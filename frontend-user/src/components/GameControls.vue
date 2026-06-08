<script setup>
import { Undo2, RotateCcw } from 'lucide-vue-next'

defineProps({
  history: {
    type: Array,
    required: true
  },
  isMoving: {
    type: Boolean,
    required: true
  },
  steps: {
    type: Number,
    required: true
  }
})

defineEmits(['undo', 'reset'])
</script>

<template>
  <div class="bg-slate-800/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 shadow-xl flex flex-col gap-6">
    
    <!-- 步数显示 -->
    <div class="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/40 border border-slate-700/30">
       <span class="text-xs sm:text-sm text-slate-500 font-bold uppercase tracking-widest mb-1">当前步数</span>
       <span class="text-5xl font-black text-amber-400 tabular-nums tracking-tight drop-shadow-md">{{ steps }}</span>
    </div>

    <!-- 控制按钮组 -->
    <div class="grid grid-cols-2 gap-3">
       <button 
          @click="$emit('undo')" 
          :disabled="history.length === 0 || isMoving"
          class="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-700/50 hover:bg-cyan-500/10 hover:text-cyan-400 border border-slate-600/30 hover:border-cyan-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
        >
          <Undo2 class="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span class="font-medium">撤销</span>
       </button>
       <button 
          @click="$emit('reset')" 
          class="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-700/50 hover:bg-amber-500/10 hover:text-amber-400 border border-slate-600/30 hover:border-amber-500/50 transition-all group"
        >
          <RotateCcw class="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          <span class="font-medium">重置</span>
       </button>
    </div>
  </div>
</template>
