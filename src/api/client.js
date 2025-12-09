const API_URL = import.meta?.env?.VITE_API_URL || 'http://localhost:4000';

let csrfToken = null;

async function ensureCsrf() {
  if (!csrfToken) {
    const res = await fetch(`${API_URL}/auth/csrf-token`, {
      credentials: 'include'
    });
    const data = await res.json();
    csrfToken = data.csrfToken;
  }
}

export async function api(path, { method = 'GET', headers = {}, body } = {}) {
  const opts = {
    method,
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers
    }
  };

  if (body && typeof body !== 'string') {
    opts.body = JSON.stringify(body);
  } else if (body) {
    opts.body = body;
  }

  // Attach CSRF for state-changing methods
  if (method !== 'GET' && method !== 'HEAD') {
    await ensureCsrf();
    opts.headers['X-CSRF-Token'] = csrfToken;
  }

  const res = await fetch(`${API_URL}${path}`, opts);
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;

  // Rotate CSRF if backend returns one
  if (data && data.csrfToken) {
    csrfToken = data.csrfToken;
  }

  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  return data;
}

export function setCsrf(token) {
  csrfToken = token;
}

