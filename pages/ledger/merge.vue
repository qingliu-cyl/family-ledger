<template>
  <view class="page">
    <view class="nav-bar">
      <text class="nav-back" @click="goBack">‹</text>
      <text class="nav-title">合并账本</text>
    </view>

    <!-- 合并策略选择 -->
    <view class="strategy-section">
      <text class="section-title">选择合并策略</text>
      <view class="strategy-list">
        <view
          v-for="s in strategies"
          :key="s.value"
          class="strategy-item"
          :class="{ active: selectedStrategy === s.value }"
          @click="selectedStrategy = s.value"
        >
          <view class="strategy-radio">
            <view class="radio-dot" v-if="selectedStrategy === s.value" />
          </view>
          <view class="strategy-info">
            <text class="strategy-name">{{ s.name }}</text>
            <text class="strategy-desc">{{ s.desc }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 预览统计 -->
    <view class="preview-section" v-if="importData">
      <text class="section-title">导入预览</text>
      <view class="stat-card">
        <view class="stat-item">
          <text class="stat-number green">{{ addedCount }}</text>
          <text class="stat-label">新增记录</text>
        </view>
        <view class="stat-item">
          <text class="stat-number orange">{{ skippedCount }}</text>
          <text class="stat-label">重复跳过</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ importData.records.length }}</text>
          <text class="stat-label">导入总数</text>
        </view>
      </view>
    </view>

    <!-- 来源信息 -->
    <view class="source-section" v-if="importData">
      <text class="section-title">来源信息</text>
      <view class="source-card">
        <view class="source-row">
          <text class="source-label">账本名称</text>
          <text class="source-value">{{ importData.ledger.name }}</text>
        </view>
        <view class="source-row">
          <text class="source-label">导出时间</text>
          <text class="source-value">{{ importData.exportedAt }}</text>
        </view>
        <view class="source-row">
          <text class="source-label">成员</text>
          <text class="source-value">{{ importData.ledger.members.map(m => m.name).join(', ') }}</text>
        </view>
      </view>
    </view>

    <!-- 无数据时提示 -->
    <view class="empty" v-if="!importData">
      <text class="empty-icon">🔗</text>
      <text class="empty-text">暂无待合并的数据</text>
      <text class="empty-hint">请先从「账本管理」导入账本文件</text>
    </view>

    <!-- 确认按钮 -->
    <view class="bottom-bar" v-if="importData">
      <view class="btn-primary" @click="confirmMerge">
        <text class="btn-text">确认合并</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { LedgerShareFile } from '@/types/ledger'
import { smartMerge, appendAll, tagImportedRecords } from '@/utils/merge'
import { getRecords } from '@/utils/storage'
import { useRecordStore } from '@/store/record'

interface StrategyOption {
  value: 'smart' | 'append'
  name: string
  desc: string
}

const recordStore = useRecordStore()
const importData = ref<LedgerShareFile | null>(null)
const memberId = ref<string>('')
const selectedStrategy = ref<'smart' | 'append'>('smart')

const strategies: StrategyOption[] = [
  { value: 'smart', name: '智能合并', desc: '按「日期+金额+分类」自动去重，避免重复记录' },
  { value: 'append', name: '完全追加', desc: '所有记录直接加入，不检查重复' }
]

// 从页面事件通道接收导入数据
const eventChannel = (uni as any).getOpenerEventChannel?.()
if (eventChannel) {
  eventChannel.on('mergeData', (data: { file: LedgerShareFile; memberId: string }) => {
    importData.value = data.file
    memberId.value = data.memberId
  })
}

const taggedRecords = computed(() => {
  if (!importData.value) return []
  return tagImportedRecords(importData.value.records, memberId.value)
})

const addedCount = computed(() => {
  if (!taggedRecords.value.length) return 0
  if (selectedStrategy.value === 'smart') {
    const existing = getRecords()
    const result = smartMerge(existing, taggedRecords.value)
    return taggedRecords.value.length - result.duplicates.length
  }
  return taggedRecords.value.length
})

const skippedCount = computed(() => {
  if (!taggedRecords.value.length || selectedStrategy.value !== 'smart') return 0
  const existing = getRecords()
  const result = smartMerge(existing, taggedRecords.value)
  return result.duplicates.length
})

function confirmMerge() {
  if (!importData.value) return

  const tagged = tagImportedRecords(importData.value.records, memberId.value)
  const existing = getRecords()
  const result = selectedStrategy.value === 'smart'
    ? smartMerge(existing, tagged)
    : { merged: appendAll(existing, tagged), duplicates: [] }

  uni.setStorageSync('hl_records', result.merged)
  recordStore.refresh()

  uni.showToast({
    title: `合并成功，新增 ${tagged.length - result.duplicates.length} 条`,
    icon: 'success',
    duration: 2000
  })

  setTimeout(() => uni.navigateBack(), 2000)
}

function goBack() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg;
  padding-bottom: 160rpx;
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
  }
}

.section-title {
  font-size: $caption-size;
  color: $text-tertiary;
  margin-bottom: 16rpx;
  display: block;
}

.strategy-section {
  margin: 24rpx;
}

.strategy-list {
  background: $card-bg;
  border-radius: $large-radius;
  overflow: hidden;
}

.strategy-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  gap: 20rpx;

  & + .strategy-item {
    border-top: 1rpx solid #F3F4F6;
  }

  &.active .strategy-radio {
    border-color: $primary;
  }

  &.active .radio-dot {
    display: block;
  }
}

.strategy-radio {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid $text-tertiary;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: $primary;
}

.strategy-info {
  display: flex;
  flex-direction: column;
}

.strategy-name {
  font-size: $body-size;
  color: $text-primary;
  font-weight: 500;
}

.strategy-desc {
  font-size: $tiny-size;
  color: $text-tertiary;
  margin-top: 4rpx;
}

.preview-section {
  margin: 24rpx;
}

.stat-card {
  display: flex;
  background: $card-bg;
  border-radius: $large-radius;
  padding: 24rpx;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: $text-primary;

  &.green {
    color: $income-green;
  }

  &.orange {
    color: #F59E0B;
  }
}

.stat-label {
  font-size: $tiny-size;
  color: $text-tertiary;
  margin-top: 8rpx;
}

.source-section {
  margin: 24rpx;
}

.source-card {
  background: $card-bg;
  border-radius: $large-radius;
  padding: 24rpx;
}

.source-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
}

.source-label {
  font-size: $body-size;
  color: $text-secondary;
}

.source-value {
  font-size: $body-size;
  color: $text-primary;
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

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx 48rpx;
  background: $card-bg;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.btn-primary {
  background: $primary;
  border-radius: $button-radius;
  padding: 28rpx;
  text-align: center;

  .btn-text {
    font-size: $body-size;
    font-weight: 600;
    color: #fff;
  }

  &:active {
    opacity: 0.85;
  }
}
</style>
