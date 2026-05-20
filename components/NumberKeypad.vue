<template>
  <view class="keypad">
    <view class="keypad-row" v-for="(row, ri) in keys" :key="ri">
      <view
        v-for="(key, ki) in row"
        :key="ki"
        class="keypad-key"
        :class="keyClass(key)"
        @click="onKey(key)"
      >
        <text class="key-text">{{ key }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'confirm'): void
}>()

const keys: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', '⌫']
]

function keyClass(key: string): string {
  if (key === '⌫') return 'key-delete'
  if (key === '✓') return 'key-confirm'
  return ''
}

function onKey(key: string): void {
  let val = props.modelValue
  if (key === '⌫') {
    emit('update:modelValue', val.slice(0, -1))
    return
  }
  // 限制小数点后 2 位
  if (key === '.') {
    if (val.includes('.')) return
    if (!val) val = '0'
  } else {
    const dotIdx = val.indexOf('.')
    if (dotIdx !== -1 && val.length - dotIdx > 2) return
    if (val === '0') val = ''
  }
  // 限制总长度
  if (val.length >= 10) return
  emit('update:modelValue', val + key)
}
</script>

<style lang="scss" scoped>
.keypad {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: $card-bg;
  padding: 12rpx 8rpx 40rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.keypad-row {
  display: flex;
}

.keypad-key {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100rpx;
  margin: 6rpx;
  border-radius: 16rpx;
  background: $bg;

  .key-text {
    font-size: 36rpx;
    font-weight: 600;
    color: $text-primary;
  }

  &.key-delete {
    .key-text {
      font-size: 30rpx;
    }
  }

  &.key-confirm {
    background: $primary;
    .key-text {
      color: #fff;
    }
  }

  &:active {
    opacity: 0.7;
  }
}
</style>
