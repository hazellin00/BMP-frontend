import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    redirect: '/record',
  },
  {
    path: '/record',
    name: 'Record',
    component: () => import('@/views/RecordView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/trend',
    name: 'Trend',
    component: () => import('@/views/TrendView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/share',
    name: 'Share',
    component: () => import('@/views/ShareView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth !== false
  const token = localStorage.getItem('token')

  if (requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/record')
  } else {
    next()
  }
})

export default router
