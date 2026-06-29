import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: "home",
    component: () => import('@/views/home.vue'),
  },
  {
    path: '/salaries',
    name: "frontoffice-salaries",
    component: () => import('@/views/frontoffice/SalariesList.vue'),
  },
  {
    path: '/salaries/create',
    name: "frontoffice-salaries-create",
    component: () => import('@/views/frontoffice/SalariesForm.vue'),
  },
  {
    path: '/backoffice/dashboard',
    name: "backoffice-dashboard",
    component: () => import('@/views/backoffice/dashboard.vue'),
    meta: { requiresBackoffice: true },
  },
  {
    path: '/backoffice/import',
    name: "backoffice-import",
    component: () => import('@/views/backoffice/import.vue'),
    meta: { requiresBackoffice: true },
  },
  {
    path: '/backoffice/login',
    name: "backoffice-login",
    component: () => import('@/views/backoffice/login.vue'),
  },
  {
    path: '/backoffice/reset',
    name: "backoffice-reset",
    component: () => import('@/views/backoffice/reset.vue'),
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