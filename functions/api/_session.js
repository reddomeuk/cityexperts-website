import { sessionSchema } from './_schemas.js';

const SESSION_COOKIE = 'session';
const MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours

function extractSessionCookie(req) {
  const cookieHeader = req?.headers?.cookie || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  return match ? match[1] : '';
}

export function decodeSession(value) {
  if (!value) return null;
  try {
    const json = Buffer.from(value, 'base64url').toString('utf8');
    return JSON.parse(json);
  } catch (error) {
    return null;
  }
}

export function validateSessionPayload(payload) {
  try {
    const parsed = sessionSchema.parse(payload);
    const isExpired = Date.now() - parsed.iat > MAX_AGE_MS;
    if (isExpired) return null;
    return parsed;
  } catch (error) {
    return null;
  }
}

export async function getSession(req, res) {
  const raw = extractSessionCookie(req);
  if (!raw) return null;

  const payload = decodeSession(raw);
  if (!payload) return null;

  const valid = validateSessionPayload(payload);
  if (!valid) {
    return null;
  }

  return {
    email: valid.sub,
    issuedAt: valid.iat,
    expiresAt: valid.exp ?? valid.iat + MAX_AGE_MS,
    raw
  };
}
