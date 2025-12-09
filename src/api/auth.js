import { api, setCsrf } from './client';

export async function getCsrf() {
  const data = await api('/auth/csrf-token');
  if (data?.csrfToken) setCsrf(data.csrfToken);
  return data.csrfToken;
}

export async function register({ email, password, name }) {
  const data = await api('/auth/register', { method: 'POST', body: { email, password, name } });
  if (data?.csrfToken) setCsrf(data.csrfToken);
  return data;
}

export async function login({ email, password }) {
  const data = await api('/auth/login', { method: 'POST', body: { email, password } });
  if (data?.csrfToken) setCsrf(data.csrfToken);
  return data.user;
}

export async function logout() {
  const data = await api('/auth/logout', { method: 'POST' });
  if (data?.csrfToken) setCsrf(data.csrfToken);
}

export async function me() {
  const data = await api('/auth/me');
  return data.user;
}

