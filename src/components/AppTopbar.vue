<template>
  <div class="sticky top-0 bg-sand-50/80 backdrop-blur supports-[backdrop-filter]:bg-sand-50/70 z-10">
    <div class="flex items-center justify-end gap-4 px-8 py-5 border-b border-[#d9d1c3]">
      <RouterLink v-if="!isLoggedIn" to="/login" class="px-3 py-2 rounded-xl bg-cocoa-700 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#9c8f7f]">
        Log in
      </RouterLink>
      <button v-else @click="onLogout" class="px-3 py-2 rounded-xl bg-cocoa-700 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#9c8f7f]">
        Log out
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { me, logout } from '../api/auth'
import { useRouter } from 'vue-router'
import { reset as resetLists } from '../store/lists'

const router = useRouter()
const isLoggedIn = ref(false)

onMounted(async () => {
  try {
    const user = await me()
    isLoggedIn.value = !!user
  } catch {
    isLoggedIn.value = false
  }
})

async function onLogout() {
  try {
    await logout()
  } finally {
    isLoggedIn.value = false
    resetLists()
    router.push('/login')
  }
}
</script>
