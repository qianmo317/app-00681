<script setup>
import { Trophy, RotateCcw, Undo2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps({
  gameMap: {
    type: Array,
    required: true
  }
})

/**
 * 获取单元格的 CSS 类名
 */
const getCellClass = (cell) => {
  const baseClass = 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg transition-all duration-150 flex items-center justify-center text-lg sm:text-xl md:text-2xl'
  
  switch (cell) {
    case 0: // 地板
      return `${baseClass} bg-slate-800/40 border border-slate-700/30`
    case 1: // 墙壁
      return `${baseClass} bg-slate-900 border border-slate-600 shadow-inner`
    case 2: // 箱子
      return `${baseClass} bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/30`
    case 3: // 终点
      return `${baseClass} bg-slate-800/40 ring-2 ring-emerald-400/60 ring-inset`
    case 4: // 玩家
      return `${baseClass} bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-blue-500/40`
    case 5: // 箱子在终点上
      return `${baseClass} bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/40`
    case 6: // 玩家在终点上
      return `${baseClass} bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-blue-500/40 ring-2 ring-emerald-400/60 ring-inset`
    default:
      return baseClass
  }
}

/**
 * 获取单元格内显示的 emoji
 */
const getCellEmoji = (cell) => {
  switch (cell) {
    case 2: return '📦' // 箱子
    case 4: return '😊' // 玩家
    case 5: return '✅' // 箱子在终点上
    case 6: return '😊' // 玩家在终点上
    default: return ''
  }
}
</script>

<template>
  <div class="relative group w-full max-w-lg lg:max-w-none flex flex-col items-center">
    
    <!-- 地图主体 -->
    <div 
      class="inline-grid gap-1 p-3 sm:p-4 lg:p-6 bg-slate-900/50 rounded-2xl lg:rounded-3xl shadow-2xl shadow-black/20 border border-slate-700/30 transition-all duration-500 lg:scale-110 xl:scale-125"
      :style="{ gridTemplateColumns: `repeat(${gameMap[0]?.length || 7}, minmax(0, 1fr))` }"
    >
      <TransitionGroup name="cell">
        <template v-for="(row, y) in gameMap" :key="y">
          <div
            v-for="(cell, x) in row"
            :key="`${x}-${y}`"
            :class="getCellClass(cell)"
          >
            <span class="select-none">{{ getCellEmoji(cell) }}</span>
          </div>
        </template>
      </TransitionGroup>
    </div>
    
    <!-- 插槽：用于放置胜利覆盖层 -->
    <slot name="overlay"></slot>
  </div>
</template>

<style scoped>
/* 单元格过渡动画 */
.cell-move,
.cell-enter-active,
.cell-leave-active {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.cell-enter-from,
.cell-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
