<template>
  <div class="profile-card">
    <div class="profile-card__header">
      <h1 class="profile-card__title" @click="startEditingTitle" v-if="!isEditingTitle">
        {{ profile.circleName || '点击编辑圈名' }}
      </h1>
      <input
        v-else
        ref="titleInput"
        v-model="profile.circleName"
        class="profile-card__title-input"
        @blur="finishEditingTitle"
        @keyup.enter="finishEditingTitle"
      />
    </div>

    <div class="profile-card__info">
      <div class="profile-card__avatar" @click="triggerAvatarUpload">
        <img v-if="profile.personalInfo.avatar" :src="profile.personalInfo.avatar" alt="头像" />
        <div v-else class="profile-card__avatar-placeholder">点击上传头像</div>
        <input
          type="file"
          ref="avatarInput"
          class="profile-card__avatar-input"
          accept="image/*"
          @change="handleAvatarUpload"
        />
      </div>

      <div class="profile-card__interests">
        <textarea
          v-model="profile.personalInfo.mainInterests"
          class="profile-card__interests-main"
          placeholder="主要兴趣"
          @input="handleInput"
        ></textarea>
        <textarea
          v-model="profile.personalInfo.otherInterests"
          class="profile-card__interests-other"
          placeholder="其他兴趣"
          @input="handleInput"
        ></textarea>
      </div>
    </div>

    <div class="profile-card__keywords">
      <div
        v-for="(keyword, index) in profile.personalInfo.keywords"
        :key="index"
        class="profile-card__keyword"
      >
        {{ keyword }}
      </div>
      <button
        v-if="profile.personalInfo.keywords.length < 5"
        class="profile-card__add-keyword"
        @click="addKeyword"
      >
        添加关键词
      </button>
    </div>

    <div class="profile-card__attributes">
      <div class="profile-card__attributes-grid">
        <div
          v-for="(attr, key) in attributes"
          :key="key"
          class="profile-card__attribute"
        >
          <div class="profile-card__attribute-options">
            <button
              v-for="(option, index) in attr.options"
              :key="index"
              :class="[
                'profile-card__attribute-option',
                `profile-card__attribute-option--${index === 0 ? 'left' : 'right'}`,
                { 'is-selected': profile.personalInfo.attributes[key]?.selected === index }
              ]"
              @click="selectAttribute(key, index)"
            >
              {{ option }}
            </button>
            <div class="profile-card__attribute-divider">/</div>
          </div>
        </div>
      </div>
    </div>

    <div class="profile-card__ingredients">
      <div
        v-for="(ingredient, index) in profile.ingredients"
        :key="index"
        class="profile-card__ingredient"
        :style="{
          gridRow: ingredient.position.row + 1,
          gridColumn: ingredient.position.column + 1
        }"
      >
        <div class="profile-card__ingredient-content">
          <div class="profile-card__ingredient-image" @click="() => triggerIngredientImageUpload(index)">
            <img v-if="ingredient.image" :src="ingredient.image" :alt="ingredient.name" />
            <div v-else class="profile-card__ingredient-image-placeholder">点击上传图片</div>
          </div>
          <input
            v-model="ingredient.name"
            class="profile-card__ingredient-name"
            placeholder="成分名称"
            @input="handleInput"
          />
          <div class="profile-card__ingredient-percentage">
            <input
              type="range"
              v-model.number="ingredient.percentage"
              min="0"
              max="100"
              @input="handleInput"
            />
            <span>{{ ingredient.percentage }}%</span>
          </div>
          <div
            class="profile-card__ingredient-trend"
            @click="() => cycleTrend(index)"
          >
            {{ getTrendIcon(ingredient.trend) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProfileStore } from '../stores/profile'
import { storeToRefs } from 'pinia'
import { debounce } from 'lodash-es'

const store = useProfileStore()
const { profile } = storeToRefs(store)

const isEditingTitle = ref(false)
const titleInput = ref<HTMLInputElement | null>(null)
const avatarInput = ref<HTMLInputElement | null>(null)

const attributes = {
  age: { options: ['成年', '未成年'] },
  lifestyle: { options: ['现充', '非现充'] },
  gaming: { options: ['打游戏', '不打游戏'] },
  visibility: { options: ['首页', '小窗'] },
  energy: { options: ['正能', '负能'] },
  postStyle: { options: ['碎碎念', '长篇大论'] },
  interaction: { options: ['点赞', '评论'] },
  idol: { options: ['追星', '不追星'] },
  content: { options: ['日常', '非日常'] },
  temper: { options: ['易怒', '平和'] },
  drama: { options: ['追剧', '不追剧'] },
  personality: { options: ['感性', '理性'] },
  social: { options: ['自来熟', '慢热'] },
  anime: { options: ['追番', '不追番'] },
  contact: { options: ['可私联', '不便私联'] }
}

const startEditingTitle = () => {
  isEditingTitle.value = true
  nextTick(() => {
    titleInput.value?.focus()
  })
}

const finishEditingTitle = () => {
  isEditingTitle.value = false
  store.saveToStorage()
}

const handleInput = debounce(() => {
  store.saveToStorage()
}, 500)

const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

const handleAvatarUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  const reader = new FileReader()
  reader.onload = () => {
    store.updateAvatar(reader.result as string)
  }
  reader.readAsDataURL(file)
}

