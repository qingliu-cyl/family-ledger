<template>
  <view class="page">
    <view class="nav-bar">
      <text class="nav-title">统计报表</text>
    </view>

    <!-- 数据维度：个人 / 家庭 -->
    <DimensionToggle v-model="dataDimension" />

    <!-- 成员筛选（家庭模式下显示） -->
    <scroll-view v-if="dataDimension === 'family'" scroll-x class="member-filter">
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

    <!-- 时间维度：日 / 周 / 月 / 年 -->
    <view class="time-tabs">
      <text
        v-for="tab in timeTabs"
        :key="tab.value"
        class="time-tab"
        :class="{ active: timeMode === tab.value }"
        @click="switchTimeMode(tab.value)"
      >{{ tab.label }}</text>
    </view>

    <!-- 时间选择器 -->
    <view class="time-picker">
      <text class="picker-arrow" @click="shiftTime(-1)">‹</text>
      <text class="picker-label">{{ timeLabel }}</text>
      <text class="picker-arrow" @click="shiftTime(1)">›</text>
    </view>

    <!-- 汇总卡片 -->
    <view class="summary-row">
      <view class="summary-card">
        <text class="summary-label">总支出</text>
        <text class="summary-value red">¥{{ total.toFixed(0) }}</text>
      </view>
      <view class="summary-card">
        <text class="summary-label">笔数</text>
        <text class="summary-value">{{ count }} 笔</text>
      </view>
      <view class="summary-card">
        <text class="summary-label">日均</text>
        <text class="summary-value">¥{{ dailyAvg.toFixed(0) }}</text>
      </view>
    </view>

    <!-- 分类占比图（简化为条形） -->
    <view class="chart-card" v-if="categoryRank.length">
      <text class="card-title">分类占比</text>
      <CategoryRank :items="categoryRank" />
    </view>

    <!-- 趋势图 -->
    <view class="chart-card" v-if="trendData.length">
      <text class="card-title">支出趋势</text>
      <TrendChart :data="trendData" :labels="trendLabels" />
    </view>

    <!-- 成员贡献排行（家庭模式下显示） -->
    <view class="rank-card" v-if="dataDimension === 'family' && memberRank.length">
      <text class="card-title">成员贡献</text>
      <view class="rank-item" v-for="item in memberRank" :key="item.id">
        <text class="rank-icon">{{ item.avatar }}</text>
        <text class="rank-name">{{ item.name }}</text>
        <view class="rank-bar-bg">
          <view
            class="rank-bar"
            :style="{ width: (item.amount / memberMaxAmount * 100) + '%', background: item.color }"
          />
        </view>
        <text class="rank-amount">¥{{ item.amount.toFixed(0) }}</text>
        <text class="rank-percent">{{ (item.amount / total * 100).toFixed(1) }}%</text>
      </view>
    </view>

    <!-- 底部占位 -->
    <view style="height: 120rpx" />
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { Record as ExpenseRecord } from '@/types/record'
import type { Member } from '@/types/member'
import { useRecordStore } from '@/store/record'
import { useCategoryStore } from '@/store/category'
import { useMemberStore } from '@/store/member'
import DimensionToggle from '@/components/DimensionToggle.vue'
import CategoryRank from '@/components/CategoryRank.vue'
import TrendChart from '@/components/TrendChart.vue'

type TimeMode = 'day' | 'week' | 'month' | 'year'

interface TimeTab {
  value: TimeMode
  label: string
}

interface TimeRange {
  start: Date
  end: Date
  label: string
}

interface CategoryStat {
  id: string
  name: string
  icon: string
  amount: number
}

interface MemberStat {
  id: string
  name: string
  avatar: string
  amount: number
  color: string
}

const recordStore = useRecordStore()
const categoryStore = useCategoryStore()
const memberStore = useMemberStore()

const dataDimension = ref<'personal' | 'family'>('personal')
const memberFilter = ref<string>('all')
const timeMode = ref<TimeMode>('month')
const timeCursor = ref<Date>(new Date())

onShow(() => {
  recordStore.refresh()
  memberStore.refresh()
})

const allMembers = computed<Member[]>(() => memberStore.allWithSelf)

