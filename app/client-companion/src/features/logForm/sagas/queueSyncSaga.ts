import { takeEvery, put, select, call } from "redux-saga/effects";
import {
  CONSENT_REQUIRED_ERROR,
  attachConsentFlag,
  enqueueFailed,
  enqueueSucceeded,
  queueLogRequested,
  selectConsentGranted,
  setConsentError,
  submitLogRequested,
  submissionPrepared,
} from "../state/logFormSlice";
import { enqueue, QUEUE_FULL_ERROR } from "../queue/repository";

const QUEUE_ENQUEUE_FAILED_ERROR = "Failed to queue offline submission";

function* ensureConsentOrReject() {
  const consentGranted: boolean = yield select(selectConsentGranted);

  if (!consentGranted) {
    yield put(setConsentError(CONSENT_REQUIRED_ERROR));
    return false;
  }

  return consentGranted;
}

function* handleSubmit(action: ReturnType<typeof submitLogRequested>) {
  const consentGranted: boolean = yield* ensureConsentOrReject();
  if (!consentGranted) return;

  const payloadWithConsent = attachConsentFlag(action.payload.fields, consentGranted);

  yield put(submissionPrepared(payloadWithConsent));
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

export function* queueSyncSaga() {
  yield takeEvery(submitLogRequested.type, handleSubmit);
  yield takeEvery(queueLogRequested.type, handleQueue);
}

export default queueSyncSaga;
