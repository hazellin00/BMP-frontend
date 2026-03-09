<template>
  <div class="calendar-strip" ref="stripRef">
    <button
      v-for="day in days"
      :key="day.dateStr"
      class="calendar-strip__item"
      :class="{ 'calendar-strip__item--selected': day.dateStr === selectedDate }"
      @click="selectDay(day.dateStr)"
    >
      <span class="calendar-strip__dow">{{ day.dow }}</span>
      <span class="calendar-strip__date">{{ day.dateNum }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  selectedDate: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:selectedDate'])

const stripRef = ref(null)

const DOW_LABELS = ['日', '一', '二', '三', '四', '五', '六']

const days = computed(() => {
  const result = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = -7; i <= 6; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    result.push({
      dateStr: `${yyyy}-${mm}-${dd}`,
      dow: DOW_LABELS[d.getDay()],
      dateNum: d.getDate(),
      isToday: i === 0,
    })
  }
  return result
})

function selectDay(dateStr) {
  emit('update:selectedDate', dateStr)
}

function scrollToSelected() {
  if (!stripRef.value) return
  const selected = stripRef.value.querySelector('.calendar-strip__item--selected')
  if (selected) {
    selected.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }
}

onMounted(() => {
  scrollToSelected()
})

watch(() => props.selectedDate, () => {
  scrollToSelected()
})
</script>

<style scoped>
.calendar-strip {
  display: flex;
  overflow-x: auto;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.calendar-strip::-webkit-scrollbar {
  display: none;
}

.calendar-strip__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 52px;
  height: 64px;
  border: 2px solid #E5E7EB;
  border-radius: 14px;
  background: white;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
  padding: 0 6px;
}

.calendar-strip__item:active {
  transform: scale(0.95);
}

.calendar-strip__item--selected {
  background-color: #10B981;
  border-color: #10B981;
  color: white;
}

.calendar-strip__dow {
  font-size: 13px;
  font-weight: 500;
  color: #6B7280;
}

.calendar-strip__item--selected .calendar-strip__dow {
  color: rgba(255, 255, 255, 0.85);
}

.calendar-strip__date {
  font-size: 20px;
  font-weight: 700;
  color: #1F2937;
}

.calendar-strip__item--selected .calendar-strip__date {
  color: white;
}
</style>
