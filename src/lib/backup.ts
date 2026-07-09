// Encrypted backup utilities using WebCrypto (AES-GCM + PBKDF2)
import { getCached, setCached, KNOWN_KEYS } from '@/lib/idbStore';

const STORAGE_KEYS = [...KNOWN_KEYS];
const MAGIC = 'HBM1'; // Hotel Booking Manager v1
const PBKDF2_ITERATIONS = 200_000;

function b64(buf: ArrayBuffer | Uint8Array) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}
function unb64(str: string) {
  const bin = atob(str);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function deriveKey(password: string, salt: Uint8Array) {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password) as BufferSource,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export function collectHotelData() {
  const data: Record<string, unknown> = {};
  STORAGE_KEYS.forEach((k) => {
    const v = getCached<unknown>(k, undefined as unknown);
    if (v !== undefined) data[k] = v;
  });
  data._exportedAt = new Date().toISOString();
  data._version = 2; // v2: IndexedDB-backed
  return data;
}

export async function encryptBackup(password: string): Promise<Blob> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const plaintext = new TextEncoder().encode(JSON.stringify(collectHotelData()));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, plaintext as BufferSource);
  const envelope = {
    magic: MAGIC,
    v: 1,
    kdf: 'PBKDF2-SHA256',
    iter: PBKDF2_ITERATIONS,
    salt: b64(salt),
    iv: b64(iv),
    ciphertext: b64(ct),
  };
  return new Blob([JSON.stringify(envelope)], { type: 'application/octet-stream' });
}

export async function decryptAndRestore(file: File, password: string) {
  const text = await file.text();
  const env = JSON.parse(text);
  if (env.magic !== MAGIC) throw new Error('Not a valid Hotel Manager backup file.');
  const key = await deriveKey(password, unb64(env.salt));
  let plainBuf: ArrayBuffer;
  try {
    plainBuf = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: unb64(env.iv) as BufferSource },
      key,
      unb64(env.ciphertext) as BufferSource
    );
  } catch {
    throw new Error('Wrong password or corrupted file.');
  }
  const data = JSON.parse(new TextDecoder().decode(plainBuf));
  let restored = 0;
  STORAGE_KEYS.forEach((k) => {
    if (Array.isArray(data[k])) {
      localStorage.setItem(k, JSON.stringify(data[k]));
      restored++;
    }
  });
  if (!restored) throw new Error('Backup contained no valid data.');
  return restored;
}
