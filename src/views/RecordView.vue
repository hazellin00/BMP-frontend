<template>
  <div>
    <!-- Page header -->
    <div class="page-header">
      <h1>記錄血壓</h1>
      <p class="subtitle">{{ todayLabel }}</p>
    </div>

    <div class="page">
      <!-- BP Input section -->
      <div class="card record-card">
        <p class="record-hint">請輸入您目前的血壓數值</p>

        <div class="bp-inputs">
          <!-- SYS -->
          <div class="bp-input-group">
            <label class="bp-input-label">收縮壓 <span class="bp-unit">(SYS)</span></label>
            <div
              class="bp-input-wrapper"
              :class="{
                'bp-input-wrapper--high': sys && getBPStatus(Number(sys), Number(dia)) === 'high',
                'bp-input-wrapper--normal': sys && getBPStatus(Number(sys), Number(dia)) === 'normal',
              }"
            >
              <input
                v-model="sys"
                type="number"
                class="bp-input"
                placeholder="120"
                min="60"
                max="250"
                inputmode="numeric"
              />
              <span class="bp-input-unit">mmHg</span>
            </div>
            <p class="bp-range-hint">正常範圍：90 - 139</p>
          </div>

          <!-- DIA -->
          <div class="bp-input-group">
            <label class="bp-input-label">舒張壓 <span class="bp-unit">(DIA)</span></label>
            <div
              class="bp-input-wrapper"
              :class="{
                'bp-input-wrapper--high': dia && getBPStatus(Number(sys), Number(dia)) === 'high',
                'bp-input-wrapper--normal': dia && getBPStatus(Number(sys), Number(dia)) === 'normal',
              }"
            >
              <input
                v-model="dia"
                type="number"
                class="bp-input"
                placeholder="80"
                min="40"
                max="150"
                inputmode="numeric"
              />
              <span class="bp-input-unit">mmHg</span>
            </div>
            <p class="bp-range-hint">正常範圍：60 - 89</p>
          </div>

          <!-- Pulse -->
          <div class="bp-input-group">
            <label class="bp-input-label">心跳 <span class="bp-unit">(Pulse)</span></label>
            <div class="bp-input-wrapper bp-input-wrapper--pulse">
              <input
                v-model="pulse"
                type="number"
                class="bp-input"
                placeholder="75"
                min="40"
                max="200"
                inputmode="numeric"
              />
              <span class="bp-input-unit">次/分</span>
            </div>
            <p class="bp-range-hint">正常範圍：60 - 100</p>
          </div>
        </div>

        <!-- Current status preview -->
        <div v-if="sys && dia" class="status-preview">
          <span
            class="badge"
            :class="getBPStatus(Number(sys), Number(dia)) === 'high' ? 'badge-high' : 'badge-normal'"
          >
            {{ getBPStatus(Number(sys), Number(dia)) === 'high' ? '⚠️ 血壓偏高' : '✅ 血壓正常' }}
          </span>
        </div>

        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

        <!-- Submit button -->
        <button
          class="btn btn-primary submit-btn"
          @click="handleSubmit"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-else>記錄並獲取 AI 建議</span>
        </button>
      </div>

      <!-- Tips card -->
      <div class="card tips-card">
        <h3>📋 測量小提醒</h3>
        <ul class="tips-list">
          <li>測量前休息 5 分鐘</li>
          <li>坐姿挺直，手臂與心臟同高</li>
          <li>避免測量前運動或喝咖啡</li>
          <li>每天固定時間測量最準確</li>
        </ul>
      </div>
    </div>

    <!-- AI Card Modal -->
    <AICardModal
      :show="showModal"
      :aiData="aiData"
      @close="showModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AICardModal from '@/components/AICardModal.vue'
import { recordBP } from '@/api/bloodPressure.js'

const sys = ref('')
const dia = ref('')
const pulse = ref('')
const loading = ref(false)
const errorMsg = ref('')
const showModal = ref(false)
const aiData = ref({})

const todayLabel = computed(() => {
  const now = new Date()
  const opts = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
  return now.toLocaleDateString('zh-TW', opts)
})

