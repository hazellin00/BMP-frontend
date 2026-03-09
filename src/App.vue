<template>
  <div id="app-root">
    <!-- Viewer banner shown when monitoring someone else -->
    <ViewerBanner v-if="authStore.isViewer" />

    <!-- Main page content -->
    <RouterView />

    <!-- Bottom navigation (hidden on login page) -->
    <BottomNav v-if="authStore.isLoggedIn && route.path !== '/login'" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import ViewerBanner from '@/components/ViewerBanner.vue'
import BottomNav from '@/components/BottomNav.vue'

const route = useRoute()
const authStore = useAuthStore()
console.log("目前的 API 網址是:", import.meta.env.VITE_API_URL);
</script>

<style>
/* Reset app-root layout */
#app-root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  background: #F9FAFB;
  position: relative;
}
</style>
