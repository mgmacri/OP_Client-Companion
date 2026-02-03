type CryptoModule = typeof import("../features/logForm/queue/crypto");
type RepoModule = typeof import("../features/logForm/queue/repository");
type IdbModule = typeof import("../features/logForm/queue/idb");

let cryptoUtils: CryptoModule;
let repository: RepoModule;
let idb: IdbModule;

type StoreMap = Map<string, string>;
type DbStores = Map<string, StoreMap>;

const dbRegistry = new Map<string, DbStores>();

const ensureStore = (dbName: string, storeName: string) => {
  const stores = dbRegistry.get(dbName) ?? new Map<string, StoreMap>();
  dbRegistry.set(dbName, stores);
  const store = stores.get(storeName) ?? new Map<string, string>();
  stores.set(storeName, store);
  return store;
};

const resetIndexedDb = () => {
  dbRegistry.clear();
};

const createRequest = <T,>(result: T, oncomplete?: () => void) => {
  const request = {
    result,
    error: null as DOMException | null,
    onsuccess: null as ((this: IDBRequest<T>, ev: Event) => unknown) | null,
    onerror: null as ((this: IDBRequest<T>, ev: Event) => unknown) | null,
  } as IDBRequest<T>;

  queueMicrotask(() => {
    request.onsuccess?.call(request, new Event("success"));
    oncomplete?.();
  });

  return request;
};

const createFakeIndexedDb = () => {
  const open = (name: string) => {
    type MutableOpenRequest = IDBOpenDBRequest & { result: IDBDatabase | null };
    const request = {
      result: null as IDBDatabase | null,
      onupgradeneeded: null as ((this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) => unknown) | null,
      onsuccess: null as ((this: IDBOpenDBRequest, ev: Event) => unknown) | null,
      onerror: null as ((this: IDBOpenDBRequest, ev: Event) => unknown) | null,
      onblocked: null as ((this: IDBOpenDBRequest, ev: Event) => unknown) | null,
    } as unknown as MutableOpenRequest;

    queueMicrotask(() => {
      const stores = dbRegistry.get(name) ?? new Map<string, StoreMap>();
      dbRegistry.set(name, stores);

      const db = {
        objectStoreNames: {
          contains: (storeName: string) => stores.has(storeName),
        } as DOMStringList,
        createObjectStore: (storeName: string) => {
          ensureStore(name, storeName);
          return {} as IDBObjectStore;
        },
        transaction: (storeName: string) => {
          const tx = {
            oncomplete: null as ((this: IDBTransaction, ev: Event) => unknown) | null,
            onerror: null as ((this: IDBTransaction, ev: Event) => unknown) | null,
            onabort: null as ((this: IDBTransaction, ev: Event) => unknown) | null,
            objectStore: () => {
              const store = ensureStore(name, storeName);
              return {
                get: (key: IDBValidKey) =>
                  createRequest(store.get(String(key)) ?? undefined, () =>
                    tx.oncomplete?.call(tx as IDBTransaction, new Event("complete"))
                  ),
                put: (value: string, key: IDBValidKey) =>
                  createRequest(
                    store.set(String(key), value),
                    () => tx.oncomplete?.call(tx as IDBTransaction, new Event("complete"))
                  ),
                delete: (key: IDBValidKey) =>
                  createRequest(
                    store.delete(String(key)),
                    () => tx.oncomplete?.call(tx as IDBTransaction, new Event("complete"))
                  ),
              } as unknown as IDBObjectStore;
            },
          } as unknown as IDBTransaction;

          return tx;
        },
        close: () => undefined,
      } as IDBDatabase;

      (request as MutableOpenRequest).result = db;
      request.onupgradeneeded?.call(request, new Event("upgradeneeded") as IDBVersionChangeEvent);
      request.onsuccess?.call(request, new Event("success"));
    });

    return request;
  };

  return { open } as IDBFactory;
};

const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const encodeBinaryToBase64 = (binary: string) => {
  let output = "";
  let i = 0;

  while (i < binary.length) {
    const byte1 = binary.charCodeAt(i++) & 0xff;
    const byte2 = i < binary.length ? binary.charCodeAt(i++) & 0xff : NaN;
    const byte3 = i < binary.length ? binary.charCodeAt(i++) & 0xff : NaN;

    const enc1 = byte1 >> 2;
    const enc2 = ((byte1 & 0x03) << 4) | (byte2 >> 4);
    const enc3 = Number.isNaN(byte2) ? 64 : ((byte2 & 0x0f) << 2) | (byte3 >> 6);
    const enc4 = Number.isNaN(byte3) ? 64 : byte3 & 0x3f;

    output += BASE64_ALPHABET.charAt(enc1);
    output += BASE64_ALPHABET.charAt(enc2);
    output += enc3 === 64 ? "=" : BASE64_ALPHABET.charAt(enc3);
    output += enc4 === 64 ? "=" : BASE64_ALPHABET.charAt(enc4);
  }

  return output;
};