function getBPStatus(sysVal, diaVal) {
  if (!sysVal || !diaVal) return 'unknown'
  if (sysVal >= 140 || diaVal >= 90) return 'high'
  return 'normal'
}

function validateInputs() {
  const s = Number(sys.value)
  const d = Number(dia.value)
  const p = Number(pulse.value)

  if (!sys.value || !dia.value || !pulse.value) {
    return '請填寫所有血壓數值'
  }
  if (isNaN(s) || isNaN(d) || isNaN(p)) {
    return '請輸入有效的數字'
  }
  if (s < 60 || s > 250) {
    return '收縮壓數值超出正常範圍（60-250）'
  }
  if (d < 40 || d > 150) {
    return '舒張壓數值超出正常範圍（40-150）'
  }
  if (p < 40 || p > 200) {
    return '心跳數值超出正常範圍（40-200）'
  }
  return null
}

async function handleSubmit() {
  errorMsg.value = ''
  const validationError = validateInputs()
  if (validationError) {
    errorMsg.value = validationError
    return
  }

  loading.value = true
  try {
    const res = await recordBP(Number(sys.value), Number(dia.value), Number(pulse.value))
    const data = res.data

    // Handle both flat response and nested ai_recommendation
    let resolved = {}
    if (data.ai_recommendation && typeof data.ai_recommendation === 'object') {
      resolved = { ...data.ai_recommendation, bp_status: data.bp_status || data.status }
    } else {
      resolved = { ...data }
    }

    // If bp_status not set, derive it
    if (!resolved.bp_status && !resolved.status) {
      resolved.bp_status = getBPStatus(Number(sys.value), Number(dia.value))
    }

    aiData.value = resolved
    showModal.value = true

    // Reset inputs
    sys.value = ''
    dia.value = ''
    pulse.value = ''
  } catch (err) {
    const msg = err?.response?.data?.detail || err?.message || '記錄失敗，請稍後再試'
    errorMsg.value = msg
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.record-card {
  margin-bottom: 16px;
}

.record-hint {
  font-size: 18px;
  color: #6B7280;
  margin-bottom: 20px;
  text-align: center;
}

.bp-inputs {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.bp-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bp-input-label {
  font-size: 20px;
  font-weight: 600;
  color: #374151;
}

.bp-unit {
  font-size: 16px;
  font-weight: 400;
  color: #9CA3AF;
}

.bp-input-wrapper {
  display: flex;
  align-items: center;
  border: 3px solid #E5E7EB;
  border-radius: 16px;
  background: white;
  overflow: hidden;
  transition: border-color 0.2s;
}

.bp-input-wrapper--normal {
  border-color: #10B981;
}

.bp-input-wrapper--high {
  border-color: #EF4444;
}

.bp-input-wrapper--pulse {
  border-color: #6B7280;
}

.bp-input {
  flex: 1;
  height: 72px;
  padding: 0 16px;
  border: none;
  outline: none;
  font-size: 36px;
  font-weight: 700;
  color: #1F2937;
  text-align: center;
  background: transparent;
  font-family: inherit;
  -webkit-appearance: none;
  -moz-appearance: textfield;
}

.bp-input::-webkit-inner-spin-button,
.bp-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.bp-input-unit {
  padding-right: 14px;
  font-size: 16px;
  color: #9CA3AF;
  font-weight: 500;
  white-space: nowrap;
}

.bp-range-hint {
  font-size: 15px;
  color: #9CA3AF;
  padding-left: 4px;
}

.status-preview {
  text-align: center;
  margin-top: 16px;
  margin-bottom: 4px;
}

.status-preview .badge {
  font-size: 18px;
  padding: 8px 20px;
}

.submit-btn {
  margin-top: 20px;
  font-size: 20px;
  height: 60px;
}

.tips-card h3 {
  margin-bottom: 12px;
  font-size: 20px;
}

.tips-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tips-list li {
  font-size: 18px;
  color: #374151;
  padding-left: 24px;
  position: relative;
}

.tips-list li::before {
  content: '•';
  position: absolute;
  left: 8px;
  color: #10B981;
  font-size: 20px;
}
</style>
