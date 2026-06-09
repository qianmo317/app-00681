<script setup>
import { computed } from 'vue'
import { ChevronRight, Plus, Trash2, Sparkles } from 'lucide-vue-next'
import { LEVELS } from '../data/levels'
import { useCustomLevels } from '../composables/useCustomLevels'

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
  }
})

const emit = defineEmits(['selectLevel', 'openEditor', 'deleteCustomLevel'])

const { customLevels, removeCustomLevel } = useCustomLevels()

// 合并后的全部关卡（用于渲染列表）
const allLevels = computed(() => [
  ...LEVELS.map((lv, i) => ({ ...lv, _custom: false, _customIndex: -1, _index: i })),
  ...customLevels.value.map((lv, i) => ({
    ...lv,
    _custom: true,
    _customIndex: i,
    _index: LEVELS.length + i
  }))
])

const handleDelete = (level, e) => {
  e.stopPropagation()
  if (!confirm(`确定要删除关卡"${level.name}"吗？`)) return
  removeCustomLevel(level._customIndex)
  emit('deleteCustomLevel', level._index)
}

const handleOpenEditor = () => {
  emit('openEditor')
}
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
    <div v-if="show" class="lg:hidden w-full max-w-lg mb-4 p-4 bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 z-10 absolute top-20 shadow-2xl max-h-[70vh] overflow-y-auto custom-scrollbar">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm text-slate-400">选择关卡：</p>
          <button
            @click="handleOpenEditor"
            class="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-purple-500/30 to-indigo-500/30 hover:from-purple-500/50 hover:to-indigo-500/50 border border-purple-400/40 text-purple-300 text-xs font-medium transition-all"
          >
            <Plus class="w-3.5 h-3.5" />
            新建
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="level in allLevels"
            :key="level._index"
            class="relative group"
          >
            <button
              @click="$emit('selectLevel', level._index)"
              :class="[
                'px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1',
                currentLevelIndex === level._index
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                  : level._custom
                    ? 'bg-purple-600/30 text-purple-200 border border-purple-400/30'
                    : 'bg-slate-600/50 text-slate-300'
              ]"
            >
              <Sparkles v-if="level._custom" class="w-3 h-3" />
              {{ level.name }}
            </button>
            <button
              v-if="level._custom"
              @click="handleDelete(level, $event)"
              class="absolute -top-1 -right-1 p-0.5 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 class="w-3 h-3" />
            </button>
          </div>
        </div>
    </div>
  </Transition>

  <!-- Desktop View -->
  <div v-else class="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar flex flex-col">
      <button
        v-for="level in allLevels"
        :key="level._index"
        @click="$emit('selectLevel', level._index)"
        :class="[
          'w-full text-left p-3 rounded-xl transition-all duration-200 border flex items-center justify-between group',
          currentLevelIndex === level._index
            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/50 text-cyan-400 shadow-md shadow-cyan-900/20'
            : level._custom
              ? 'bg-purple-900/10 border-purple-500/20 text-purple-300 hover:bg-purple-700/20'
              : 'bg-slate-900/20 border-transparent hover:bg-slate-700/30 text-slate-400 hover:text-slate-200'
        ]"
      >
        <div class="flex items-center gap-3 min-w-0">
            <div :class="['w-2 h-2 rounded-full flex-shrink-0', currentLevelIndex === level._index ? 'bg-cyan-400 animate-pulse' : level._custom ? 'bg-purple-400' : 'bg-slate-600']"></div>
            <Sparkles v-if="level._custom" class="w-3.5 h-3.5 flex-shrink-0 text-purple-400" />
            <span class="font-medium truncate">{{ level.name }}</span>
        </div>
        <div class="flex items-center gap-1 flex-shrink-0">
          <button
            v-if="level._custom"
            @click.stop="handleDelete(level, $event)"
            class="p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
            title="删除关卡"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
          <ChevronRight v-if="currentLevelIndex === level._index" class="w-4 h-4 opacity-100" />
        </div>
      </button>

      <!-- 新建关卡按钮 -->
      <button
        @click="handleOpenEditor"
        class="w-full mt-1 p-3 rounded-xl border border-dashed border-purple-400/40 hover:border-purple-400/80 bg-purple-500/5 hover:bg-purple-500/15 text-purple-300 transition-all flex items-center justify-center gap-2 group"
      >
        <Plus class="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
        <span class="font-medium text-sm">新建关卡</span>
      </button>
  </div>
</template>

<style scoped>
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
