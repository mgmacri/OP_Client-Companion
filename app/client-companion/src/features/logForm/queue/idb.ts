const DB_NAME = "offline_queue_db";
const STORE_NAME = "queue_store";
const DB_VERSION = 1;

export const QUEUE_BLOB_KEY = "offline_queue_v1";

export const QUEUE_STORAGE_UNAVAILABLE = "Queue storage unavailable";
export const QUEUE_LOAD_FAILED = "Failed to load offline queue";
export const QUEUE_PERSIST_FAILED = "Failed to persist offline queue";

type Mode = IDBTransactionMode;

const isIndexedDbAvailable = () => typeof indexedDB !== "undefined";

const openDb = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    if (!isIndexedDbAvailable()) {
      reject(new Error(QUEUE_STORAGE_UNAVAILABLE));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(QUEUE_STORAGE_UNAVAILABLE));
    request.onblocked = () => reject(new Error(QUEUE_STORAGE_UNAVAILABLE));
  });

const withStore = async <T>(mode: Mode, runner: (store: IDBObjectStore) => IDBRequest<T>) => {
  const db = await openDb();

  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const request = runner(store);

    request.onsuccess = () => resolve(request.result as T);
    request.onerror = () => reject(request.error ?? new Error(QUEUE_STORAGE_UNAVAILABLE));

    tx.onabort = () => reject(tx.error ?? new Error(QUEUE_STORAGE_UNAVAILABLE));
    tx.onerror = () => reject(tx.error ?? new Error(QUEUE_STORAGE_UNAVAILABLE));
    tx.oncomplete = () => db.close();
  });
};

export const put = async (key: string, value: string) => {
  try {
    await withStore("readwrite", (store) => store.put(value, key));
  } catch {
    throw new Error(QUEUE_PERSIST_FAILED);
  }
};

export const get = async (key: string) => {
  try {
    const value = await withStore<string | undefined>("readonly", (store) => store.get(key));
    return typeof value === "string" ? value : null;
  } catch {
    throw new Error(QUEUE_LOAD_FAILED);
  }
};

export const remove = async (key: string) => {
  try {
    await withStore("readwrite", (store) => store.delete(key));
  } catch {
    throw new Error(QUEUE_PERSIST_FAILED);
  }
};
