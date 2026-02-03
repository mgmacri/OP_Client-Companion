export type QueuedSubmissionPayload = Record<string, string | number | boolean> & {
  consent_granted: boolean;
};

export type OfflineQueueItem = {
  id: string;
  enqueued_at_utc: string;
  payload: QueuedSubmissionPayload;
  retry_count: number;
  last_error_code: string | null;
};
