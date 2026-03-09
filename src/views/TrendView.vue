<template>
  <div class="trend-view">
    <!-- Calendar strip -->
    <CalendarStrip
      :selectedDate="selectedDate"
      @update:selectedDate="onDateSelect"
    />

    <div class="page">
      <!-- Chart section -->
      <div class="card chart-card">
        <h2 class="chart-title">血壓趨勢圖</h2>
        <p class="chart-subtitle">過去 14 天記錄</p>

        <div v-if="chartLoading" class="chart-loading">
          <div class="chart-spinner"></div>
          <p>載入中...</p>
        </div>

        <div v-else-if="hasData" class="chart-wrapper">
          <Line :data="chartData" :options="chartOptions" />
        </div>

        <div v-else class="chart-empty">
          <span class="chart-empty__icon">📊</span>
          <p>目前沒有歷史記錄</p>
          <p class="chart-empty__hint">前往「記錄」頁面記錄您的血壓</p>
        </div>
      </div>

      <!-- Today's reading -->
      <div class="card today-card" v-if="todayRecord">
        <h3 class="today-title">{{ selectedDate === todayStr ? '今日' : selectedDate }} 測量結果</h3>

        <div class="today-values">
          <div class="today-value-item">
            <span class="today-value-label">收縮壓</span>
            <span class="today-value-number sys-color">{{ todayRecord.systolic }}</span>
            <span class="today-value-unit">mmHg</span>
          </div>
          <div class="today-divider">／</div>
          <div class="today-value-item">
            <span class="today-value-label">舒張壓</span>
            <span class="today-value-number dia-color">{{ todayRecord.diastolic }}</span>
            <span class="today-value-unit">mmHg</span>
          </div>
          <div class="today-value-pulse" v-if="todayRecord.pulse">
            <span class="pulse-icon">💓</span>
            <span class="pulse-number">{{ todayRecord.pulse }}</span>
            <span class="pulse-unit">次/分</span>
          </div>
        </div>

        <div class="today-status">
          <span
            class="badge"
            :class="bpStatusClass(todayRecord.systolic, todayRecord.diastolic)"
          >
            {{ bpStatusText(todayRecord.systolic, todayRecord.diastolic) }}
          </span>
        </div>

        <!-- AI recommendation snippet -->
        <div v-if="todayRecord.ai_message || todayRecord.message || (todayRecord.ai_recommendation && todayRecord.ai_recommendation.message)" class="today-ai">
          <div class="today-ai__label">🤖 AI 建議</div>
          <p class="today-ai__text">
            {{
              todayRecord.ai_message ||
              todayRecord.message ||
              (todayRecord.ai_recommendation && todayRecord.ai_recommendation.message) ||
              ''
            }}
          </p>
        </div>
      </div>

      <div v-else-if="!chartLoading" class="card today-empty">
        <p class="today-empty__text">
          {{ selectedDate === todayStr ? '今天' : selectedDate }}
          尚無測量記錄
        </p>
        <RouterLink to="/record" class="btn btn-outline" style="margin-top: 12px; text-decoration: none;">
          前往記錄血壓
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import CalendarStrip from '@/components/CalendarStrip.vue'
import { getHistory, getTodayRecord } from '@/api/bloodPressure.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Today string
const today = new Date()
const todayStr = computed(() => {
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
})

const selectedDate = ref(todayStr.value)
const chartLoading = ref(false)
const historyData = ref([])
const todayRecord = ref(null)

// Compute 14-day date range
function get14DayRange(centerDate) {
  const center = new Date(centerDate + 'T00:00:00')
  const start = new Date(center)
  start.setDate(center.getDate() - 7)
  const end = new Date(center)
  end.setDate(center.getDate() + 6)

  function fmt(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }
  return { start: fmt(start), end: fmt(end) }
}

async function loadData(dateStr) {
  chartLoading.value = true
  todayRecord.value = null

  try {
    const { start, end } = get14DayRange(dateStr)
    const res = await getHistory(start, end)
    const records = Array.isArray(res.data) ? res.data : (res.data?.records || [])
    historyData.value = records

    // Find selected date record
    const match = records.find(r => {
      const rDate = (r.recorded_at || r.created_at || r.date || '').substring(0, 10)
      return rDate === dateStr
    })
    todayRecord.value = match || null

    // Also fetch today separately if no match
    if (!todayRecord.value && dateStr === todayStr.value) {
      try {
        const todayRes = await getTodayRecord()
        if (todayRes.data) {
          todayRecord.value = todayRes.data
        }
      } catch {
        // no today record
      }
    }
  } catch (err) {
    console.error('Failed to load history', err)
    historyData.value = []
  } finally {
    chartLoading.value = false
  }
}

