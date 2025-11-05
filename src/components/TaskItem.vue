<template>
  <li class="surface-card px-4 py-3">
    <div class="flex items-center gap-4">
      <input
        type="checkbox"
        class="w-5 h-5 rounded-md border-[#bfb5a6] text-blue-600 focus:ring-blue-600"
        :checked="task.done"
        @change="$emit('toggle')"
      />
      <div class="flex-1">
        <div :class="task.done ? 'line-through text-[#9c8f7f]' : ''" class="font-medium">{{ task.title }}</div>
      </div>
      <span v-if="task.due" class="pill">Due: {{ task.due }}</span>
      <div class="w-8 h-8 rounded-full bg-[#d9d1c3] flex items-center justify-center font-semibold ml-2">{{ task.owner }}</div>
    </div>
  </li>
  
</template>

<script setup>
defineProps({ task: { type: Object, required: true } })
defineEmits(['toggle'])
</script>

