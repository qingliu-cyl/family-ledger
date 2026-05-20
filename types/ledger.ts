import type { Record } from './record'
import type { Category } from './category'
import type { Member } from './member'

export interface LedgerMeta {
  id: string
  name: string
  members: string[] // member ids
  createdAt: number
  version: number
}

/** 应用设置 */
export interface AppSettings {
  currentMemberId: string
  autoRecordEnabled: boolean
  defaultDimension: 'personal' | 'family'
  theme: 'light' | 'dark' | 'auto'
}

/** .hlk 完整备份文件结构（换设备恢复用） */
export interface LedgerFullBackup {
  version: number
  type: 'full_backup'
  platform: 'uniapp'
  exportedAt: string
  deviceId: string
  checksum: string
  data: {
    records: Record[]
    categories: Category[]
    members: Member[]
    ledgerMeta: LedgerMeta
    settings: AppSettings
  }
}

/** .hlk 部分导入文件结构（家人之间合并用） */
export interface LedgerShareFile {
  version: number
  type: 'share'
  platform: 'uniapp'
  exportedAt: string
  ledger: {
    id: string
    name: string
    members: Pick<Member, 'id' | 'name' | 'avatar'>[]
  }
  categories: Category[]
  records: Record[]
}

/** 合并策略 */
export enum MergeStrategy {
  APPEND_ALL = 'append_all',
  SMART_DEDUP = 'smart_dedup',
  MANUAL = 'manual'
}

/** 合并结果 */
export interface MergeResult {
  merged: Record[]
  duplicates: Record[]
}
