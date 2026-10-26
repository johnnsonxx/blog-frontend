import { createRouter, createWebHistory } from 'vue-router'
import LoginView from './views/LoginView.vue'
import RegisterView from './views/RegisterView.vue'
import BlogListView from './views/BlogListView.vue'
import BlogDetailView from './views/BlogDetailView.vue'
import BlogCreateView from './views/BlogCreateView.vue'
import { auth } from './stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/blogs' },
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    { path: '/register', name: 'register', component: RegisterView, meta: { guestOnly: true } },
    { path: '/blogs', name: 'blogs', component: BlogListView, meta: { requiresAuth: true } },
    { path: '/blogs/new', name: 'blog-create', component: BlogCreateView, meta: { requiresAuth: true } },
    { path: '/blogs/:slug', name: 'blog-detail', component: BlogDetailView, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/blogs' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && auth.isLoggedIn) {
    return { name: 'blogs' }
  }
})

export default router