const hasData = computed(() => historyData.value.length > 0)

// Build chart data from history
const chartData = computed(() => {
  const sorted = [...historyData.value].sort((a, b) => {
    const da = a.recorded_at || a.created_at || a.date || ''
    const db = b.recorded_at || b.created_at || b.date || ''
    return da.localeCompare(db)
  })

  const labels = sorted.map(r => {
    const dateStr = (r.recorded_at || r.created_at || r.date || '').substring(5, 10)
    return dateStr
  })

  const sysValues = sorted.map(r => r.systolic)
  const diaValues = sorted.map(r => r.diastolic)

  return {
    labels,
    datasets: [
      {
        label: '收縮壓 (SYS)',
        data: sysValues,
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239,68,68,0.1)',
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: '#EF4444',
        tension: 0.3,
        fill: false,
      },
      {
        label: '舒張壓 (DIA)',
        data: diaValues,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59,130,246,0.1)',
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: '#3B82F6',
        tension: 0.3,
        fill: false,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: { size: 14 },
        padding: 16,
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} mmHg`,
      },
    },
  },
  scales: {
    x: {
      ticks: { font: { size: 13 } },
      grid: { color: '#F3F4F6' },
    },
    y: {
      min: 40,
      max: 200,
      ticks: { font: { size: 13 } },
      grid: { color: '#F3F4F6' },
    },
  },
}

function bpStatusClass(sys, dia) {
  if (sys >= 140 || dia >= 90) return 'badge-high'
  if (sys >= 130 || dia >= 85) return 'badge-warn'
  return 'badge-normal'
}

function bpStatusText(sys, dia) {
  if (sys >= 140 || dia >= 90) return '⚠️ 血壓偏高'
  if (sys >= 130 || dia >= 85) return '注意偏高'
  return '✅ 血壓正常'
}

function onDateSelect(date) {
  selectedDate.value = date
}

watch(selectedDate, (newDate) => {
  loadData(newDate)
})

onMounted(() => {
  loadData(selectedDate.value)
})
</script>

<style scoped>
.trend-view {
  min-height: 100vh;
  background: #F9FAFB;
}

.chart-card {
  margin-bottom: 16px;
}

.chart-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 4px;
}

.chart-subtitle {
  font-size: 16px;
  color: #6B7280;
  margin-bottom: 16px;
}

.chart-wrapper {
  position: relative;
}

.chart-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  gap: 12px;
  color: #6B7280;
  font-size: 18px;
}

.chart-spinner {
  width: 36px;
  height: 36px;
  border: 4px solid #E5E7EB;
  border-top-color: #10B981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  gap: 8px;
  color: #6B7280;
}

.chart-empty__icon {
  font-size: 48px;
}

.chart-empty p {
  font-size: 18px;
}

.chart-empty__hint {
  font-size: 16px !important;
  color: #9CA3AF;
}

/* Today card */
.today-card {
  margin-bottom: 16px;
}

.today-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #374151;
}

.today-values {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.today-value-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.today-value-label {
  font-size: 14px;
  color: #6B7280;
  font-weight: 500;
}

.today-value-number {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
}

.sys-color { color: #EF4444; }
.dia-color { color: #3B82F6; }

.today-value-unit {
  font-size: 14px;
  color: #9CA3AF;
}

.today-divider {
  font-size: 36px;
  color: #D1D5DB;
  font-weight: 300;
  align-self: center;
  padding-top: 16px;
}

.today-value-pulse {
  display: flex;
  align-items: baseline;
  gap: 4px;
  width: 100%;
  justify-content: center;
  margin-top: 4px;
}

.pulse-icon { font-size: 18px; }
.pulse-number { font-size: 24px; font-weight: 700; color: #374151; }
.pulse-unit { font-size: 14px; color: #6B7280; }

.today-status {
  text-align: center;
  margin-bottom: 16px;
}

.today-ai {
  background: #F0FDF4;
  border-radius: 12px;
  padding: 14px 16px;
  border-left: 4px solid #10B981;
}

.today-ai__label {
  font-size: 16px;
  font-weight: 700;
  color: #065F46;
  margin-bottom: 6px;
}

.today-ai__text {
  font-size: 18px;
  color: #374151;
  line-height: 1.6;
}

.today-empty {
  text-align: center;
  padding: 32px 24px;
}

.today-empty__text {
  font-size: 20px;
  color: #6B7280;
}
</style>
