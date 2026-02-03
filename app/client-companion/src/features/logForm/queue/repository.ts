import type { OfflineQueueItem } from "./types";
import { encrypt, decrypt } from "./crypto";
import {
  get,
  put,
  remove,
  QUEUE_BLOB_KEY,
  QUEUE_LOAD_FAILED,
  QUEUE_PERSIST_FAILED,
} from "./idb";

type QueueBlob = {
  version: 1;
  items: OfflineQueueItem[];
};

export const MAX_QUEUE_SIZE = 50;
export const QUEUE_FULL_ERROR = "Queue is full (50 items max)";

const serializeEncrypted = (payload: { ivB64: string; ctB64: string }) =>
  JSON.stringify(payload);

const parseEncrypted = (value: string) => {
  const parsed = JSON.parse(value) as { ivB64?: string; ctB64?: string };
  if (!parsed.ivB64 || !parsed.ctB64) {
    throw new Error(QUEUE_LOAD_FAILED);
  }
  return { ivB64: parsed.ivB64, ctB64: parsed.ctB64 };
};

const parseQueueBlob = (value: string): QueueBlob => {
  const parsed = JSON.parse(value) as { version?: number; items?: OfflineQueueItem[] };
  if (parsed.version !== 1 || !Array.isArray(parsed.items)) {
    throw new Error(QUEUE_LOAD_FAILED);
  }
  return { version: 1, items: parsed.items };
};

export const loadQueue = async (): Promise<OfflineQueueItem[]> => {
  try {
    const stored = await get(QUEUE_BLOB_KEY);
    if (!stored) {
      return [];
    }

    const { ivB64, ctB64 } = parseEncrypted(stored);
    const plaintext = await decrypt(ivB64, ctB64);
    const blob = parseQueueBlob(plaintext);
    return blob.items;
  } catch {
    throw new Error(QUEUE_LOAD_FAILED);
  }
};

export const saveQueue = async (items: OfflineQueueItem[]): Promise<void> => {
  const blob: QueueBlob = { version: 1, items };

  try {
    const plaintext = JSON.stringify(blob);
    const encrypted = await encrypt(plaintext);
    const payload = serializeEncrypted(encrypted);
    await put(QUEUE_BLOB_KEY, payload);
  } catch {
    throw new Error(QUEUE_PERSIST_FAILED);
  }
};

export const enqueue = async (item: OfflineQueueItem): Promise<void> => {
  const current = await loadQueue();
  if (current.length >= MAX_QUEUE_SIZE) {
    throw new Error(QUEUE_FULL_ERROR);
  }
  const next = [...current, item];
  await saveQueue(next);
};

export const clearQueue = async (): Promise<void> => {
  try {
    await remove(QUEUE_BLOB_KEY);
  } catch {
    throw new Error(QUEUE_PERSIST_FAILED);
  }
};
