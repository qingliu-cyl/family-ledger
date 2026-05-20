<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <view class="nav-bar">
      <text class="nav-title">{{ currentMonth }}</text>
    </view>

    <!-- 概览卡片 -->
    <view class="overview-card">
      <view class="overview-header">
        <text class="overview-label">{{ dimensionLabel }}</text>
      </view>
      <text class="overview-amount">¥ {{ totalExpense.toFixed(2) }}</text>
      <view class="overview-split" v-if="currentDimension === 'family'">
        <view class="split-item">
          <text class="split-label">本机</text>
          <text class="split-value">¥ {{ localExpense.toFixed(2) }}</text>
        </view>
        <view class="split-item">
          <text class="split-label">导入</text>
          <text class="split-value">¥ {{ importedExpense.toFixed(2) }}</text>
        </view>
      </view>
    </view>

    <!-- 维度切换 -->
    <DimensionToggle v-model="currentDimension" />

    <!-- 成员筛选（家庭模式下显示） -->
    <scroll-view v-if="currentDimension === 'family'" scroll-x class="member-filter">
      <text
        class="member-chip"
        :class="{ active: memberFilter === 'all' }"
        @click="memberFilter = 'all'"
      >全部</text>
      <text
        v-for="m in allMembers"
        :key="m.id"
        class="member-chip"
        :class="{ active: memberFilter === m.id }"
        @click="memberFilter = m.id"
      >{{ m.avatar }} {{ m.name }}</text>
    </scroll-view>

    <!-- 自动记账提示条 -->
    <view class="auto-bar" v-if="autoCount > 0" @click="goToPending">
      <text class="auto-icon">🔔</text>
      <text class="auto-text">{{ autoCount }} 笔交易待确认</text>
      <text class="auto-arrow">›</text>
    </view>

    <!-- 空状态 -->
    <view class="empty" v-if="groupedRecords.length === 0">
      <text class="empty-icon">📒</text>
      <text class="empty-text">暂无记账记录</text>
      <text class="empty-hint">点击下方 + 号开始记账</text>
    </view>

    <!-- 账单列表 -->
    <view class="bill-section" v-for="group in groupedRecords" :key="group.date">
      <view class="bill-date-header">
        <text class="bill-date">{{ group.dateLabel }}</text>
        <text class="bill-date-total">-¥{{ group.total.toFixed(2) }}</text>
      </view>
      <ExpenseCard
        v-for="record in group.records"
        :key="record.id"
        :record="record"
        :show-source-badge="currentDimension === 'family'"
        @click="goToDetail"
      />
    </view>

    <!-- 记账 FAB -->
    <view class="fab" @click="goToAdd">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { Record as ExpenseRecord } from '@/types/record'
import type { Member } from '@/types/member'
import { useRecordStore } from '@/store/record'
import { useMemberStore } from '@/store/member'
import { pendingPayments, startListening, checkNotificationPermission } from '@/utils/payment-listener'
import DimensionToggle from '@/components/DimensionToggle.vue'
import ExpenseCard from '@/components/ExpenseCard.vue'

interface DateGroup {
  date: string
  dateLabel: string
  records: ExpenseRecord[]
  total: number
}

const recordStore = useRecordStore()
const memberStore = useMemberStore()

const currentDimension = ref<'personal' | 'family'>('personal')
const memberFilter = ref<string>('all')

onShow(async () => {
  recordStore.refresh()
  memberStore.refresh()

  // #ifdef APP-PLUS
  const hasPermission: boolean = await checkNotificationPermission()
  if (hasPermission) startListening()
  // #endif
})

const allMembers = computed<Member[]>(() => memberStore.allWithSelf)

