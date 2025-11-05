<template>
  <section>
    <div class="flex items-center justify-between">
      <h2 class="text-3xl font-extrabold">Grocery List</h2>
      <button class="px-4 py-2 rounded-lg bg-cocoa-700 text-white font-semibold shadow hover:bg-cocoa-900" @click="addGrocery()">
        <span class="mr-2" v-html="icons.plusSm"></span> Add Item
      </button>
    </div>

    <div class="mt-6 space-y-8">
      <div v-for="section in grocery" :key="section.title">
        <h4 class="text-lg font-semibold border-b border-[#d9d1c3] pb-2">{{ section.title }} ({{ section.items.length }})</h4>
        <ul class="mt-3 space-y-4">
          <li v-for="it in section.items" :key="it.id" class="surface-card px-4 py-3">
            <div class="flex items-center gap-4">
              <input type="checkbox" class="w-5 h-5 rounded-md border-[#bfb5a6] text-blue-600 focus:ring-blue-600" v-model="it.done" />
              <div :class="it.done ? 'line-through text-[#9c8f7f]' : ''" class="font-medium">{{ it.title }}</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { icons } from '../icons'

const grocery = ref([
  {
    title: 'Produce',
    items: [
      { id: 1, title: 'Apples (x5)', done: false },
      { id: 2, title: 'Spinach (1 bag)', done: false },
      { id: 3, title: 'Avocados (x2)', done: true },
    ]
  },
  {
    title: 'Dairy & Eggs',
    items: [
      { id: 4, title: 'Milk (2% Gallon)', done: false },
      { id: 5, title: 'Eggs (1 Dozen)', done: false },
    ]
  }
])

function addGrocery() {
  grocery.value[0].items.push({ id: Date.now(), title: 'New item', done: false })
}
</script>
