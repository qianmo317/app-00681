<script setup>
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Undo2, RotateCcw } from 'lucide-vue-next'

defineProps({
  history: {
    type: Array,
    required: true
  },
  isMoving: {
    type: Boolean,
    required: true
  }
})

defineEmits(['undo', 'reset', 'moveUp', 'moveDown', 'moveLeft', 'moveRight'])
</script>

<template>
  <div class="lg:hidden mt-8 w-full max-w-xs grid grid-cols-3 gap-3">
    <div></div>
    <button @click="$emit('moveUp')" class="p-4 rounded-2xl bg-slate-700 shadow-xl border border-slate-600 text-cyan-400 flex justify-center active:scale-95 transition-transform hover:bg-slate-600"><ChevronUp class="w-8 h-8"/></button>
    <div></div>
    <button @click="$emit('moveLeft')" class="p-4 rounded-2xl bg-slate-700 shadow-xl border border-slate-600 text-cyan-400 flex justify-center active:scale-95 transition-transform hover:bg-slate-600"><ChevronLeft class="w-8 h-8"/></button>
    <button @click="$emit('moveDown')" class="p-4 rounded-2xl bg-slate-700 shadow-xl border border-slate-600 text-cyan-400 flex justify-center active:scale-95 transition-transform hover:bg-slate-600"><ChevronDown class="w-8 h-8"/></button>
    <button @click="$emit('moveRight')" class="p-4 rounded-2xl bg-slate-700 shadow-xl border border-slate-600 text-cyan-400 flex justify-center active:scale-95 transition-transform hover:bg-slate-600"><ChevronRight class="w-8 h-8"/></button>
  </div>
  <div class="lg:hidden flex gap-4 mt-6">
    <button @click="$emit('undo')" :disabled="history.length===0" class="flex flex-col items-center gap-1 bg-slate-700/80 border border-slate-600 px-6 py-2 rounded-xl shadow-lg text-slate-200 active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"><Undo2 class="w-6 h-6"/> <span class="text-xs font-medium">撤销</span></button>
      <button @click="$emit('reset')" class="flex flex-col items-center gap-1 bg-slate-700/80 border border-slate-600 px-6 py-2 rounded-xl shadow-lg text-amber-400 active:scale-95 transition-transform"><RotateCcw class="w-6 h-6"/> <span class="text-xs font-medium">重置</span></button>
  </div>
</template>
