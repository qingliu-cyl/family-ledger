<template>
  <view class="page">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <text class="nav-close" @click="goBack">✕</text>
      <text class="nav-title">记一笔</text>
      <text class="nav-save" @click="save">保存</text>
    </view>

    <!-- 金额 -->
    <view class="amount-card">
      <text class="amount-label">支出金额</text>
      <view class="amount-row">
        <text class="amount-symbol">¥</text>
        <text class="amount-value">{{ displayAmount || '0.00' }}</text>
      </view>
    </view>

    <!-- 分类选择 -->
    <CategoryGrid v-model="form.categoryId" />

    <!-- 日期 & 支付方式 -->
    <view class="meta-card">
      <picker mode="date" :value="form.date" @change="onDateChange">
        <view class="meta-row">
          <text class="meta-label">📅 日期</text>
          <text class="meta-value">{{ form.date }} ›</text>
        </view>
      </picker>
      <view class="meta-divider" />
      <picker :range="paymentMethods" :range-key="'label'" @change="onPaymentChange">
        <view class="meta-row">
          <text class="meta-label">💳 支付方式</text>
          <text class="meta-value">{{ selectedPaymentLabel }} ›</text>
        </view>
      </picker>
      <view class="meta-divider" />
      <input
        class="note-input"
        v-model="form.note"
        placeholder="📝 添加备注..."
        placeholder-class="note-placeholder"
        @focus="noteFocused = true"
        @blur="noteFocused = false"
      />
    </view>

    <!-- 数字键盘 -->
    <NumberKeypad v-if="!noteFocused" v-model="displayAmount" />
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue'
import type { PaymentMethod, CreateRecordInput } from '@/types/record'
import { useRecordStore } from '@/store/record'
import CategoryGrid from '@/components/CategoryGrid.vue'
import NumberKeypad from '@/components/NumberKeypad.vue'

interface PaymentOption {
  value: PaymentMethod
  label: string
}

const recordStore = useRecordStore()

const form = reactive({
  categoryId: '',
  date: new Date().toISOString().slice(0, 10),
  paymentMethod: 'wechat' as PaymentMethod,
  note: ''
})

const displayAmount = ref('')
const noteFocused = ref(false)

const paymentMethods: PaymentOption[] = [
  { value: 'wechat', label: '微信支付' },
  { value: 'alipay', label: '支付宝' },
  { value: 'cash', label: '现金' },
  { value: 'card', label: '银行卡' }
]

const selectedPaymentLabel = computed<string>(() =>
  paymentMethods.find(p => p.value === form.paymentMethod)?.label || '微信支付'
)

function onDateChange(e: any): void {
  form.date = e.detail.value
}

function onPaymentChange(e: any): void {
  form.paymentMethod = paymentMethods[e.detail.value].value
}

function save(): void {
  const amount = parseFloat(displayAmount.value)
  if (!amount || amount <= 0) {
    return uni.showToast({ title: '请输入金额', icon: 'none' })
  }
  if (!form.categoryId) {
    return uni.showToast({ title: '请选择分类', icon: 'none' })
  }

  const input: CreateRecordInput = {
    amount,
    categoryId: form.categoryId,
    note: form.note,
    date: form.date,
    type: 'expense',
    source: 'local',
    payerId: 'local',
    paymentMethod: form.paymentMethod
  }
  recordStore.add(input)

  uni.showToast({ title: '已保存', icon: 'success' })
  setTimeout(() => uni.switchTab({ url: '/pages/home/index' }), 800)
}

function goBack(): void {
  uni.switchTab({ url: '/pages/home/index' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg;
  padding-bottom: 460rpx;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 100rpx 32rpx 24rpx;
  background: $card-bg;

  .nav-close {
    font-size: 36rpx;
    color: $text-secondary;
    width: 80rpx;
  }

  .nav-title {
    font-size: $title-size;
    font-weight: 600;
    color: $text-primary;
  }

  .nav-save {
    font-size: $body-size;
    color: $primary;
    font-weight: 600;
    width: 80rpx;
    text-align: right;
  }
}

.amount-card {
  margin: 24rpx;
  padding: 32rpx;
  background: $card-bg;
  border-radius: $large-radius;

  .amount-label {
    font-size: $caption-size;
    color: $text-tertiary;
  }

  .amount-row {
    display: flex;
    align-items: baseline;
    margin-top: 16rpx;
  }

  .amount-symbol {
    font-size: 40rpx;
    font-weight: 700;
    color: $text-primary;
  }

  .amount-value {
    font-size: 72rpx;
    font-weight: 700;
    color: $text-primary;
    margin-left: 8rpx;
  }
}

.meta-card {
  margin: 24rpx;
  padding: 0 24rpx;
  background: $card-bg;
  border-radius: $card-radius;

  .meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 0;
  }

  .meta-label {
    font-size: $body-size;
    color: $text-secondary;
  }

  .meta-value {
    font-size: $body-size;
    color: $text-primary;
  }

  .meta-divider {
    height: 1rpx;
    background: #F3F4F6;
  }
}

.note-input {
  width: 100%;
  padding: 28rpx 16rpx;
  font-size: $body-size;
  min-height: 96rpx;
  box-sizing: border-box;
}

.note-placeholder {
  color: $text-tertiary;
}
</style>
