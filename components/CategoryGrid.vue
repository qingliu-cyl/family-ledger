<template>
  <view class="category-grid">
    <view
      v-for="cat in categories"
      :key="cat.id"
      class="category-item"
      :class="{ active: modelValue === cat.id }"
      @click="$emit('update:modelValue', cat.id)"
    >
      <text class="cat-icon">{{ cat.icon }}</text>
      <text class="cat-name">{{ cat.name }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useCategoryStore } from '@/store/category'

const props = defineProps<{
  modelValue: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const store = useCategoryStore()
const categories = store.categories
</script>

<style lang="scss" scoped>
.category-grid {
  display: flex;
  flex-wrap: wrap;
  margin: 24rpx;
  padding: 16rpx 0;
  background: $card-bg;
  border-radius: $large-radius;
}

.category-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;

  .cat-icon {
    font-size: 52rpx;
  }

  .cat-name {
    font-size: $tiny-size;
    color: $text-secondary;
    margin-top: 8rpx;
  }

  &.active .cat-icon {
    transform: scale(1.15);
  }

  &.active .cat-name {
    color: $primary;
    font-weight: 600;
  }
}
</style>
