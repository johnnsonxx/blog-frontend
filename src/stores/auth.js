import { reactive } from 'vue'
import { api } from '../api'

const TOKEN_KEY = 'blog_access_token'
const USER_KEY = 'blog_user'

function readUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}

export const auth = reactive({
  token: localStorage.getItem(TOKEN_KEY),
  user: readUser(),

  get isLoggedIn() {
    return Boolean(this.token)
  },

  async login(email, password) {
    const result = await api.login(email, password)

    if (!result?.accessToken || !result?.user) {
      throw new Error('登入回應格式不正確，請確認後端服務版本。')
    }

    this.token = result.accessToken
    this.user = result.user
    localStorage.setItem(TOKEN_KEY, result.accessToken)
    localStorage.setItem(USER_KEY, JSON.stringify(result.user))
    return result
  },

  logout() {
    this.token = null
    this.user = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
})
