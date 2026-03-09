<template>
  <div>
    <div class="page-header">
      <h1>健康分享</h1>
      <p class="subtitle">讓家人一起關心您的健康</p>
    </div>

    <div class="page">
      <!-- My sharing code -->
      <div class="card share-code-card">
        <h2 class="section-title">我的授權碼</h2>
        <p class="section-desc">將此授權碼分享給家人，讓他們可以查看您的血壓記錄</p>

        <div v-if="codeLoading" class="code-loading">
          <div class="chart-spinner"></div>
        </div>

        <div v-else class="code-display">
          <div class="code-block">
            <span class="code-text">{{ sharingCode || '--------' }}</span>
          </div>

          <div class="code-actions">
            <button class="btn btn-outline" @click="copyCode" :disabled="!sharingCode">
              {{ copied ? '✅ 已複製！' : '📋 複製授權碼' }}
            </button>
            <button class="btn btn-danger reset-btn" @click="confirmReset" :disabled="resetLoading">
              <span v-if="resetLoading" class="spinner spinner--dark"></span>
              <span v-else>🔄 重置授權碼</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Viewers list -->
      <div class="card viewers-card">
        <h2 class="section-title">監看者清單</h2>

        <div v-if="viewersLoading" class="viewers-loading">
          <div class="chart-spinner"></div>
        </div>

        <div v-else-if="viewers.length === 0" class="viewers-empty">
          <span class="viewers-empty__icon">👨‍👩‍👧‍👦</span>
          <p>目前沒有家人在監看</p>
          <p class="viewers-empty__hint">分享您的授權碼給家人即可開始監看</p>
        </div>

        <ul v-else class="viewers-list">
          <li v-for="viewer in viewers" :key="viewer.id" class="viewer-item">
            <div class="avatar viewer-avatar">
              {{ (viewer.name || viewer.email || '?')[0].toUpperCase() }}
            </div>
            <div class="viewer-info">
              <p class="viewer-name">{{ viewer.name || '未知用戶' }}</p>
              <p class="viewer-email">{{ viewer.email }}</p>
            </div>
            <button
              class="revoke-btn"
              @click="handleRevoke(viewer.id)"
              :disabled="revokingId === viewer.id"
            >
              {{ revokingId === viewer.id ? '...' : '撤銷' }}
            </button>
          </li>
        </ul>
      </div>

      <!-- How to use -->
      <div class="card instructions-card">
        <h3>📖 如何讓家人監看？</h3>
        <ol class="instructions-list">
          <li>請家人下載「愛健康」App 並註冊帳號</li>
          <li>在家人的 App 中點選「分享」功能</li>
          <li>輸入您的 8 位授權碼</li>
          <li>授權成功後，家人即可查看您的血壓記錄</li>
        </ol>
        <p class="instructions-note">⚠️ 重置授權碼後，舊有連結將立即失效，家人需重新輸入新的授權碼。</p>
      </div>
    </div>

    <!-- Reset confirm modal -->
    <div v-if="showResetConfirm" class="confirm-overlay" @click.self="showResetConfirm = false">
      <div class="confirm-dialog">
        <h3>確認重置授權碼？</h3>
        <p>重置後，目前所有監看者將失去連結，需重新輸入新的授權碼。</p>
        <div class="confirm-actions">
          <button class="btn btn-secondary" @click="showResetConfirm = false">取消</button>
          <button class="btn btn-danger" @click="handleReset">確認重置</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getSharingCode, resetSharingCode, getViewers, revokeViewer } from '@/api/sharing.js'

const sharingCode = ref('')
const codeLoading = ref(false)
const resetLoading = ref(false)
const copied = ref(false)
const viewers = ref([])
const viewersLoading = ref(false)
const revokingId = ref(null)
const showResetConfirm = ref(false)

async function loadSharingCode() {
  codeLoading.value = true
  try {
    const res = await getSharingCode()
    sharingCode.value = res.data?.code || res.data?.sharing_code || ''
  } catch (err) {
    console.error('Failed to load sharing code', err)
  } finally {
    codeLoading.value = false
  }
}

