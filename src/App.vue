<script setup lang="ts">
import ProfileCard from './components/ProfileCard.vue'
import { useProfileStore } from './stores/profile'
import { toPng } from 'html-to-image'

const store = useProfileStore()

const exportImage = async () => {
  const element = document.querySelector('.profile-card')
  if (!element) return
  
  try {
    const dataUrl = await toPng(element, {
      quality: 0.95,
      backgroundColor: '#ffffff'
    })
    
    // 创建下载链接
    const link = document.createElement('a')
    link.download = `${store.profile.circleName || '我的成分表'}.png`
    link.href = dataUrl
    link.click()
  } catch (error) {
    console.error('导出图片失败:', error)
  }
}
</script>

<template>
  <div class="app">
    <ProfileCard />
    <div class="actions">
      <button class="export-button" @click="exportImage">导出为图片</button>
    </div>
  </div>
</template>

<style lang="scss">
body {
  margin: 0;
  min-height: 100vh;
  background: #f0f2f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.app {
  max-width: 1024px;
  margin: 0 auto;
  padding: 40px 20px;
}

.actions {
  margin-top: 20px;
  text-align: center;
}

.export-button {
  padding: 12px 24px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background: #40a9ff;
  }

  &:active {
    background: #096dd9;
  }
}
</style>
