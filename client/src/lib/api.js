const BASE = (import.meta.env.VITE_API_URL || '') + '/api';
const KEY = 'zeal_token';

export const auth = {
  get: () => localStorage.getItem(KEY),
  set: (t) => localStorage.setItem(KEY, t),
  clear: () => localStorage.removeItem(KEY),
};

async function request(method, path, body) {
  const token = auth.get();
  const res = await fetch(BASE + path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const type = res.headers.get('content-type') || '';
  const isJson = type.includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : {};
  if (!res.ok) {
    if (res.status === 401 && token && path !== '/auth/login') {
      auth.clear();
      window.dispatchEvent(new Event('zeal-signed-out'));
    }
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  if (!isJson && res.status !== 204) {
    throw new Error(`Expected JSON from ${path}, got ${type || 'no content-type'}`);
  }
  return data;
}

export const api = {
  get: (p) => request('GET', p),
  list: (p) => request('GET', p).then((x) => (Array.isArray(x) ? x : [])).catch(() => []),
  post: (p, b) => request('POST', p, b ?? {}),
  put: (p, b) => request('PUT', p, b ?? {}),
  patch: (p, b) => request('PATCH', p, b ?? {}),
  del: (p) => request('DELETE', p),
};
