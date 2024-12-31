import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ProfileData } from '../types'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<ProfileData>({
    circleName: '',
    personalInfo: {
      avatar: '',
      mainInterests: '',
      otherInterests: '',
      keywords: [],
      attributes: {}
    },
    ingredients: Array(6).fill(null).map((_, index) => ({
      name: '',
      image: '',
      percentage: 0,
      trend: 'stable' as const,
      order: index,
      position: {
        row: Math.floor(index / 3),
        column: index % 3
      }
    }))
  })

  // 从 localStorage 加载数据
  const loadFromStorage = () => {
    const stored = localStorage.getItem('profile-data')
    if (stored) {
      try {
        profile.value = JSON.parse(stored)
      } catch (e) {
        console.error('Failed to load profile data:', e)
      }
    }
  }

  // 保存数据到 localStorage
  const saveToStorage = () => {
    localStorage.setItem('profile-data', JSON.stringify(profile.value))
  }

  // 更新头像
  const updateAvatar = (base64: string) => {
    profile.value.personalInfo.avatar = base64
    saveToStorage()
  }

  // 更新关键词
  const updateKeywords = (keywords: string[]) => {
    profile.value.personalInfo.keywords = keywords.slice(0, 5)
    saveToStorage()
  }

  // 更新成分
  const updateIngredient = (index: number, data: Partial<ProfileData['ingredients'][0]>) => {
    profile.value.ingredients[index] = {
      ...profile.value.ingredients[index],
      ...data
    }
    saveToStorage()
  }

  // 更新成分顺序
  const updateIngredientsOrder = (from: number, to: number) => {
    const ingredients = [...profile.value.ingredients]
    const [moved] = ingredients.splice(from, 1)
    ingredients.splice(to, 0, moved)
    
    // 更新位置信息
    ingredients.forEach((ingredient, index) => {
      ingredient.order = index
      ingredient.position = {
        row: Math.floor(index / 3),
        column: index % 3
      }
    })
    
    profile.value.ingredients = ingredients
    saveToStorage()
  }

  return {
    profile,
    loadFromStorage,
    saveToStorage,
    updateAvatar,
    updateKeywords,
    updateIngredient,
    updateIngredientsOrder
  }
})
