import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type LogFormStatus = "idle" | "validating" | "queued" | "syncing";

export type LogFormState = {
  fields: Record<string, string | number>;
  consent: {
    granted: boolean;
    error: string | null;
  };
  status: LogFormStatus;
  errors: string[];
};

export type SubmissionRequest = {
  fields: Record<string, string | number>;
};

export const CONSENT_REQUIRED_ERROR = "Cannot submit: consent not granted";

const initialState: LogFormState = {
  fields: {},
  consent: {
    granted: false,
    error: null,
  },
  status: "idle",
  errors: [],
};

const attachConsentFlag = (
  fields: Record<string, string | number>,
  consentGranted: boolean
) => ({
  ...fields,
  consent_granted: consentGranted,
});

const logFormSlice = createSlice({
  name: "logForm",
  initialState,
  reducers: {
    grantConsent(state) {
      state.consent.granted = true;
      state.consent.error = null;
    },
    revokeConsent(state) {
      state.consent.granted = false;
    },
    setConsentError(state, action: PayloadAction<string>) {
      state.consent.error = action.payload;
    },
    clearConsentError(state) {
      state.consent.error = null;
    },
    setFields(state, action: PayloadAction<Record<string, string | number>>) {
      state.fields = action.payload;
    },
    submitLogRequested(state, action: PayloadAction<SubmissionRequest>) {
      if (!state.consent.granted) {
        state.consent.error = CONSENT_REQUIRED_ERROR;
        state.status = "idle";
        return;
      }
      state.status = "validating";
      state.errors = [];
      state.fields = action.payload.fields;
    },
    queueLogRequested(state, action: PayloadAction<SubmissionRequest>) {
      if (!state.consent.granted) {
        state.consent.error = CONSENT_REQUIRED_ERROR;
        state.status = "idle";
        return;
      }
      state.status = "queued";
      state.errors = [];
      state.fields = action.payload.fields;
    },
    submissionPrepared(state) {
      state.status = state.status === "queued" ? "queued" : "syncing";
      state.errors = [];
    },
    submissionFailed(state, action: PayloadAction<string>) {
      state.status = "idle";
      state.errors = [action.payload];
    },
    submissionSucceeded(state) {
      state.status = "idle";
      state.errors = [];
    },
  },
});

export const selectConsentGranted = (state: { logForm: LogFormState }) =>
  state.logForm.consent.granted;

export const selectConsentError = (state: { logForm: LogFormState }) =>
  state.logForm.consent.error;

export const selectFieldsWithConsent = (state: { logForm: LogFormState }) =>
  attachConsentFlag(state.logForm.fields, state.logForm.consent.granted);

export const {
  grantConsent,
  revokeConsent,
  setConsentError,
  clearConsentError,
  setFields,
  submitLogRequested,
  queueLogRequested,
  submissionPrepared,
  submissionFailed,
  submissionSucceeded,
} = logFormSlice.actions;

export { attachConsentFlag };

export default logFormSlice.reducer;
