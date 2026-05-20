<template>
  <view class="dialog-overlay" v-if="visible" @click="onCancel">
    <view class="dialog-box" @click.stop>
      <text class="dialog-title">{{ title }}</text>
      <text class="dialog-content">{{ content }}</text>
      <view class="dialog-actions">
        <view class="dialog-btn cancel" @click="onCancel">
          <text class="btn-text">{{ cancelText }}</text>
        </view>
        <view class="dialog-btn confirm" @click="onConfirm">
          <text class="btn-text">{{ confirmText }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
defineProps<{
  visible: boolean
  title: string
  content: string
  cancelText?: string
  confirmText?: string
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

function onConfirm() {
  emit('confirm')
}

function onCancel() {
  emit('cancel')
}
</script>

<style lang="scss" scoped>
.dialog-overlay {
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

.dialog-box {
  width: 600rpx;
  background: $card-bg;
  border-radius: $large-radius;
  padding: 40rpx;
}

.dialog-title {
  font-size: $title-size;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: 16rpx;
}

.dialog-content {
  font-size: $body-size;
  color: $text-secondary;
  display: block;
  margin-bottom: 32rpx;
  line-height: 1.6;
}

.dialog-actions {
  display: flex;
  gap: 16rpx;
}

.dialog-btn {
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
