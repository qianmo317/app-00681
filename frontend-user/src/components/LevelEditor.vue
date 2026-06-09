<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Save, Trash2, Eraser, Grid3x3, ArrowLeft, AlertCircle, CheckCircle, X } from 'lucide-vue-next'
import { useLevelEditor } from '../composables/useLevelEditor'

const emit = defineEmits(['back', 'playLevel'])

const {
  editorMap,
  rows,
  cols,
  currentTool,
  currentToolConfig,
  levelName,
  isPainting,
  TOOLS,
  initEditor,
  resizeMap,
  onCellMouseDown,
  onCellMouseEnter,
  onCellMouseUp,
  validateMap,
  saveLevel,
  clearMap,
  loadLevelToEditor
} = useLevelEditor()

const validationErrors = ref([])
const saveSuccess = ref(false)
const showSaveSuccess = ref(false)
const showValidationModal = ref(false)
const pendingLevel = ref(null)

const toolColorMap = {
  wall: 'from-slate-600 to-slate-700 border-slate-500',
  floor: 'from-gray-500 to-gray-600 border-gray-400',
  box: 'from-amber-500 to-orange-500 border-amber-400',
  target: 'from-emerald-500 to-green-500 border-emerald-400',
  player: 'from-cyan-500 to-blue-500 border-cyan-400',
  eraser: 'from-rose-500 to-pink-500 border-rose-400'
}

const toolActiveColorMap = {
  wall: 'ring-slate-400 shadow-slate-500/40',
  floor: 'ring-gray-300 shadow-gray-400/40',
  box: 'ring-amber-400 shadow-amber-500/40',
  target: 'ring-emerald-400 shadow-emerald-500/40',
  player: 'ring-cyan-400 shadow-cyan-500/40',
  eraser: 'ring-rose-400 shadow-rose-500/40'
}

const getEditorCellClass = (cell) => {
  const base = 'w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-md transition-all duration-100 flex items-center justify-center text-sm sm:text-base md:text-lg cursor-pointer select-none'
  switch (cell) {
    case 0: return `${base} bg-slate-800/40 border border-slate-700/30 hover:bg-slate-700/40`
    case 1: return `${base} bg-slate-900 border border-slate-600 shadow-inner`
    case 2: return `${base} bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-orange-500/20`
    case 3: return `${base} bg-slate-800/40 ring-2 ring-emerald-400/60 ring-inset`
    case 4: return `${base} bg-gradient-to-br from-cyan-400 to-blue-500 shadow-md shadow-blue-500/20`
    case 5: return `${base} bg-gradient-to-br from-emerald-400 to-green-500 shadow-md shadow-emerald-500/20`
    case 6: return `${base} bg-gradient-to-br from-cyan-400 to-blue-500 shadow-md shadow-blue-500/20 ring-2 ring-emerald-400/60 ring-inset`
    default: return base
  }
}

const getEditorCellEmoji = (cell) => {
  switch (cell) {
    case 2: return '📦'
    case 4: return '😊'
    case 5: return '✅'
    case 6: return '😊'
    default: return ''
  }
}

const stats = computed(() => {
  let player = 0, box = 0, target = 0, wall = 0
  for (const row of editorMap.value) {
    for (const cell of row) {
      if (cell === 4 || cell === 6) player++
      if (cell === 2 || cell === 5) box++
      if (cell === 3 || cell === 5 || cell === 6) target++
      if (cell === 1) wall++
    }
  }
  return { player, box, target, wall }
})

function handleSave() {
  const result = saveLevel()
  if (result.success) {
    pendingLevel.value = result.level
    showSaveSuccess.value = true
    validationErrors.value = []
    setTimeout(() => {
      showSaveSuccess.value = false
    }, 3000)
  } else {
    validationErrors.value = result.errors
    showValidationModal.value = true
  }
}

function handlePlayCustomLevel() {
  showSaveSuccess.value = false
  if (pendingLevel.value) {
    emit('playLevel', pendingLevel.value)
  }
}

function handleBack() {
  emit('back')
}

function handleGlobalMouseUp() {
  onCellMouseUp()
}

