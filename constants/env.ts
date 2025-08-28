// Environment Configuration
// This file centralizes all environment variables and their defaults

export const ENV_CONFIG = {
  // Backend API Configuration
  API_BASE: process.env.EXPO_PUBLIC_API_BASE || 'https://your-api-domain.com',
  API_VERSION_PREFIX: process.env.EXPO_PUBLIC_API_VERSION || '/api', // allow switching to /api/v1
  
  // Firebase Configuration
  FIREBASE: {
    API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDCH6aWsVl6_5S-w5AovBbUGRQKWe8LH4g',
    AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'novabot-7ao7b.firebaseapp.com',
    PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'novabot-7ao7b',
    STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'novabot-7ao7b.appspot.com',
    MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '793201613927',
    APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:793201613927:web:112b9aff1265f0233188c2',
  },
  
  // AI Service Configuration
  AI: {
    PROVIDER: process.env.EXPO_PUBLIC_AI_PROVIDER || 'gemini',
    MODEL: process.env.EXPO_PUBLIC_AI_MODEL || 'gemini-pro',
    TEMPERATURE: parseFloat(process.env.EXPO_PUBLIC_AI_TEMPERATURE || '0.7'),
    GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
    OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  },
  
  // App Configuration
  APP: {
    NAME: 'NovaBot',
    VERSION: '1.0.0',
    DESCRIPTION: 'AI-powered document generation and management platform',
  },
  
  // Feature Flags
  FEATURES: {
    ENABLE_FIREBASE_AUTH: true,
    ENABLE_AI_GENERATION: true,
    ENABLE_AI_CHAT: true,
    ENABLE_FILE_CONVERSION: true,
    ENABLE_DOCUMENT_MANAGEMENT: true,
  },
  // Observability
  SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
};

// Helper function to check if running in development
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development' || __DEV__;
};

// Helper function to check if running on web
export const isWeb = () => {
  return typeof window !== 'undefined';
};

// Helper function to get API URL with proper formatting
export const getApiUrl = (endpoint: string) => {
  const base = ENV_CONFIG.API_BASE.replace(/\/$/, '');
  const rawPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // If endpoint starts with /api/ and version prefix differs, rewrite
  if (rawPath.startsWith('/api/') && ENV_CONFIG.API_VERSION_PREFIX && ENV_CONFIG.API_VERSION_PREFIX !== '/api') {
    return `${base}${rawPath.replace('/api', ENV_CONFIG.API_VERSION_PREFIX)}`;
  }
  return `${base}${rawPath}`;
};

// Helper function to get AI provider configuration
export const getAIProvider = () => {
  return {
    provider: ENV_CONFIG.AI.PROVIDER,
    model: ENV_CONFIG.AI.MODEL,
    temperature: ENV_CONFIG.AI.TEMPERATURE,
    apiKey: ENV_CONFIG.AI.PROVIDER === 'gemini' 
      ? ENV_CONFIG.AI.GEMINI_API_KEY 
      : ENV_CONFIG.AI.OPENAI_API_KEY,
  };
};
