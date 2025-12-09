<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="open" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>
        <div class="absolute inset-0 flex items-center justify-center p-6">
          <div class="w-full max-w-lg rounded-2xl bg-sand-100 border border-[#d9d1c3] shadow-xl p-6">
            <h3 class="text-xl font-bold mb-4">Create New Group List</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm text-[#9c8f7f] mb-1">List Name</label>
                <input v-model="name" class="w-full rounded-xl px-3 py-2 bg-white border border-[#d1c7b8] focus:outline-none focus:ring-2 focus:ring-[#9c8f7f]" placeholder="e.g., 'Project Phoenix'" />
              </div>
              <div>
                <label class="block text-sm text-[#9c8f7f] mb-1">Invite Members</label>
                <input v-model="emails" class="w-full rounded-xl px-3 py-2 bg-white border border-[#d1c7b8] focus:outline-none focus:ring-2 focus:ring-[#9c8f7f]" placeholder="e.g., 'maria@example.com, kenji@example.com'" />
                <p class="text-xs text-[#9c8f7f] mt-1">Separate emails with commas. Users must already have an account.</p>
              </div>
              <div class="flex justify-end gap-3 pt-2">
                <button class="px-4 py-2 rounded-lg bg-[#e7dfd2] text-cocoa-700 font-semibold border border-[#d1c7b8]" @click="$emit('close')">Cancel</button>
                <button class="px-4 py-2 rounded-lg bg-cocoa-700 text-white font-semibold" @click="onCreate">Create & Invite</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['close','create'])

const name = ref('')
const emails = ref('')

function onCreate() {
  const n = name.value.trim()
  if (!n) return
  const invites = emails.value
    .split(',')
    .map((e) => e.trim())
    .filter((e) => e.length > 0)
  emit('create', { name: n, emails: invites })
  name.value = ''
  emails.value = ''
  emit('close')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>

