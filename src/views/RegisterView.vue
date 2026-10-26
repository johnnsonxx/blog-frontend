<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'

const router = useRouter()
const displayName = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const loading = ref(false)
const error = ref('')

function getErrorMessage(err) {
  const errors = err.data?.errors
  if (errors && typeof errors === 'object') {
    const firstMessage = Object.values(errors).flat()[0]
    if (firstMessage) return firstMessage
  }

  if (err.status === 409) return '這個電子郵件已經註冊過了。'
  return err.message
}

async function submit() {
  error.value = ''

  if (password.value !== passwordConfirmation.value) {
    error.value = '兩次輸入的密碼不一致。'
    return
  }

  loading.value = true

  try {
    await api.register(displayName.value.trim(), email.value.trim(), password.value)
    await router.replace({
      name: 'login',
      query: { registered: '1', email: email.value.trim() },
    })
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="login-page">
    <div class="login-intro register-intro">
      <div class="eyebrow">JOIN THE COMMUNITY</div>
      <h1>從今天開始，<br />記錄你的故事。</h1>
      <p>建立帳戶，閱讀文章、分享想法，也寫下屬於你的篇章。</p>
    </div>

    <form class="login-card register-card" @submit.prevent="submit">
      <RouterLink class="brand login-brand" :to="{ name: 'login' }">
        <span class="brand-mark">光</span>
        <span>微光誌</span>
      </RouterLink>

      <div>
        <h2>建立帳戶</h2>
        <p class="muted">填寫以下資料即可加入。</p>
      </div>

      <label>
        <span>顯示名稱</span>
        <input v-model="displayName" type="text" autocomplete="name" maxlength="100" placeholder="你的名稱" required />
      </label>

      <label>
        <span>電子郵件</span>
        <input v-model="email" type="email" autocomplete="email" maxlength="320" placeholder="name@example.com" required />
      </label>

      <label>
        <span>密碼</span>
        <input v-model="password" type="password" autocomplete="new-password" minlength="8" maxlength="128" placeholder="至少 8 個字元" required />
      </label>

      <label>
        <span>確認密碼</span>
        <input v-model="passwordConfirmation" type="password" autocomplete="new-password" minlength="8" maxlength="128" placeholder="再次輸入密碼" required />
      </label>

      <p v-if="error" class="error-message" role="alert">{{ error }}</p>

      <button class="primary-button" type="submit" :disabled="loading">
        {{ loading ? '建立中…' : '建立帳戶' }}
      </button>

      <div class="auth-switch">
        <span>已經有帳戶？</span>
        <RouterLink class="outline-button" :to="{ name: 'login' }">返回登入</RouterLink>
      </div>
    </form>
  </section>
</template>
