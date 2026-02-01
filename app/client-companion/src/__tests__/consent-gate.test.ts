/// <reference types="jest" />

import reducer, {
  CONSENT_REQUIRED_ERROR,
  grantConsent,
  queueLogRequested,
  selectFieldsWithConsent,
  submitLogRequested,
} from "../../redux/logFormSlice";
import type { LogFormState } from "../../redux/logFormSlice";

const baseState: LogFormState = {
  fields: {},
  consent: {
    granted: false,
    error: null,
  },
  status: "idle",
  errors: [],
};

describe("consent gate", () => {
  it("blocks submit when consent is missing and surfaces a static error", () => {
    const next = reducer(
      baseState,
      submitLogRequested({ fields: { note: "calm" } })
    );

    expect(next.consent.error).toBe(CONSENT_REQUIRED_ERROR);
    expect(next.status).toBe("idle");
    expect(next.fields).toEqual({});
  });

  it("blocks queue when consent is missing and surfaces a static error", () => {
    const next = reducer(
      baseState,
      queueLogRequested({ fields: { note: "queued" } })
    );

    expect(next.consent.error).toBe(CONSENT_REQUIRED_ERROR);
    expect(next.status).toBe("idle");
    expect(next.fields).toEqual({});
  });

  it("grants consent, clears errors, and allows subsequent submit and queue actions", () => {
    const withError: LogFormState = {
      ...baseState,
      consent: { granted: false, error: CONSENT_REQUIRED_ERROR },
    };

    const afterGrant = reducer(withError, grantConsent());
    expect(afterGrant.consent.granted).toBe(true);
    expect(afterGrant.consent.error).toBeNull();

    const afterSubmit = reducer(
      afterGrant,
      submitLogRequested({ fields: { note: "ready" } })
    );
    expect(afterSubmit.status).toBe("validating");
    expect(afterSubmit.fields).toEqual({ note: "ready" });

    const afterQueue = reducer(
      afterGrant,
      queueLogRequested({ fields: { note: "queued" } })
    );
    expect(afterQueue.status).toBe("queued");
    expect(afterQueue.fields).toEqual({ note: "queued" });
  });

  it("includes consent flag in the submission payload selector", () => {
    const state = {
      logForm: {
        ...baseState,
        fields: { mood: "ok" },
        consent: { granted: true, error: null },
      },
    };

    const payload = selectFieldsWithConsent(state);

    expect(payload).toMatchObject({ mood: "ok", consent_granted: true });
  });
});
