import type { LedgerFullBackup, LedgerShareFile } from '@/types/ledger'
import type { Record } from '@/types/record'
import type { AppSettings } from '@/types/ledger'
import {
  getRecords,
  getCategories,
  getMembers,
  getDeviceId,
  getLedgerMeta,
  getSettings
} from './storage'

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
 * 完整备份（换设备恢复用）
 */
export function exportFullBackup(): LedgerFullBackup {
  const records = getRecords()
  const categories = getCategories()
  const members = getMembers()
  const settings: AppSettings = getSettings()
  const ledgerMeta = getLedgerMeta()

  const payload: LedgerFullBackup = {
    version: 2,
    type: 'full_backup',
    platform: 'uniapp',
    exportedAt: new Date().toISOString(),
    deviceId: getDeviceId(),
    checksum: '',
    data: { records, categories, members, ledgerMeta, settings }
  }

  const jsonForChecksum = JSON.stringify(payload.data)
  payload.checksum = computeChecksum(jsonForChecksum)

  return payload
}

/**
 * 完整备份 → 文件/剪贴板
 */
export async function exportFullBackupToFile(): Promise<void> {
  const backup = exportFullBackup()
  const json = JSON.stringify(backup, null, 2)
  const filename = `家账完整备份_${new Date().toISOString().slice(0, 10)}.hlk`

  // #ifdef APP-PLUS
  const filePath = `${uni.env.USER_DATA_PATH}/${filename}`
  uni.getFileSystemManager().writeFile({
    filePath,
    data: json,
    encoding: 'utf8',
    success() {
      uni.shareWithSystem({
        filePath,
        type: 'application/json',
        success() {
          uni.showToast({ title: '导出成功', icon: 'success' })
        }
      })
    }
  })
  return
  // #endif

  // #ifdef MP-WEIXIN
  uni.setClipboardData({
    data: json,
    success() {
      uni.showToast({ title: '备份已复制到剪贴板', icon: 'none' })
    }
  })
  // #endif
}

/**
 * 分享账本（家人之间导入合并用）
 */
export function exportShareFile(records?: Record[]): LedgerShareFile {
  const allRecords = records || getRecords()
  const categories = getCategories()
  const members = getMembers()
  const meta = getLedgerMeta()

  return {
    version: 2,
    type: 'share',
    platform: 'uniapp',
    exportedAt: new Date().toISOString(),
    ledger: {
      id: meta.id,
      name: meta.name,
      members: members.map(m => ({ id: m.id, name: m.name, avatar: m.avatar }))
    },
    categories,
    records: allRecords
  }
}

/**
 * 分享账本 → 文件/剪贴板
 */
export async function exportShareFileToClipboard(): Promise<void> {
  const shareFile = exportShareFile()
  const json = JSON.stringify(shareFile, null, 2)

  // #ifdef MP-WEIXIN
  uni.setClipboardData({
    data: json,
    success() {
      uni.showToast({ title: '分享账本已复制到剪贴板', icon: 'none' })
    }
  })
  return
  // #endif

  // #ifdef APP-PLUS
  const filename = `家账分享_${new Date().toISOString().slice(0, 10)}.hlk`
  const filePath = `${uni.env.USER_DATA_PATH}/${filename}`
  uni.getFileSystemManager().writeFile({
    filePath,
    data: json,
    encoding: 'utf8',
    success() {
      uni.shareWithSystem({
        filePath,
        type: 'application/json',
        success() {
          uni.showToast({ title: '分享账本已导出', icon: 'success' })
        }
      })
    }
  })
  // #endif
}
