import { cookies } from 'next/headers';

export const PAPA_SESSION_COOKIE = 'papa_session';
export const PAPA_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function encoder(): TextEncoder {
  return new TextEncoder();
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(normalized);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

async function hmac(value: string, secret: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', encoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder().encode(value)));
}

function authConfig(): { password: string; secret: string } | null {
  const password = process.env.PAPA_APP_PASSWORD?.trim();
  const secret = process.env.PAPA_AUTH_SECRET?.trim();
  return password && secret ? { password, secret } : null;
}

export function isPapaAuthConfigured(): boolean {
  return authConfig() !== null;
}

export async function verifyPapaPassword(password: string): Promise<boolean> {
  const config = authConfig();
  if (!config || password.length === 0 || password.length > 200) return false;
  const [actual, expected] = await Promise.all([hmac(password, config.secret), hmac(config.password, config.secret)]);
  return constantTimeEqual(actual, expected);
}

export async function createPapaSession(): Promise<string> {
  const config = authConfig();
  if (!config) throw new Error('PAPA_APP_PASSWORD en PAPA_AUTH_SECRET ontbreken.');
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = String(issuedAt);
  const signature = await hmac(payload, config.secret);
  return `${payload}.${toBase64Url(signature)}`;
}

export async function isValidPapaSession(value: string | undefined): Promise<boolean> {
  const config = authConfig();
  if (!config || !value) return false;
  const [issuedAtText, signatureText] = value.split('.', 2);
  const issuedAt = Number(issuedAtText);
  if (!Number.isInteger(issuedAt) || !signatureText) return false;
  const now = Math.floor(Date.now() / 1000);
  if (issuedAt > now + 60 || now - issuedAt > PAPA_SESSION_MAX_AGE) return false;
  try {
    return constantTimeEqual(await hmac(issuedAtText, config.secret), fromBase64Url(signatureText));
  } catch {
    return false;
  }
}

export async function hasPapaSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidPapaSession(cookieStore.get(PAPA_SESSION_COOKIE)?.value);
}
