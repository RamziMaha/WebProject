import { api } from './client';

export async function fetchLists({ includeTasks = false } = {}) {
  const qs = includeTasks ? '?includeTasks=true' : '';
  return api(`/lists${qs}`);
}

export async function createList({ name, type }) {
  return api('/lists', { method: 'POST', body: { name, type } });
}

export async function deleteList(id) {
  return api(`/lists/${id}`, { method: 'DELETE' });
}
