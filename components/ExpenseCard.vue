<template>
  <view class="expense-card" @click="$emit('click', record)">
    <view class="card-left">
      <text class="card-icon">{{ categoryIcon }}</text>
      <view class="card-info">
        <text class="card-title">{{ categoryName }}</text>
        <text class="card-note" v-if="record.note">{{ record.note }}</text>
        <text class="card-note" v-else>{{ paymentLabel }}</text>
      </view>
    </view>
    <view class="card-right">
      <text class="card-amount" :class="record.type">
        {{ record.type === 'expense' ? '-' : '+' }}¥{{ record.amount.toFixed(2) }}
      </text>
      <view class="source-badge" v-if="showSourceBadge && record.source !== 'local'">
        <text class="badge-text">{{ memberName }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { Record } from '@/types/record'
import { useCategoryStore } from '@/store/category'

const props = defineProps<{
  record: Record
  showSourceBadge?: boolean
}>()

defineEmits<{
  (e: 'click', record: Record): void
}>()

const categoryStore = useCategoryStore()

const categoryIcon = computed(() => {
  return categoryStore.getById(props.record.categoryId)?.icon || '📦'
})

const categoryName = computed(() => {
  return categoryStore.getById(props.record.categoryId)?.name || '其他'
})

const paymentLabel = computed(() => {
  const map: Record<string, string> = {
    wechat: '微信支付',
    alipay: '支付宝',
    cash: '现金',
    card: '银行卡'
  }
  return map[props.record.paymentMethod] || ''
})

const memberName = computed(() => {
  if (props.record.source === 'local') return '本机'
  const memberId = props.record.source.replace('imported_', '')
  return memberId
})
</script>

<style lang="scss" scoped>
.expense-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  background: $card-bg;
  margin: 2rpx 0;
}

.card-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.card-icon {
  font-size: 40rpx;
  width: 56rpx;
  height: 56rpx;
  line-height: 56rpx;
  text-align: center;
  background: $bg;
  border-radius: 16rpx;
}

.card-info {
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: $body-size;
  color: $text-primary;
  font-weight: 500;
}

.card-note {
  font-size: $tiny-size;
  color: $text-tertiary;
  margin-top: 4rpx;
}

.card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.card-amount {
  font-size: $subtitle-size;
  font-weight: 600;
  color: $text-primary;

  &.expense {
    color: $expense-red;
  }

  &.income {
    color: $income-green;
  }
}

.source-badge {
  margin-top: 6rpx;
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
  background: rgba($primary, 0.1);

  .badge-text {
    font-size: $tiny-size;
    color: $primary;
  }
}
</style>
