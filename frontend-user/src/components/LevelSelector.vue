<script setup>
import { ChevronRight, Plus } from 'lucide-vue-next'
import { PRESET_LEVELS } from '../data/levels'

defineProps({
  currentLevelIndex: {
    type: Number,
    required: true
  },
  levels: {
    type: Array,
    required: true
  },
  isMobile: {
    type: Boolean,
    default: false
  },
  show: {
    type: Boolean,
    default: true
  }
})

defineEmits(['selectLevel', 'openEditor'])
</script>

<template>
  <!-- Mobile View -->
  <Transition
    v-if="isMobile"
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div v-if="show" class="lg:hidden w-full max-w-lg mb-4 p-4 bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 z-10 absolute top-20 shadow-2xl">
        <p class="text-sm text-slate-400 mb-2">选择关卡：</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="(level, index) in levels"
            :key="index"
            @click="$emit('selectLevel', index)"
            :class="[
              'px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
              currentLevelIndex === index
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                : index >= PRESET_LEVELS.length
                  ? 'bg-purple-600/50 text-purple-200'
                  : 'bg-slate-600/50 text-slate-300'
            ]"
          >
            {{ level.name }}
          </button>
          <button
            @click="$emit('openEditor')"
            class="px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 flex items-center gap-1"
          >
            <Plus class="w-4 h-4" />
            编辑器
          </button>
        </div>
    </div>
  </Transition>

  <!-- Desktop View -->
  <div v-else class="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
      <button
        v-for="(level, index) in levels"
        :key="index"
        @click="$emit('selectLevel', index)"
        :class="[
          'w-full text-left p-3 rounded-xl transition-all duration-200 border flex items-center justify-between group',
          currentLevelIndex === index
            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/50 text-cyan-400 shadow-md shadow-cyan-900/20'
            : index >= PRESET_LEVELS.length
              ? 'bg-purple-900/20 border-transparent hover:bg-purple-700/30 text-purple-400 hover:text-purple-200'
              : 'bg-slate-900/20 border-transparent hover:bg-slate-700/30 text-slate-400 hover:text-slate-200'
        ]"
      >
        <div class="flex items-center gap-3">
            <div :class="['w-2 h-2 rounded-full', currentLevelIndex === index ? 'bg-cyan-400 animate-pulse' : index >= PRESET_LEVELS.length ? 'bg-purple-500' : 'bg-slate-600']"></div>
            <span class="font-medium">{{ level.name }}</span>
            <span v-if="index >= PRESET_LEVELS.length" class="text-xs bg-purple-500/20 px-2 py-0.5 rounded-full text-purple-300">自定义</span>
        </div>
        <ChevronRight v-if="currentLevelIndex === index" class="w-4 h-4 opacity-100" />
      </button>

      <button
        @click="$emit('openEditor')"
        class="w-full text-left p-3 rounded-xl transition-all duration-200 border flex items-center gap-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-400 hover:from-emerald-500/20 hover:to-teal-500/20 group"
      >
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Plus class="w-5 h-5 text-white" />
        </div>
        <span class="font-medium">创建新关卡</span>
      </button>
  </div>
</template>
