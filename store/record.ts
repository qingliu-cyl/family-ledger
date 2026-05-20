import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Record, CreateRecordInput } from '@/types/record'
import {
  getRecords,
  setRecords,
  addRecord as storageAddRecord,
  deleteRecord as storageDeleteRecord,
  updateRecord as storageUpdateRecord
} from '@/utils/storage'

export const useRecordStore = defineStore('record', () => {
  const records = ref<Record[]>(getRecords())

  function refresh() {
    records.value = getRecords()
  }

  const personalRecords = computed(() =>
    records.value.filter(r => r.source === 'local')
  )

  const familyRecords = computed(() => records.value)

  function add(input: CreateRecordInput): Record {
    const record = storageAddRecord(input)
    records.value = getRecords()
    return record
  }

  function remove(id: string) {
    storageDeleteRecord(id)
    records.value = getRecords()
  }

  function update(id: string, updates: Partial<Record>) {
    storageUpdateRecord(id, updates)
    records.value = getRecords()
  }

  function getByMember(memberId: string): Record[] {
    if (memberId === 'local' || memberId === 'self') {
      return records.value.filter(r => r.source === 'local')
    }
    return records.value.filter(r => r.source === `imported_${memberId}`)
  }

  return {
    records,
    personalRecords,
    familyRecords,
    refresh,
    add,
    remove,
    update,
    getByMember
  }
})
