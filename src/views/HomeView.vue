<template>
  <section>
    <h2 class="text-3xl font-extrabold mb-6">Welcome Back!</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <TileCard :icon="icons.plus" title="Create new TO DO list" subtitle="Start a fresh list for your tasks." @click="showCreateTodo = true" />
      <TileCard :icon="icons.users" title="Create a new Group list" subtitle="Collaborate with your team." @click="showCreateGroup = true" />
      <TileCard v-for="tile in homeTiles" :key="tile.title" :icon="tile.icon" :title="tile.title" :subtitle="tile.subtitle" />
    </div>

    <CreateGroupModal :open="showCreateGroup" @close="showCreateGroup = false" />
    <CreateTodoModal :open="showCreateTodo" @close="showCreateTodo = false" />
  </section>
</template>

<script setup>
import { ref } from 'vue'
import TileCard from '../components/TileCard.vue'
import CreateGroupModal from '../components/CreateGroupModal.vue'
import CreateTodoModal from '../components/CreateTodoModal.vue'
import { icons } from '../icons'

const showCreateGroup = ref(false)
const showCreateTodo = ref(false)

const homeTiles = [
  { icon: icons.person, title: 'Personal Errands', subtitle: '5 tasks today' },
  { icon: icons.basket, title: 'Grocery List', subtitle: '32 items to buy' },
  { icon: icons.work, title: 'Work Projects', subtitle: '12 tasks pending' },
  { icon: icons.plane, title: 'Trip to Japan', subtitle: 'Planning phase' }
]
</script>
