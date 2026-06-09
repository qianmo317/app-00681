<script setup>
import { ref, computed } from 'vue'
import {
  X, Save, Trash2, Eraser, Square, Box, Target, User,
  RotateCcw, AlertCircle, CheckCircle2, Loader2, Mountain
} from 'lucide-vue-next'
import { useLevelEditor, TOOLS, CELL } from '../composables/useLevelEditor'
import { useCustomLevels } from '../composables/useCustomLevels'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close', 'saved'])

const {
  editorMap,
  editorRows,
  editorCols,
  currentTool,
  levelName,
  levelDifficulty,
  editorStats,
  selectTool,
  paintCell,
  resizeMap,
  clearMap,
  resetEditor,
  validateEditorMap,
  buildLevelData
} = useLevelEditor()

const { addCustomLevel } = useCustomLevels()

// 验证状态
const validation = ref({ ok: true, errors: [], message: '' })
const isValidating = ref(false)

// 拖拽绘制状态
const isPainting = ref(false)

// 工具按钮配置
const toolList = [
  { key: TOOLS.WALL, label: '墙壁', icon: Mountain, color: 'text-slate-200', bg: 'from-slate-600 to-slate-800' },
  { key: TOOLS.FLOOR, label: '地板', icon: Square, color: 'text-slate-300', bg: 'from-slate-500/40 to-slate-600/40' },
  { key: TOOLS.BOX, label: '箱子', icon: Box, color: 'text-orange-400', bg: 'from-amber-400 to-orange-500' },
  { key: TOOLS.GOAL, label: '终点', icon: Target, color: 'text-emerald-400', bg: 'from-emerald-500/30 to-emerald-700/30' },
  { key: TOOLS.PLAYER, label: '玩家', icon: User, color: 'text-cyan-400', bg: 'from-cyan-400 to-blue-500' },
  { key: TOOLS.ERASER, label: '橡皮', icon: Eraser, color: 'text-pink-400', bg: 'from-pink-500/30 to-pink-700/30' }
]

// 单元格样式（沿用 GameBoard 风格）
const getCellClass = (cell) => {
  const base = 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-md flex items-center justify-center text-base cursor-pointer transition-colors select-none'
  switch (cell) {
    case CELL.FLOOR:
      return `${base} bg-slate-800/40 border border-slate-700/40 hover:bg-slate-700/60`
    case CELL.WALL:
      return `${base} bg-slate-900 border border-slate-600 shadow-inner hover:bg-slate-800`
    case CELL.BOX:
      return `${base} bg-gradient-to-br from-amber-400 to-orange-500 shadow shadow-orange-500/30`
    case CELL.GOAL:
      return `${base} bg-slate-800/40 ring-2 ring-emerald-400/60 ring-inset`
    case CELL.PLAYER:
      return `${base} bg-gradient-to-br from-cyan-400 to-blue-500 shadow shadow-blue-500/40`
    case CELL.BOX_ON_GOAL:
      return `${base} bg-gradient-to-br from-emerald-400 to-green-500 shadow shadow-emerald-500/40`
    case CELL.PLAYER_ON_GOAL:
      return `${base} bg-gradient-to-br from-cyan-400 to-blue-500 shadow shadow-blue-500/40 ring-2 ring-emerald-400/60 ring-inset`
    default:
      return base
  }
}

const getCellEmoji = (cell) => {
  switch (cell) {
    case CELL.BOX: return '📦'
    case CELL.PLAYER: return '😊'
    case CELL.BOX_ON_GOAL: return '✅'
    case CELL.PLAYER_ON_GOAL: return '😊'
    default: return ''
  }
}

// 鼠标交互：支持点击 + 拖拽绘制
const handleCellMouseDown = (x, y) => {
  isPainting.value = true
  paintCell(x, y)
  // 修改后清掉验证结果，避免误导
  validation.value = { ok: true, errors: [], message: '' }
}

const handleCellMouseEnter = (x, y) => {
  if (!isPainting.value) return
  paintCell(x, y)
}

const handleMouseUp = () => {
  isPainting.value = false
}

// 触摸支持（移动端）
const handleCellTouchStart = (x, y, e) => {
  e.preventDefault()
  isPainting.value = true
  paintCell(x, y)
  validation.value = { ok: true, errors: [], message: '' }
}

const handleTouchMove = (e) => {
  if (!isPainting.value) return
  const touch = e.touches[0]
  if (!touch) return
  const el = document.elementFromPoint(touch.clientX, touch.clientY)
  if (!el) return
  const cellEl = el.closest('[data-cell]')
  if (!cellEl) return
  const x = parseInt(cellEl.getAttribute('data-x'))
  const y = parseInt(cellEl.getAttribute('data-y'))
  if (!isNaN(x) && !isNaN(y)) paintCell(x, y)
}

