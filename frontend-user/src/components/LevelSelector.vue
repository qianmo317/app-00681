<script setup>
import { computed } from 'vue'
import { ChevronRight, Plus } from 'lucide-vue-next'
import { LEVELS } from '../data/levels'

const props = defineProps({
  currentLevelIndex: {
    type: Number,
    required: true
  },
  isMobile: {
    type: Boolean,
    default: false
  },
  show: {
    type: Boolean,
    default: true
  },
  customLevels: {
    type: Array,
    default: () => []
  },
  showEditorButton: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['selectLevel', 'openEditor'])

const allLevels = computed(() => {
  return [...LEVELS, ...props.customLevels]
})
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
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm text-slate-400">选择关卡：</p>
          <button
            v-if="showEditorButton"
            @click="$emit('openEditor')"
            class="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium hover:shadow-lg transition-all"
          >
            <Plus class="w-3 h-3" /> 编辑器
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="(level, index) in allLevels"
            :key="index"
            @click="$emit('selectLevel', index)"
            :class="[
              'px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
              currentLevelIndex === index
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                : level.isCustom
                  ? 'bg-purple-600/40 text-purple-200'
                  : 'bg-slate-600/50 text-slate-300'
            ]"
          >
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
            ? level.isCustom
              ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 text-purple-400 shadow-md shadow-purple-900/20'
              : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/50 text-cyan-400 shadow-md shadow-cyan-900/20'
            : 'bg-slate-900/20 border-transparent hover:bg-slate-700/30 text-slate-400 hover:text-slate-200'
        ]"
      >
        <div class="flex items-center gap-3">
            <div :class="['w-2 h-2 rounded-full', currentLevelIndex === index ? (level.isCustom ? 'bg-purple-400 animate-pulse' : 'bg-cyan-400 animate-pulse') : level.isCustom ? 'bg-purple-600' : 'bg-slate-600']"></div>
            <div class="flex flex-col">
              <span class="font-medium">{{ level.name }}</span>
              <span v-if="level.isCustom" class="text-xs opacity-70">自定义关卡</span>
            </div>
        </div>
        <ChevronRight v-if="currentLevelIndex === index" class="w-4 h-4 opacity-100" />
      </button>
      
      <button
        v-if="showEditorButton"
        @click="$emit('openEditor')"
        class="w-full text-left p-3 rounded-xl transition-all duration-200 border border-dashed border-purple-500/30 hover:border-purple-500/50 bg-purple-900/10 hover:bg-purple-900/20 text-purple-400 hover:text-purple-300 flex items-center gap-3"
      >
        <Plus class="w-4 h-4" />
        <span class="font-medium">关卡编辑器</span>
      </button>
  </div>
</template>
