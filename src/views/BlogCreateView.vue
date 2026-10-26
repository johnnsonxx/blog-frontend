<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import { auth } from '../stores/auth'

const router = useRouter()
const title = ref('')
const slug = ref('')
const content = ref('')
const slugEdited = ref(false)
const loading = ref(false)
const error = ref('')

function makeSlug(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

watch(title, (value) => {
  if (!slugEdited.value) slug.value = makeSlug(value)
})

function markSlugEdited() {
  slugEdited.value = true
  slug.value = makeSlug(slug.value)
}

function validationMessage(err) {
  const errors = err.data?.errors
  if (errors && typeof errors === 'object') {
    const firstMessage = Object.values(errors).flat()[0]
    if (firstMessage) return firstMessage
  }

  if (err.status === 409) return '這個網址代稱已被使用，請更換後再試。'
  return err.message
}

async function submit() {
  error.value = ''
  loading.value = true

  try {
    const blog = await api.createBlog({
      title: title.value.trim(),
      slug: slug.value.trim().toLowerCase(),
      content: content.value.trim(),
    })
    await router.replace({ name: 'blog-detail', params: { slug: blog.slug } })
  } catch (err) {
    if (err.status === 401) {
      auth.logout()
      await router.replace({ name: 'login', query: { redirect: '/blogs/new' } })
      return
    }
    error.value = validationMessage(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="page-container compose-page">
    <RouterLink class="back-link" :to="{ name: 'blogs' }">← 取消並回到文章列表</RouterLink>

    <div class="compose-heading">
      <p class="eyebrow">WRITE A NEW STORY</p>
      <h1>發佈新文章</h1>
      <p>寫下想分享的內容。文章會依目前後端設定建立為草稿。</p>
    </div>

    <form class="compose-form" @submit.prevent="submit">
      <label>
        <span>文章標題</span>
        <input
          v-model="title"
          type="text"
          maxlength="200"
          placeholder="輸入一個清楚的文章標題"
          autofocus
          required
        />
      </label>

      <label>
        <span>網址代稱（Slug）</span>
        <input
          v-model="slug"
          type="text"
          maxlength="200"
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          placeholder="例如：my-first-blog-post"
          required
          @input="markSlugEdited"
        />
        <small>僅能使用小寫英文字母、數字與單一連字號。</small>
      </label>

      <label>
        <span>文章內容</span>
        <textarea
          v-model="content"
          rows="15"
          placeholder="開始寫作…"
          required
        />
      </label>

      <p v-if="error" class="error-message compose-error" role="alert">{{ error }}</p>

      <div class="compose-actions">
        <RouterLink class="secondary-button" :to="{ name: 'blogs' }">取消</RouterLink>
        <button class="primary-button compose-submit" type="submit" :disabled="loading">
          {{ loading ? '發佈中…' : '發佈文章' }}
        </button>
      </div>
    </form>
  </section>
</template>
