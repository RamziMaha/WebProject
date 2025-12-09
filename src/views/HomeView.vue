<template>
  <section>
    <h2 class="text-3xl font-extrabold mb-6">Welcome Back!</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Creation actions -->
      <TileCard :icon="icons.plus" title="Create new TO DO list" subtitle="Start a fresh list for your tasks." @click="showCreateTodo = true" />
      <TileCard :icon="icons.users" title="Create a new Group list" subtitle="Collaborate with your team." @click="showCreateGroup = true" />
    </div>

    <h3 class="mt-8 text-xl font-semibold">Your Lists</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-3">
      <div v-for="l in lists" :key="l.id" class="relative">
        <TileCard :icon="emojiForType(l.type)" :title="l.name" :subtitle="formatType(l.type)" @click="openList(l)" />
        <button
          title="Delete list"
          class="absolute top-2 right-2 p-2 rounded-lg bg-[#efe9df] text-cocoa-700 border border-[#d1c7b8] hover:bg-[#e7dfd2]"
          @click.stop="onDeleteList(l)"
        >
          <span v-html="icons.trash"></span>
        </button>
      </div>
    </div>

    <CreateGroupModal :open="showCreateGroup" @close="showCreateGroup = false" @create="handleCreateGroup" />
    <CreateTodoModal :open="showCreateTodo" @close="showCreateTodo = false" @create="handleCreateList" />
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TileCard from '../components/TileCard.vue'
import CreateGroupModal from '../components/CreateGroupModal.vue'
import CreateTodoModal from '../components/CreateTodoModal.vue'
import { icons, emojiForType } from '../icons'
import { fetchLists, createList, deleteList } from '../api/lists'
import { inviteMembers } from '../api/members'
import { useListsStore } from '../store/lists'
// emojiForType imported from icons.js

const router = useRouter()
const showCreateGroup = ref(false)
const showCreateTodo = ref(false)

const lists = ref([])
const loading = ref(false)
const error = ref('')
const { addList, removeList } = useListsStore()

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    lists.value = await fetchLists()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load lists'
  } finally {
    loading.value = false
  }
})

async function handleCreateList(payload) {
  try {
    const created = await createList(payload)
    const item = { id: created.id, name: created.name, type: created.type }
    lists.value.push(item)
    addList(item)
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to create list')
  }
}

function openList(l) {
  router.push(`/lists/${l.id}`)
}

function formatType(t) {
  if (!t) return ''
  return String(t).charAt(0).toUpperCase() + String(t).slice(1)
}

async function onDeleteList(l) {
  if (!confirm(`Delete list "${l.name}"? This will remove its tasks.`)) return
  try {
    await deleteList(l.id)
    lists.value = lists.value.filter(x => x.id !== l.id)
    removeList(l.id)
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to delete list')
  }
}

// Create group list then invite members by email
async function handleCreateGroup({ name, emails }) {
  try {
    const created = await createList({ name, type: 'work' })
    const item = { id: created.id, name: created.name, type: created.type }
    lists.value.push(item)
    addList(item)
    if (emails && emails.length) {
      const res = await inviteMembers(created.id, emails)
      if (res.notFound && res.notFound.length) {
        alert(`Some emails were not found: ${res.notFound.join(', ')}`)
      }
    }
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to create group list')
  }
}
</script>