const timeTabs: TimeTab[] = [
  { value: 'day', label: '按日' },
  { value: 'week', label: '按周' },
  { value: 'month', label: '按月' },
  { value: 'year', label: '按年' }
]

// ---------- 时间范围 ----------

const timeRange = computed<TimeRange>(() => {
  const d = timeCursor.value
  const y = d.getFullYear()
  const m = d.getMonth()
  const day = d.getDate()

  switch (timeMode.value) {
    case 'day':
      return {
        start: new Date(y, m, day),
        end: new Date(y, m, day, 23, 59, 59),
        label: `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      }
    case 'week': {
      const dow = d.getDay() || 7
      const monday = new Date(y, m, day - dow + 1)
      const sunday = new Date(y, m, day - dow + 7, 23, 59, 59)
      return {
        start: monday,
        end: sunday,
        label: `${monday.getMonth() + 1}/${monday.getDate()} - ${sunday.getMonth() + 1}/${sunday.getDate()}`
      }
    }
    case 'month':
      return {
        start: new Date(y, m, 1),
        end: new Date(y, m + 1, 0, 23, 59, 59),
        label: `${y}年${m + 1}月`
      }
    case 'year':
      return {
        start: new Date(y, 0, 1),
        end: new Date(y, 11, 31, 23, 59, 59),
        label: `${y}年`
      }
  }
})

const timeLabel = computed(() => timeRange.value.label)

function switchTimeMode(mode: TimeMode): void {
  timeMode.value = mode
  timeCursor.value = new Date()
}

function shiftTime(dir: number): void {
  const d = new Date(timeCursor.value)
  switch (timeMode.value) {
    case 'day': d.setDate(d.getDate() + dir); break
    case 'week': d.setDate(d.getDate() + dir * 7); break
    case 'month': d.setMonth(d.getMonth() + dir); break
    case 'year': d.setFullYear(d.getFullYear() + dir); break
  }
  timeCursor.value = d
}

// ---------- 数据筛选 ----------

const filteredRecords = computed<ExpenseRecord[]>(() => {
  const { start, end } = timeRange.value
  let list = recordStore.records.filter(r => r.type === 'expense')

  if (dataDimension.value === 'personal') {
    list = list.filter(r => r.source === 'local')
  }

  if (dataDimension.value === 'family' && memberFilter.value !== 'all') {
    if (memberFilter.value === 'local') {
      list = list.filter(r => r.source === 'local')
    } else {
      list = list.filter(r => r.source === `imported_${memberFilter.value}`)
    }
  }

  return list.filter(r => {
    const d = new Date(r.date)
    return d >= start && d <= end
  })
})

const total = computed(() => filteredRecords.value.reduce((s, r) => s + r.amount, 0))
const count = computed(() => filteredRecords.value.length)

const dailyAvg = computed(() => {
  const days = timeMode.value === 'day' ? 1
    : timeMode.value === 'week' ? 7
    : timeMode.value === 'month'
      ? new Date(timeCursor.value.getFullYear(), timeCursor.value.getMonth() + 1, 0).getDate()
      : 365
  return total.value / days
})

// ---------- 分类排行 ----------

const categoryRank = computed<CategoryStat[]>(() => {
  const map: Record<string, CategoryStat> = {}
  const cats = categoryStore.categories
  filteredRecords.value.forEach(r => {
    if (!map[r.categoryId]) {
      const cat = cats.find(c => c.id === r.categoryId)
      map[r.categoryId] = {
        id: r.categoryId,
        name: cat?.name || '未知',
        icon: cat?.icon || '📦',
        amount: 0
      }
    }
    map[r.categoryId].amount += r.amount
  })
  return Object.values(map).sort((a, b) => b.amount - a.amount)
})

// ---------- 趋势数据 ----------

const trendData = computed<number[]>(() => {
  const buckets: Record<string, number> = {}
  const labels: string[] = []

  if (timeMode.value === 'day') {
    for (let h = 6; h <= 23; h++) {
      const key = String(h).padStart(2, '0') + ':00'
      buckets[key] = 0
      labels.push(key)
    }
    filteredRecords.value.forEach(r => {
      const h = new Date(r.createdAt).getHours()
      const key = String(h).padStart(2, '0') + ':00'
      if (buckets[key] !== undefined) buckets[key] += r.amount
    })
  } else if (timeMode.value === 'week') {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    days.forEach(d => { buckets[d] = 0; labels.push(d) })
    filteredRecords.value.forEach(r => {
      const dow = new Date(r.date).getDay() || 7
      buckets[days[dow - 1]] += r.amount
    })
  } else if (timeMode.value === 'month') {
    const y = timeCursor.value.getFullYear()
    const m = timeCursor.value.getMonth()
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    for (let d = 1; d <= daysInMonth; d++) {
      const key = String(d) + '日'
      buckets[key] = 0
      labels.push(key)
    }
    filteredRecords.value.forEach(r => {
      const day = new Date(r.date).getDate()
      const key = String(day) + '日'
      if (buckets[key] !== undefined) buckets[key] += r.amount
    })
  } else {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    months.forEach(m => { buckets[m] = 0; labels.push(m) })
    filteredRecords.value.forEach(r => {
      const m = new Date(r.date).getMonth()
      buckets[months[m]] += r.amount
    })
  }

  trendLabels.value = labels
  return Object.values(buckets)
})

const trendLabels = ref<string[]>([])

// ---------- 成员贡献排行 ----------

const MEMBER_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

const memberRank = computed<MemberStat[]>(() => {
  const map: Record<string, MemberStat> = {}
  allMembers.value.forEach((m, i) => {
    map[m.id] = {
      id: m.id,
      name: m.name,
      avatar: m.avatar,
      amount: 0,
      color: MEMBER_COLORS[i % MEMBER_COLORS.length]
    }
  })
  filteredRecords.value.forEach(r => {
    const key = r.source === 'local' ? 'local' : r.source.replace('imported_', '')
    if (map[key]) map[key].amount += r.amount
  })
  return Object.values(map).filter(m => m.amount > 0).sort((a, b) => b.amount - a.amount)
})

const memberMaxAmount = computed(() => memberRank.value[0]?.amount || 1)
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

.time-tabs {
  display: flex;
  margin: 24rpx;
  background: $card-bg;
  border-radius: 12rpx;
  padding: 6rpx;

  .time-tab {
    flex: 1;
    text-align: center;
    padding: 14rpx 0;
    font-size: $caption-size;
    color: $text-tertiary;
    border-radius: 10rpx;

    &.active {
      background: $primary;
      color: #fff;
      font-weight: 600;
    }
  }
}

.time-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40rpx;
  margin-bottom: 16rpx;

  .picker-arrow {
    font-size: 36rpx;
    color: $text-tertiary;
    padding: 8rpx 16rpx;
  }

  .picker-label {
    font-size: $subtitle-size;
    font-weight: 600;
    color: $text-primary;
  }
}

.summary-row {
  display: flex;
  gap: 16rpx;
  margin: 0 24rpx 24rpx;

  .summary-card {
    flex: 1;
    background: $card-bg;
    border-radius: $card-radius;
    padding: 20rpx;
    text-align: center;
  }

  .summary-label {
    font-size: $tiny-size;
    color: $text-tertiary;
  }

  .summary-value {
    display: block;
    font-size: 32rpx;
    font-weight: 700;
    margin-top: 8rpx;

    &.red {
      color: $expense-red;
    }
  }
}

.chart-card,
.rank-card {
  margin: 24rpx;
  background: $card-bg;
  border-radius: $large-radius;
  padding: 24rpx;

  .card-title {
    font-size: $body-size;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 20rpx;
    display: block;
  }
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  gap: 12rpx;

  .rank-icon {
    font-size: 32rpx;
  }

  .rank-name {
    font-size: $caption-size;
    color: $text-primary;
    width: 80rpx;
  }

  .rank-bar-bg {
    flex: 1;
    height: 16rpx;
    background: #F3F4F6;
    border-radius: 8rpx;
    overflow: hidden;
  }

  .rank-bar {
    height: 100%;
    background: $primary;
    border-radius: 8rpx;
  }

  .rank-amount {
    font-size: $caption-size;
    font-weight: 600;
    color: $text-primary;
    width: 120rpx;
    text-align: right;
  }

  .rank-percent {
    font-size: $tiny-size;
    color: $text-tertiary;
    width: 80rpx;
    text-align: right;
  }
}
</style>
