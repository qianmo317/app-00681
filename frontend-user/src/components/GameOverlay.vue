<script setup>
import { Trophy } from 'lucide-vue-next'

defineProps({
  isGameWon: {
    type: Boolean,
    required: true
  },
  steps: {
    type: Number,
    required: true
  },
  hasNextLevel: {
    type: Boolean,
    required: true
  }
})

defineEmits(['reset', 'nextLevel'])
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-500 ease-out"
    enter-from-class="opacity-0 scale-75 translate-y-4"
    enter-to-class="opacity-100 scale-100 translate-y-0"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100 scale-100 translate-y-0"
    leave-to-class="opacity-0 scale-75 translate-y-4"
  >
    <div v-if="isGameWon" class="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
      <div class="pointer-events-auto p-6 lg:p-8 rounded-3xl bg-slate-800/95 backdrop-blur-2xl border-2 border-emerald-400/50 shadow-2xl shadow-emerald-500/20 text-center transform transition-all hover:scale-105">
        <div class="flex items-center justify-center gap-3 mb-3">
          <Trophy class="w-10 h-10 text-amber-400 animate-bounce" />
          <span class="text-3xl font-bold text-emerald-400 bg-clip-text">恭喜通关！</span>
        </div>
        <p class="text-slate-300 mb-6 text-lg">耗时 <span class="text-amber-400 font-bold text-xl">{{ steps }}</span> 步</p>
        <div class="flex gap-4 justify-center">
          <button @click="$emit('reset')" class="px-6 py-2 rounded-xl bg-slate-600 hover:bg-slate-500 text-white font-medium transition-colors">重玩</button>
          <button v-if="hasNextLevel" @click="$emit('nextLevel')" class="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium shadow-lg shadow-emerald-500/30 transition-colors">下一关</button>
        </div>
      </div>
    </div>
  </Transition>
</template>
