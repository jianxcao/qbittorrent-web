import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/', name: 'Dashboard', component: DashboardView },
  { path: '/settings/:tab?', name: 'Settings', component: SettingsView }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL || '/'),
  routes
})

// 防止 iOS PWA 模式下跳转显示浏览器头尾
router.beforeEach((to, from, next) => {
  // 确保在 PWA 模式下保持 standalone 状态
  if (window.matchMedia('(display-mode: standalone)').matches) {
    // 在 standalone 模式下，确保使用 router 导航而不触发页面刷新
    next()
  } else {
    next()
  }
})

export default router
