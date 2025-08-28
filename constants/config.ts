import { ENV_CONFIG, getApiUrl } from './env';

// Frontend configuration using centralized environment variables
export const API_BASE = ENV_CONFIG.API_BASE;
export const API_ROUTES = {
  root: getApiUrl('/'),
  docs: getApiUrl('/api/docs/'),
  schema: getApiUrl('/api/schema/'),
  health: getApiUrl('/api/health/'),
  apiRoot: getApiUrl('/api/'), // auto-rewritten if EXPO_PUBLIC_API_VERSION is set (e.g., /api/v1)
  auth: {
    register: getApiUrl('/api/auth/register/'),
    token: getApiUrl('/api/auth/token/'),
    me: getApiUrl('/api/auth/me/'),
    firebase: getApiUrl('/api/auth/firebase/'),
  },
  chat: getApiUrl('/api/chat/'),
  chatHistory: getApiUrl('/api/chat/history/'),
  documents: getApiUrl('/api/documents/'),
  convert: getApiUrl('/api/documents/convert/'),
  convertedFiles: getApiUrl('/api/converted/'),
};

// AI Configuration
export const AI_CONFIG = {
  provider: ENV_CONFIG.AI.PROVIDER,
  model: ENV_CONFIG.AI.MODEL,
  temperature: ENV_CONFIG.AI.TEMPERATURE,
};

// App Configuration
export const APP_CONFIG = {
  name: ENV_CONFIG.APP.NAME,
  version: ENV_CONFIG.APP.VERSION,
  description: ENV_CONFIG.APP.DESCRIPTION,
};

// Feature Flags
export const FEATURES = ENV_CONFIG.FEATURES;
