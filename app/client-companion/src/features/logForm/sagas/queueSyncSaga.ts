import { takeEvery, put, select } from "redux-saga/effects";
import {
  CONSENT_REQUIRED_ERROR,
  attachConsentFlag,
  queueLogRequested,
  selectConsentGranted,
  setConsentError,
  submitLogRequested,
  submissionPrepared,
} from "../state/logFormSlice";

function* ensureConsentBeforeSubmit(
  action: ReturnType<typeof submitLogRequested> | ReturnType<typeof queueLogRequested>
) {
  const consentGranted: boolean = yield select(selectConsentGranted);

  if (!consentGranted) {
    yield put(setConsentError(CONSENT_REQUIRED_ERROR));
    return;
  }

  const payloadWithConsent = attachConsentFlag(action.payload.fields, consentGranted);

  yield put(submissionPrepared(payloadWithConsent));
}

export function* queueSyncSaga() {
  yield takeEvery(submitLogRequested.type, ensureConsentBeforeSubmit);
  yield takeEvery(queueLogRequested.type, ensureConsentBeforeSubmit);
}

export default queueSyncSaga;
