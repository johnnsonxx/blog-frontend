<script setup>
import { useRoute, useRouter } from 'vue-router'
import { auth } from './stores/auth'

const route = useRoute()
const router = useRouter()

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="app-shell">
    <header v-if="!route.meta.guestOnly" class="site-header">
      <RouterLink class="brand" :to="{ name: 'blogs' }">
        <span class="brand-mark">光</span>
        <span>微光誌</span>
      </RouterLink>

      <div class="account">
        <span v-if="auth.user" class="account-greeting">嗨，{{ auth.user.displayName }}</span>
        <RouterLink class="publish-button" :to="{ name: 'blog-create' }">＋ 發佈新文章</RouterLink>
        <button class="text-button" type="button" @click="logout">登出</button>
      </div>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>
