import { CookieOptions } from 'express';

const normalizeOrigin = (origin: string) => origin.trim().replace(/\/$/, '');

const splitEnvOrigins = (value?: string): string[] =>
  (value || '')
    .split(',')
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);

const parseBoolean = (value?: string): boolean | undefined => {
  const normalized = value?.trim().toLowerCase();

  if (normalized === 'true') {
    return true;
  }

  if (normalized === 'false') {
    return false;
  }

  return undefined;
};

const parseSameSite = (value?: string): CookieOptions['sameSite'] | undefined => {
  const normalized = value?.trim().toLowerCase();

  if (normalized === 'lax' || normalized === 'strict' || normalized === 'none') {
    return normalized;
  }

  return undefined;
};

const getHostname = (origin: string): string | null => {
  try {
    return new URL(origin).hostname;
  } catch {
    return null;
  }
};

const isRemoteHttpsOrigin = (origin: string): boolean => {
  try {
    const parsedOrigin = new URL(origin);
    const isLocalhost = parsedOrigin.hostname === 'localhost' || parsedOrigin.hostname === '127.0.0.1';

    return parsedOrigin.protocol === 'https:' && !isLocalhost;
  } catch {
    return false;
  }
};

const localFrontendOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const configuredFrontendOrigins = [
  ...splitEnvOrigins(process.env.FRONTEND_URL),
  ...splitEnvOrigins(process.env.FRONTEND_URLS)
];

export const allowedFrontendOrigins = Array.from(
  new Set([...localFrontendOrigins, ...configuredFrontendOrigins])
);

const configuredNetlifyHosts = allowedFrontendOrigins
  .filter((origin) => origin.endsWith('.netlify.app'))
  .map(getHostname)
  .filter((hostname): hostname is string => Boolean(hostname));

const allowNetlifyPreviewOrigins = process.env.ALLOW_NETLIFY_PREVIEWS === 'true';
const useCrossSiteCookies = allowedFrontendOrigins.some(isRemoteHttpsOrigin);

const matchesNetlifyPreviewOrigin = (origin: string): boolean => {
  const hostname = getHostname(origin);

  if (!hostname) {
    return false;
  }

  return configuredNetlifyHosts.some(
    (configuredHost) => hostname === configuredHost || hostname.endsWith(`--${configuredHost}`)
  );
};

export const isAllowedFrontendOrigin = (origin?: string): boolean => {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = normalizeOrigin(origin);

  if (allowedFrontendOrigins.includes(normalizedOrigin)) {
    return true;
  }

  if (allowNetlifyPreviewOrigins && matchesNetlifyPreviewOrigin(normalizedOrigin)) {
    return true;
  }

  return false;
};

export const getAuthCookieOptions = (): CookieOptions => {
  const sameSite = parseSameSite(process.env.COOKIE_SAME_SITE) || (useCrossSiteCookies ? 'none' : 'lax');
  const secure = parseBoolean(process.env.COOKIE_SECURE) ?? useCrossSiteCookies;

  return {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  };
};

export const getAuthCookieClearOptions = (): CookieOptions => {
  const { httpOnly, secure, sameSite, path } = getAuthCookieOptions();

  return {
    httpOnly,
    secure,
    sameSite,
    path
  };
};
