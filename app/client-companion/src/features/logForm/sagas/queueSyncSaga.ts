import { takeEvery, put, select, call, take } from "redux-saga/effects";
import { eventChannel } from "redux-saga";
import {
  CONSENT_REQUIRED_ERROR,
  attachConsentFlag,
  enqueueFailed,
  enqueueSucceeded,
  queueLogRequested,
  selectConsentGranted,
  setConsentError,
  syncFailed,
  syncFinished,
  syncRequested,
  syncStarted,
  submitLogRequested,
  submissionPrepared,
} from "../state/logFormSlice";
import { enqueue, loadQueue, saveQueue, QUEUE_FULL_ERROR } from "../queue/repository";
import { submitQueuedItem, BACKEND_UNAVAILABLE_ERROR, BACKEND_UNAVAILABLE_CODE } from "../queue/transport";
import { subscribeToConnectivityChanges } from "../queue/connectivity";
import type { OfflineQueueItem } from "../queue/types";

const QUEUE_ENQUEUE_FAILED_ERROR = "Failed to queue offline submission";
const QUEUE_SYNC_FAILED_ERROR = "Failed to sync offline queue";
const QUEUE_SYNC_BLOCKED_ERROR = CONSENT_REQUIRED_ERROR;

function* ensureConsentOrReject() {
  const consentGranted: boolean = yield select(selectConsentGranted);

  if (!consentGranted) {
    yield put(setConsentError(CONSENT_REQUIRED_ERROR));
    return false;
  }

  return consentGranted;
}

function* handleSubmit() {
  const consentGranted: boolean = yield* ensureConsentOrReject();
  if (!consentGranted) return;

  yield put(submissionPrepared());
}

function* handleQueue(action: ReturnType<typeof queueLogRequested>) {
  const consentGranted: boolean = yield* ensureConsentOrReject();
  if (!consentGranted) return;

  const metadata = action.payload.metadata;
  if (!metadata?.id || !metadata?.enqueued_at_utc) {
    yield put(enqueueFailed(QUEUE_ENQUEUE_FAILED_ERROR));
    return;
  }

  const payloadWithConsent = attachConsentFlag(action.payload.fields, consentGranted);

  try {
    yield call(enqueue, {
      id: metadata.id,
      enqueued_at_utc: metadata.enqueued_at_utc,
      payload: payloadWithConsent,
      retry_count: 0,
      last_error_code: null,
    });
    yield put(enqueueSucceeded());
  } catch (error) {
    if (error instanceof Error && error.message === QUEUE_FULL_ERROR) {
      yield put(enqueueFailed(QUEUE_FULL_ERROR));
      return;
    }
    yield put(enqueueFailed(QUEUE_ENQUEUE_FAILED_ERROR));
  }
}

const createConnectivityChannel = () =>
  eventChannel<"online">((emit) => {
    const unsubscribe = subscribeToConnectivityChanges(() => emit("online"));
    return () => unsubscribe();
  });

const resolveSubmitErrorCode = (error: unknown) => {
  if (error instanceof Error && error.message === BACKEND_UNAVAILABLE_ERROR) {
    return BACKEND_UNAVAILABLE_CODE;
  }
  return "UNKNOWN";
};

export function* handleSync() {
  const consentGranted: boolean = yield select(selectConsentGranted);
  if (!consentGranted) {
    yield put(setConsentError(CONSENT_REQUIRED_ERROR));
    yield put(syncFailed(QUEUE_SYNC_BLOCKED_ERROR));
    return;
  }

  yield put(syncStarted());

  try {
    let items: OfflineQueueItem[] = yield call(loadQueue);
    if (items.length === 0) {
      yield put(syncFinished());
      return;
    }

    while (items.length > 0) {
      const [current, ...rest] = items;
      try {
        yield call(submitQueuedItem, current);
        items = rest;
        yield call(saveQueue, items);
      } catch (error) {
        const errorCode = resolveSubmitErrorCode(error);
        const updated: OfflineQueueItem = {
          ...current,
          retry_count: current.retry_count + 1,
          last_error_code: errorCode,
        };
        items = [updated, ...rest];
        yield call(saveQueue, items);
        yield put(syncFailed(QUEUE_SYNC_FAILED_ERROR));
        return;
      }
    }

    yield put(syncFinished());
  } catch (error) {
    console.error("Sync failed:", error);
    yield put(syncFailed(QUEUE_SYNC_FAILED_ERROR));
  }
}

function* connectivitySyncWatcher() {
  const channel = createConnectivityChannel();
  try {
    while (true) {
      yield take(channel);
      yield put(syncRequested());
    }
  } finally {
    channel.close();
  }
}

export function* queueSyncSaga() {
  yield takeEvery(submitLogRequested.type, handleSubmit);
  yield takeEvery(queueLogRequested.type, handleQueue);
  yield takeEvery(syncRequested.type, handleSync);
  yield call(connectivitySyncWatcher);
}

export default queueSyncSaga;
