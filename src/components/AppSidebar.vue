<template>
  <aside class="w-64 bg-sand-100 min-h-screen border-r border-[#d9d1c3] px-6 py-8">
    <div class="mb-8">
      <BrandLink />
    </div>
    <nav class="space-y-2">
      <!-- Static items -->
      <RouterLink
        to="/"
        class="w-full flex items-center gap-3 rounded-xl px-3 py-3 transition"
        active-class="bg-sand-200 text-cocoa-700"
        :class="'hover:bg-sand-150 text-cocoa-700'"
      >
        <span class="w-5 h-5 inline-block" v-html="icons.home"></span>
        <span class="font-medium">Home</span>
      </RouterLink>

      <!-- Dynamic lists -->
      <div class="mt-6 mb-2 text-xs uppercase tracking-wide text-[#9c8f7f]">My Lists</div>
      <div v-if="loading" class="text-sm text-[#9c8f7f]">Loading…</div>
      <div v-else-if="error" class="text-sm text-red-700">{{ error }}</div>
      <RouterLink
        v-for="l in lists"
        :key="l.id"
        :to="`/lists/${l.id}`"
        class="w-full flex items-center gap-3 rounded-xl px-3 py-3 transition"
        active-class="bg-sand-200 text-cocoa-700"
        :class="'hover:bg-sand-150 text-cocoa-700'"
      >
        <span class="w-5 h-5 inline-flex items-center justify-center leading-none" v-html="emojiForType(l.type)"></span>
        <span class="font-medium">{{ l.name }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { icons } from '../icons'
import BrandLink from './BrandLink.vue'
import { useListsStore } from '../store/lists'
import { emojiForType } from '../icons'

const { state, loadLists } = useListsStore()
const lists = computed(() => state.items)
const loading = computed(() => state.loading && !state.loaded)
const error = computed(() => state.error)

onMounted(() => {
  if (!state.loaded) void loadLists()
})
</script>

<style scoped>
.emoji-icon { /* size and alignment for emoji injected via v-html */
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  font-size: 16px;
}
</style>

