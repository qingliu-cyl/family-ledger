<template>
  <view class="page">
    <view class="nav-bar">
      <text class="nav-title">账本管理</text>
    </view>

    <!-- 账本信息 -->
    <view class="info-card">
      <view class="info-row">
        <text class="info-label">账本名称</text>
        <text class="info-value">{{ ledgerMeta.name }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">成员数</text>
        <text class="info-value">{{ allMembers.length }} 位</text>
      </view>
      <view class="info-row">
        <text class="info-label">记录数</text>
        <text class="info-value">{{ recordsCount }} 条</text>
      </view>
    </view>

    <!-- 操作列表 -->
    <view class="action-group">
      <view class="group-title">
        <text class="group-text">数据导出</text>
      </view>
      <view class="action-item" @click="exportFullBackup">
        <view class="action-left">
          <text class="action-icon">💾</text>
          <view class="action-info">
            <text class="action-name">导出完整备份</text>
            <text class="action-desc">包含所有数据，换设备可完全恢复</text>
          </view>
        </view>
        <text class="action-arrow">›</text>
      </view>
      <view class="action-item" @click="exportShare">
        <view class="action-left">
          <text class="action-icon">📤</text>
          <view class="action-info">
            <text class="action-name">导出分享账本</text>
            <text class="action-desc">分享给家人，可合并到对方的账本中</text>
          </view>
        </view>
        <text class="action-arrow">›</text>
      </view>
    </view>

    <view class="action-group">
      <view class="group-title">
        <text class="group-text">数据导入</text>
      </view>
      <view class="action-item" @click="importData">
        <view class="action-left">
          <text class="action-icon">📥</text>
          <view class="action-info">
            <text class="action-name">导入账本</text>
            <text class="action-desc">从文件导入备份或分享账本</text>
          </view>
        </view>
        <text class="action-arrow">›</text>
      </view>
    </view>

    <view class="action-group">
      <view class="group-title">
        <text class="group-text">数据合并</text>
      </view>
      <view class="action-item" @click="goToMerge">
        <view class="action-left">
          <text class="action-icon">🔗</text>
          <view class="action-info">
            <text class="action-name">合并账本</text>
            <text class="action-desc">查看合并历史与去重统计</text>
          </view>
        </view>
        <text class="action-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useLedgerStore } from '@/store/ledger'
import { useMemberStore } from '@/store/member'
import { useRecordStore } from '@/store/record'
import { exportFullBackupToFile, exportShareFileToClipboard } from '@/utils/export'
import { importFromFile } from '@/utils/import'

const ledgerStore = useLedgerStore()
const memberStore = useMemberStore()
const recordStore = useRecordStore()

onShow(() => {
  ledgerStore.refresh()
  memberStore.refresh()
  recordStore.refresh()
})

const ledgerMeta = computed(() => ledgerStore.meta)
const allMembers = computed(() => memberStore.allWithSelf)
const recordsCount = computed(() => recordStore.records.length)

async function exportFullBackup() {
  await exportFullBackupToFile()
}

async function exportShare() {
  await exportShareFileToClipboard()
}

function importData() {
  importFromFile()
}

function goToMerge() {
  uni.navigateTo({ url: '/pages/ledger/merge' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg;
}

.nav-bar {
  padding: 100rpx 32rpx 24rpx;
  background: $card-bg;

  .nav-title {
    font-size: 40rpx;
    font-weight: 700;
    color: $text-primary;
  }
}

.info-card {
  margin: 24rpx;
  padding: 24rpx;
  background: $card-bg;
  border-radius: $large-radius;

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 0;
  }

  .info-label {
    font-size: $body-size;
    color: $text-secondary;
  }

  .info-value {
    font-size: $body-size;
    color: $text-primary;
    font-weight: 500;
  }
}

.action-group {
  margin: 24rpx;

  .group-title {
    margin-bottom: 16rpx;
  }

  .group-text {
    font-size: $caption-size;
    color: $text-tertiary;
    text-transform: uppercase;
  }
}

.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 24rpx;
  background: $card-bg;
  margin-bottom: 2rpx;
  border-radius: $card-radius;

  &:first-of-type {
    border-radius: $card-radius $card-radius 2rpx 2rpx;
  }

  &:last-of-type {
    border-radius: 2rpx 2rpx $card-radius $card-radius;
    margin-bottom: 0;
  }

  &:only-of-type {
    border-radius: $card-radius;
  }
}

.action-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.action-icon {
  font-size: 40rpx;
  width: 64rpx;
  height: 64rpx;
  line-height: 64rpx;
  text-align: center;
  background: $bg;
  border-radius: 16rpx;
}

.action-info {
  display: flex;
  flex-direction: column;
}

.action-name {
  font-size: $body-size;
  color: $text-primary;
  font-weight: 500;
}

.action-desc {
  font-size: $tiny-size;
  color: $text-tertiary;
  margin-top: 4rpx;
}

.action-arrow {
  font-size: 36rpx;
  color: $text-tertiary;
}
</style>
