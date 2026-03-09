<template>
  <div class="login-page">
    <!-- App title -->
    <div class="login-page__header">
      <div class="login-page__logo">💚</div>
      <h1 class="login-page__title">愛健康</h1>
      <p class="login-page__subtitle">您的血壓健康守護夥伴</p>
    </div>

    <!-- Tab toggle -->
    <div class="login-page__tabs">
      <button
        class="login-page__tab"
        :class="{ 'login-page__tab--active': mode === 'login' }"
        @click="mode = 'login'"
      >
        登入
      </button>
      <button
        class="login-page__tab"
        :class="{ 'login-page__tab--active': mode === 'register' }"
        @click="mode = 'register'"
      >
        註冊
      </button>
    </div>

    <!-- Login form -->
    <form v-if="mode === 'login'" class="login-page__form" @submit.prevent="handleLogin">
      <div class="form-group">
        <label class="form-label">電子郵件</label>
        <input
          v-model="email"
          type="email"
          class="input-field"
          placeholder="請輸入電子郵件"
          autocomplete="email"
          required
        />
      </div>

      <div class="form-group">
        <label class="form-label">密碼</label>
        <input
          v-model="password"
          type="password"
          class="input-field"
          placeholder="請輸入密碼"
          autocomplete="current-password"
          required
        />
      </div>

      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

      <button type="submit" class="btn btn-primary" :disabled="loading">
        <span v-if="loading" class="spinner"></span>
        <span v-else>登入</span>
      </button>
    </form>

    <!-- Register form -->
    <form v-else class="login-page__form" @submit.prevent="handleRegister">
      <div class="form-group">
        <label class="form-label">姓名</label>
        <input
          v-model="name"
          type="text"
          class="input-field"
          placeholder="請輸入您的姓名"
          autocomplete="name"
          required
        />
      </div>

      <div class="form-group">
        <label class="form-label">電子郵件</label>
        <input
          v-model="email"
          type="email"
          class="input-field"
          placeholder="請輸入電子郵件"
          autocomplete="email"
          required
        />
      </div>

      <div class="form-group">
        <label class="form-label">密碼</label>
        <input
          v-model="password"
          type="password"
          class="input-field"
          placeholder="請設定密碼（至少 6 位）"
          autocomplete="new-password"
          required
          minlength="6"
        />
      </div>

      <div class="form-group">
        <label class="form-label">確認密碼</label>
        <input
          v-model="confirmPassword"
          type="password"
          class="input-field"
          placeholder="請再次輸入密碼"
          autocomplete="new-password"
          required
        />
      </div>

      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

      <button type="submit" class="btn btn-primary" :disabled="loading">
        <span v-if="loading" class="spinner"></span>
        <span v-else>建立帳號</span>
      </button>
    </form>

    <p class="login-page__switch">
      <span v-if="mode === 'login'">
        還沒有帳號？
        <button class="link-btn" @click="mode = 'register'">立即註冊</button>
      </span>
      <span v-else>
        已有帳號？
        <button class="link-btn" @click="mode = 'login'">前往登入</button>
      </span>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

const mode = ref('login')
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  errorMsg.value = ''
  if (!email.value || !password.value) {
    errorMsg.value = '請填寫所有欄位'
    return
  }
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    router.push('/record')
  } catch (err) {
    const msg = err?.response?.data?.detail || err?.message || '登入失敗，請確認帳號密碼'
    errorMsg.value = msg
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  errorMsg.value = ''
  if (!name.value || !email.value || !password.value || !confirmPassword.value) {
    errorMsg.value = '請填寫所有欄位'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMsg.value = '兩次密碼輸入不一致'
    return
  }
  if (password.value.length < 6) {
    errorMsg.value = '密碼至少需要 6 個字元'
    return
  }
  loading.value = true
  try {
    await authStore.register(name.value, email.value, password.value)
    router.push('/record')
  } catch (err) {
    const msg = err?.response?.data?.detail || err?.message || '註冊失敗，請稍後再試'
    errorMsg.value = msg
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #F9FAFB;
  padding: 40px 24px 60px;
  display: flex;
  flex-direction: column;
}

.login-page__header {
  text-align: center;
  margin-bottom: 36px;
}

.login-page__logo {
  font-size: 64px;
  line-height: 1;
  margin-bottom: 12px;
}

.login-page__title {
  font-size: 36px;
  font-weight: 700;
  color: #10B981;
  margin-bottom: 6px;
}

.login-page__subtitle {
  font-size: 18px;
  color: #6B7280;
}

.login-page__tabs {
  display: flex;
  background: #E5E7EB;
  border-radius: 14px;
  padding: 4px;
  margin-bottom: 28px;
}

.login-page__tab {
  flex: 1;
  height: 48px;
  border: none;
  border-radius: 10px;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
  color: #6B7280;
  transition: all 0.2s;
  font-family: inherit;
}

.login-page__tab--active {
  background: white;
  color: #10B981;
  box-shadow: 0 1px 4px rgba(0,0,0,0.12);
}

.login-page__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.login-page__switch {
  text-align: center;
  margin-top: 24px;
  font-size: 18px;
  color: #6B7280;
}

.link-btn {
  background: none;
  border: none;
  color: #10B981;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  text-decoration: underline;
}
</style>
