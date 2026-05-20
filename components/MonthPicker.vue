<template>
  <view class="month-picker">
    <text class="arrow" @click="shift(-1)">‹</text>
    <text class="label">{{ label }}</text>
    <text class="arrow" @click="shift(1)">›</text>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  modelValue: Date
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Date): void
}>()

const label = computed(() => {
  const d = props.modelValue
  return `${d.getFullYear()}年${d.getMonth() + 1}月`
})

function shift(dir: number) {
  const d = new Date(props.modelValue)
  d.setMonth(d.getMonth() + dir)
  emit('update:modelValue', d)
}
</script>

<style lang="scss" scoped>
.month-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40rpx;
  padding: 16rpx 0;

  .arrow {
    font-size: 36rpx;
    color: $text-tertiary;
    padding: 8rpx 16rpx;
  }

  .label {
    font-size: $subtitle-size;
    font-weight: 600;
    color: $text-primary;
  }
}
</style>
