<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-card">
        <!-- Status Icon -->
        <div class="modal-card__status-icon">
          {{ isHigh ? '❤️' : '💚' }}
        </div>

        <!-- Status Badge -->
        <div class="modal-card__badge" :class="isHigh ? 'badge-high' : 'badge-normal'">
          {{ bpStatusText }}
        </div>

        <!-- AI Message -->
        <div class="modal-card__message">
          <p>{{ resolvedMessage }}</p>
        </div>

        <!-- Daily Calories Card -->
        <div class="modal-card__calories" v-if="resolvedCalories">
          <div class="modal-card__calories-label">每日建議熱量</div>
          <div class="modal-card__calories-value">
            <span class="calories-number">{{ resolvedCalories }}</span>
            <span class="calories-unit">大卡/天</span>
          </div>
        </div>

        <!-- Diet Plan -->
        <div class="modal-card__diet" v-if="resolvedDietPlan">
          <div class="diet-title">飲食計畫建議</div>
          <p class="diet-content">{{ resolvedDietPlan }}</p>
        </div>

        <!-- Close Button -->
        <button class="btn btn-primary modal-card__close" @click="$emit('close')">
          我知道了，謝謝！
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  aiData: {
    type: Object,
    default: () => ({}),
  },
})

defineEmits(['close'])

const isHigh = computed(() => {
  const status = props.aiData?.bp_status || props.aiData?.status || ''
  return status === 'high' || status === '偏高' || status === 'elevated'
})

const bpStatusText = computed(() => {
  const status = props.aiData?.bp_status || props.aiData?.status || ''
  if (status === 'normal' || status === '正常') return '血壓正常'
  if (status === 'high' || status === '偏高' || status === 'elevated') return '血壓偏高'
  return isHigh.value ? '血壓偏高' : '血壓正常'
})

// Flexible field resolution
const resolvedMessage = computed(() => {
  return (
    props.aiData?.message ||
    props.aiData?.ai_message ||
    props.aiData?.advice ||
    props.aiData?.ai_advice ||
    '您的血壓記錄已成功保存，請繼續保持健康的生活習慣！'
  )
})

const resolvedCalories = computed(() => {
  return (
    props.aiData?.daily_calories ||
    props.aiData?.calories ||
    props.aiData?.recommended_calories ||
    null
  )
})

const resolvedDietPlan = computed(() => {
  return (
    props.aiData?.diet_plan ||
    props.aiData?.meal_plan ||
    props.aiData?.dietary_advice ||
    props.aiData?.diet_advice ||
    null
  )
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 200;
  padding: 0;
}

.modal-card {
  background: white;
  border-radius: 24px 24px 0 0;
  padding: 32px 24px 40px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal-card__status-icon {
  text-align: center;
  font-size: 64px;
  line-height: 1;
}

.modal-card__badge {
  text-align: center;
  display: inline-block;
  padding: 6px 20px;
  border-radius: 999px;
  font-size: 18px;
  font-weight: 700;
  align-self: center;
}

.badge-normal { background: #D1FAE5; color: #065F46; }
.badge-high   { background: #FEE2E2; color: #991B1B; }

.modal-card__message {
  background: #F9FAFB;
  border-radius: 16px;
  padding: 16px 20px;
}

.modal-card__message p {
  font-size: 20px;
  line-height: 1.7;
  color: #1F2937;
}

.modal-card__calories {
  background: linear-gradient(135deg, #10B981, #059669);
  border-radius: 16px;
  padding: 20px 24px;
  text-align: center;
  color: white;
}

.modal-card__calories-label {
  font-size: 16px;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 8px;
}

.modal-card__calories-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
}

.calories-number {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
}

.calories-unit {
  font-size: 20px;
  font-weight: 500;
}

.modal-card__diet {
  background: #FEF3C7;
  border-radius: 16px;
  padding: 16px 20px;
}

.diet-title {
  font-size: 18px;
  font-weight: 700;
  color: #92400E;
  margin-bottom: 8px;
}

.diet-content {
  font-size: 20px;
  line-height: 1.7;
  color: #78350F;
}

.modal-card__close {
  margin-top: 8px;
  font-size: 20px;
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-card {
  transform: translateY(100%);
}

.modal-leave-to .modal-card {
  transform: translateY(100%);
}
</style>
