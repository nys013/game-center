import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '游戏中心' }
  },
  {
    path: '/game/2048',
    name: 'Game2048',
    component: () => import('@/views/games/Game2048.vue'),
    meta: { title: '2048' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_PATH || '/game-center/'),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = (to.meta.title as string) || '游戏中心'
  next()
})

export default router
