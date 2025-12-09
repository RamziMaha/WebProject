<template>
  <section>
    <div class="flex items-center justify-between">
      <h2 class="text-3xl font-extrabold">{{ listTitle }}</h2>
      <button @click="showCreate = true" class="px-3 py-2 rounded-xl bg-cocoa-700 text-white font-semibold">New task</button>
    </div>

    <div class="mt-6">
      <div v-if="loading" class="text-[#9c8f7f]">Loading…</div>
      <div v-else-if="error" class="text-red-700">{{ error }}</div>
      <ul v-else class="space-y-4">
        <li v-for="t in tasks" :key="t.id" class="bg-white border border-[#e3dacb] rounded-2xl shadow-sm hover:shadow-md transition p-4 flex items-center justify-between task-card">
          <div class="flex items-start gap-3">
            <button :class="circleClass(t)" @click="cycleStatus(t)">
              <svg v-if="t.status==='done'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="w-3 h-3" fill="#16a34a"><path d="M8 13.5 4.5 10l1.4-1.4L8 10.7l5.7-5.7L15 6.4z"/></svg>
            </button>
            <div>
              <div class="font-semibold text-cocoa-700">{{ t.title }}</div>
              <div v-if="t.description" class="text-sm text-[#6f655a] mt-0.5">{{ t.description }}</div>
              <div class="mt-1 flex flex-wrap items-center gap-2">
                <span :class="['pill', priorityPillClass(t.priority)]">{{ capitalize(t.priority) }}</span>
                <span v-if="t.dueAt" :class="['pill', duePillClass(t)]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="w-3 h-3 mr-1 inline" fill="currentColor"><path d="M6 2h2v2h4V2h2v2h2v14H4V4h2V2Zm10 6H4v8h12V8Z"/></svg>
                  {{ formatDate(t.dueAt) }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="openEdit(t)" class="px-2 py-1 rounded bg-[#e7dfd2] border border-[#d1c7b8]">Edit</button>
            <button @click="removeTask(t)" class="px-2 py-1 rounded bg-red-600 text-white">Delete</button>
          </div>
        </li>
      </ul>
    </div>

    <CreateTaskModal :open="showCreate" @close="showCreate = false" @create="onCreateFromModal" />
    <EditTaskModal :open="showEdit" :task="editingTask" @close="showEdit = false" @save="onSaveEdit" />
  </section>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchTasks, createTask, updateTask, deleteTask } from '../api/tasks'
import CreateTaskModal from '../components/CreateTaskModal.vue'
import EditTaskModal from '../components/EditTaskModal.vue'

const route = useRoute()
const listId = ref(Number(route.params.id))
const listTitle = ref('List')
const tasks = ref([])
const loading = ref(false)
const error = ref('')
const form = ref({ title: '', priority: 'med', due: '', description: '' })
const showCreate = ref(false)
const showEdit = ref(false)
const editingTask = ref(null)

watch(() => route.params.id, (val) => {
  listId.value = Number(val)
  load()
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await fetchTasks({ listId: listId.value })
    tasks.value = data
    if (tasks.value.length && tasks.value[0].listName) {
      listTitle.value = tasks.value[0].listName
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load tasks'
  } finally {
    loading.value = false
  }
}

async function onAddTask() {
  const title = form.value.title.trim()
  if (!title) return
  try {
    const payload = { listId: listId.value, title, priority: form.value.priority }
    if (form.value.description) payload.description = form.value.description
    if (form.value.due) payload.dueAt = new Date(form.value.due).toISOString()
    const created = await createTask(payload)
    tasks.value.push(created)
    form.value = { title: '', priority: 'med', due: '', description: '' }
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to add task')
  }
}

async function onCreateFromModal(payload) {
  form.value.title = payload.title
  form.value.priority = payload.priority
  form.value.description = payload.description
  form.value.due = payload.due?.value || payload.due || ''
  await onAddTask()
  showCreate.value = false
}

function nextStatus(status) {
  return status === 'done' ? 'todo' : 'done'
}

async function cycleStatus(t) {
  const newStatus = nextStatus(t.status)
  try {
    const updated = await updateTask(t.id, { status: newStatus })
    t.status = updated.status
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to update task')
  }
}

async function removeTask(t) {
  try {
    await deleteTask(t.id)
    tasks.value = tasks.value.filter(x => x.id !== t.id)
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to delete task')
  }
}

onMounted(load)

function openEdit(t) {
  editingTask.value = { ...t }
  showEdit.value = true
}

async function onSaveEdit(payload) {
  if (!editingTask.value) return
  try {
    const updated = await updateTask(editingTask.value.id, payload)
    const idx = tasks.value.findIndex(x => x.id === editingTask.value.id)
    if (idx !== -1) {
      tasks.value[idx] = { ...tasks.value[idx], ...updated }
    }
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to update task')
  } finally {
    showEdit.value = false
    editingTask.value = null
  }
}

function formatDate(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString()
  } catch { return iso }
}

function circleClass(t) {
  const base = 'status-circle '
  if (t.status === 'done') return base + 'status-done'
  const pr = t.priority === 'high' ? 'priority-high' : (t.priority === 'low' ? 'priority-low' : 'priority-med')
  return base + 'status-todo ' + pr
}

function capitalize(s) {
  if (!s) return ''
  return String(s).charAt(0).toUpperCase() + String(s).slice(1)
}

function daysUntil(dateIso) {
  try {
    const today = new Date()
    const d = new Date(dateIso)
    const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const t1 = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    return Math.round((t1 - t0) / (1000*60*60*24))
  } catch { return undefined }
}

function duePillClass(t) {
  const n = daysUntil(t.dueAt)
  if (n === undefined) return 'pill-neutral'
  if (n < 0) return 'pill-danger'
  if (n <= 2) return 'pill-warn'
  return 'pill-neutral'
}

function priorityPillClass(p) {
  if (p === 'high') return 'pill-danger'
  if (p === 'med') return 'pill-info'
  return 'pill-neutral'
}
</script>

<style scoped>
.status-circle {
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #c8bfb0;
  background: #fff;
}
.status-todo { }
.status-done { border-color: #16a34a; }
.priority-low { border-color: #c8bfb0; }
.priority-med { border-color: #2563eb; }
.priority-high { border-color: #dc2626; }

.pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 12px;
  line-height: 1.2;
  border: 1px solid transparent;
}
.pill-neutral { background: #eef2f7; color: #374151; border-color: #e5e7eb; }
.pill-info { background: #dbeafe; color: #2563eb; border-color: #bfdbfe; }
.pill-warn { background: #fef3c7; color: #b45309; border-color: #fde68a; }
.pill-danger { background: #fee2e2; color: #dc2626; border-color: #fecaca; }
</style>

