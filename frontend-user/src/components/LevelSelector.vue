<script setup>
import { ChevronRight, Star } from 'lucide-vue-next'

defineProps({
  currentLevelIndex: {
    type: Number,
    required: true
  },
  allLevels: {
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

defineEmits(['selectLevel'])
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
            v-for="(level, index) in allLevels"
            :key="index"
            @click="$emit('selectLevel', index)"
            :class="[
              'px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5',
              currentLevelIndex === index
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                : level.isCustom
                  ? 'bg-violet-600/30 text-violet-300 border border-violet-500/30'
                  : 'bg-slate-600/50 text-slate-300'
            ]"
          >
            <Star v-if="level.isCustom" class="w-3 h-3" />
            {{ level.name }}
          </button>
        </div>
    </div>
  </Transition>

  <!-- Desktop View -->
  <div v-else class="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
      <button
        v-for="(level, index) in allLevels"
        :key="index"
        @click="$emit('selectLevel', index)"
        :class="[
          'w-full text-left p-3 rounded-xl transition-all duration-200 border flex items-center justify-between group',
          currentLevelIndex === index
            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/50 text-cyan-400 shadow-md shadow-cyan-900/20'
            : level.isCustom
              ? 'bg-violet-500/5 border-violet-500/20 hover:bg-violet-500/10 text-violet-300 hover:text-violet-200'
              : 'bg-slate-900/20 border-transparent hover:bg-slate-700/30 text-slate-400 hover:text-slate-200'
        ]"
      >
        <div class="flex items-center gap-3">
            <div :class="[
              'w-2 h-2 rounded-full',
              currentLevelIndex === index ? 'bg-cyan-400 animate-pulse' : level.isCustom ? 'bg-violet-400' : 'bg-slate-600'
            ]"></div>
            <span class="font-medium flex items-center gap-1.5">
              <Star v-if="level.isCustom" class="w-3.5 h-3.5 text-violet-400" />
              {{ level.name }}
            </span>
        </div>
        <ChevronRight v-if="currentLevelIndex === index" class="w-4 h-4 opacity-100" />
      </button>
  </div>
</template>
