<template>
  <div class="relative min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md rounded-2xl border border-[#d9d1c3] bg-[#efebe4] shadow-tile p-8">
      <h1 class="text-2xl font-extrabold text-center mb-6">Create your account</h1>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="block text-sm text-[#9c8f7f] mb-1">Name (optional)</label>
          <input v-model="name" type="text" class="w-full rounded-xl px-3 py-2 bg-white border border-[#d1c7b8] focus:outline-none focus:ring-2 focus:ring-[#9c8f7f]" placeholder="Jane" />
        </div>
        <div>
          <label class="block text-sm text-[#9c8f7f] mb-1">Email</label>
          <input v-model="email" type="email" required class="w-full rounded-xl px-3 py-2 bg-white border border-[#d1c7b8] focus:outline-none focus:ring-2 focus:ring-[#9c8f7f]" placeholder="you@example.com" />
        </div>
        <div>
          <label class="block text-sm text-[#9c8f7f] mb-1">Password</label>
          <input v-model="password" type="password" required minlength="8" class="w-full rounded-xl px-3 py-2 bg-white border border-[#d1c7b8] focus:outline-none focus:ring-2 focus:ring-[#9c8f7f]" placeholder="••••••••" />
        </div>
        <button :disabled="loading" class="w-full px-4 py-2 rounded-lg bg-cocoa-700 text-white font-semibold shadow hover:bg-cocoa-900 disabled:opacity-60">{{ loading ? 'Creating…' : 'Create account' }}</button>
        <p v-if="error" class="text-sm text-red-700">{{ error }}</p>
        <p v-if="success" class="text-sm text-green-700">Account created. Redirecting…</p>
      </form>

      <p class="text-center text-sm text-[#9c8f7f] mt-6">
        Already have an account?
        <RouterLink to="/login" class="underline">Sign in</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getCsrf, register, login } from '../api/auth'

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)
const router = useRouter()

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await getCsrf()
    await register({ email: email.value, password: password.value, name: name.value || undefined })
    success.value = true
    // Auto-login for convenience
    await login({ email: email.value, password: password.value })
    router.push('/')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>

