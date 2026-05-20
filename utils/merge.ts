import type { Record, RecordSource } from '@/types/record'
import type { MergeResult } from '@/types/ledger'
import { MergeStrategy } from '@/types/ledger'

export { MergeStrategy }

/**
 * 导入账本：给所有导入记录打上 source 标记
 */
export function tagImportedRecords(incomingRecords: Record[], memberId: string): Record[] {
  return incomingRecords.map(r => ({
    ...r,
    source: `imported_${memberId}` as RecordSource,
    importedAt: Date.now() as any
  }))
}

/**
 * 生成去重 key（同一条记录在不同设备上可能 ID 不同）
 */
function dedupKey(record: Record): string {
  return `${record.date}_${record.amount}_${record.categoryId}`
}

/**
 * 智能合并：去重后追加
 */
export function smartMerge(existing: Record[], incoming: Record[]): MergeResult {
  const existingKeys = new Set(existing.map(dedupKey))
  const merged: Record[] = [...existing]
  const duplicates: Record[] = []

  incoming.forEach(record => {
    if (existingKeys.has(dedupKey(record))) {
      duplicates.push(record)
    } else {
      merged.push(record)
    }
  })

  merged.sort((a, b) => b.createdAt - a.createdAt)
  return { merged, duplicates }
}

/**
 * 完全追加（不去重）
 */
export function appendAll(existing: Record[], incoming: Record[]): Record[] {
  return [...existing, ...incoming].sort((a, b) => b.createdAt - a.createdAt)
}