const currentMonth = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}年${d.getMonth() + 1}月`
})

const dimensionLabel = computed(() =>
  currentDimension.value === 'personal' ? '本月个人支出' : '本月家庭支出'
)

const filteredRecords = computed<ExpenseRecord[]>(() => {
  let list = recordStore.records
  // 维度筛选
  if (currentDimension.value === 'personal') {
    list = list.filter(r => r.source === 'local')
  }
  // 成员筛选（仅家庭模式）
  if (currentDimension.value === 'family' && memberFilter.value !== 'all') {
    if (memberFilter.value === 'local') {
      list = list.filter(r => r.source === 'local')
    } else {
      list = list.filter(r => r.source === `imported_${memberFilter.value}`)
    }
  }
  return list
})

const totalExpense = computed<number>(() =>
  filteredRecords.value.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
)

const localExpense = computed<number>(() =>
  recordStore.records.filter(r => r.source === 'local' && r.type === 'expense').reduce((s, r) => s + r.amount, 0)
)

const importedExpense = computed<number>(() =>
  recordStore.records.filter(r => r.source !== 'local' && r.type === 'expense').reduce((s, r) => s + r.amount, 0)
)

const autoCount = computed<number>(() => pendingPayments.value.length)

const groupedRecords = computed<DateGroup[]>(() => {
  const groups: Record<string, ExpenseRecord[]> = {}
  filteredRecords.value.forEach(r => {
    if (!groups[r.date]) groups[r.date] = []
    groups[r.date].push(r)
  })
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, recs]) => ({
      date,
      dateLabel: formatDateLabel(date),
      records: recs,
      total: recs.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
    }))
})

function formatDateLabel(dateStr: string): string {
  const today = new Date().toISOString().slice(0, 10)
  if (dateStr === today) return `今天 · ${dateStr.slice(5)}`
  return dateStr.slice(5)
}

function goToAdd(): void {
  uni.switchTab({ url: '/pages/add/index' })
}

function goToPending(): void {
  uni.navigateTo({ url: '/pages/pending/index' })
}

function goToDetail(_record: ExpenseRecord): void {
  // 暂时不实现详情页
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg;
  padding-bottom: 140rpx;
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

.overview-card {
  margin: 24rpx;
  padding: 32rpx;
  background: $card-bg;
  border-radius: $large-radius;

  .overview-header {
    margin-bottom: 12rpx;
  }

  .overview-label {
    font-size: $caption-size;
    color: $text-tertiary;
  }

  .overview-amount {
    font-size: 56rpx;
    font-weight: 700;
    color: $text-primary;
  }

  .overview-split {
    display: flex;
    gap: 32rpx;
    margin-top: 20rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid #F3F4F6;
  }

  .split-item {
    display: flex;
    flex-direction: column;
  }

  .split-label {
    font-size: $tiny-size;
    color: $text-tertiary;
  }

  .split-value {
    font-size: $subtitle-size;
    font-weight: 600;
    color: $text-primary;
    margin-top: 4rpx;
  }
}

.member-filter {
  white-space: nowrap;
  padding: 0 24rpx;
  margin-bottom: 8rpx;
}

.member-chip {
  display: inline-block;
  padding: 10rpx 24rpx;
  margin-right: 16rpx;
  border-radius: 24rpx;
  font-size: $caption-size;
  color: $text-secondary;
  background: $card-bg;

  &.active {
    background: $primary;
    color: #fff;
    font-weight: 600;
  }
}

.auto-bar {
  display: flex;
  align-items: center;
  margin: 8rpx 24rpx 0;
  padding: 20rpx 24rpx;
  background: #FEF3C7;
  border-radius: $card-radius;

  .auto-icon {
    font-size: 32rpx;
    margin-right: 12rpx;
  }

  .auto-text {
    flex: 1;
    font-size: $caption-size;
    color: #92400E;
  }

  .auto-arrow {
    font-size: 32rpx;
    color: #92400E;
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

.bill-section {
  margin: 0 24rpx;
}

.bill-date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0 8rpx;

  .bill-date {
    font-size: $caption-size;
    color: $text-secondary;
  }

  .bill-date-total {
    font-size: $caption-size;
    color: $text-tertiary;
  }
}

.fab {
  position: fixed;
  bottom: 120rpx;
  right: 40rpx;
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  background: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba($primary, 0.4);

  .fab-icon {
    font-size: 48rpx;
    color: #fff;
    font-weight: 300;
    line-height: 1;
  }

  &:active {
    opacity: 0.85;
  }
}
</style>
