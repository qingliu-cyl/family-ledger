import type { LedgerFullBackup, LedgerShareFile } from '@/types/ledger'
import { tagImportedRecords, smartMerge, appendAll } from './merge'
import { setRecords, getRecords, addMember, getMembers } from './storage'

/**
 * 简单校验和
 */
function computeChecksum(data: string): string {
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

/**
 * 自动识别文件类型
 */
export function detectFileType(json: string): 'full_backup' | 'share' | 'unknown' {
  try {
    const parsed = JSON.parse(json)
    if (parsed.type === 'full_backup' && parsed.version >= 2) return 'full_backup'
    if (parsed.type === 'share' && parsed.version >= 2) return 'share'
    if (parsed.records && Array.isArray(parsed.records)) return 'share'
    return 'unknown'
  } catch {
    return 'unknown'
  }
}

/**
 * 完整恢复（换设备用）
 */
export function restoreFullBackup(backup: LedgerFullBackup): { success: boolean; error?: string } {
  const jsonForChecksum = JSON.stringify(backup.data)
  const expectedChecksum = computeChecksum(jsonForChecksum)
  if (backup.checksum !== expectedChecksum) {
    return { success: false, error: '备份文件校验失败，数据可能已损坏' }
  }

  uni.setStorageSync('hl_records', backup.data.records)
  uni.setStorageSync('hl_categories', backup.data.categories)
  uni.setStorageSync('hl_members', backup.data.members)
  uni.setStorageSync('hl_meta', backup.data.ledgerMeta)
  uni.setStorageSync('hl_settings', backup.data.settings)

  return { success: true }
}

/**
 * 解析分享文件
 */
export function importShareFile(json: string): LedgerShareFile | null {
  try {
    const parsed = JSON.parse(json) as LedgerShareFile
    if (parsed.records && Array.isArray(parsed.records)) return parsed
    return null
  } catch {
    return null
  }
}

/**
 * 完整导入流程
 */
export function importWithMember(
  file: LedgerShareFile,
  memberId: string,
  strategy: 'smart' | 'append'
): { added: number; skipped: number } {
  const tagged = tagImportedRecords(file.records, memberId)
  const existing = getRecords()
  const result = strategy === 'smart'
    ? smartMerge(existing, tagged)
    : { merged: appendAll(existing, tagged), duplicates: [] }

  setRecords(result.merged)

  // 自动创建成员（如果不存在）
  const existingMembers = getMembers()
  if (!existingMembers.find(m => m.id === memberId) && file.ledger.members?.length) {
    const importedMember = file.ledger.members.find(m => m.id === memberId)
    if (importedMember) addMember({ ...importedMember, createdAt: Date.now() })
  }

  return { added: tagged.length - result.duplicates.length, skipped: result.duplicates.length }
}

/**
 * 从剪贴板读取内容（小程序端）
 */
export function readFromClipboard(): Promise<string | null> {
  return new Promise((resolve) => {
    uni.getClipboardData({
      success(res) { resolve(res.data) },
      fail() { resolve(null) }
    })
  })
}

/**
 * 通用导入入口
 */
export async function importFromFile(): Promise<void> {
  let json: string | null = null

  // #ifdef MP-WEIXIN
  json = await readFromClipboard()
  // #endif

  // #ifdef APP-PLUS
  json = await new Promise((resolve) => {
    uni.chooseFile({
      count: 1,
      type: 'file',
      extension: ['.hlk', '.json'],
      success(res) {
        uni.getFileSystemManager().readFile({
          filePath: res.tempFiles[0].path,
          encoding: 'utf8',
          success(e: any) { resolve(e.data) }
        })
      },
      fail() { resolve(null) }
    })
  })
  // #endif

  if (!json) return

  const fileType = detectFileType(json)

  if (fileType === 'full_backup') {
    const backup = JSON.parse(json) as LedgerFullBackup
    uni.showModal({
      title: '完整备份恢复',
      content: `将恢复 ${backup.data.records.length} 条记录、${backup.data.members.length} 位成员。当前数据将被覆盖，确定？`,
      success(btn) {
        if (btn.confirm) {
          const result = restoreFullBackup(backup)
          if (result.success) {
            uni.showToast({ title: '恢复成功，重启生效', icon: 'success' })
            setTimeout(() => uni.reLaunch({ url: '/pages/home/index' }), 1500)
          } else {
            uni.showToast({ title: result.error || '恢复失败', icon: 'none' })
          }
        }
      }
    })
  } else if (fileType === 'share') {
    const shareFile = importShareFile(json)
    if (shareFile) {
      uni.navigateTo({
        url: '/pages/ledger/import-assign',
        success(res) {
          res.eventChannel.emit('importData', shareFile)
        }
      })
    }
  } else {
    uni.showToast({ title: '无法识别的文件格式', icon: 'none' })
  }
}
