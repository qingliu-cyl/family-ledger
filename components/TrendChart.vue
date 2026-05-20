<template>
  <view class="trend-chart">
    <canvas canvas-id="trendCanvas" id="trendCanvas" class="chart-canvas" @touchstart="onTouch" />
  </view>
</template>

<script lang="ts" setup>
import { watch, onMounted, nextTick } from 'vue'

const props = defineProps<{
  data: number[]
  labels: string[]
}>()

let ctx: UniApp.CanvasContext | null = null

onMounted(() => {
  ctx = uni.createCanvasContext('trendCanvas')
  nextTick(() => draw())
})

watch(() => [props.data, props.labels], () => {
  nextTick(() => draw())
}, { deep: true })

function draw() {
  if (!ctx || !props.data.length) return

  const width = 680
  const height = 360
  const padding = { top: 40, right: 30, bottom: 50, left: 70 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  ctx.clearRect(0, 0, width, height)

  const maxVal = Math.max(...props.data, 1)
  const minVal = 0

  // 画网格线
  const gridCount = 4
  ctx.setStrokeStyle('#F3F4F6')
  ctx.setLineWidth(1)
  for (let i = 0; i <= gridCount; i++) {
    const y = padding.top + (chartH / gridCount) * i
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(width - padding.right, y)
    ctx.stroke()

    // Y 轴标签
    const val = maxVal - (maxVal - minVal) * (i / gridCount)
    ctx.setFontSize(18)
    ctx.setFillStyle('#9CA3AF')
    ctx.setTextAlign('right')
    ctx.fillText(val >= 1000 ? (val / 1000).toFixed(0) + 'k' : Math.round(val).toString(), padding.left - 10, y + 5)
  }

  // 画折线
  const points = props.data.map((v, i) => {
    const x = padding.left + (chartW / Math.max(props.data.length - 1, 1)) * i
    const y = padding.top + chartH - ((v - minVal) / (maxVal - minVal || 1)) * chartH
    return { x, y }
  })

  // 填充区域
  ctx.beginPath()
  ctx.moveTo(points[0].x, padding.top + chartH)
  points.forEach(p => ctx.lineTo(p.x, p.y))
  ctx.lineTo(points[points.length - 1].x, padding.top + chartH)
  ctx.closePath()
  ctx.setFillStyle('rgba(99, 102, 241, 0.1)')
  ctx.fill()

  // 折线
  ctx.setStrokeStyle('#6366F1')
  ctx.setLineWidth(3)
  ctx.beginPath()
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y)
    else ctx.lineTo(p.x, p.y)
  })
  ctx.stroke()

  // 数据点
  points.forEach(p => {
    ctx.beginPath()
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
    ctx.setFillStyle('#6366F1')
    ctx.fill()
  })

  // X 轴标签（显示部分）
  const step = Math.max(1, Math.floor(props.labels.length / 7))
  ctx.setFontSize(16)
  ctx.setFillStyle('#9CA3AF')
  ctx.setTextAlign('center')
  props.labels.forEach((label, i) => {
    if (i % step === 0 || i === props.labels.length - 1) {
      const x = padding.left + (chartW / Math.max(props.labels.length - 1, 1)) * i
      ctx.fillText(label, x, height - padding.bottom + 28)
    }
  })

  ctx.draw()
}

function onTouch(_e: any) {
  // 预留：后续可做 tooltip
}
</script>

<style lang="scss" scoped>
.trend-chart {
  width: 100%;
}

.chart-canvas {
  width: 680rpx;
  height: 360rpx;
}
</style>
