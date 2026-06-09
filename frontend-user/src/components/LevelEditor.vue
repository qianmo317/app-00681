<script setup>
import { ref, onMounted, computed } from 'vue'
import { 
  Pencil, Eraser, Box, Target, User, 
  Save, Trash2, Play, Plus, Minus,
  Check, X, Info, ArrowLeft, Edit3
} from 'lucide-vue-next'
import { useLevelEditor, TOOL_TYPES, CELL_TYPES } from '../composables/useLevelEditor'

const emit = defineEmits(['close', 'playLevel'])

const {
  editorMap,
  mapWidth,
  mapHeight,
  currentTool,
  customLevels,
  levelName,
  getStats,
  initEditor,
  handleCellClick,
  handleMouseDown,
  handleMouseEnter,
  handleMouseUp,
  resizeMap,
  clearMap,
  validateBasic,
  canSolve,
  saveLevel,
  deleteLevel,
  editLevel
} = useLevelEditor()

const activeTab = ref('editor')
const validationResult = ref(null)
const showSaveSuccess = ref(false)
const saveError = ref('')

const tools = [
  { type: TOOL_TYPES.WALL, icon: Pencil, label: '墙壁', color: 'from-slate-500 to-slate-700' },
  { type: TOOL_TYPES.FLOOR, icon: Eraser, label: '地板', color: 'from-slate-600 to-slate-800' },
  { type: TOOL_TYPES.BOX, icon: Box, label: '箱子', color: 'from-amber-400 to-orange-500' },
  { type: TOOL_TYPES.TARGET, icon: Target, label: '终点', color: 'from-emerald-400 to-green-500' },
  { type: TOOL_TYPES.PLAYER, icon: User, label: '玩家', color: 'from-cyan-400 to-blue-500' }
]

const getCellClass = (cell) => {
  const baseClass = 'w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition-all duration-100 flex items-center justify-center text-sm cursor-pointer hover:scale-105 active:scale-95'
  
  switch (cell) {
    case CELL_TYPES.FLOOR:
      return `${baseClass} bg-slate-800/40 border border-slate-700/30`
    case CELL_TYPES.WALL:
      return `${baseClass} bg-slate-900 border border-slate-600 shadow-inner`
    case CELL_TYPES.BOX:
      return `${baseClass} bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/30`
    case CELL_TYPES.TARGET:
      return `${baseClass} bg-slate-800/40 ring-2 ring-emerald-400/60 ring-inset`
    case CELL_TYPES.PLAYER:
      return `${baseClass} bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-blue-500/40`
    case CELL_TYPES.BOX_ON_TARGET:
      return `${baseClass} bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/40`
    case CELL_TYPES.PLAYER_ON_TARGET:
      return `${baseClass} bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-blue-500/40 ring-2 ring-emerald-400/60 ring-inset`
    default:
      return baseClass
  }
}

const getCellEmoji = (cell) => {
  switch (cell) {
    case CELL_TYPES.BOX: return '📦'
    case CELL_TYPES.PLAYER: return '😊'
    case CELL_TYPES.BOX_ON_TARGET: return '✅'
    case CELL_TYPES.PLAYER_ON_TARGET: return '😊'
    default: return ''
  }
}

const basicErrors = computed(() => validateBasic())

const checkSolvability = () => {
  validationResult.value = canSolve()
  setTimeout(() => {
    validationResult.value = null
  }, 3000)
}

const handleSave = () => {
  saveError.value = ''
  const result = saveLevel()
  if (result.success) {
    showSaveSuccess.value = true
    setTimeout(() => {
      showSaveSuccess.value = false
    }, 2000)
  } else {
    saveError.value = result.error
  }
}

const handlePlayLevel = (index) => {
  const globalIndex = 3 + index
  emit('playLevel', globalIndex)
}

const handleEditCustomLevel = (index) => {
  editLevel(index)
  activeTab.value = 'editor'
}

const handleDeleteLevel = (index) => {
  if (confirm('确定要删除这个自定义关卡吗？')) {
    deleteLevel(index)
  }
}

const adjustWidth = (delta) => {
  const newWidth = Math.max(5, Math.min(20, mapWidth.value + delta))
  resizeMap(newWidth, mapHeight.value)
}

const adjustHeight = (delta) => {
  const newHeight = Math.max(5, Math.min(20, mapHeight.value + delta))
  resizeMap(mapWidth.value, newHeight)
}

onMounted(() => {
  initEditor()
})
</script>