const decodeBase64ToBinary = (base64: string) => {
  let output = "";
  let i = 0;
  const sanitized = base64.replace(/[^A-Za-z0-9+/=]/g, "");

  while (i < sanitized.length) {
    const enc1 = BASE64_ALPHABET.indexOf(sanitized.charAt(i++));
    const enc2 = BASE64_ALPHABET.indexOf(sanitized.charAt(i++));
    const enc3 = BASE64_ALPHABET.indexOf(sanitized.charAt(i++));
    const enc4 = BASE64_ALPHABET.indexOf(sanitized.charAt(i++));

    const byte1 = (enc1 << 2) | (enc2 >> 4);
    const byte2 = ((enc2 & 0x0f) << 4) | (enc3 >> 2);
    const byte3 = ((enc3 & 0x03) << 6) | enc4;

    output += String.fromCharCode(byte1);
    if (enc3 !== 64 && enc3 !== -1) {
      output += String.fromCharCode(byte2);
    }
    if (enc4 !== 64 && enc4 !== -1) {
      output += String.fromCharCode(byte3);
    }
  }

  return output;
};

const ensureBase64Helpers = () => {
  if (!globalThis.btoa) {
    globalThis.btoa = encodeBinaryToBase64;
  }
  if (!globalThis.atob) {
    globalThis.atob = decodeBase64ToBinary;
  }
};

beforeAll(async () => {
  if (!globalThis.crypto) {
    throw new Error("WebCrypto unavailable for tests");
  }
  if (!globalThis.indexedDB) {
    globalThis.indexedDB = createFakeIndexedDb();
  }
  ensureBase64Helpers();
  cryptoUtils = await import("../features/logForm/queue/crypto");
  repository = await import("../features/logForm/queue/repository");
  idb = await import("../features/logForm/queue/idb");
});

beforeEach(() => {
  resetIndexedDb();
});

describe("offline encrypted queue", () => {
  it("encrypt/decrypt roundtrip returns original plaintext", async () => {
    const payload = JSON.stringify({ time_of_day: "Morning", mood: "Sad" });
    const encrypted = await cryptoUtils.encrypt(payload);
    const decrypted = await cryptoUtils.decrypt(encrypted.ivB64, encrypted.ctB64);

    expect(decrypted).toBe(payload);
  });

  it("persist/load roundtrip preserves FIFO order", async () => {
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
        retry_count: 1,
        last_error_code: "NETWORK_ERROR",
      },
    ];

    await repository.enqueue(items[0]);
    await repository.enqueue(items[1]);

    const loaded = await repository.loadQueue();
    expect(loaded).toEqual(items);
  });

  it("does not store plaintext payload values at rest", async () => {
    const items = [
      {
        id: "id-plain",
        enqueued_at_utc: "2026-02-02T00:02:00.000Z",
        payload: { consent_granted: true, time_of_day: "Morning", mood: "Sad" },
        retry_count: 0,
        last_error_code: null,
      },
    ];

    await repository.saveQueue(items);

    const rawStored = (await idb.get(idb.QUEUE_BLOB_KEY)) ?? "";
    expect(rawStored).not.toContain("time_of_day");
    expect(rawStored).not.toContain("Sad");
  });

  it("rejects enqueue when queue is full", async () => {
    const items = Array.from({ length: repository.MAX_QUEUE_SIZE }, (_, index) => ({
      id: `id-${index}`,
      enqueued_at_utc: `2026-02-02T00:${String(index).padStart(2, "0")}:00.000Z`,
      payload: { consent_granted: true, time_of_day: "Morning" },
      retry_count: 0,
      last_error_code: null,
    }));

    await repository.saveQueue(items);

    await expect(
      repository.enqueue({
        id: "id-overflow",
        enqueued_at_utc: "2026-02-02T01:00:00.000Z",
        payload: { consent_granted: true, time_of_day: "Evening" },
        retry_count: 0,
        last_error_code: null,
      })
    ).rejects.toThrow(repository.QUEUE_FULL_ERROR);
  });

  it("returns static error string when crypto is unavailable", async () => {
    const originalCrypto = globalThis.crypto;
    (globalThis as { crypto?: Crypto }).crypto = undefined;

    await expect(cryptoUtils.encrypt("test"))
      .rejects
      .toThrow(cryptoUtils.QUEUE_CRYPTO_UNAVAILABLE);

    (globalThis as { crypto?: Crypto }).crypto = originalCrypto;
  });
});
