<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Gamepad2, Trophy, PenTool } from 'lucide-vue-next'
import { useGame } from './composables/useGame'
import GameHeader from './components/GameHeader.vue'
import LevelSelector from './components/LevelSelector.vue'
import GameBoard from './components/GameBoard.vue'
import GameControls from './components/GameControls.vue'
import MobileControls from './components/MobileControls.vue'
import GameOverlay from './components/GameOverlay.vue'
import LevelEditor from './components/LevelEditor.vue'

const {
  currentLevelIndex,
  gameMap,
  steps,
  history,
  isGameWon,
  isMoving,
  currentLevel,
  allLevels,
  initLevel,
  initCustomLevel,
  refreshCustomLevels,
  undo,
  resetLevel,
  moveUp,
  moveDown,
  moveLeft,
  moveRight,
  selectLevel,
  nextLevel
} = useGame()

const showSettings = ref(false)
const isEditorMode = ref(false)

const toggleSettings = () => {
  showSettings.value = !showSettings.value
}

const handleSelectLevel = (index) => {
  selectLevel(index)
  showSettings.value = false
}

const enterEditor = () => {
  isEditorMode.value = true
}

const exitEditor = () => {
  isEditorMode.value = false
  refreshCustomLevels()
  initLevel(currentLevelIndex.value)
}

const handlePlayLevel = (levelData) => {
  isEditorMode.value = false
  refreshCustomLevels()
  initCustomLevel(levelData)
}

const handleKeydown = (e) => {
  if (isEditorMode.value) return

  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'].includes(e.key)) {
    e.preventDefault()
  }

  if (isGameWon.value) return

  switch(e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      moveUp()
      break
    case 'ArrowDown':
    case 's':
    case 'S':
      moveDown()
      break
    case 'ArrowLeft':
    case 'a':
    case 'A':
      moveLeft()
      break
    case 'ArrowRight':
    case 'd':
    case 'D':
      moveRight()
      break
    case 'r':
    case 'R':
      resetLevel()
      break
  }

  if ((e.ctrlKey && (e.key === 'z' || e.key === 'Z')) || e.key === 'u' || e.key === 'U') {
    e.preventDefault()
    undo()
  }
}

onMounted(() => {
  initLevel(0)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <!-- 编辑器模式 -->
  <LevelEditor v-if="isEditorMode" @back="exitEditor" @playLevel="handlePlayLevel" />

  <!-- 游戏模式 -->
  <div v-else class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 font-sans text-slate-200 overflow-y-auto">
    
    <div class="p-4 mx-auto max-w-[1400px] min-h-screen grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 content-start lg:content-center items-start lg:items-center lg:p-8">

      <!-- 左侧 / 移动端顶部：游戏主舞台 -->
      <div class="lg:col-span-8 xl:col-span-9 flex flex-col items-center justify-center w-full">
        
        <GameHeader 
          :steps="steps" 
          :showSettings="showSettings" 
          @toggleSettings="toggleSettings" 
        />

        <LevelSelector 
          :currentLevelIndex="currentLevelIndex"
          :allLevels="allLevels"
          :isMobile="true"
          :show="showSettings"
          @selectLevel="handleSelectLevel"
        />

        <GameBoard :gameMap="gameMap">
          <template #overlay>
            <GameOverlay 
              :isGameWon="isGameWon" 
              :steps="steps" 
              :hasNextLevel="currentLevelIndex < allLevels.length - 1"
              @reset="resetLevel" 
              @nextLevel="nextLevel" 
            />
          </template>
        </GameBoard>

         <MobileControls 
            :history="history"
            :isMoving="isMoving"
            @moveUp="moveUp"
            @moveDown="moveDown"
            @moveLeft="moveLeft"
            @moveRight="moveRight"
            @undo="undo"
            @reset="resetLevel"
         />

      </div>

      <!-- 右侧：PC端控制面板 -->
      <div class="hidden lg:flex lg:col-span-4 xl:col-span-3 flex-col gap-6 h-full justify-center">
        
        <!-- 标题卡片 -->
        <div class="bg-slate-800/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 shadow-xl">
           <div class="flex items-center gap-3 mb-2">
            <div class="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
               <Gamepad2 class="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-white tracking-tight">推箱子</h1>
              <p class="text-xs text-slate-400 font-medium tracking-wider">SOKOBAN MASTER</p>
            </div>
          </div>
        </div>

        <!-- 数据与控制 -->
        <GameControls 
          :steps="steps" 
          :history="history" 
          :isMoving="isMoving" 
          @undo="undo" 
          @reset="resetLevel"
        />

        <!-- 关卡列表 -->
        <div class="bg-slate-800/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 shadow-xl flex-1 max-h-[400px] flex flex-col">
           <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Trophy class="w-4 h-4" /> 关卡选择
           </h3>
           <LevelSelector 
             :currentLevelIndex="currentLevelIndex"
             :allLevels="allLevels"
             @selectLevel="handleSelectLevel"
           />
        </div>

        <!-- 关卡编辑器入口 -->
        <button
          @click="enterEditor"
          class="bg-gradient-to-br from-violet-600/80 to-purple-600/80 backdrop-blur-xl rounded-3xl p-5 border border-violet-400/30 shadow-xl text-white relative overflow-hidden group hover:from-violet-500/80 hover:to-purple-500/80 transition-all active:scale-[0.98]"
        >
          <div class="flex items-center gap-3">
            <div class="p-2.5 rounded-xl bg-white/10">
              <PenTool class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-bold text-base">关卡编辑器</h3>
              <p class="text-violet-200 text-xs opacity-80">设计你自己的关卡</p>
            </div>
          </div>
        </button>

        <!-- 操作说明 -->
         <div class="bg-gradient-to-br from-sky-600/80 to-blue-600/80 backdrop-blur-xl rounded-3xl p-5 border border-sky-400/30 shadow-xl text-white relative overflow-hidden group">
            <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Gamepad2 class="w-24 h-24 -rotate-12" />
            </div>
            <h3 class="font-bold text-lg mb-1">操作指南</h3>
            <p class="text-sky-100 text-sm opacity-90 mb-3">掌握技巧，轻松通关！</p>
            <div class="space-y-2 text-xs font-medium text-sky-50">
               <div class="flex items-center gap-2 bg-blue-900/30 p-2 rounded-lg">
                  <span class="bg-white/20 px-1.5 py-0.5 rounded text-white">WASD</span>
                  <span>控制移动</span>
               </div>
               <div class="flex items-center gap-2 bg-blue-900/30 p-2 rounded-lg">
                  <span class="bg-white/20 px-1.5 py-0.5 rounded text-white">R</span>
                  <span>快速重置</span>
                  <span class="bg-white/20 px-1.5 py-0.5 rounded text-white ml-2">U</span>
                  <span>撤销</span>
               </div>
            </div>
         </div>

      </div>

      <!-- 移动端编辑器入口 -->
      <div class="lg:hidden w-full max-w-lg mt-4">
        <button
          @click="enterEditor"
          class="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium shadow-lg shadow-violet-500/30 active:scale-95 transition-transform"
        >
          <PenTool class="w-5 h-5" />
          关卡编辑器
        </button>
      </div>

    </div>
  </div>
</template>

<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(30, 41, 59, 0.5);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(71, 85, 105, 0.8);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 1);
}
</style>
