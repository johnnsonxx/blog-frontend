<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const email = ref(typeof route.query.email === 'string' ? route.query.email : '')
const password = ref('')
const loading = ref(false)
const error = ref('')
const registered = route.query.registered === '1'

async function submit() {
  error.value = ''
  loading.value = true

  try {
    await auth.login(email.value.trim(), password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/blogs'
    await router.replace(redirect)
  } catch (err) {
    error.value = err.status === 401 ? '電子郵件或密碼錯誤。' : err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="login-page">
    <div class="login-intro">
      <div class="eyebrow">WELCOME BACK</div>
      <h1>把值得記住的，<br />留在字裡行間。</h1>
      <p>登入後，閱讀最新文章與每一段完整故事。</p>
    </div>

    <form class="login-card" @submit.prevent="submit">
      <div class="brand login-brand">
        <span class="brand-mark">光</span>
        <span>微光誌</span>
      </div>
      <div>
        <h2>登入帳戶</h2>
        <p class="muted">歡迎回來，請輸入您的帳戶資訊。</p>
      </div>

      <p v-if="registered" class="success-message" role="status">
        帳戶建立成功，請使用新帳戶登入。
      </p>

      <label>
        <span>電子郵件</span>
        <input v-model="email" type="email" autocomplete="email" placeholder="name@example.com" required />
      </label>

      <label>
        <span>密碼</span>
        <input v-model="password" type="password" autocomplete="current-password" placeholder="至少 8 個字元" minlength="8" required />
      </label>

      <p v-if="error" class="error-message" role="alert">{{ error }}</p>

      <button class="primary-button" type="submit" :disabled="loading">
        {{ loading ? '登入中…' : '登入' }}
      </button>

      <div class="auth-switch">
        <span>還沒有帳戶？</span>
        <RouterLink class="outline-button" :to="{ name: 'register' }">建立帳戶</RouterLink>
      </div>
    </form>
  </section>
</template>
