<template>
  <nav class="bottom-nav">
    <RouterLink
      v-for="tab in tabs"
      :key="tab.path"
      :to="tab.path"
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--active': isActive(tab.path) }"
    >
      <span class="bottom-nav__icon">{{ tab.icon }}</span>
      <span class="bottom-nav__label">{{ tab.label }}</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { path: '/record', icon: '🏠', label: '記錄' },
  { path: '/trend',  icon: '📈', label: '趨勢' },
  { path: '/share',  icon: '🤝', label: '分享' },
  { path: '/profile',icon: '👤', label: '會員' },
]

function isActive(path) {
  return route.path === path
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  height: 70px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.08);
  z-index: 50;
  border-top: 1px solid #E5E7EB;
}

.bottom-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  flex: 1;
  height: 100%;
  text-decoration: none;
  color: #9CA3AF;
  transition: color 0.2s;
  padding: 8px 0;
}

.bottom-nav__item--active {
  color: #10B981;
}

.bottom-nav__icon {
  font-size: 24px;
  transition: font-size 0.2s;
  line-height: 1;
}

.bottom-nav__item--active .bottom-nav__icon {
  font-size: 28px;
}

.bottom-nav__label {
  font-size: 13px;
  font-weight: 500;
}

.bottom-nav__item--active .bottom-nav__label {
  font-weight: 700;
  font-size: 14px;
}
</style>