// 验证地图
const handleValidate = async () => {
  isValidating.value = true
  validation.value = { ok: true, errors: [], message: '' }
  // 下一帧执行（让 UI 显示加载状态）
  await new Promise(resolve => setTimeout(resolve, 30))
  const result = validateEditorMap()
  validation.value = {
    ok: result.ok,
    errors: result.errors,
    message: result.ok ? '验证通过！地图有解，可以保存。' : ''
  }
  isValidating.value = false
}

// 保存关卡
const handleSave = async () => {
  isValidating.value = true
  validation.value = { ok: true, errors: [], message: '' }
  await new Promise(resolve => setTimeout(resolve, 30))
  const result = validateEditorMap()
  if (!result.ok) {
    validation.value = { ok: false, errors: result.errors, message: '' }
    isValidating.value = false
    return
  }
  isValidating.value = false

  const level = buildLevelData()
  const newIndex = addCustomLevel(level)
  emit('saved', newIndex)
  // 重置编辑器，关闭弹窗
  resetEditor()
  validation.value = { ok: true, errors: [], message: '' }
  emit('close')
}

const handleClose = () => {
  emit('close')
}

const handleClear = () => {
  clearMap()
  validation.value = { ok: true, errors: [], message: '' }
}

const handleResize = () => {
  resizeMap(editorRows.value, editorCols.value)
  validation.value = { ok: true, errors: [], message: '' }
}

// 阻止滚动穿透到背后
const onOverlayWheel = (e) => {
  // 允许内部滚动，外层不需要特殊处理
}

