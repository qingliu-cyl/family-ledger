<template>
  <view class="page">
    <view class="nav-bar">
      <text class="nav-back" @click="goBack">‹</text>
      <text class="nav-title">导入账本</text>
    </view>

    <!-- 步骤指示 -->
    <view class="steps">
      <view class="step active">
        <view class="step-dot">1</view>
        <text class="step-text">选择归属人</text>
      </view>
      <view class="step-line" />
      <view class="step">
        <view class="step-dot">2</view>
        <text class="step-text">合并策略</text>
      </view>
    </view>

    <!-- 导入信息 -->
    <view class="import-info" v-if="shareFile">
      <text class="info-title">账本信息</text>
      <view class="info-card">
        <view class="info-row">
          <text class="info-label">账本名称</text>
          <text class="info-value">{{ shareFile.ledger.name }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">记录数</text>
          <text class="info-value">{{ shareFile.records.length }} 条</text>
        </view>
        <view class="info-row">
          <text class="info-label">导出时间</text>
          <text class="info-value">{{ formatDate(shareFile.exportedAt) }}</text>
        </view>
      </view>
    </view>

    <!-- 选择归属成员 -->
    <view class="member-section" v-if="shareFile">
      <text class="section-title">选择这些记录的归属人</text>

      <!-- 已有成员 -->
      <view class="member-list">
        <view
          v-for="m in shareFile.ledger.members"
          :key="m.id"
          class="member-item"
          :class="{ active: selectedMemberId === m.id }"
          @click="selectedMemberId = m.id"
        >
          <text class="member-avatar">{{ m.avatar }}</text>
          <text class="member-name">{{ m.name }}</text>
          <view class="member-check" v-if="selectedMemberId === m.id">✓</view>
        </view>
      </view>

      <!-- 手动输入新成员 -->
      <view class="new-member">
        <text class="section-title">或者创建新成员</text>
        <view class="input-row">
          <input
            class="member-input"
            v-model="newMemberName"
            placeholder="输入成员名称"
          />
          <view class="input-btn" @click="createNewMember" v-if="newMemberName.trim()">
            <text class="btn-text-sm">创建</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 无数据时提示 -->
    <view class="empty" v-if="!shareFile">
      <text class="empty-icon">📥</text>
      <text class="empty-text">未找到导入数据</text>
      <text class="empty-hint">请重新导入账本文件</text>
    </view>

    <!-- 下一步按钮 -->
    <view class="bottom-bar" v-if="shareFile">
      <view class="btn-primary" :class="{ disabled: !selectedMemberId }" @click="goToMerge">
        <text class="btn-text">下一步：选择合并策略</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { LedgerShareFile } from '@/types/ledger'
import { genId } from '@/utils/uuid'

const shareFile = ref<LedgerShareFile | null>(null)
const selectedMemberId = ref<string>('')
const newMemberName = ref('')

// 从页面事件通道接收导入数据
const eventChannel = (uni as any).getOpenerEventChannel?.()
if (eventChannel) {
  eventChannel.on('importData', (data: LedgerShareFile) => {
    shareFile.value = data
    // 默认选中第一个成员
    if (data.ledger.members.length) {
      selectedMemberId.value = data.ledger.members[0].id
    }
  })
}

function formatDate(iso: string): string {
  return iso.slice(0, 10).replace('T', ' ')
}

function createNewMember() {
  const name = newMemberName.value.trim()
  if (!name) return

  const id = 'member_' + genId().slice(0, 8)
  // 添加到选择列表
  if (shareFile.value) {
    shareFile.value.ledger.members.push({ id, name, avatar: '👤' })
    selectedMemberId.value = id
    newMemberName.value = ''
  }
}

function goToMerge() {
  if (!selectedMemberId.value || !shareFile.value) return

  uni.navigateTo({
    url: '/pages/ledger/merge',
    success(res) {
      res.eventChannel.emit('mergeData', {
        file: shareFile.value,
        memberId: selectedMemberId.value
      })
    }
  })
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

.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  gap: 16rpx;
}

.step {
  display: flex;
  align-items: center;
  gap: 12rpx;

  .step-dot {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background: #E5E7EB;
    color: $text-tertiary;
    font-size: $tiny-size;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
  }

  .step-text {
    font-size: $caption-size;
    color: $text-tertiary;
  }

  &.active .step-dot {
    background: $primary;
    color: #fff;
  }

  &.active .step-text {
    color: $text-primary;
    font-weight: 600;
  }
}

.step-line {
  width: 60rpx;
  height: 2rpx;
  background: #E5E7EB;
}

.import-info {
  margin: 0 24rpx 24rpx;
}

.info-title,
.section-title {
  font-size: $caption-size;
  color: $text-tertiary;
  margin-bottom: 16rpx;
  display: block;
}

.info-card {
  background: $card-bg;
  border-radius: $large-radius;
  padding: 24rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
}

.info-label {
  font-size: $body-size;
  color: $text-secondary;
}

.info-value {
  font-size: $body-size;
  color: $text-primary;
}

.member-section {
  margin: 24rpx;
}

.member-list {
  background: $card-bg;
  border-radius: $large-radius;
  overflow: hidden;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  gap: 20rpx;

  & + .member-item {
    border-top: 1rpx solid #F3F4F6;
  }

  &.active {
    background: rgba($primary, 0.05);
  }
}

.member-avatar {
  font-size: 40rpx;
}

.member-name {
  flex: 1;
  font-size: $body-size;
  color: $text-primary;
}

.member-check {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: $primary;
  color: #fff;
  font-size: $caption-size;
  display: flex;
  align-items: center;
  justify-content: center;
}

.new-member {
  margin-top: 24rpx;
}

.input-row {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.member-input {
  flex: 1;
  background: $card-bg;
  border-radius: $card-radius;
  padding: 20rpx 24rpx;
  font-size: $body-size;
}

.input-btn {
  background: $primary;
  border-radius: $button-radius;
  padding: 20rpx 28rpx;

  .btn-text-sm {
    color: #fff;
    font-size: $caption-size;
    font-weight: 600;
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

  &.disabled {
    opacity: 0.5;
  }

  &:active:not(.disabled) {
    opacity: 0.85;
  }
}
</style>
