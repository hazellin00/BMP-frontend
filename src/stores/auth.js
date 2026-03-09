import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, register as apiRegister, getMe } from '@/api/auth.js'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const viewingUser = ref(null)

  const isLoggedIn = computed(() => !!token.value)
  const isViewer = computed(() => !!viewingUser.value)

  async function login(email, password) {
    const res = await apiLogin(email, password)
    const data = res.data
    const jwt = data.access_token || data.token
    if (!jwt) throw new Error('No token in response')

    token.value = jwt
    localStorage.setItem('token', jwt)

    await fetchMe()
    return user.value
  }

async function register(name, email, password) {
  const res = await apiRegister(name, email, password)
  // 現在註冊成功會直接跳這裡，不需要去收信了
  alert("註冊成功！現在請去登入。") 
}

//   async function register(name, email, password) {
//   const res = await apiRegister(name, email, password)
//   const data = res.data
  
//   //  檢查是否有 Token (驗證模式下通常沒有)
//   const jwt = data.access_token || data.token
  
//   if (jwt) {
//     // 只有在沒開啟 Email 驗證或直接登入時才會跑這
//     token.value = jwt
//     localStorage.setItem('token', jwt)
//     await fetchMe()
//   } else {
//     // Email 驗證模式：提示使用者去收信，而不是報錯
//     console.log('請檢查電子郵件以啟用帳號')
//     return { needsVerification: true }
//   }
// }

  async function fetchMe() {
    try {
      const res = await getMe()
      user.value = res.data
      localStorage.setItem('user', JSON.stringify(res.data))
    } catch (err) {
      console.error('fetchMe failed', err)
    }
  }

  function logout() {
    token.value = null
    user.value = null
    viewingUser.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  function setViewingUser(userData) {
    viewingUser.value = userData
  }

  return {
    token,
    user,
    viewingUser,
    isLoggedIn,
    isViewer,
    login,
    register,
    fetchMe,
    logout,
    setViewingUser,
  }
})
