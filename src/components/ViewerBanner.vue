<template>
  <div class="viewer-banner" v-if="authStore.isViewer">
    <span class="viewer-banner__icon">👀</span>
    <span class="viewer-banner__text">
      正在查看 <strong>{{ authStore.viewingUser?.name }}</strong> 的健康資料
    </span>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()
</script>

<style scoped>
.viewer-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #10B981;
  color: white;
  padding: 12px 16px;
  font-size: 20px;
  font-weight: 500;
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
}

.viewer-banner__icon {
  font-size: 22px;
}

.viewer-banner__text strong {
  font-weight: 700;
}
</style>
