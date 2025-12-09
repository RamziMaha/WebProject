import { reactive } from 'vue'
import { fetchLists } from '../api/lists'

const state = reactive({ items: [], loaded: false, loading: false, error: '' })

export async function loadLists() {
  if (state.loading) return
  state.loading = true
  state.error = ''
  try {
    state.items = await fetchLists()
    state.loaded = true
  } catch (e) {
    state.error = e instanceof Error ? e.message : 'Failed to load lists'
  } finally {
    state.loading = false
  }
}

export function addList(list) {
  // avoid duplicates
  if (!state.items.some((l) => l.id === list.id)) {
    state.items.push(list)
  }
}

export function removeList(id) {
  state.items = state.items.filter((l) => l.id !== id)
}

export function useListsStore() {
  return { state, loadLists, addList, removeList, reset }
}

export function reset() {
  state.items = []
  state.loaded = false
  state.loading = false
  state.error = ''
}
