<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api'
import { auth } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const blog = ref(null)
const loading = ref(true)
const error = ref('')
const confirmingDelete = ref(false)
const deleting = ref(false)
const deleteError = ref('')
const comments = ref([])
const commentsLoading = ref(false)
const commentsError = ref('')
const newComment = ref('')
const submittingComment = ref(false)
const commentSubmitError = ref('')

const isAuthor = computed(() => {
  const authorId = blog.value?.authorId
  const currentUserId = auth.user?.id
  return Boolean(
    authorId &&
    currentUserId &&
    authorId.toLowerCase() === currentUserId.toLowerCase(),
  )
})

function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value))
}

function formatCommentDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

async function loadComments() {
  if (!blog.value) return

  commentsLoading.value = true
  commentsError.value = ''

  try {
    comments.value = await api.getComments(blog.value.id)
  } catch (err) {
    commentsError.value = err.status === 404 ? '這篇文章已不存在。' : err.message
  } finally {
    commentsLoading.value = false
  }
}

async function loadBlog() {
  loading.value = true
  error.value = ''
  confirmingDelete.value = false
  deleteError.value = ''
  comments.value = []
  commentsError.value = ''
  newComment.value = ''
  commentSubmitError.value = ''

  try {
    blog.value = await api.getBlog(route.params.slug)
    await loadComments()
  } catch (err) {
    error.value = err.status === 404 ? '找不到這篇文章。' : err.message
  } finally {
    loading.value = false
  }
}

async function submitComment() {
  const content = newComment.value.trim()
  if (!blog.value || !content || content.length > 5000) return

  submittingComment.value = true
  commentSubmitError.value = ''

  try {
    await api.createComment(blog.value.id, content)
    newComment.value = ''
    await loadComments()
  } catch (err) {
    if (err.status === 401) {
      auth.logout()
      await router.replace({ name: 'login', query: { redirect: route.fullPath } })
      return
    }

    const validationErrors = err.data?.errors
    commentSubmitError.value = validationErrors
      ? Object.values(validationErrors).flat()[0] || err.message
      : err.message
  } finally {
    submittingComment.value = false
  }
}

async function deleteBlog() {
  if (!blog.value || !isAuthor.value) return

  deleting.value = true
  deleteError.value = ''

  try {
    await api.deleteBlog(blog.value.id)
    await router.replace({ name: 'blogs' })
  } catch (err) {
    if (err.status === 401) {
      auth.logout()
      await router.replace({ name: 'login', query: { redirect: route.fullPath } })
      return
    }

    if (err.status === 403) {
      deleteError.value = '只有文章作者可以刪除這篇文章。'
    } else if (err.status === 404) {
      deleteError.value = '文章已不存在，可能已被刪除。'
    } else {
      deleteError.value = err.message
    }
  } finally {
    deleting.value = false
  }
}

watch(() => route.params.slug, loadBlog)
onMounted(loadBlog)
</script>

<template>
  <section class="page-container detail-page">
    <RouterLink class="back-link" :to="{ name: 'blogs' }">← 回到文章列表</RouterLink>

    <div v-if="loading" class="state-panel">
      <span class="spinner" />
      <p>正在載入文章…</p>
    </div>

    <div v-else-if="error" class="state-panel error-state">
      <p>{{ error }}</p>
      <RouterLink class="secondary-button" :to="{ name: 'blogs' }">回文章列表</RouterLink>
    </div>

    <article v-else-if="blog" class="article-detail">
      <header>
        <p class="eyebrow">{{ blog.status }} · {{ formatDate(blog.publishedAt || blog.createdAt) }}</p>
        <h1>{{ blog.title }}</h1>
        <div class="title-rule" />

        <div v-if="isAuthor" class="author-actions">
          <template v-if="confirmingDelete">
            <span>確定要刪除這篇文章嗎？此操作無法復原。</span>
            <button class="danger-button" type="button" :disabled="deleting" @click="deleteBlog">
              {{ deleting ? '刪除中…' : '確定刪除' }}
            </button>
            <button class="text-button" type="button" :disabled="deleting" @click="confirmingDelete = false">
              取消
            </button>
          </template>
          <button v-else class="delete-trigger" type="button" @click="confirmingDelete = true">
            刪除文章
          </button>
        </div>

        <p v-if="deleteError" class="error-message detail-delete-error" role="alert">
          {{ deleteError }}
        </p>
      </header>
      <div class="article-body">{{ blog.content }}</div>

      <section class="comments-section" aria-labelledby="comments-title">
        <div class="comments-heading">
          <div>
            <p class="eyebrow">DISCUSSION</p>
            <h2 id="comments-title">留言</h2>
          </div>
          <span>{{ comments.length }} 則</span>
        </div>

        <div v-if="commentsLoading" class="comments-state">
          <span class="spinner" />
          <span>正在載入留言…</span>
        </div>

        <div v-else-if="commentsError" class="comments-state error-state">
          <span>{{ commentsError }}</span>
          <button class="secondary-button" type="button" @click="loadComments">再試一次</button>
        </div>

        <p v-else-if="comments.length === 0" class="comments-empty">
          還沒有留言，成為第一個留言的人吧。
        </p>

        <ol v-else class="comment-list">
          <li v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-avatar" aria-hidden="true">
              {{ comment.authorDisplayName?.charAt(0) || '匿' }}
            </div>
            <div class="comment-main">
              <div class="comment-meta">
                <strong>{{ comment.authorDisplayName }}</strong>
                <time :datetime="comment.createdAt">{{ formatCommentDate(comment.createdAt) }}</time>
              </div>
              <p>{{ comment.content }}</p>
            </div>
          </li>
        </ol>

        <form class="comment-form" @submit.prevent="submitComment">
          <label for="new-comment">留下你的想法</label>
          <textarea
            id="new-comment"
            v-model="newComment"
            rows="4"
            maxlength="5000"
            placeholder="寫下留言…"
            required
          />
          <div class="comment-form-footer">
            <span>{{ newComment.length }} / 5000</span>
            <button
              class="primary-button comment-submit"
              type="submit"
              :disabled="submittingComment || !newComment.trim()"
            >
              {{ submittingComment ? '送出中…' : '送出留言' }}
            </button>
          </div>
          <p v-if="commentSubmitError" class="error-message comment-error" role="alert">
            {{ commentSubmitError }}
          </p>
        </form>
      </section>
    </article>
  </section>
</template>
