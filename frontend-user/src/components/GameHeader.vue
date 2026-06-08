<script setup>
import { Settings, Gamepad2 } from 'lucide-vue-next'

defineProps({
  steps: {
    type: Number,
    required: true
  },
  showSettings: {
    type: Boolean,
    required: true
  }
})

defineEmits(['toggleSettings'])
</script>

<template>
  <div class="lg:hidden w-full max-w-lg mb-4 flex items-center justify-between p-4 bg-slate-800/60 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-700/50">
    <div class="flex items-center gap-2">
      <Gamepad2 class="w-6 h-6 text-cyan-400" />
      <h1 class="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">推箱子</h1>
    </div>
    <div class="flex items-center gap-3">
       <span class="text-sm font-bold text-amber-400 bg-slate-700/50 px-3 py-1 rounded-lg">Step: {{ steps }}</span>
      <button @click="$emit('toggleSettings')" class="p-2 bg-slate-700/50 rounded-lg text-cyan-400">
        <Settings class="w-5 h-5"/>
      </button>
    </div>
  </div>
</template>
