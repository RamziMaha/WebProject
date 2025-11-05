<template>
  <aside class="w-64 bg-sand-100 min-h-screen border-r border-[#d9d1c3] px-6 py-8">
    <div class="mb-8">
      <BrandLink />
    </div>
    <nav class="space-y-2">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="w-full flex items-center gap-3 rounded-xl px-3 py-3 transition"
        active-class="bg-sand-200 text-cocoa-700"
        :class="'hover:bg-sand-150 text-cocoa-700'"
      >
        <span class="w-5 h-5 inline-block" v-html="item.icon"></span>
        <span class="font-medium">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup>
import { icons } from '../icons'
import BrandLink from './BrandLink.vue'

const items = [
  { to: '/', label: 'Home', icon: icons.home },
  { to: '/work', label: 'Work Projects', icon: icons.users },
  { to: '/errands', label: 'Personal Errands', icon: icons.list },
  { to: '/grocery', label: 'Grocery List', icon: icons.cart },
  { to: '/trip', label: 'Trip to Japan', icon: icons.plane }
]
</script>
