import { get, put } from "./idb";

const KEY_STORAGE_KEY = "offline_queue_key_v1";

export const QUEUE_CRYPTO_UNAVAILABLE = "Queue crypto unavailable";
export const QUEUE_KEY_LOAD_FAILED = "Failed to load queue key";
export const QUEUE_KEY_PERSIST_FAILED = "Failed to persist queue key";
export const QUEUE_ENCRYPT_FAILED = "Failed to encrypt offline queue";
export const QUEUE_DECRYPT_FAILED = "Failed to decrypt offline queue";

const isWebCryptoAvailable = () =>
  typeof globalThis !== "undefined" &&
  !!globalThis.crypto &&
  !!globalThis.crypto.subtle &&
  !!globalThis.crypto.getRandomValues;

const toB64 = (bytes: Uint8Array) =>
  globalThis.btoa(String.fromCharCode(...Array.from(bytes)));

const fromB64 = (value: string) =>
  new Uint8Array(
    Array.from(globalThis.atob(value)).map((char) => char.charCodeAt(0))
  );

const importKey = (raw: ArrayBuffer) =>
  globalThis.crypto.subtle.importKey(
    "raw",
    raw,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

const exportKey = (key: CryptoKey) =>
  globalThis.crypto.subtle.exportKey("raw", key);

export const getOrCreateKey = async (): Promise<CryptoKey> => {
  if (!isWebCryptoAvailable()) {
    throw new Error(QUEUE_CRYPTO_UNAVAILABLE);
  }

  try {
    const stored = await get(KEY_STORAGE_KEY);
    if (stored) {
      const raw = fromB64(stored);
      const isolated = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
      return importKey(isolated);
    }
  } catch {
    throw new Error(QUEUE_KEY_LOAD_FAILED);
  }

  try {
    const key = await globalThis.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    const raw = await exportKey(key);
    const encoded = toB64(new Uint8Array(raw));
    await put(KEY_STORAGE_KEY, encoded);
    return importKey(raw);
  } catch {
    throw new Error(QUEUE_KEY_PERSIST_FAILED);
  }
};

export const encrypt = async (plaintext: string) => {
  if (!isWebCryptoAvailable()) {
    throw new Error(QUEUE_CRYPTO_UNAVAILABLE);
  }

  try {
    const key = await getOrCreateKey();
    const iv = new Uint8Array(12);
    globalThis.crypto.getRandomValues(iv);
    const encoded = new TextEncoder().encode(plaintext);
    const ciphertext = await globalThis.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoded
    );

    return {
      ivB64: toB64(iv),
      ctB64: toB64(new Uint8Array(ciphertext)),
    };
  } catch (error) {
    if (error instanceof Error && error.message === QUEUE_KEY_PERSIST_FAILED) {
      throw error;
    }
    if (error instanceof Error && error.message === QUEUE_KEY_LOAD_FAILED) {
      throw error;
    }
    throw new Error(QUEUE_ENCRYPT_FAILED);
  }
};

export const decrypt = async (ivB64: string, ctB64: string) => {
  if (!isWebCryptoAvailable()) {
    throw new Error(QUEUE_CRYPTO_UNAVAILABLE);
  }

  try {
    const key = await getOrCreateKey();
    const iv = fromB64(ivB64);
    const ciphertext = fromB64(ctB64);
    const plaintext = await globalThis.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );
    return new TextDecoder().decode(plaintext);
  } catch (error) {
    if (error instanceof Error && error.message === QUEUE_KEY_PERSIST_FAILED) {
      throw error;
    }
    if (error instanceof Error && error.message === QUEUE_KEY_LOAD_FAILED) {
      throw error;
    }
    throw new Error(QUEUE_DECRYPT_FAILED);
  }
};
