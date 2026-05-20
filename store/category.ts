import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Category } from '@/types/category'
import { getCategories, setCategories, DEFAULT_CATEGORIES } from '@/utils/storage'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>(getCategories())

  function refresh() {
    categories.value = getCategories()
  }

  function getById(id: string): Category | undefined {
    return categories.value.find(c => c.id === id)
  }

  function reset() {
    setCategories(DEFAULT_CATEGORIES)
    categories.value = DEFAULT_CATEGORIES
  }

  return {
    categories,
    refresh,
    getById,
    reset
  }
})