async function loadViewers() {
  viewersLoading.value = true
  try {
    const res = await getViewers()
    viewers.value = Array.isArray(res.data) ? res.data : (res.data?.viewers || [])
  } catch (err) {
    console.error('Failed to load viewers', err)
    viewers.value = []
  } finally {
    viewersLoading.value = false
  }
}

async function copyCode() {
  if (!sharingCode.value) return
  try {
    await navigator.clipboard.writeText(sharingCode.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // Fallback
    const el = document.createElement('textarea')
    el.value = sharingCode.value
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}

function confirmReset() {
  showResetConfirm.value = true
}

async function handleReset() {
  showResetConfirm.value = false
  resetLoading.value = true
  try {
    const res = await resetSharingCode()
    sharingCode.value = res.data?.code || res.data?.sharing_code || ''
    // Reload viewers - they're now all disconnected
    await loadViewers()
  } catch (err) {
    console.error('Failed to reset sharing code', err)
  } finally {
    resetLoading.value = false
  }
}

async function handleRevoke(viewerId) {
  revokingId.value = viewerId
  try {
    await revokeViewer(viewerId)
    viewers.value = viewers.value.filter(v => v.id !== viewerId)
  } catch (err) {
    console.error('Failed to revoke viewer', err)
  } finally {
    revokingId.value = null
  }
}

onMounted(() => {
  loadSharingCode()
  loadViewers()
})
</script>

<style scoped>
.section-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #1F2937;
}

.section-desc {
  font-size: 17px;
  color: #6B7280;
  margin-bottom: 20px;
  line-height: 1.5;
}

.share-code-card {
  margin-bottom: 16px;
}

.code-loading,
.viewers-loading {
  display: flex;
  justify-content: center;
  padding: 24px 0;
}

.chart-spinner {
  width: 32px;
  height: 32px;
  border: 4px solid #E5E7EB;
  border-top-color: #10B981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.code-display {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.code-block {
  background: #F9FAFB;
  border: 2px dashed #D1D5DB;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
}

.code-text {
  font-family: 'Courier New', Courier, monospace;
  font-size: 40px;
  font-weight: 700;
  letter-spacing: 8px;
  color: #1F2937;
}

.code-actions {
  display: flex;
  gap: 12px;
}

.code-actions .btn {
  flex: 1;
  font-size: 17px;
}

.reset-btn {
  flex: 1;
}

.spinner--dark {
  border-color: rgba(239,68,68,0.3);
  border-top-color: #EF4444;
}

.viewers-card {
  margin-bottom: 16px;
}

.viewers-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0;
  gap: 8px;
  color: #6B7280;
}

.viewers-empty__icon {
  font-size: 48px;
}

.viewers-empty p {
  font-size: 20px;
  color: #6B7280;
}

.viewers-empty__hint {
  font-size: 16px !important;
  color: #9CA3AF;
  text-align: center;
}

.viewers-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.viewer-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid #F3F4F6;
}

.viewer-item:last-child {
  border-bottom: none;
}

.viewer-avatar {
  width: 48px;
  height: 48px;
  font-size: 20px;
}

.viewer-info {
  flex: 1;
  min-width: 0;
}

.viewer-name {
  font-size: 20px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.viewer-email {
  font-size: 15px;
  color: #6B7280;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.revoke-btn {
  background: #FEE2E2;
  color: #EF4444;
  border: none;
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;
  transition: background 0.2s;
}

.revoke-btn:hover {
  background: #FECACA;
}

.revoke-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.instructions-card h3 {
  font-size: 20px;
  margin-bottom: 14px;
}

.instructions-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  counter-reset: step;
}

.instructions-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 18px;
  color: #374151;
  counter-increment: step;
  padding-left: 4px;
}

.instructions-list li::before {
  content: counter(step);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #10B981;
  color: white;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 2px;
}

.instructions-note {
  margin-top: 16px;
  font-size: 16px;
  color: #92400E;
  background: #FEF3C7;
  border-radius: 10px;
  padding: 10px 14px;
  line-height: 1.5;
}

/* Confirm dialog */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 24px;
}

.confirm-dialog {
  background: white;
  border-radius: 20px;
  padding: 28px 24px;
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.confirm-dialog h3 {
  font-size: 22px;
  font-weight: 700;
  color: #1F2937;
}

.confirm-dialog p {
  font-size: 18px;
  color: #6B7280;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}
</style>
