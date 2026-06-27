import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: "home",
    component: () => import('@/views/Home.vue'),
  },
   {
    path: '/backoffice/dashboard',
    name: "backoffice-dashboard",
    component: () => import('@/views/backoffice/DashboardView.vue'),
    meta: { requiresBackoffice: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})


router.beforeEach((to) => {
  const isBackofficeAuthenticated =
    localStorage.getItem('backoffice_authenticated') === 'true'

  if (to.meta.requiresBackoffice && !isBackofficeAuthenticated) {
    return '/'
  }
})

export default router

