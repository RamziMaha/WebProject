import { api } from './client';

export async function fetchTasks({ listId, status } = {}) {
  const params = new URLSearchParams();
  if (listId) params.append('listId', String(listId));
  if (status) params.append('status', status);
  const qs = params.toString() ? `?${params}` : '';
  return api(`/tasks${qs}`);
}

export async function createTask(payload) {
  return api('/tasks', { method: 'POST', body: payload });
}

export async function updateTask(id, payload) {
  return api(`/tasks/${id}`, { method: 'PATCH', body: payload });
}

export async function deleteTask(id) {
  return api(`/tasks/${id}`, { method: 'DELETE' });
}

