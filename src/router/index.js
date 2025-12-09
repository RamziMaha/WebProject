import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import WorkProjectsView from '../views/WorkProjectsView.vue'
import ErrandsView from '../views/ErrandsView.vue'
import GroceryView from '../views/GroceryView.vue'
import TripView from '../views/TripView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ListView from '../views/ListView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/work', name: 'work', component: WorkProjectsView },
  { path: '/errands', name: 'errands', component: ErrandsView },
  { path: '/grocery', name: 'grocery', component: GroceryView },
  { path: '/trip', name: 'trip', component: TripView },
  { path: '/login', name: 'login', component: LoginView, meta: { layout: 'auth' } },
  { path: '/register', name: 'register', component: RegisterView, meta: { layout: 'auth' } },
  { path: '/lists/:id', name: 'list', component: ListView },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Optional: simple scroll/route guard hooks, kept minimal
router.afterEach(() => {
  // no-op for now
})

export default router