onMounted(() => {
  initEditor()
  window.addEventListener('mouseup', handleGlobalMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mouseup', handleGlobalMouseUp)
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 font-sans text-slate-200">
    <div class="p-4 mx-auto max-w-[1400px] min-h-screen grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 content-start lg:content-center items-start lg:items-center lg:p-8">

      <!-- 左侧：编辑器主区域 -->
      <div class="lg:col-span-8 xl:col-span-9 flex flex-col items-center justify-center w-full">

        <!-- 顶部栏 -->
        <div class="w-full max-w-2xl mb-4 flex items-center justify-between p-4 bg-slate-800/60 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-700/50">
          <button @click="handleBack" class="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors">
            <ArrowLeft class="w-5 h-5" />
            <span class="text-sm font-medium">返回游戏</span>
          </button>
          <h1 class="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">关卡编辑器</h1>
          <div class="w-20"></div>
        </div>

        <!-- 地图名称输入 -->
        <div class="w-full max-w-2xl mb-4">
          <input
            v-model="levelName"
            type="text"
            placeholder="输入关卡名称（可选）"
            class="w-full px-4 py-3 bg-slate-800/60 backdrop-blur-xl rounded-xl border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all text-sm"
          />
        </div>

        <!-- 编辑器网格 -->
        <div class="relative w-full max-w-2xl flex flex-col items-center">
          <div
            class="inline-grid gap-0.5 sm:gap-1 p-2 sm:p-3 lg:p-4 bg-slate-900/50 rounded-2xl lg:rounded-3xl shadow-2xl shadow-black/20 border border-slate-700/30"
            :style="{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }"
            @mouseleave="onCellMouseUp"
          >
            <template v-for="(row, y) in editorMap" :key="y">
              <div
                v-for="(cell, x) in row"
                :key="`${x}-${y}`"
                :class="getEditorCellClass(cell)"
                @mousedown.prevent="onCellMouseDown(y, x)"
                @mouseenter="onCellMouseEnter(y, x)"
                @touchstart.prevent="onCellMouseDown(y, x)"
                @touchmove.prevent
              >
                <span class="select-none pointer-events-none">{{ getEditorCellEmoji(cell) }}</span>
              </div>
            </template>
          </div>
        </div>

        <!-- 移动端统计 -->
        <div class="lg:hidden mt-4 flex gap-3 text-xs">
          <span class="bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">😊 {{ stats.player }}</span>
          <span class="bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">📦 {{ stats.box }}</span>
          <span class="bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">🎯 {{ stats.target }}</span>
        </div>
      </div>

      <!-- 右侧：工具面板 -->
      <div class="hidden lg:flex lg:col-span-4 xl:col-span-3 flex-col gap-4 h-full justify-center">

        <!-- 工具选择 -->
        <div class="bg-slate-800/60 backdrop-blur-xl rounded-3xl p-5 border border-slate-700/50 shadow-xl">
          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">绘制工具</h3>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="tool in TOOLS"
              :key="tool.id"
              @click="currentTool = tool.id"
              :class="[
                'flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-200',
                currentTool === tool.id
                  ? `bg-gradient-to-br ${toolColorMap[tool.id]} ring-2 ${toolActiveColorMap[tool.id]} shadow-lg text-white`
                  : 'bg-slate-700/30 border-slate-600/30 text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
              ]"
            >
              <span class="text-xl">{{ tool.emoji }}</span>
              <span class="text-xs font-medium">{{ tool.label }}</span>
            </button>
          </div>
        </div>

        <!-- 地图尺寸 -->
        <div class="bg-slate-800/60 backdrop-blur-xl rounded-3xl p-5 border border-slate-700/50 shadow-xl">
          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">地图尺寸</h3>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <span class="text-sm text-slate-400 w-8">行</span>
              <input
                type="range"
                :min="5"
                :max="15"
                v-model.number="rows"
                @change="resizeMap(rows, cols)"
                class="flex-1 accent-cyan-500"
              />
              <span class="text-sm font-bold text-cyan-400 w-6 text-right">{{ rows }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm text-slate-400 w-8">列</span>
              <input
                type="range"
                :min="5"
                :max="15"
                v-model.number="cols"
                @change="resizeMap(rows, cols)"
                class="flex-1 accent-cyan-500"
              />
              <span class="text-sm font-bold text-cyan-400 w-6 text-right">{{ cols }}</span>
            </div>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="bg-slate-800/60 backdrop-blur-xl rounded-3xl p-5 border border-slate-700/50 shadow-xl">
          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">地图统计</h3>
          <div class="grid grid-cols-2 gap-2">
            <div class="bg-slate-900/40 rounded-xl p-3 text-center border border-slate-700/30">
              <div class="text-lg">😊</div>
              <div class="text-xs text-slate-500 mt-1">玩家</div>
              <div class="text-lg font-bold" :class="stats.player === 1 ? 'text-emerald-400' : 'text-rose-400'">{{ stats.player }}</div>
            </div>
            <div class="bg-slate-900/40 rounded-xl p-3 text-center border border-slate-700/30">
              <div class="text-lg">📦</div>
              <div class="text-xs text-slate-500 mt-1">箱子</div>
              <div class="text-lg font-bold" :class="stats.box > 0 ? 'text-emerald-400' : 'text-rose-400'">{{ stats.box }}</div>
            </div>
            <div class="bg-slate-900/40 rounded-xl p-3 text-center border border-slate-700/30">
              <div class="text-lg">🎯</div>
              <div class="text-xs text-slate-500 mt-1">终点</div>
              <div class="text-lg font-bold" :class="stats.target > 0 ? 'text-emerald-400' : 'text-rose-400'">{{ stats.target }}</div>
            </div>
            <div class="bg-slate-900/40 rounded-xl p-3 text-center border border-slate-700/30">
              <div class="text-lg">🧱</div>
              <div class="text-xs text-slate-500 mt-1">墙壁</div>
              <div class="text-lg font-bold text-slate-300">{{ stats.wall }}</div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="bg-slate-800/60 backdrop-blur-xl rounded-3xl p-5 border border-slate-700/50 shadow-xl space-y-3">
          <button
            @click="handleSave"
            class="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-medium shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
          >
            <Save class="w-5 h-5" />
            保存关卡
          </button>
          <button
            @click="clearMap"
            class="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-700/50 hover:bg-rose-500/10 hover:text-rose-400 border border-slate-600/30 hover:border-rose-500/50 transition-all"
          >
            <Eraser class="w-5 h-5" />
            清空地图
          </button>
        </div>

        <!-- 提示 -->
        <div class="bg-gradient-to-br from-sky-600/80 to-blue-600/80 backdrop-blur-xl rounded-3xl p-5 border border-sky-400/30 shadow-xl text-white relative overflow-hidden">
          <h3 class="font-bold text-lg mb-1">编辑提示</h3>
          <p class="text-sky-100 text-sm opacity-90 mb-3">点击或拖拽绘制地图</p>
          <div class="space-y-2 text-xs font-medium text-sky-50">
            <div class="flex items-center gap-2 bg-blue-900/30 p-2 rounded-lg">
              <span>🎯 箱子与终点数量需一致</span>
            </div>
            <div class="flex items-center gap-2 bg-blue-900/30 p-2 rounded-lg">
              <span>😊 只能有一个玩家</span>
            </div>
            <div class="flex items-center gap-2 bg-blue-900/30 p-2 rounded-lg">
              <span>✅ 保存时自动验证可解性</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 移动端底部工具栏 -->
      <div class="lg:hidden col-span-1 flex flex-col gap-3 mt-4">
        <!-- 移动端工具选择 -->
        <div class="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50 shadow-xl">
          <div class="grid grid-cols-6 gap-2">
            <button
              v-for="tool in TOOLS"
              :key="tool.id"
              @click="currentTool = tool.id"
              :class="[
                'flex flex-col items-center gap-0.5 p-2 rounded-lg border transition-all',
                currentTool === tool.id
                  ? `bg-gradient-to-br ${toolColorMap[tool.id]} ring-2 ${toolActiveColorMap[tool.id]} shadow-lg text-white`
                  : 'bg-slate-700/30 border-slate-600/30 text-slate-400'
              ]"
            >
              <span class="text-lg">{{ tool.emoji }}</span>
              <span class="text-[10px] font-medium">{{ tool.label }}</span>
            </button>
          </div>
        </div>

        <!-- 移动端尺寸控制 -->
        <div class="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50 shadow-xl">
          <div class="flex gap-4">
            <div class="flex-1 flex items-center gap-2">
              <span class="text-xs text-slate-400">行</span>
              <input type="range" :min="5" :max="15" v-model.number="rows" @change="resizeMap(rows, cols)" class="flex-1 accent-cyan-500" />
              <span class="text-xs font-bold text-cyan-400">{{ rows }}</span>
            </div>
            <div class="flex-1 flex items-center gap-2">
              <span class="text-xs text-slate-400">列</span>
              <input type="range" :min="5" :max="15" v-model.number="cols" @change="resizeMap(rows, cols)" class="flex-1 accent-cyan-500" />
              <span class="text-xs font-bold text-cyan-400">{{ cols }}</span>
            </div>
          </div>
        </div>

        <!-- 移动端操作按钮 -->
        <div class="flex gap-3">
          <button
            @click="handleSave"
            class="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform"
          >
            <Save class="w-5 h-5" />
            保存
          </button>
          <button
            @click="clearMap"
            class="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-700/50 border border-slate-600/30 text-slate-300 active:scale-95 transition-transform"
          >
            <Eraser class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- 验证错误弹窗 -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-90"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-90"
    >
      <div v-if="showValidationModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" @click.self="showValidationModal = false">
        <div class="bg-slate-800 border border-rose-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-rose-500/10">
          <div class="flex items-center gap-3 mb-4">
            <AlertCircle class="w-6 h-6 text-rose-400" />
            <h3 class="text-lg font-bold text-rose-400">验证失败</h3>
          </div>
          <ul class="space-y-2 mb-5">
            <li v-for="(error, i) in validationErrors" :key="i" class="text-sm text-slate-300 flex items-start gap-2">
              <span class="text-rose-400 mt-0.5">•</span>
              {{ error }}
            </li>
          </ul>
          <button @click="showValidationModal = false" class="w-full p-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors">
            知道了
          </button>
        </div>
      </div>
    </Transition>

    <!-- 保存成功弹窗 -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-90"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-90"
    >
      <div v-if="showSaveSuccess" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div class="bg-slate-800 border border-emerald-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-emerald-500/10">
          <div class="flex items-center gap-3 mb-4">
            <CheckCircle class="w-6 h-6 text-emerald-400" />
            <h3 class="text-lg font-bold text-emerald-400">保存成功！</h3>
          </div>
          <p class="text-sm text-slate-300 mb-5">关卡已保存，可以立即开始游戏</p>
          <div class="flex gap-3">
            <button @click="showSaveSuccess = false" class="flex-1 p-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors">
              继续编辑
            </button>
            <button @click="handlePlayCustomLevel" class="flex-1 p-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium shadow-lg shadow-emerald-500/30 transition-colors">
              开始游戏
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
