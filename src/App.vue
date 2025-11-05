<template>
  <div class="min-h-screen bg-sand-50 text-cocoa-700">
    
    <div v-if="isAuth">
      <RouterView />
    </div>

    
    <div v-else class="flex">
      <AppSidebar />
      <main class="flex-1">
        <AppTopbar />
        <div class="px-10 py-8">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
  
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './components/AppSidebar.vue'
import AppTopbar from './components/AppTopbar.vue'

const route = useRoute()
const isAuth = computed(() => route.name === 'login' || route.meta.layout === 'auth')
</script>
