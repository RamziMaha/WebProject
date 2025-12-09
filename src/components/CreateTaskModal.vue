<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="open" class="fixed inset-0 z-50">
        <!-- Backdrop with blur -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')"></div>

        <div class="absolute inset-0 flex items-center justify-center p-6">
          <div class="w-full max-w-2xl rounded-2xl bg-sand-100 border border-[#d9d1c3] shadow-xl p-6">
            <h3 class="text-xl font-bold mb-4">Create Task</h3>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
              <input v-model="title" class="md:col-span-2 rounded-xl px-3 py-2 bg-white border border-[#d1c7b8] focus:outline-none focus:ring-2 focus:ring-[#9c8f7f]" placeholder="New task title" />

              <select v-model="priority" class="rounded-xl px-3 py-2 bg-white border border-[#d1c7b8] focus:outline-none focus:ring-2 focus:ring-[#9c8f7f]">
                <option value="low">Low</option>
                <option value="med">Medium</option>
                <option value="high">High</option>
              </select>

              <input v-model="due" type="date" class="rounded-xl px-3 py-2 bg-white border border-[#d1c7b8] focus:outline-none focus:ring-2 focus:ring-[#9c8f7f]" />
            </div>
            <textarea v-model="description" rows="3" class="mt-3 w-full rounded-xl px-3 py-2 bg-white border border-[#d1c7b8] focus:outline-none focus:ring-2 focus:ring-[#9c8f7f]" placeholder="Optional details"></textarea>

            <div class="mt-4 flex justify-end gap-3">
              <button class="px-4 py-2 rounded-lg bg-[#e7dfd2] text-cocoa-700 font-semibold border border-[#d1c7b8]" @click="$emit('close')">Cancel</button>
              <button class="px-4 py-2 rounded-lg bg-cocoa-700 text-white font-semibold" @click="emitCreate">Add task</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['close','create'])

const title = ref('')
const priority = ref('med')
const due = ref('')
const description = ref('')

function emitCreate() {
  const t = title.value.trim()
  if (!t) return
  emit('create', {
    title: t,
    priority: priority.value,
    due,
    description: description.value
  })
  title.value = ''
  priority.value = 'med'
  due.value = ''
  description.value = ''
}

// Clear on close
watch(() => false, () => {})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