<template>
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div 
      class="bg-slate-800/95 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    >
      <div class="flex items-center justify-between p-5 border-b border-slate-700/50">
        <div class="flex items-center gap-3">
          <button 
            @click="$emit('close')"
            class="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <div>
            <h2 class="text-xl font-bold text-white">关卡编辑器</h2>
            <p class="text-xs text-slate-400">设计属于你的推箱子关卡</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            @click="activeTab = 'editor'"
            :class="[
              'px-4 py-2 rounded-xl text-sm font-medium transition-all',
              activeTab === 'editor'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
            ]"
          >
            <Edit3 class="w-4 h-4 inline-block mr-1" /> 编辑
          </button>
          <button
            @click="activeTab = 'levels'"
            :class="[
              'px-4 py-2 rounded-xl text-sm font-medium transition-all',
              activeTab === 'levels'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
            ]"
          >
            <Box class="w-4 h-4 inline-block mr-1" /> 我的关卡
          </button>
        </div>
      </div>

      <div v-if="activeTab === 'editor'" class="flex-1 overflow-y-auto p-5">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-4">
            <div class="bg-slate-900/50 rounded-2xl p-4 border border-slate-700/30">
              <div class="flex items-center gap-3 mb-3">
                <label class="text-sm font-medium text-slate-300">关卡名称：</label>
                <input
                  v-model="levelName"
                  type="text"
                  class="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="输入关卡名称"
                />
              </div>
            </div>

            <div class="bg-slate-900/50 rounded-2xl p-4 border border-slate-700/30 flex flex-col items-center">
              <div 
                class="inline-grid gap-1 p-3 bg-slate-900/80 rounded-2xl border border-slate-700/30 select-none"
                :style="{ gridTemplateColumns: `repeat(${mapWidth}, minmax(0, 1fr))` }"
              >
                <template v-for="(row, y) in editorMap" :key="y">
                  <div
                    v-for="(cell, x) in row"
                    :key="`${x}-${y}`"
                    :class="getCellClass(cell)"
                    @mousedown.prevent="handleMouseDown(x, y)"
                    @mouseenter="handleMouseEnter(x, y)"
                    @click="handleCellClick(x, y)"
                  >
                    <span class="select-none">{{ getCellEmoji(cell) }}</span>
                  </div>
                </template>
              </div>
            </div>

            <div class="bg-slate-900/50 rounded-2xl p-4 border border-slate-700/30">
              <h3 class="text-sm font-bold text-slate-300 mb-3">工具（点击或拖拽绘制）</h3>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="tool in tools"
                  :key="tool.type"
                  @click="currentTool = tool.type"
                  :class="[
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    currentTool === tool.type
                      ? `bg-gradient-to-r ${tool.color} text-white shadow-lg scale-105`
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  ]"
                >
                  <component :is="tool.icon" class="w-4 h-4" />
                  {{ tool.label }}
                </button>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div class="bg-slate-900/50 rounded-2xl p-4 border border-slate-700/30">
              <h3 class="text-sm font-bold text-slate-300 mb-3">地图尺寸</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-400">宽度</span>
                  <div class="flex items-center gap-2">
                    <button
                      @click="adjustWidth(-1)"
                      class="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors"
                    >
                      <Minus class="w-4 h-4" />
                    </button>
                    <span class="w-8 text-center font-bold">{{ mapWidth }}</span>
                    <button
                      @click="adjustWidth(1)"
                      class="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors"
                    >
                      <Plus class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-400">高度</span>
                  <div class="flex items-center gap-2">
                    <button
                      @click="adjustHeight(-1)"
                      class="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors"
                    >
                      <Minus class="w-4 h-4" />
                    </button>
                    <span class="w-8 text-center font-bold">{{ mapHeight }}</span>
                    <button
                      @click="adjustHeight(1)"
                      class="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors"
                    >
                      <Plus class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-slate-900/50 rounded-2xl p-4 border border-slate-700/30">
              <h3 class="text-sm font-bold text-slate-300 mb-3">当前状态</h3>
              <div class="space-y-2 text-sm">
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">玩家</span>
                  <span :class="getStats.playerCount === 1 ? 'text-emerald-400' : 'text-rose-400'" class="font-bold">
                    {{ getStats.playerCount }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">箱子</span>
                  <span :class="getStats.boxCount > 0 ? 'text-amber-400' : 'text-rose-400'" class="font-bold">
                    {{ getStats.boxCount }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">终点</span>
                  <span :class="getStats.targetCount > 0 ? 'text-emerald-400' : 'text-rose-400'" class="font-bold">
                    {{ getStats.targetCount }}
                  </span>
                </div>
              </div>
            </div>

            <div v-if="basicErrors.length > 0" class="bg-rose-500/10 rounded-2xl p-4 border border-rose-500/30">
              <div class="flex items-start gap-2">
                <Info class="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div class="space-y-1">
                  <p v-for="(error, index) in basicErrors" :key="index" class="text-sm text-rose-300">
                    {{ error }}
                  </p>
                </div>
              </div>
            </div>

            <div v-if="validationResult" class="rounded-2xl p-4 border" :class="validationResult.solvable ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'">
              <div class="flex items-center gap-2">
                <component :is="validationResult.solvable ? Check : X" :class="validationResult.solvable ? 'text-emerald-400' : 'text-rose-400'" class="w-5 h-5" />
                <span class="text-sm font-medium" :class="validationResult.solvable ? 'text-emerald-300' : 'text-rose-300'">
                  {{ validationResult.solvable ? '关卡可解！' : validationResult.reason }}
                </span>
              </div>
            </div>

            <div v-if="showSaveSuccess" class="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/30">
              <div class="flex items-center gap-2">
                <Check class="w-5 h-5 text-emerald-400" />
                <span class="text-sm font-medium text-emerald-300">关卡保存成功！</span>
              </div>
            </div>

            <div v-if="saveError" class="bg-rose-500/10 rounded-2xl p-4 border border-rose-500/30">
              <div class="flex items-start gap-2">
                <X class="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <span class="text-sm text-rose-300">{{ saveError }}</span>
              </div>
            </div>

            <div class="space-y-2">
              <button
                @click="checkSolvability"
                class="w-full px-4 py-3 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 font-medium transition-all flex items-center justify-center gap-2"
              >
                <Check class="w-5 h-5" />
                验证可解性
              </button>
              <button
                @click="clearMap"
                class="w-full px-4 py-3 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 font-medium transition-all flex items-center justify-center gap-2"
              >
                <Trash2 class="w-5 h-5" />
                清空地图
              </button>
              <button
                @click="handleSave"
                :disabled="basicErrors.length > 0"
                :class="[
                  'w-full px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2',
                  basicErrors.length > 0
                    ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:scale-[1.02]'
                ]"
              >
                <Save class="w-5 h-5" />
                保存关卡
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="flex-1 overflow-y-auto p-5">
        <div v-if="customLevels.length === 0" class="flex flex-col items-center justify-center h-64 text-center">
          <Box class="w-16 h-16 text-slate-600 mb-4" />
          <p class="text-slate-400 mb-2">还没有自定义关卡</p>
          <p class="text-sm text-slate-500">切换到「编辑」标签页开始设计你的第一个关卡吧！</p>
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="(level, index) in customLevels"
            :key="index"
            class="bg-slate-900/50 rounded-2xl p-4 border border-slate-700/30 hover:border-slate-600/50 transition-all"
          >
            <div class="flex items-start justify-between mb-3">
              <div>
                <h3 class="font-bold text-white">{{ level.name }}</h3>
                <p class="text-xs text-slate-400">自定义关卡</p>
              </div>
            </div>
            <div class="flex justify-center mb-4">
              <div 
                class="inline-grid gap-0.5 p-2 bg-slate-800/50 rounded-xl"
                :style="{ gridTemplateColumns: `repeat(${level.map[0]?.length || 7}, minmax(0, 1fr))` }"
              >
                <template v-for="(row, y) in level.map.slice(0, 8)" :key="y">
                  <div
                    v-for="(cell, x) in row.slice(0, 8)"
                    :key="`${x}-${y}`"
                    :class="[
                      'w-3 h-3 sm:w-4 sm:h-4 rounded',
                      cell === 1 ? 'bg-slate-600' :
                      cell === 2 || cell === 5 ? 'bg-amber-500' :
                      cell === 3 ? 'bg-emerald-500/50 ring-1 ring-emerald-400' :
                      cell === 4 || cell === 6 ? 'bg-cyan-500' :
                      'bg-slate-700/30'
                    ]"
                  />
                </template>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                @click="handlePlayLevel(index)"
                class="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium hover:shadow-lg transition-all flex items-center justify-center gap-1"
              >
                <Play class="w-4 h-4" />
                开始
              </button>
              <button
                @click="handleEditCustomLevel(index)"
                class="px-3 py-2 rounded-xl bg-slate-700/50 text-slate-300 text-sm hover:bg-slate-600/50 transition-all"
              >
                <Edit3 class="w-4 h-4" />
              </button>
              <button
                @click="handleDeleteLevel(index)"
                class="px-3 py-2 rounded-xl bg-rose-500/20 text-rose-400 text-sm hover:bg-rose-500/30 transition-all"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
