<template>
  <div class="sticky top-0 bg-sand-50/80 backdrop-blur supports-[backdrop-filter]:bg-sand-50/70 z-10">
    <div class="flex items-center justify-end gap-4 px-8 py-5 border-b border-[#d9d1c3]">
      <div class="relative w-80">
        <input
          class="w-full rounded-xl pl-10 pr-4 py-2 bg-[#efebe4] border border-[#d9d1c3] placeholder-[#9c8f7f] focus:outline-none focus:ring-2 focus:ring-[#9c8f7f]"
          placeholder="Search..."
        />
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#9c8f7f]" v-html="icons.search"></span>
      </div>
      <RouterLink to="/login" class="w-9 h-9 rounded-full bg-[#d9d1c3] text-cocoa-700 flex items-center justify-center font-semibold focus:outline-none focus:ring-2 focus:ring-[#9c8f7f]">A</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { icons } from '../icons'
</script>
