import { ref } from 'vue'
import type { PaymentMethod, CreateRecordInput } from '@/types/record'

interface RawPaymentInfo {
  source: string
  amount: number
  merchant: string
  cardTail: string
  timestamp: number
}

interface CategoryRule {
  keywords: string[]
  category: string
}

// #ifdef APP-PLUS
const paymentModule = uni.requireNativePlugin('HomeLedger-PaymentListener') as {
  registerListener(cb: (info: RawPaymentInfo) => void): void
  checkPermission(cb: (res: { enabled: boolean }) => void): void
  openNotificationSettings(): void
}
// #endif

const pendingPayments = ref<CreateRecordInput[]>([])
const isListening = ref<boolean>(false)

const CATEGORY_RULES: CategoryRule[] = [
  { keywords: ['美团', '饿了么', '肯德基', '麦当劳', '星巴克', '瑞幸', '奶茶', '火锅', '烧烤', '餐厅', '饭店', '食堂', '外卖'], category: 'food' },
  { keywords: ['滴滴', '地铁', '公交', '加油', '停车', '高铁', '火车', '机票', '打车', '出租'], category: 'transport' },
  { keywords: ['淘宝', '京东', '拼多多', '天猫', '超市', '商场', '便利店', '全家', '711', '罗森'], category: 'shopping' },
  { keywords: ['房租', '物业', '电费', '水费', '燃气', '宽带', '房贷'], category: 'housing' },
  { keywords: ['医院', '药店', '诊所', '体检', '牙科'], category: 'medical' },
  { keywords: ['电影', 'KTV', '游戏', '视频会员', '音乐', '健身', '旅游', '景区'], category: 'entertainment' },
  { keywords: ['话费', '流量', '充值', '中国移动', '中国联通', '中国电信'], category: 'telecom' },
  { keywords: ['学校', '培训', '书店', '课程', '考试'], category: 'education' },
  { keywords: ['童装', '玩具', '奶粉', '尿不湿', '幼儿园', '早教'], category: 'baby' },
  { keywords: ['服装', '鞋', '衣', '裤', '优衣库', 'ZARA', 'HM'], category: 'clothing' }
]

function guessCategory(merchant: string): string {
  if (!merchant) return 'other'
  const lower = merchant.toLowerCase()
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) return rule.category
  }
  return 'other'
}

function parsePaymentInfo(info: RawPaymentInfo): CreateRecordInput | null {
  const categoryId = guessCategory(info.merchant)
  const paymentMethod: PaymentMethod =
    info.source === 'wechat' ? 'wechat'
    : info.source === 'alipay' ? 'alipay'
    : 'card'

  return {
    amount: info.amount,
    categoryId,
    note: info.merchant || '',
    date: new Date(info.timestamp).toISOString().slice(0, 10),
    type: 'expense',
    source: 'local',
    payerId: 'local',
    paymentMethod
  }
}

export function startListening(): void {
  // #ifdef APP-PLUS
  paymentModule.registerListener((info: RawPaymentInfo) => {
    const parsed = parsePaymentInfo(info)
    if (parsed) {
      pendingPayments.value.unshift(parsed)
      uni.showToast({ title: `检测到支付 ¥${parsed.amount}`, icon: 'none', duration: 3000 })
    }
  })
  isListening.value = true
  // #endif
}

export async function checkNotificationPermission(): Promise<boolean> {
  // #ifdef APP-PLUS
  return new Promise((resolve) => {
    paymentModule.checkPermission((res) => { resolve(res.enabled) })
  })
  // #endif
  return false
}

export function openNotificationSettings(): void {
  // #ifdef APP-PLUS
  paymentModule.openNotificationSettings()
  // #endif
}

export { pendingPayments, isListening }
