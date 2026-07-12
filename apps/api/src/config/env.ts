import 'dotenv/config';

function optional(name: string, fallback = ''): string {
  return process.env[name] ?? fallback;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    // eslint-disable-next-line no-console
    console.warn(`[env] Missing required env var ${name}. Some features will be disabled until it is set.`);
    return '';
  }
  return value;
}

export const env = {
  PORT: Number(optional('PORT', '4000')),
  NODE_ENV: optional('NODE_ENV', 'development'),
  CORS_ORIGIN: optional('CORS_ORIGIN', 'http://localhost:3000'),
  SUPABASE_URL: required('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: required('SUPABASE_SERVICE_ROLE_KEY'),
  FIREBASE_PROJECT_ID: optional('FIREBASE_PROJECT_ID'),
  FIREBASE_CLIENT_EMAIL: optional('FIREBASE_CLIENT_EMAIL'),
  FIREBASE_PRIVATE_KEY: optional('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
  RATE_LIMIT_WINDOW_MS: Number(optional('RATE_LIMIT_WINDOW_MS', '60000')),
  RATE_LIMIT_MAX: Number(optional('RATE_LIMIT_MAX', '120')),
  CACHE_TTL_QUOTE_SECONDS: Number(optional('CACHE_TTL_QUOTE_SECONDS', '60')),
  CACHE_TTL_HISTORY_SECONDS: Number(optional('CACHE_TTL_HISTORY_SECONDS', '3600')),
  CACHE_TTL_NEWS_SECONDS: Number(optional('CACHE_TTL_NEWS_SECONDS', '900')),
  ADMIN_EMAILS: optional('ADMIN_EMAILS')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
};

export const isProduction = env.NODE_ENV === 'production';
