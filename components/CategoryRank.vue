<template>
  <view class="category-rank">
    <view class="rank-item" v-for="item in items" :key="item.id">
      <text class="rank-icon">{{ item.icon }}</text>
      <text class="rank-name">{{ item.name }}</text>
      <view class="rank-bar-bg">
        <view class="rank-bar" :style="{ width: (item.amount / maxAmount * 100) + '%' }" />
      </view>
      <text class="rank-amount">¥{{ item.amount.toFixed(0) }}</text>
      <text class="rank-percent">{{ (item.amount / total * 100).toFixed(1) }}%</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

interface RankItem {
  id: string
  name: string
  icon: string
  amount: number
}

const props = defineProps<{
  items: RankItem[]
}>()

const total = computed(() => props.items.reduce((s, i) => s + i.amount, 0))
const maxAmount = computed(() => props.items[0]?.amount || 1)
</script>

<style lang="scss" scoped>
.rank-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  gap: 12rpx;

  .rank-icon {
    font-size: 32rpx;
  }

  .rank-name {
    font-size: $caption-size;
    color: $text-primary;
    width: 80rpx;
  }

  .rank-bar-bg {
    flex: 1;
    height: 16rpx;
    background: #F3F4F6;
    border-radius: 8rpx;
    overflow: hidden;
  }

  .rank-bar {
    height: 100%;
    background: $primary;
    border-radius: 8rpx;
  }

  .rank-amount {
    font-size: $caption-size;
    font-weight: 600;
    color: $text-primary;
    width: 120rpx;
    text-align: right;
  }

  .rank-percent {
    font-size: $tiny-size;
    color: $text-tertiary;
    width: 80rpx;
    text-align: right;
  }
}
</style>
