import CryptoJS from 'crypto-js';

const SECRET_PASSPHRASE = 'ws-studio-2024-secret-key';

export function encryptKey(rawKey: string): string {
  return CryptoJS.AES.encrypt(rawKey, SECRET_PASSPHRASE).toString();
}

export function decryptKey(encryptedKey: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedKey, SECRET_PASSPHRASE);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export function saveEncryptedKey(provider: string, rawKey: string): void {
  if (typeof window === 'undefined') return;
  const encrypted = encryptKey(rawKey);
  const stored = getStoredKeys();
  stored[provider] = encrypted;
  localStorage.setItem('ws-studio-api-keys', JSON.stringify(stored));
}

export function getDecryptedKey(provider: string): string | null {
  if (typeof window === 'undefined') return null;
  const stored = getStoredKeys();
  const encrypted = stored[provider];
  if (!encrypted) return null;
  try {
    return decryptKey(encrypted);
  } catch {
    return null;
  }
}

export function removeKey(provider: string): void {
  if (typeof window === 'undefined') return;
  const stored = getStoredKeys();
  delete stored[provider];
  localStorage.setItem('ws-studio-api-keys', JSON.stringify(stored));
}

function getStoredKeys(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('ws-studio-api-keys');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
