import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LedgerMeta, AppSettings } from '@/types/ledger'
import { getLedgerMeta, setLedgerMeta, getSettings, setSettings } from '@/utils/storage'

export const useLedgerStore = defineStore('ledger', () => {
  const meta = ref<LedgerMeta>(getLedgerMeta())
  const settings = ref<AppSettings>(getSettings())

  function refresh() {
    meta.value = getLedgerMeta()
    settings.value = getSettings()
  }

  function updateMeta(updates: Partial<LedgerMeta>) {
    meta.value = { ...meta.value, ...updates }
    setLedgerMeta(meta.value)
  }

  function updateSettings(updates: Partial<AppSettings>) {
    settings.value = { ...settings.value, ...updates }
    setSettings(settings.value)
  }

  return {
    meta,
    settings,
    refresh,
    updateMeta,
    updateSettings
  }
})
