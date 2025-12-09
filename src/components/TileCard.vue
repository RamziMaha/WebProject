<template>
  <button class="surface-card p-8 text-left w-full" @click="$emit('click')">
    <div class="flex items-center gap-4">
      <div class="w-12 h-12 rounded-full bg-[#d9d1c3] flex items-center justify-center" v-html="icon"></div>
      <div>
        <div class="font-semibold">{{ title }}</div>
        <div v-if="subtitle" class="text-[#9c8f7f]">{{ subtitle }}</div>
        <slot />
      </div>
    </div>
  </button>
  
</template>

<script setup>
defineProps({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' }
})
defineEmits(['click'])
</script>

<style scoped>
.emoji-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  font-size: 22px;
}
</style>
