<template>
  <view class="page">
    <view class="nav-bar">
      <text class="nav-title">我的</text>
    </view>

    <!-- 用户卡片 -->
    <view class="user-card">
      <text class="user-avatar">👤</text>
      <view class="user-info">
        <text class="user-name">本机用户</text>
        <text class="user-hint">所有本地记录归属您本人</text>
      </view>
    </view>

    <!-- 家庭成员管理 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">家庭成员</text>
        <text class="section-add" @click="showAddMember = true">+ 添加</text>
      </view>
      <view class="member-list" v-if="members.length">
        <view class="member-item" v-for="m in members" :key="m.id">
          <text class="member-avatar">{{ m.avatar }}</text>
          <text class="member-name">{{ m.name }}</text>
          <text class="member-delete" @click="deleteMember(m.id)">✕</text>
        </view>
      </view>
      <view class="empty-hint" v-else>
        <text class="hint-text">暂无成员，导入他人账本时可自动添加</text>
      </view>
    </view>

    <!-- 自动记账设置 -->
    <view class="section">
      <text class="section-title">自动记账</text>
      <view class="setting-card">
        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-name">支付通知监听</text>
            <text class="setting-desc">自动识别微信/支付宝支付通知</text>
          </view>
          <switch
            :checked="settings.autoRecordEnabled"
            @change="toggleAutoRecord"
            color="#6366F1"
          />
        </view>
        <view class="setting-item" @click="openNotificationSettings">
          <view class="setting-info">
            <text class="setting-name">通知权限</text>
            <text class="setting-desc">需要开启通知监听权限</text>
          </view>
          <text class="setting-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 数据管理 -->
    <view class="section">
      <text class="section-title">数据管理</text>
      <view class="setting-card">
        <view class="setting-item" @click="exportBackup">
          <view class="setting-info">
            <text class="setting-name">导出完整备份</text>
            <text class="setting-desc">换设备可完全恢复</text>
          </view>
          <text class="setting-arrow">›</text>
        </view>
        <view class="setting-item" @click="clearAllData">
          <view class="setting-info">
            <text class="setting-name">清空所有数据</text>
            <text class="setting-desc">删除所有记录，不可恢复</text>
          </view>
          <text class="setting-arrow red">›</text>
        </view>
      </view>
    </view>

    <!-- 添加成员弹窗 -->
    <view class="modal-overlay" v-if="showAddMember" @click="showAddMember = false">
      <view class="modal-box" @click.stop>
        <text class="modal-title">添加家庭成员</text>
        <input
          class="modal-input"
          v-model="newMemberName"
          placeholder="输入成员名称"
          focus
        />
        <text class="emoji-label">选择头像</text>
        <view class="emoji-list">
          <text
            v-for="emoji in avatarOptions"
            :key="emoji"
            class="emoji-item"
            :class="{ active: newMemberAvatar === emoji }"
            @click="newMemberAvatar = emoji"
          >{{ emoji }}</text>
        </view>
        <view class="modal-actions">
          <view class="modal-btn cancel" @click="showAddMember = false">
            <text class="btn-text">取消</text>
          </view>
          <view class="modal-btn confirm" @click="addMember">
            <text class="btn-text">添加</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { Member } from '@/types/member'
import { useMemberStore } from '@/store/member'
import { useLedgerStore } from '@/store/ledger'
import { genId } from '@/utils/uuid'
import { exportFullBackupToFile } from '@/utils/export'
import { openNotificationSettings } from '@/utils/payment-listener'

const memberStore = useMemberStore()
const ledgerStore = useLedgerStore()

const showAddMember = ref(false)
const newMemberName = ref('')
const newMemberAvatar = ref('👨')
const avatarOptions = ['👨', '👩', '👴', '👵', '👦', '👧', '👶', '🧑', '🧓']

onShow(() => {
  memberStore.refresh()
  ledgerStore.refresh()
})

const members = computed<Member[]>(() => memberStore.members)
const settings = computed(() => ledgerStore.settings)

function addMember() {
  const name = newMemberName.value.trim()
  if (!name) {
    uni.showToast({ title: '请输入名称', icon: 'none' })
    return
  }
  const member: Member = {
    id: 'member_' + genId().slice(0, 8),
    name,
    avatar: newMemberAvatar.value,
    createdAt: Date.now()
  }
  memberStore.add(member)
  newMemberName.value = ''
  newMemberAvatar.value = '👨'
  showAddMember.value = false
  uni.showToast({ title: '已添加', icon: 'success' })
}

