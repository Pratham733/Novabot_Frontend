import axios from 'axios';
import { API_ROUTES } from '@/constants/config';

export const api = axios.create({ baseURL: API_ROUTES.apiRoot });

let accessToken: string | undefined;
let refreshToken: string | undefined;

export function setTokens(tokens?: { access?: string; refresh?: string }) {
  accessToken = tokens?.access;
  refreshToken = tokens?.refresh;
  if (accessToken) api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  else delete api.defaults.headers.common['Authorization'];
}

export function setAuth(token?: string) {
  setTokens({ access: token });
}

// Always attach Authorization if we have a token
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers || {};
    (config.headers as any)['Authorization'] = `Bearer ${accessToken}`;
  }
  return config;
});

export async function register(payload: {username: string; password: string; password2: string; email?: string; display_name?: string;}) {
  // Use absolute URL here to avoid sending the api instance's Authorization header
  // (which may contain an invalid token and cause the backend to return 403).
  const { data } = await axios.post(API_ROUTES.auth.register, payload);
  return data;
}
export async function login(username: string, password: string) {
  const { data } = await api.post(API_ROUTES.auth.token.replace(API_ROUTES.apiRoot, ''), { username, password });
  return data as { access: string; refresh: string };
}
export async function refresh() {
  if (!refreshToken) throw new Error('No refresh token');
  const url = API_ROUTES.auth.token.replace('/token/', '/token/refresh/');
  const { data } = await api.post(url.replace(API_ROUTES.apiRoot, ''), { refresh: refreshToken });
  return data as { access: string };
}
export async function updateProfile(payload: { display_name?: string; bio?: string; avatar?: string }) {
  // Use relative path so axios baseURL (apiRoot) is preserved (avoids dropping /api/)
  const endpoint = 'profile/';
  const { data } = await api.post(endpoint, payload as any);
  return data;
}
let cachedProfile: any | undefined;
let lastProfileFetch = 0;
let attemptedMeMerge = false;
export async function getProfile(force = false) {
  const now = Date.now();
  if (!force && cachedProfile && (now - lastProfileFetch) < 60000) return cachedProfile;
  const endpoint = 'profile/';
  // If we have no access token set, short‑circuit to avoid hammering the backend with guaranteed 403s
  if (!accessToken) {
    const err: any = new Error('Not authenticated');
    err.code = 'NO_TOKEN';
    throw err;
  }
  let data: any;
  try {
    ({ data } = await api.get(endpoint));
  } catch (e: any) {
    const status = e?.response?.status;
    if (status === 401 || status === 403) {
      const err: any = new Error('Unauthorized');
      err.code = 'UNAUTHORIZED';
      err.status = status;
      throw err;
    }
    throw e;
  }
  let merged = data;
  if ((!merged || (!merged.email && !merged.display_name)) && !attemptedMeMerge) {
    try {
      const me = await api.get('auth/me/');
      merged = { ...me.data, ...merged };
    } catch {} finally { attemptedMeMerge = true; }
  }
  cachedProfile = merged;
  lastProfileFetch = now;
  return cachedProfile;
}
export async function loginWithFirebase(idToken: string) {
  const url = API_ROUTES.auth.register.replace('/register/', '/firebase/');
  // Prefer the explicit API route constant
  const { data } = await axios.post(`${API_ROUTES.apiRoot}auth/firebase/`, { id_token: idToken });
  setTokens({ access: data.access, refresh: data.refresh });
  return data as { access: string; refresh: string };
}
export async function chat(messages: {role:'user'|'assistant'|'system'; content: string}[], opts?: {provider?: string; model?: string; temperature?: number}) {
  const { data } = await api.post(API_ROUTES.chat.replace(API_ROUTES.apiRoot, ''), { messages, ...opts });
  return data;
}
export async function health() {
  // Call absolute path to avoid baseURL duplication issues
  const { data } = await axios.get(API_ROUTES.health);
  return data as { status?: string } & Record<string, any>;
}
export async function createDocument(doc: {doc_type: string; title: string; content: string}) {
  const { data } = await api.post(API_ROUTES.documents.replace(API_ROUTES.apiRoot, ''), doc);
  return data;
}
export async function generateDocument(doc: {doc_type: string; title: string; prompt: string}) {
  const { data } = await api.post(API_ROUTES.documents.replace(API_ROUTES.apiRoot, '') + 'generate/', doc);
  return data;
}
export async function listDocuments() {
  const { data } = await api.get(API_ROUTES.documents.replace(API_ROUTES.apiRoot, ''));
  return data as { results?: any[] } | any[];
}
export async function getDocument(id: number) {
  const { data } = await api.get(API_ROUTES.documents.replace(API_ROUTES.apiRoot, '') + `${id}/`);
  return data;
}
export async function regenerateDocument(id: number, instructions?: string) {
  const { data } = await api.post(API_ROUTES.documents.replace(API_ROUTES.apiRoot, '') + `${id}/regenerate/`, { instructions });
  return data;
}
export async function finalizeDocument(id: number, opts?: { provider?: string; model?: string; temperature?: number }) {
  const { data } = await api.post(API_ROUTES.documents.replace(API_ROUTES.apiRoot, '') + `${id}/finalize/`, opts || {});
  return data;
}

export async function exportDocument(id: number, format = 'txt') {
  const url = API_ROUTES.documents.replace(API_ROUTES.apiRoot, '') + `${id}/export/?format=${encodeURIComponent(format)}`;
  // Use axios instance to preserve auth header
  const { data, headers } = await api.get(url, { responseType: 'arraybuffer' } as any);
  return { data, headers } as any;

}

export async function convertDocumentFile(file: File, format = 'txt') {
  const form = new FormData();
  // @ts-ignore - File types in RN web
  form.append('file', file as any);
  form.append('format', format);
  // Allow non-2xx responses so frontend can show server messages (501 Not Implemented)
  const resp = await api.post(API_ROUTES.documents.replace(API_ROUTES.apiRoot, '') + 'convert/', form as any, { headers: { 'Content-Type': 'multipart/form-data' }, validateStatus: () => true } as any);
  return resp;
}

export async function convertCapabilities() {
  const { data } = await api.get(API_ROUTES.documents.replace(API_ROUTES.apiRoot, '') + 'convert/capabilities/');
  return data as { formats: string[] };
}

// Chat aliases for backward compatibility
export const sendMessage = chat;
export async function clearChatHistory() {
  // This would typically call a backend endpoint to clear chat history
  // For now, return a simple success response
  return { success: true };
}

// Axios 401 interceptor for token refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error?.response?.status === 401 && !original._retry && refreshToken) {
      original._retry = true;
      try {
        const { access } = await refresh();
        setTokens({ access, refresh: refreshToken });
        original.headers = original.headers || {};
        original.headers['Authorization'] = `Bearer ${access}`;
        return api(original);
      } catch (e) {}
    }
    return Promise.reject(error);
  }
);
