<template>
  <div>
    <div class="page-header">
      <h1>會員資料</h1>
      <p class="subtitle">管理您的健康資訊</p>
    </div>

    <div class="page">
      <!-- User info card -->
      <div class="card user-card">
        <div class="user-card__content">
          <div class="avatar user-avatar">
            {{ avatarLetter }}
          </div>
          <div class="user-info">
            <div v-if="!editingName" class="user-name-display" @click="editingName = true">
              <span class="user-name">{{ form.name || '點擊設定姓名' }}</span>
              <span class="edit-icon">✏️</span>
            </div>
            <input
              v-else
              v-model="form.name"
              type="text"
              class="input-field name-input"
              placeholder="請輸入姓名"
              @blur="editingName = false"
              @keyup.enter="editingName = false"
              ref="nameInputRef"
              autofocus
            />
            <p class="user-email">{{ authStore.user?.email || '' }}</p>
          </div>
        </div>
      </div>

      <!-- Health data -->
      <div class="card health-card">
        <h2 class="card-section-title">生理資料</h2>

        <div class="health-fields">
          <!-- Age -->
          <div class="health-field">
            <label class="field-label">年齡</label>
            <div class="field-input-wrapper">
              <input
                v-model.number="form.age"
                type="number"
                class="input-field health-input"
                placeholder="65"
                min="1"
                max="120"
                inputmode="numeric"
              />
              <span class="field-unit">歲</span>
            </div>
          </div>

          <!-- Height -->
          <div class="health-field">
            <label class="field-label">身高</label>
            <div class="field-input-wrapper">
              <input
                v-model.number="form.height"
                type="number"
                class="input-field health-input"
                placeholder="165"
                min="100"
                max="250"
                inputmode="numeric"
                @input="calcBMI"
              />
              <span class="field-unit">cm</span>
            </div>
          </div>

          <!-- Weight -->
          <div class="health-field">
            <label class="field-label">體重</label>
            <div class="field-input-wrapper">
              <input
                v-model.number="form.weight"
                type="number"
                class="input-field health-input"
                placeholder="60"
                min="20"
                max="300"
                inputmode="numeric"
                @input="calcBMI"
              />
              <span class="field-unit">kg</span>
            </div>
          </div>

          <!-- BMI display -->
          <div class="bmi-display" v-if="bmi">
            <div class="bmi-label">BMI 身體質量指數</div>
            <div class="bmi-value" :class="bmiColorClass">{{ bmi }}</div>
            <div class="bmi-status" :class="bmiColorClass">{{ bmiStatusText }}</div>
          </div>
        </div>
      </div>

      <!-- Chronic disease -->
      <div class="card disease-card">
        <h2 class="card-section-title">慢性病狀況</h2>
        <p class="card-section-hint">請勾選您目前已診斷的慢性病</p>

        <div class="disease-list">
          <label
            v-for="disease in diseaseOptions"
            :key="disease.value"
            class="disease-item"
            :class="{ 'disease-item--checked': form.diseases.includes(disease.value) }"
          >
            <input
              type="checkbox"
              :value="disease.value"
              v-model="form.diseases"
              class="disease-checkbox"
            />
            <span class="disease-icon">{{ disease.icon }}</span>
            <span class="disease-name">{{ disease.label }}</span>
            <span class="disease-check" v-if="form.diseases.includes(disease.value)">✓</span>
          </label>
        </div>
      </div>

      <!-- Actions -->
      <div class="action-section">
        <div v-if="saveSuccess" class="success-msg">✅ 資料已成功儲存！</div>
        <div v-if="saveError" class="error-msg">{{ saveError }}</div>

        <button class="btn btn-primary save-btn" @click="handleSave" :disabled="saving">
          <span v-if="saving" class="spinner"></span>
          <span v-else>儲存資料</span>
        </button>

        <button class="btn btn-danger logout-btn" @click="handleLogout">
          登出帳號
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { getProfile, updateProfile } from '@/api/profile.js'

const router = useRouter()
const authStore = useAuthStore()

const editingName = ref(false)
const nameInputRef = ref(null)
const saving = ref(false)
const saveSuccess = ref(false)
const saveError = ref('')
const bmi = ref(null)

const form = ref({
  name: '',
  age: null,
  height: null,
  weight: null,
  diseases: [],
})

const diseaseOptions = [
  { value: 'diabetes',     label: '糖尿病',   icon: '🩸' },
  { value: 'hyperlipidemia', label: '高血脂', icon: '🫀' },
  { value: 'kidney',       label: '腎臟病',   icon: '🫘' },
  { value: 'heart',        label: '心臟病',   icon: '❤️' },
]

