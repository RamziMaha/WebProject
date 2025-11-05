<template>
  <section>
    <div class="flex items-center justify-between">
      <h2 class="text-3xl font-extrabold">Personal Errands</h2>
      <button class="px-4 py-2 rounded-lg bg-cocoa-700 text-white font-semibold shadow hover:bg-cocoa-900" @click="addErrand()">
        <span class="mr-2" v-html="icons.plusSm"></span> Add Task
      </button>
    </div>

    <h3 class="mt-6 text-xl font-semibold border-t border-[#d9d1c3] pt-4">Today ({{ errands.length }})</h3>

    <ul class="mt-3 space-y-4">
      <li v-for="e in errands" :key="e.id" class="surface-card px-4 py-3">
        <div class="flex items-center gap-4">
          <input type="checkbox" class="w-5 h-5 rounded-md border-[#bfb5a6] text-blue-600 focus:ring-blue-600" v-model="e.done" />
          <div class="flex-1">
            <div :class="e.done ? 'line-through text-[#9c8f7f]' : ''" class="font-medium">{{ e.title }}</div>
          </div>
          <span v-if="e.due" class="pill">{{ e.due }}</span>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { icons } from '../icons'

const errands = ref([
  { id: 1, title: 'Pick up dry cleaning', due: 'by 5:00 PM', done: false },
  { id: 2, title: 'Call the bank', done: false },
  { id: 3, title: 'Book dentist appointment', done: true },
  { id: 4, title: 'Buy milk and eggs', done: false },
  { id: 5, title: "RSVP to Jen's party", due: 'EOD', done: false },
])

function addErrand() {
  errands.value.push({ id: Date.now(), title: 'New task', done: false })
}
</script>
