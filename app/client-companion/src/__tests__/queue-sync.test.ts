import { runSaga } from "redux-saga";
import { handleSync } from "../features/logForm/sagas/queueSyncSaga";
import * as repository from "../features/logForm/queue/repository";
import * as transport from "../features/logForm/queue/transport";
import { CONSENT_REQUIRED_ERROR, setConsentError, syncFailed, syncFinished, syncStarted } from "../features/logForm/state/logFormSlice";

const baseState = {
  logForm: {
    fields: {},
    consent: { granted: true, error: null },
    status: "idle" as const,
    errors: [],
  },
};

describe("queue sync saga", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("drains queue in FIFO order", async () => {
    const items = [
      {
        id: "id-1",
        enqueued_at_utc: "2026-02-02T00:00:00.000Z",
        payload: { consent_granted: true, time_of_day: "Morning" },
        retry_count: 0,
        last_error_code: null,
      },
      {
        id: "id-2",
        enqueued_at_utc: "2026-02-02T00:01:00.000Z",
        payload: { consent_granted: true, time_of_day: "Evening" },
        retry_count: 0,
        last_error_code: null,
      },
    ];

    const submittedIds: string[] = [];

    jest.spyOn(repository, "loadQueue").mockResolvedValue(items);
    jest.spyOn(repository, "saveQueue").mockResolvedValue();
    jest.spyOn(transport, "submitQueuedItem").mockImplementation(async (item) => {
      submittedIds.push(item.id);
    });

    const dispatched: Array<{ type: string }> = [];

    await runSaga(
      {
        dispatch: (action) => dispatched.push(action as { type: string }),
        getState: () => baseState,
      },
      handleSync
    ).toPromise();

    expect(submittedIds).toEqual(["id-1", "id-2"]);
    expect(dispatched).toContainEqual(syncFinished());
  });

  it("finishes immediately when queue is empty", async () => {
    jest.spyOn(repository, "loadQueue").mockResolvedValue([]);

    const dispatched: Array<{ type: string }> = [];

    await runSaga(
      {
        dispatch: (action) => dispatched.push(action as { type: string }),
        getState: () => baseState,
      },
      handleSync
    ).toPromise();

    expect(dispatched).toContainEqual(syncFinished());
  });

  it("blocks sync when consent is false", async () => {
    const dispatched: Array<{ type: string }> = [];

    await runSaga(
      {
        dispatch: (action) => dispatched.push(action as { type: string }),
        getState: () => ({
          ...baseState,
          logForm: { ...baseState.logForm, consent: { granted: false, error: null } },
        }),
      },
      handleSync
    ).toPromise();

    expect(dispatched).toContainEqual(setConsentError(CONSENT_REQUIRED_ERROR));
    expect(dispatched).toContainEqual(syncFailed(CONSENT_REQUIRED_ERROR));
  });

  it("updates retry metadata on failure", async () => {
    const items = [
      {
        id: "id-1",
        enqueued_at_utc: "2026-02-02T00:00:00.000Z",
        payload: { consent_granted: true, time_of_day: "Morning" },
        retry_count: 0,
        last_error_code: null,
      },
    ];

    const saveQueue = jest.spyOn(repository, "saveQueue").mockResolvedValue();
    jest.spyOn(repository, "loadQueue").mockResolvedValue(items);
    jest
      .spyOn(transport, "submitQueuedItem")
      .mockRejectedValue(new Error(transport.BACKEND_UNAVAILABLE_ERROR));

    const dispatched: Array<{ type: string }> = [];

    await runSaga(
      {
        dispatch: (action) => dispatched.push(action as { type: string }),
        getState: () => baseState,
      },
      handleSync
    ).toPromise();

    expect(saveQueue).toHaveBeenCalledWith([
      {
        ...items[0],
        retry_count: 1,
        last_error_code: transport.BACKEND_UNAVAILABLE_CODE,
      },
    ]);
    expect(dispatched).toContainEqual(syncStarted());
    expect(dispatched).toContainEqual(syncFailed("Failed to sync offline queue"));
  });

  it("preserves later items when a mid-queue failure occurs", async () => {
    const items = [
      {
        id: "id-1",
        enqueued_at_utc: "2026-02-02T00:00:00.000Z",
        payload: { consent_granted: true, time_of_day: "Morning" },
        retry_count: 0,
        last_error_code: null,
      },
      {
        id: "id-2",
        enqueued_at_utc: "2026-02-02T00:01:00.000Z",
        payload: { consent_granted: true, time_of_day: "Evening" },
        retry_count: 0,
        last_error_code: null,
      },
      {
        id: "id-3",
        enqueued_at_utc: "2026-02-02T00:02:00.000Z",
        payload: { consent_granted: true, time_of_day: "Night" },
        retry_count: 0,
        last_error_code: null,
      },
    ];

    jest.spyOn(repository, "loadQueue").mockResolvedValue(items);
    const saveQueue = jest.spyOn(repository, "saveQueue").mockResolvedValue();

    const submit = jest.spyOn(transport, "submitQueuedItem");
    submit
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error(transport.BACKEND_UNAVAILABLE_ERROR));

    await runSaga(
      {
        dispatch: () => undefined,
        getState: () => baseState,
      },
      handleSync
    ).toPromise();

    expect(saveQueue).toHaveBeenCalledWith([
      {
        ...items[1],
        retry_count: 1,
        last_error_code: transport.BACKEND_UNAVAILABLE_CODE,
      },
      items[2],
    ]);
  });
});