const addKeyword = () => {
  const keyword = prompt('请输入关键词')
  if (keyword && profile.value.personalInfo.keywords.length < 5) {
    profile.value.personalInfo.keywords.push(keyword)
    store.saveToStorage()
  }
}

const getTrendIcon = (trend: 'up' | 'stable' | 'down') => {
  switch (trend) {
    case 'up': return '↑'
    case 'down': return '↓'
    default: return '→'
  }
}

const cycleTrend = (index: number) => {
  const trends: Array<'up' | 'stable' | 'down'> = ['up', 'stable', 'down']
  const currentTrend = profile.value.ingredients[index].trend
  const nextIndex = (trends.indexOf(currentTrend) + 1) % trends.length
  profile.value.ingredients[index].trend = trends[nextIndex]
  store.saveToStorage()
}

const triggerIngredientImageUpload = (index: number) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (event) => {
    const target = event.target as HTMLInputElement
    if (!target.files?.length) return

    const file = target.files[0]
    const reader = new FileReader()
    reader.onload = () => {
      profile.value.ingredients[index].image = reader.result as string
      store.saveToStorage()
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

const selectAttribute = (key: string, index: number) => {
  profile.value.personalInfo.attributes[key] = { selected: index }
  store.saveToStorage()
}

onMounted(() => {
  store.loadFromStorage()
})
</script>

<style lang="scss" scoped>
.profile-card {
  width: 900px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &__header {
    text-align: center;
    margin-bottom: 20px;
  }

  &__title {
    font-size: 24px;
    cursor: pointer;
    
    &-input {
      font-size: 24px;
      text-align: center;
      width: 100%;
      border: none;
      border-bottom: 2px solid #ddd;
      outline: none;
      padding: 4px;
    }
  }

  &__info {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
  }

  &__avatar {
    width: 160px;
    height: 160px;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    position: relative;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    &-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      color: #999;
    }
    
    &-input {
      display: none;
    }
  }

  &__interests {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
    
    textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      resize: none;
      outline: none;
      
      &:focus {
        border-color: #666;
      }
    }
  }

  &__keywords {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
  }

  &__keyword {
    padding: 4px 12px;
    background: #f0f0f0;
    border-radius: 16px;
    font-size: 14px;
  }

  &__add-keyword {
    padding: 4px 12px;
    border: 1px dashed #999;
    border-radius: 16px;
    background: none;
    cursor: pointer;
    font-size: 14px;
    
    &:hover {
      background: #f5f5f5;
    }
  }

  &__attributes {
    margin: 20px 0 30px;
    padding: 20px;
    background: #f9f9f9;
    border-radius: 12px;
  }

  &__attributes-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px 30px;
  }

  &__attribute {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__attribute-options {
    position: relative;
    display: inline-flex;
    background: var(--card-background);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 2px;
    width: 100%;
    max-width: 200px;
  }

  &__attribute-option {
    flex: 1;
    padding: 6px 12px;
    font-size: 14px;
    cursor: pointer;
    background: transparent;
    border: none;
    transition: all 0.2s ease;
    position: relative;
    z-index: 1;
    
    &--left {
      border-radius: 16px 0 0 16px;
    }
    
    &--right {
      border-radius: 0 16px 16px 0;
    }
    
    &:hover:not(.is-selected) {
      background: rgba(0, 0, 0, 0.03);
    }
    
    &.is-selected {
      background: var(--primary-color);
      color: white;
    }
  }

  &__attribute-divider {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: var(--border-color);
    font-size: 12px;
    z-index: 0;
  }

  &__ingredients {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, auto);
    gap: 20px;
  }

  &__ingredient {
    background: #f9f9f9;
    border-radius: 8px;
    padding: 16px;
    
    &-content {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    &-image {
      width: 160px;
      height: 160px;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      &-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f5f5;
        color: #999;
      }
    }
    
    &-name {
      width: 100%;
      padding: 4px;
      border: none;
      border-bottom: 1px solid #ddd;
      outline: none;
      text-align: center;
      
      &:focus {
        border-color: #666;
      }
    }
    
    &-percentage {
      display: flex;
      align-items: center;
      gap: 10px;
      
      input[type="range"] {
        flex: 1;
      }
    }
    
    &-trend {
      text-align: center;
      cursor: pointer;
      font-size: 20px;
    }
  }
}
</style>