const avatarLetter = computed(() => {
  const name = form.value.name || authStore.user?.name || authStore.user?.email || '?'
  return name[0].toUpperCase()
})

function calcBMI() {
  const h = form.value.height
  const w = form.value.weight
  if (h && w && h > 0) {
    const hm = h / 100
    bmi.value = (w / (hm * hm)).toFixed(1)
  } else {
    bmi.value = null
  }
}

const bmiColorClass = computed(() => {
  const b = parseFloat(bmi.value)
  if (!b) return ''
  if (b < 18.5) return 'bmi-underweight'
  if (b < 24) return 'bmi-normal'
  if (b < 27) return 'bmi-overweight'
  return 'bmi-obese'
})

const bmiStatusText = computed(() => {
  const b = parseFloat(bmi.value)
  if (!b) return ''
  if (b < 18.5) return '體重過輕'
  if (b < 24) return '正常範圍'
  if (b < 27) return '體重過重'
  return '肥胖'
})

async function loadProfile() {
  try {
    const res = await getProfile()
    const data = res.data
    form.value.name    = data.name || ''
    form.value.age     = data.age || null
    form.value.height  = data.height || null
    form.value.weight  = data.weight || null

    // diseases may come as array of strings
    const rawDiseases = data.diseases || data.chronic_diseases || []
    form.value.diseases = Array.isArray(rawDiseases) ? rawDiseases : []

    calcBMI()
  } catch (err) {
    // If fetch fails, use auth store user
    const u = authStore.user
    if (u) {
      form.value.name = u.name || ''
      form.value.age  = u.age || null
      form.value.height = u.height || null
      form.value.weight = u.weight || null
    }
  }
}

async function handleSave() {
  saving.value = true
  saveSuccess.value = false
  saveError.value = ''
  try {
    await updateProfile({
      name: form.value.name,
      age: form.value.age,
      height: form.value.height,
      weight: form.value.weight,
      diseases: form.value.diseases,
      chronic_diseases: form.value.diseases,
    })
    saveSuccess.value = true
    await authStore.fetchMe()
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (err) {
    saveError.value = err?.response?.data?.detail || err?.message || '儲存失敗，請稍後再試'
  } finally {
    saving.value = false
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

watch(editingName, async (val) => {
  if (val) {
    await nextTick()
    nameInputRef.value?.focus()
  }
})

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.user-card {
  margin-bottom: 16px;
}

.user-card__content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  width: 72px;
  height: 72px;
  font-size: 32px;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name-display {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 0;
}

.user-name {
  font-size: 24px;
  font-weight: 700;
  color: #1F2937;
}

.edit-icon {
  font-size: 18px;
}

.name-input {
  font-size: 22px;
  font-weight: 700;
  height: 48px;
}

.user-email {
  font-size: 16px;
  color: #6B7280;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.health-card,
.disease-card {
  margin-bottom: 16px;
}

.card-section-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 6px;
  color: #1F2937;
}

.card-section-hint {
  font-size: 16px;
  color: #6B7280;
  margin-bottom: 16px;
}

.health-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.health-field {
  display: flex;
  align-items: center;
  gap: 12px;
}

.field-label {
  font-size: 20px;
  font-weight: 600;
  color: #374151;
  min-width: 52px;
}

.field-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.health-input {
  flex: 1;
  font-size: 22px;
  font-weight: 600;
  text-align: center;
}

.field-unit {
  font-size: 18px;
  color: #6B7280;
  min-width: 28px;
}

/* BMI display */
.bmi-display {
  background: #F9FAFB;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.bmi-label {
  font-size: 16px;
  color: #6B7280;
  flex: 1;
}

.bmi-value {
  font-size: 32px;
  font-weight: 700;
}

.bmi-status {
  font-size: 16px;
  font-weight: 600;
}

.bmi-underweight { color: #3B82F6; }
.bmi-normal      { color: #10B981; }
.bmi-overweight  { color: #F59E0B; }
.bmi-obese       { color: #EF4444; }

/* Disease checkboxes */
.disease-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.disease-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 2px solid #E5E7EB;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.disease-item--checked {
  border-color: #10B981;
  background: #F0FDF4;
}

.disease-checkbox {
  display: none;
}

.disease-icon {
  font-size: 24px;
}

.disease-name {
  flex: 1;
  font-size: 20px;
  font-weight: 500;
  color: #1F2937;
}

.disease-check {
  font-size: 22px;
  color: #10B981;
  font-weight: 700;
}

/* Action section */
.action-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.save-btn {
  font-size: 20px;
  height: 60px;
}

.logout-btn {
  font-size: 20px;
  height: 56px;
}

.success-msg {
  background: #D1FAE5;
  color: #065F46;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 18px;
  text-align: center;
}
</style>
