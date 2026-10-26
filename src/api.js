const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function getStoredToken() {
  return localStorage.getItem('blog_access_token')
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers)
  const token = getStoredToken()

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await response.json() : null

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('blog_access_token')
      localStorage.removeItem('blog_user')
    }

    const error = new Error(
      data?.error?.message ||
      data?.detail ||
      data?.title ||
      '請求失敗，請稍後再試。',
    )
    error.status = response.status
    error.code = data?.error?.code
    error.data = data
    throw error
  }

  // ASP.NET controllers return the response body directly. Also accept a
  // { data: ... } envelope in case an API gateway adds one later.
  if (data && typeof data === 'object' && Object.hasOwn(data, 'data')) {
    return data.data
  }

  return data
}

export const api = {
  register(displayName, email, password) {
    return request('/users/register', {
      method: 'POST',
      body: JSON.stringify({ displayName, email, password }),
    })
  },
  login(email, password) {
    return request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },
  getMe() {
    return request('/users/me')
  },
  getBlogs(page = 1, pageSize = 10) {
    return request(`/blogs?page=${page}&pageSize=${pageSize}`)
  },
  getBlog(slug) {
    return request(`/blogs/${encodeURIComponent(slug)}`)
  },
  createBlog({ title, slug, content }) {
    return request('/blogs', {
      method: 'POST',
      body: JSON.stringify({ title, slug, content }),
    })
  },
  deleteBlog(blogId) {
    return request(`/blogs/${encodeURIComponent(blogId)}`, {
      method: 'DELETE',
    })
  },
  getComments(blogId) {
    return request(`/blogs/${encodeURIComponent(blogId)}/comments`)
  },
  createComment(blogId, content) {
    return request(`/blogs/${encodeURIComponent(blogId)}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
  },
}