function deleteMember(id: string) {
  uni.showModal({
    title: '确认删除',
    content: '删除后该成员的导入记录将保留，但不再显示成员信息',
    success(btn) {
      if (btn.confirm) {
        memberStore.remove(id)
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

function toggleAutoRecord(e: any) {
  ledgerStore.updateSettings({ autoRecordEnabled: e.detail.value })
}

async function exportBackup() {
  await exportFullBackupToFile()
}

function clearAllData() {
  uni.showModal({
    title: '清空数据',
    content: '将删除所有记账记录，此操作不可恢复。建议先导出备份。',
    confirmColor: '#EF4444',
    success(btn) {
      if (btn.confirm) {
        uni.setStorageSync('hl_records', [])
        uni.showToast({ title: '已清空', icon: 'success' })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg;
  padding-bottom: 120rpx;
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

.user-card {
  display: flex;
  align-items: center;
  margin: 24rpx;
  padding: 32rpx;
  background: $card-bg;
  border-radius: $large-radius;
  gap: 24rpx;

  .user-avatar {
    font-size: 64rpx;
    width: 96rpx;
    height: 96rpx;
    line-height: 96rpx;
    text-align: center;
    background: $bg;
    border-radius: 50%;
  }

  .user-name {
    font-size: $title-size;
    font-weight: 600;
    color: $text-primary;
    display: block;
  }

  .user-hint {
    font-size: $caption-size;
    color: $text-tertiary;
    margin-top: 4rpx;
  }
}

.section {
  margin: 32rpx 24rpx 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: $caption-size;
  color: $text-tertiary;
}

.section-add {
  font-size: $caption-size;
  color: $primary;
  font-weight: 600;
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

  .member-avatar {
    font-size: 36rpx;
  }

  .member-name {
    flex: 1;
    font-size: $body-size;
    color: $text-primary;
  }

  .member-delete {
    font-size: 28rpx;
    color: $text-tertiary;
    padding: 8rpx;
  }
}

.empty-hint {
  background: $card-bg;
  border-radius: $large-radius;
  padding: 32rpx;
  text-align: center;

  .hint-text {
    font-size: $caption-size;
    color: $text-tertiary;
  }
}

.setting-card {
  background: $card-bg;
  border-radius: $large-radius;
  overflow: hidden;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;

  & + .setting-item {
    border-top: 1rpx solid #F3F4F6;
  }
}

.setting-info {
  display: flex;
  flex-direction: column;
}

.setting-name {
  font-size: $body-size;
  color: $text-primary;
  font-weight: 500;
}

.setting-desc {
  font-size: $tiny-size;
  color: $text-tertiary;
  margin-top: 4rpx;
}

.setting-arrow {
  font-size: 36rpx;
  color: $text-tertiary;

  &.red {
    color: $expense-red;
  }
}

// 弹窗
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-box {
  width: 600rpx;
  background: $card-bg;
  border-radius: $large-radius;
  padding: 40rpx;
}

.modal-title {
  font-size: $title-size;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: 24rpx;
}

.modal-input {
  background: $bg;
  border-radius: $card-radius;
  padding: 20rpx 24rpx;
  font-size: $body-size;
  margin-bottom: 24rpx;
}

.emoji-label {
  font-size: $caption-size;
  color: $text-tertiary;
  display: block;
  margin-bottom: 16rpx;
}

.emoji-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.emoji-item {
  font-size: 48rpx;
  width: 72rpx;
  height: 72rpx;
  line-height: 72rpx;
  text-align: center;
  border-radius: 16rpx;

  &.active {
    background: rgba($primary, 0.1);
  }
}

.modal-actions {
  display: flex;
  gap: 16rpx;
}

.modal-btn {
  flex: 1;
  padding: 20rpx 0;
  border-radius: $button-radius;
  text-align: center;

  .btn-text {
    font-size: $body-size;
    font-weight: 600;
  }

  &.cancel {
    background: $bg;

    .btn-text {
      color: $text-secondary;
    }
  }

  &.confirm {
    background: $primary;

    .btn-text {
      color: #fff;
    }
  }
}
</style>
