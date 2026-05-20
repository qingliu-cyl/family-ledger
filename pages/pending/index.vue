<template>
  <view class="page">
    <view class="nav-bar">
      <text class="nav-back" @click="goBack">‹</text>
      <text class="nav-title">待确认账单</text>
      <text class="nav-hint" v-if="pendingPayments.length">
        检测到 {{ pendingPayments.length }} 笔交易
      </text>
    </view>

    <!-- 空状态 -->
    <view class="empty" v-if="pendingPayments.length === 0">
      <text class="empty-icon">🔔</text>
      <text class="empty-text">暂无自动检测的交易</text>
      <text class="empty-hint">支付后会自动出现在这里</text>
    </view>

    <!-- 待确认列表 -->
    <view class="pending-card" v-for="(item, idx) in pendingPayments" :key="idx">
      <!-- 来源标识 -->
      <view class="source-tag" :class="item.paymentMethod">
        <text class="source-text">{{ sourceLabel(item.paymentMethod) }}</text>
      </view>

      <!-- 金额 -->
      <text class="pending-amount">¥ {{ item.amount.toFixed(2) }}</text>

      <!-- 商户 -->
      <text class="pending-merchant">{{ item.note || '未知商户' }}</text>

      <!-- 可编辑字段 -->
      <view class="edit-row">
        <text class="edit-label">分类</text>
        <picker :range="categories" :range-key="'label'" @change="(e: any) => onCategoryChange(idx, e)">
          <text class="edit-value">{{ getCategoryLabel(item.categoryId) }} ›</text>
        </picker>
      </view>

      <view class="edit-row">
        <text class="edit-label">备注</text>
        <input class="edit-input" v-model="item.note" placeholder="添加备注..." />
      </view>

      <!-- 操作按钮 -->
      <view class="action-row">
        <text class="btn-ignore" @click="ignore(idx)">忽略</text>
        <text class="btn-confirm" @click="confirm(idx)">✓ 确认入账</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { CreateRecordInput } from '@/types/record'
import { pendingPayments } from '@/utils/payment-listener'
import { useRecordStore } from '@/store/record'
import { useCategoryStore } from '@/store/category'

interface CategoryOption {
  value: string
  label: string
}

const recordStore = useRecordStore()
const categoryStore = useCategoryStore()

const categories = computed<CategoryOption[]>(() =>
  categoryStore.categories.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` }))
)

function sourceLabel(method: string): string {
  const map: Record<string, string> = { wechat: '微信支付', alipay: '支付宝', card: '银行卡' }
  return map[method] || '自动检测'
}

function getCategoryLabel(id: string): string {
  const cat = categories.value.find(c => c.value === id)
  return cat ? cat.label : '📦 其他'
}

function onCategoryChange(idx: number, e: any): void {
  pendingPayments.value[idx].categoryId = categories.value[e.detail.value].value
}

function confirm(idx: number): void {
  const item = pendingPayments.value[idx]
  recordStore.add(item)
  pendingPayments.value.splice(idx, 1)
  uni.showToast({ title: '已入账', icon: 'success' })
}

function ignore(idx: number): void {
  pendingPayments.value.splice(idx, 1)
}

function goBack(): void {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg;
}

.nav-bar {
  display: flex;
  align-items: center;
  padding: 100rpx 32rpx 24rpx;
  background: $card-bg;

  .nav-back {
    font-size: 44rpx;
    color: $primary;
    margin-right: 16rpx;
  }

  .nav-title {
    font-size: $title-size;
    font-weight: 600;
    color: $text-primary;
    flex: 1;
  }

  .nav-hint {
    font-size: $caption-size;
    color: $text-tertiary;
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;

  .empty-icon {
    font-size: 80rpx;
  }

  .empty-text {
    font-size: $subtitle-size;
    color: $text-secondary;
    margin-top: 24rpx;
  }

  .empty-hint {
    font-size: $caption-size;
    color: $text-tertiary;
    margin-top: 8rpx;
  }
}

.pending-card {
  margin: 24rpx;
  padding: 28rpx;
  background: $card-bg;
  border-radius: $large-radius;
  position: relative;
}

.source-tag {
  display: inline-flex;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  font-size: $tiny-size;

  &.wechat {
    background: #DCF8C6;
    color: #07C160;
  }

  &.alipay {
    background: #E6F4FF;
    color: #1677FF;
  }

  &.card {
    background: #FFF7ED;
    color: #D97706;
  }
}

.pending-amount {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: $expense-red;
  margin-top: 16rpx;
}

.pending-merchant {
  font-size: $body-size;
  color: $text-secondary;
  margin-top: 4rpx;
}

.edit-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-top: 1rpx solid #F3F4F6;
  margin-top: 8rpx;

  .edit-label {
    font-size: $caption-size;
    color: $text-tertiary;
  }

  .edit-value {
    font-size: $caption-size;
    color: $text-primary;
  }

  .edit-input {
    font-size: $caption-size;
    text-align: right;
    flex: 1;
  }
}

.action-row {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  margin-top: 24rpx;
}

.btn-ignore {
  padding: 16rpx 32rpx;
  border-radius: 12rpx;
  font-size: $caption-size;
  color: $text-tertiary;
  background: #F3F4F6;
}

.btn-confirm {
  padding: 16rpx 40rpx;
  border-radius: 12rpx;
  font-size: $caption-size;
  font-weight: 600;
  color: #fff;
  background: $primary;
}
</style>
