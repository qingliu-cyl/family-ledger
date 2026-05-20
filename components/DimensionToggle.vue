<template>
  <view class="dimension-toggle">
    <view
      class="toggle-item"
      :class="{ active: modelValue === 'personal' }"
      @click="$emit('update:modelValue', 'personal')"
    >
      <text class="toggle-text">个人</text>
    </view>
    <view
      class="toggle-item"
      :class="{ active: modelValue === 'family' }"
      @click="$emit('update:modelValue', 'family')"
    >
      <text class="toggle-text">家庭</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
defineProps<{
  modelValue: 'personal' | 'family'
}>()

defineEmits<{
  (e: 'update:modelValue', value: 'personal' | 'family'): void
}>()
</script>

<style lang="scss" scoped>
.dimension-toggle {
  display: flex;
  margin: 24rpx;
  background: $card-bg;
  border-radius: 12rpx;
  padding: 6rpx;
}

.toggle-item {
  flex: 1;
  text-align: center;
  padding: 14rpx 0;
  border-radius: 10rpx;
  transition: all 0.2s;

  .toggle-text {
    font-size: $caption-size;
    color: $text-tertiary;
    font-weight: 500;
  }

  &.active {
    background: $primary;

    .toggle-text {
      color: #fff;
      font-weight: 600;
    }
  }
}
</style>
