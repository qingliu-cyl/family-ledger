import type { Record, CreateRecordInput } from '@/types/record'
import type { Category } from '@/types/category'
import type { Member } from '@/types/member'
import type { AppSettings, LedgerMeta } from '@/types/ledger'
import { genId } from './uuid'

const KEYS = {
  RECORDS: 'hl_records',
  CATEGORIES: 'hl_categories',
  MEMBERS: 'hl_members',
  LEDGER_META: 'hl_meta',
  SETTINGS: 'hl_settings'
} as const

/** 默认分类 */
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: '餐饮', icon: '🍚', dimension: 'both', sortOrder: 0 },
  { id: 'transport', name: '交通', icon: '🚗', dimension: 'both', sortOrder: 1 },
  { id: 'shopping', name: '购物', icon: '🛒', dimension: 'both', sortOrder: 2 },
  { id: 'housing', name: '居住', icon: '🏠', dimension: 'both', sortOrder: 3 },
  { id: 'baby', name: '育儿', icon: '👶', dimension: 'both', sortOrder: 4 },
  { id: 'education', name: '教育', icon: '🎓', dimension: 'both', sortOrder: 5 },
  { id: 'medical', name: '医疗', icon: '🏥', dimension: 'both', sortOrder: 6 },
  { id: 'entertainment', name: '娱乐', icon: '🎬', dimension: 'both', sortOrder: 7 },
  { id: 'clothing', name: '服饰', icon: '👔', dimension: 'both', sortOrder: 8 },
  { id: 'telecom', name: '通讯', icon: '📱', dimension: 'both', sortOrder: 9 },
  { id: 'utility', name: '水电', icon: '💡', dimension: 'both', sortOrder: 10 },
  { id: 'gift', name: '礼金', icon: '🎁', dimension: 'both', sortOrder: 11 },
  { id: 'repair', name: '维修', icon: '🔧', dimension: 'both', sortOrder: 12 },
  { id: 'other', name: '其他', icon: '📦', dimension: 'both', sortOrder: 13 }
]

// ============================================================
// 记录
// ============================================================

export function getRecords(): Record[] {
  return uni.getStorageSync(KEYS.RECORDS) || []
}

export function setRecords(list: Record[]): void {
  uni.setStorageSync(KEYS.RECORDS, list)
}

/** 获取个人记录（仅本机记的） */
export function getPersonalRecords(): Record[] {
  return getRecords().filter(r => r.source === 'local')
}

/** 获取家庭记录（全部 = 本机 + 导入） */
export function getFamilyRecords(): Record[] {
  return getRecords()
}

/** 按成员筛选记录 */
export function getRecordsByMember(memberId: string): Record[] {
  if (memberId === 'local' || memberId === 'self') {
    return getRecords().filter(r => r.source === 'local')
  }
  return getRecords().filter(r => r.source === `imported_${memberId}`)
}

/** 新增记录 */
export function addRecord(input: CreateRecordInput): Record {
  const record: Record = {
    ...input,
    id: genId(),
    source: input.source || 'local',
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  const list = getRecords()
  list.unshift(record)
  setRecords(list)
  return record
}

/** 删除记录 */
export function deleteRecord(id: string): void {
  const list = getRecords().filter(r => r.id !== id)
  setRecords(list)
}

/** 更新记录 */
export function updateRecord(id: string, updates: Partial<Record>): Record | null {
  const list = getRecords()
  const idx = list.findIndex(r => r.id === id)
  if (idx === -1) return null
  list[idx] = { ...list[idx], ...updates, updatedAt: Date.now() }
  setRecords(list)
  return list[idx]
}

// ============================================================
// 成员
// ============================================================

export function getMembers(): Member[] {
  return uni.getStorageSync(KEYS.MEMBERS) || []
}

export function setMembers(members: Member[]): void {
  uni.setStorageSync(KEYS.MEMBERS, members)
}

export function addMember(member: Member): void {
  const list = getMembers()
  if (!list.find(m => m.id === member.id)) {
    list.push(member)
    setMembers(list)
  }
}

export function removeMember(id: string): void {
  const list = getMembers().filter(m => m.id !== id)
  setMembers(list)
}

/** 获取家庭成员列表（含自己） */
export function getAllMembersIncludingSelf(): Member[] {
  const self: Member = { id: 'local', name: '我', avatar: '👤', createdAt: 0 }
  const members = getMembers()
  return [self, ...members.filter(m => m.id !== 'local')]
}

// ============================================================
// 分类
// ============================================================

export function getCategories(): Category[] {
  const stored = uni.getStorageSync(KEYS.CATEGORIES)
  return stored && stored.length ? stored : DEFAULT_CATEGORIES
}

export function setCategories(cats: Category[]): void {
  uni.setStorageSync(KEYS.CATEGORIES, cats)
}

export function addCategory(cat: Category): void {
  const list = getCategories()
  if (!list.find(c => c.id === cat.id)) {
    list.push(cat)
    setCategories(list)
  }
}

export function removeCategory(id: string): void {
  const list = getCategories().filter(c => c.id !== id)
  setCategories(list)
}

// ============================================================
// 设置
// ============================================================

export function getSettings(): AppSettings {
  return (
    uni.getStorageSync(KEYS.SETTINGS) || {
      currentMemberId: 'local',
      autoRecordEnabled: false,
      defaultDimension: 'personal',
      theme: 'auto'
    }
  )
}

export function setSettings(settings: AppSettings): void {
  uni.setStorageSync(KEYS.SETTINGS, settings)
}

// ============================================================
// 账本元信息
// ============================================================

export function getLedgerMeta(): LedgerMeta {
  return (
    uni.getStorageSync(KEYS.LEDGER_META) || {
      id: 'default',
      name: '我的账本',
      members: ['local'],
      createdAt: Date.now(),
      version: 1
    }
  )
}

export function setLedgerMeta(meta: LedgerMeta): void {
  uni.setStorageSync(KEYS.LEDGER_META, meta)
}

// ============================================================
// 设备 ID
// ============================================================

export function getDeviceId(): string {
  const stored = uni.getStorageSync('hl_device_id')
  if (stored) return stored
  const id = 'dev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10)
  uni.setStorageSync('hl_device_id', id)
  return id
}
