/** 支付方式 */
export type PaymentMethod = 'wechat' | 'alipay' | 'cash' | 'card'

/** 记录来源：local=本机记的，imported_<memberId>=导入的 */
export type RecordSource = 'local' | `imported_${string}`

/** 账单记录 */
export interface Record {
  id: string
  amount: number
  categoryId: string
  note: string
  date: string // '2026-05-20'
  type: 'expense' | 'income'
  source: RecordSource
  payerId: string
  paymentMethod: PaymentMethod
  createdAt: number // timestamp ms
  updatedAt: number
}

/** 新增记录时的入参（id/createdAt/updatedAt 自动生成） */
export type CreateRecordInput = Omit<Record, 'id' | 'createdAt' | 'updatedAt'>
