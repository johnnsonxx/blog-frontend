<script setup>
import { onMounted, ref, watch } from 'vue'
import { api } from '../api'
import { auth } from '../stores/auth'

const blogs = ref([])
const page = ref(1)
const pageSize = 6
const totalPages = ref(1)
const totalCount = ref(0)
const loading = ref(true)
const error = ref('')

function formatDate(value) {
  if (!value) return '尚未發布'
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value))
}

async function loadBlogs() {
  loading.value = true
  error.value = ''

  try {
    const result = await api.getBlogs(page.value, pageSize)
    blogs.value = result.items
    totalPages.value = result.totalPages || 1
    totalCount.value = result.totalCount
  } catch (err) {
    if (err.status === 401) auth.logout()
    error.value = err.message
  } finally {
    loading.value = false
  }
}

watch(page, loadBlogs)
onMounted(loadBlogs)
</script>

<template>
  <section class="page-container list-page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">STORIES & IDEAS</p>
        <h1>最新文章</h1>
      </div>
      <p class="article-count">共 {{ totalCount }} 篇</p>
    </div>

    <div v-if="loading" class="state-panel">
      <span class="spinner" />
      <p>正在載入文章…</p>
    </div>

    <div v-else-if="error" class="state-panel error-state">
      <p>{{ error }}</p>
      <button class="secondary-button" type="button" @click="loadBlogs">再試一次</button>
    </div>

    <div v-else-if="blogs.length === 0" class="state-panel">
      <p>目前還沒有文章。</p>
    </div>

    <div v-else class="article-grid">
      <RouterLink
        v-for="(blog, index) in blogs"
        :key="blog.id"
        class="article-card"
        :class="{ featured: index === 0 && page === 1 }"
        :to="{ name: 'blog-detail', params: { slug: blog.slug } }"
      >
        <div class="card-number">{{ String((page - 1) * pageSize + index + 1).padStart(2, '0') }}</div>
        <div class="card-content">
          <p class="card-meta">{{ formatDate(blog.publishedAt || blog.createdAt) }} · {{ blog.status }}</p>
          <h2>{{ blog.title }}</h2>
          <span class="read-link">閱讀全文 <span aria-hidden="true">→</span></span>
        </div>
      </RouterLink>
    </div>

    <nav v-if="totalPages > 1" class="pagination" aria-label="文章分頁">
      <button type="button" :disabled="page === 1" @click="page--">← 上一頁</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button type="button" :disabled="page === totalPages" @click="page++">下一頁 →</button>
    </nav>
  </section>
</template>
