<template>
  <div class="relative min-h-screen flex items-center justify-center px-4">
    <div class="absolute left-6 top-6">
      <BrandLink />
    </div>
    <div class="w-full max-w-md rounded-2xl border border-[#d9d1c3] bg-[#efebe4] shadow-tile p-8">
      <h1 class="text-2xl font-extrabold text-center mb-6">Sign in to Toodoz</h1>

      <form class="space-y-4" @submit.prevent>
        <div>
          <label class="block text-sm text-[#9c8f7f] mb-1">Email</label>
          <input type="email" required class="w-full rounded-xl px-3 py-2 bg-white border border-[#d1c7b8] focus:outline-none focus:ring-2 focus:ring-[#9c8f7f]" placeholder="you@example.com" />
        </div>
        <div>
          <label class="block text-sm text-[#9c8f7f] mb-1">Password</label>
          <input type="password" required class="w-full rounded-xl px-3 py-2 bg-white border border-[#d1c7b8] focus:outline-none focus:ring-2 focus:ring-[#9c8f7f]" placeholder="••••••••" />
        </div>
        <div class="flex items-center justify-between">
          <label class="inline-flex items-center gap-2 text-sm text-[#2f2b26]">
            <input type="checkbox" class="rounded border-[#bfb5a6] text-blue-600 focus:ring-blue-600"> Remember me
          </label>
          <RouterLink to="/" class="text-sm text-[#2f2b26] underline">Back to app</RouterLink>
        </div>
        <button class="w-full px-4 py-2 rounded-lg bg-cocoa-700 text-white font-semibold shadow hover:bg-cocoa-900">Sign in</button>
      </form>

      <p class="text-center text-sm text-[#9c8f7f] mt-6">Don’t have an account? <a href="#" class="underline">Create one</a></p>
    </div>
  </div>
</template>

<script setup>

import BrandLink from '../components/BrandLink.vue'
</script>