// 工具说明
const currentToolLabel = computed(() => {
  const t = toolList.find(t => t.key === currentTool.value)
  return t ? t.label : ''
})
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto"
      @wheel="onOverlayWheel"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @touchend="handleMouseUp"
      @touchcancel="handleMouseUp"
    >
      <div class="relative w-full max-w-5xl my-auto bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700/60 shadow-2xl overflow-hidden">
        <!-- 头部 -->
        <div class="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700/50">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/30">
              <Box class="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 class="text-lg sm:text-xl font-bold text-white">关卡编辑器</h2>
              <p class="text-xs text-slate-400">设计你的专属推箱子关卡</p>
            </div>
          </div>
          <button
            @click="handleClose"
            class="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-600/70 text-slate-300 hover:text-white transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- 内容区域：工具栏 + 画板 -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 sm:p-6">

          <!-- 左侧：工具与设置 -->
          <div class="lg:col-span-4 flex flex-col gap-4">

            <!-- 关卡信息 -->
            <div class="bg-slate-900/50 rounded-2xl p-4 border border-slate-700/40">
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">关卡信息</h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-xs text-slate-400 mb-1">名称</label>
                  <input
                    v-model="levelName"
                    type="text"
                    maxlength="20"
                    placeholder="未命名自定义关卡"
                    class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label class="block text-xs text-slate-400 mb-1">难度</label>
                  <select
                    v-model="levelDifficulty"
                    class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="简单">简单</option>
                    <option value="中等">中等</option>
                    <option value="困难">困难</option>
                    <option value="自定义">自定义</option>
                  </select>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block text-xs text-slate-400 mb-1">行 (3-20)</label>
                    <input
                      v-model.number="editorRows"
                      type="number"
                      min="3"
                      max="20"
                      @change="handleResize"
                      class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label class="block text-xs text-slate-400 mb-1">列 (3-20)</label>
                    <input
                      v-model.number="editorCols"
                      type="number"
                      min="3"
                      max="20"
                      @change="handleResize"
                      class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- 工具栏 -->
            <div class="bg-slate-900/50 rounded-2xl p-4 border border-slate-700/40">
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">画笔工具</h3>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="tool in toolList"
                  :key="tool.key"
                  @click="selectTool(tool.key)"
                  :class="[
                    'p-3 rounded-xl border flex flex-col items-center gap-1 transition-all',
                    currentTool === tool.key
                      ? 'bg-slate-700/80 border-cyan-400/60 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/30'
                      : 'bg-slate-800/40 border-slate-700/40 hover:bg-slate-700/40'
                  ]"
                >
                  <component :is="tool.icon" :class="['w-5 h-5', tool.color]" />
                  <span class="text-xs text-slate-300">{{ tool.label }}</span>
                </button>
              </div>
              <p class="mt-3 text-xs text-slate-500">
                当前画笔：<span class="text-cyan-400 font-medium">{{ currentToolLabel }}</span>
              </p>
            </div>

            <!-- 状态信息 -->
            <div class="bg-slate-900/50 rounded-2xl p-4 border border-slate-700/40">
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">地图状态</h3>
              <div class="grid grid-cols-3 gap-2 text-center">
                <div class="bg-slate-800/60 rounded-lg p-2">
                  <div class="text-xs text-slate-500">玩家</div>
                  <div :class="['text-lg font-bold', editorStats.players === 1 ? 'text-emerald-400' : 'text-red-400']">
                    {{ editorStats.players }}
                  </div>
                </div>
                <div class="bg-slate-800/60 rounded-lg p-2">
                  <div class="text-xs text-slate-500">箱子</div>
                  <div :class="['text-lg font-bold', editorStats.boxes >= 1 ? 'text-amber-400' : 'text-red-400']">
                    {{ editorStats.boxes }}
                  </div>
                </div>
                <div class="bg-slate-800/60 rounded-lg p-2">
                  <div class="text-xs text-slate-500">终点</div>
                  <div :class="['text-lg font-bold', editorStats.goals >= 1 && editorStats.goals === editorStats.boxes ? 'text-emerald-400' : 'text-red-400']">
                    {{ editorStats.goals }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="grid grid-cols-2 gap-2">
              <button
                @click="handleClear"
                class="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-700/50 hover:bg-amber-500/20 hover:text-amber-400 border border-slate-600/30 hover:border-amber-500/50 transition-all"
              >
                <RotateCcw class="w-4 h-4" />
                <span class="text-sm font-medium">清空</span>
              </button>
              <button
                @click="handleValidate"
                :disabled="isValidating"
                class="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-700/50 hover:bg-cyan-500/20 hover:text-cyan-400 border border-slate-600/30 hover:border-cyan-500/50 transition-all disabled:opacity-50"
              >
                <Loader2 v-if="isValidating" class="w-4 h-4 animate-spin" />
                <CheckCircle2 v-else class="w-4 h-4" />
                <span class="text-sm font-medium">验证</span>
              </button>
            </div>
          </div>

          <!-- 右侧：画板 -->
          <div class="lg:col-span-8 flex flex-col gap-4">
            <div class="bg-slate-900/50 rounded-2xl p-4 border border-slate-700/40 flex-1 flex flex-col items-center justify-center">
              <div class="overflow-auto max-h-[55vh] max-w-full p-2">
                <div
                  class="inline-grid gap-0.5"
                  :style="{ gridTemplateColumns: `repeat(${editorMap[0]?.length || 1}, minmax(0, 1fr))` }"
                  @touchmove="handleTouchMove"
                >
                  <template v-for="(row, y) in editorMap" :key="y">
                    <div
                      v-for="(cell, x) in row"
                      :key="`${x}-${y}`"
                      :data-cell="true"
                      :data-x="x"
                      :data-y="y"
                      :class="getCellClass(cell)"
                      @mousedown.prevent="handleCellMouseDown(x, y)"
                      @mouseenter="handleCellMouseEnter(x, y)"
                      @touchstart.prevent="handleCellTouchStart(x, y, $event)"
                    >
                      <span>{{ getCellEmoji(cell) }}</span>
                    </div>
                  </template>
                </div>
              </div>
              <p class="mt-3 text-xs text-slate-500 text-center">
                💡 点击或按住拖拽，使用画笔在地图上绘制
              </p>
            </div>

            <!-- 验证结果 -->
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <div v-if="validation.errors.length > 0" class="bg-red-500/10 border border-red-500/40 rounded-2xl p-3 flex items-start gap-2">
                <AlertCircle class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div class="flex-1">
                  <div class="text-sm font-medium text-red-300 mb-1">地图验证失败</div>
                  <ul class="text-xs text-red-200/80 space-y-0.5 list-disc list-inside">
                    <li v-for="(err, i) in validation.errors" :key="i">{{ err }}</li>
                  </ul>
                </div>
              </div>
              <div v-else-if="validation.message" class="bg-emerald-500/10 border border-emerald-500/40 rounded-2xl p-3 flex items-start gap-2">
                <CheckCircle2 class="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div class="text-sm text-emerald-300">{{ validation.message }}</div>
              </div>
            </Transition>

            <!-- 保存按钮 -->
            <div class="flex gap-3">
              <button
                @click="handleClose"
                class="flex-1 px-5 py-3 rounded-xl bg-slate-700/50 hover:bg-slate-600 text-slate-200 font-medium border border-slate-600/30 transition-all"
              >
                取消
              </button>
              <button
                @click="handleSave"
                :disabled="isValidating"
                class="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50"
              >
                <Loader2 v-if="isValidating" class="w-5 h-5 animate-spin" />
                <Save v-else class="w-5 h-5" />
                <span>保存关卡</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* 隐藏 number 输入的箭头（更紧凑） */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
