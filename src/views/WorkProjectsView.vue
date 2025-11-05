<template>
  <section>
    <div class="flex items-center justify-between">
      <h2 class="text-3xl font-extrabold">Project Phoenix</h2>
      <div class="flex items-center gap-3">
        <span class="text-[#9c8f7f] mr-2">Filter by member:</span>
        <button
          v-for="m in members"
          :key="m"
          @click="activeMember.value = m"
          class="w-9 h-9 rounded-full border flex items-center justify-center"
          :class="activeMember.value === m ? 'border-[#2f2b26]' : 'border-[#d1c7b8] bg-[#e7dfd2]'"
        >
          <span class="font-semibold">{{ m }}</span>
        </button>
      </div>
    </div>

    <div class="mt-4">
      <div class="text-sm text-[#9c8f7f] mb-2">Overall Progress</div>
      <div class="h-2 bg-[#e1d9cb] rounded-full overflow-hidden">
        <div class="h-full bg-cocoa-700" :style="{ width: progress + '%' }"></div>
      </div>
      <div class="text-right text-sm text-[#9c8f7f] mt-1">{{ progress }}%</div>
    </div>

    <h3 class="mt-6 text-xl font-semibold border-t border-[#d9d1c3] pt-4">Tasks ({{ filteredTasks.length }})</h3>

    <ul class="mt-3 space-y-4">
      <TaskItem
        v-for="t in filteredTasks"
        :key="t.id"
        :task="t"
        @toggle="t.done = !t.done"
      />
    </ul>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import TaskItem from '../components/TaskItem.vue'

const members = ['A','M','K','All']
const activeMember = ref('All')
const tasks = ref([
  { id: 1, title: 'Design homepage wireframes', owner: 'A', due: 'Nov 10', done: false },
  { id: 2, title: 'Develop API endpoints', owner: 'M', due: 'Nov 12', done: false },
  { id: 3, title: 'Create style guide', owner: 'A', done: true },
  { id: 4, title: 'Setup database schema', owner: 'K', due: 'Nov 11', done: false },
  { id: 5, title: 'Frontend authentication', owner: 'M', due: 'Nov 14', done: false },
])

const filteredTasks = computed(() => activeMember.value === 'All' ? tasks.value : tasks.value.filter(t => t.owner === activeMember.value))
const progress = computed(() => Math.round((tasks.value.filter(t=>t.done).length / tasks.value.length) * 100))
</script>
