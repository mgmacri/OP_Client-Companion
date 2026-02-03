import type { OfflineQueueItem } from "./types";

export const BACKEND_UNAVAILABLE_ERROR = "Backend unavailable";
export const BACKEND_UNAVAILABLE_CODE = "BACKEND_UNAVAILABLE" as const;

export type QueueSubmitErrorCode = typeof BACKEND_UNAVAILABLE_CODE | "UNKNOWN";

export const submitQueuedItem = async (item: OfflineQueueItem): Promise<void> => {
  void item;
  // TODO: Wire to backend idempotent submit endpoint once available.
  throw new Error(BACKEND_UNAVAILABLE_ERROR);
};
