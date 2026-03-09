<template>
  <div class="elder-app">
    <header>
      <h1>血壓助理</h1>
    </header>

    <section class="status-card">
      <h2> 系統連線狀態</h2>
      <ul>
        <li>後端網址: <code>{{ apiUrl || '未設定' }}</code></li>
        <li>API 狀態: <span :class="apiReady ? 'success' : 'fail'">{{ apiStatus }}</span></li>
        <li>資料庫狀態: <span :class="dbReady ? 'success' : 'fail'">{{ dbStatus }}</span></li>
      </ul>
      <button @click="checkConnections" class="main-btn">重新測試連線</button>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { createClient } from '@supabase/supabase-js'

// 1. 初始化讀取環境變數
const apiUrl = import.meta.env.VITE_API_URL
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const apiStatus = ref('檢測中...')
const apiReady = ref(false)
const dbStatus = ref('檢測中...')
const dbReady = ref(false)

// 2. 初始化 Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

const checkConnections = async () => {
  // 測試後端 FastAPI (Render)
  try {
    const res = await axios.get(`${apiUrl}/`)
    apiStatus.value = `連線成功: ${res.data.status || 'OK'}`
    apiReady.value = true
  } catch (err) {
    apiStatus.value = '連線失敗，請檢查 Render 網址與 CORS'
    apiReady.value = false
  }

  // 測試資料庫 (Supabase)
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
    if (error) throw error
    dbStatus.value = '連線成功！'
    dbReady.value = true
  } catch (err) {
    dbStatus.value = '連線失敗，請檢查 Supabase Key'
    dbReady.value = false
  }
}

onMounted(checkConnections)
</script>

<style scoped>
.elder-app { font-family: sans-serif; padding: 20px; text-align: center; }
h1 { font-size: 2.5rem; color: #2c3e50; }
.status-card { background: white; border-radius: 15px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
ul { list-style: none; padding: 0; text-align: left; display: inline-block; }
li { margin: 10px 0; font-size: 1.2rem; }
.success { color: green; font-weight: bold; }
.fail { color: red; font-weight: bold; }
.main-btn { background: #4A90E2; color: white; border: none; padding: 15px 30px; font-size: 1.2rem; border-radius: 10px; cursor: pointer; }
</style>