import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Member } from '@/types/member'
import {
  getMembers,
  addMember as storageAddMember,
  removeMember as storageRemoveMember,
  getAllMembersIncludingSelf
} from '@/utils/storage'

export const useMemberStore = defineStore('member', () => {
  const members = ref<Member[]>(getMembers())

  function refresh() {
    members.value = getMembers()
  }

  const allWithSelf = computed(() => getAllMembersIncludingSelf())

  function add(member: Member) {
    storageAddMember(member)
    members.value = getMembers()
  }

  function remove(id: string) {
    storageRemoveMember(id)
    members.value = getMembers()
  }

  function getById(id: string): Member | undefined {
    return members.value.find(m => m.id === id)
  }

  return {
    members,
    allWithSelf,
    refresh,
    add,
    remove,
    getById
  }
})
