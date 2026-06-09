<script setup>
import { ref, computed, watch } from 'vue'
import { X, Eraser, Square, Package, Target, User, Check, Trash2, Play, Save, Plus, Minus } from 'lucide-vue-next'
import { useLevelValidator } from '../composables/useLevelValidator'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'saveAndPlay'])

const { errors, validateMap, countElements, CELL } = useLevelValidator()

const TOOLS = [
  { id: CELL.FLOOR, name: '地板', icon: Eraser, color: 'bg-slate-600' },
  { id: CELL.WALL, name: '墙壁', icon: Square, color: 'bg-slate-900' },
  { id: CELL.BOX, name: '箱子', icon: Package, color: 'bg-gradient-to-br from-amber-400 to-orange-500' },
  { id: CELL.TARGET, name: '终点', icon: Target, color: 'bg-emerald-500' },
  { id: CELL.PLAYER, name: '玩家', icon: User, color: 'bg-gradient-to-br from-cyan-400 to-blue-500' }
]

const selectedTool = ref(CELL.WALL)
const mapWidth = ref(9)
const mapHeight = ref(9)
const levelName = ref('我的关卡')
const editorMap = ref([])
const isValid = ref(false)

const createEmptyMap = (width, height, borderWalls = true) => {
  const map = []
  for (let y = 0; y < height; y++) {
    const row = []
    for (let x = 0; x < width; x++) {
      if (borderWalls && (y === 0 || y === height - 1 || x === 0 || x === width - 1)) {
        row.push(CELL.WALL)
      } else {
        row.push(CELL.FLOOR)
      }
    }
    map.push(row)
  }
  return map
}

const initEditor = () => {
  editorMap.value = createEmptyMap(mapWidth.value, mapHeight.value)
  levelName.value = '我的关卡'
  isValid.value = false
  errors.value = []
}

watch(() => props.show, (newVal) => {
  if (newVal && editorMap.value.length === 0) {
    initEditor()
  }
})

const resizeMap = () => {
  const newMap = createEmptyMap(mapWidth.value, mapHeight.value)
  for (let y = 0; y < Math.min(editorMap.value.length, mapHeight.value); y++) {
    for (let x = 0; x < Math.min(editorMap.value[y].length, mapWidth.value); x++) {
      newMap[y][x] = editorMap.value[y][x]
    }
  }
  editorMap.value = newMap
}

const clearMap = () => {
  editorMap.value = createEmptyMap(mapWidth.value, mapHeight.value)
}

const setCell = (x, y) => {
  if (selectedTool.value === CELL.PLAYER) {
    for (let row of editorMap.value) {
      for (let i = 0; i < row.length; i++) {
        if (row[i] === CELL.PLAYER) row[i] = CELL.FLOOR
        if (row[i] === CELL.PLAYER_ON_TARGET) row[i] = CELL.TARGET
      }
    }
  }
  
  const currentCell = editorMap.value[y][x]
  
  if (selectedTool.value === CELL.PLAYER) {
    if (currentCell === CELL.TARGET) {
      editorMap.value[y][x] = CELL.PLAYER_ON_TARGET
    } else if (currentCell === CELL.FLOOR) {
      editorMap.value[y][x] = CELL.PLAYER
    }
  } else if (selectedTool.value === CELL.BOX) {
    if (currentCell === CELL.TARGET) {
      editorMap.value[y][x] = CELL.BOX_ON_TARGET
    } else if (currentCell !== CELL.WALL) {
      editorMap.value[y][x] = CELL.BOX
    }
  } else if (selectedTool.value === CELL.TARGET) {
    if (currentCell === CELL.BOX) {
      editorMap.value[y][x] = CELL.BOX_ON_TARGET
    } else if (currentCell === CELL.PLAYER) {
      editorMap.value[y][x] = CELL.PLAYER_ON_TARGET
    } else if (currentCell !== CELL.WALL) {
      editorMap.value[y][x] = CELL.TARGET
    }
  } else {
    editorMap.value[y][x] = selectedTool.value
  }
}

const getCellClass = (cell) => {
  const baseClass = 'w-7 h-7 sm:w-8 sm:h-8 rounded transition-all duration-150 flex items-center justify-center text-sm cursor-pointer hover:ring-2 hover:ring-white/40'
  
  switch (cell) {
    case CELL.FLOOR:
      return `${baseClass} bg-slate-800/40 border border-slate-700/30`
    case CELL.WALL:
      return `${baseClass} bg-slate-900 border border-slate-600 shadow-inner`
    case CELL.BOX:
      return `${baseClass} bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/30`
    case CELL.TARGET:
      return `${baseClass} bg-slate-800/40 ring-2 ring-emerald-400/60 ring-inset`
    case CELL.PLAYER:
      return `${baseClass} bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-blue-500/40`
    case CELL.BOX_ON_TARGET:
      return `${baseClass} bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/40`
    case CELL.PLAYER_ON_TARGET:
      return `${baseClass} bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-blue-500/40 ring-2 ring-emerald-400/60 ring-inset`
    default:
      return baseClass
  }
}

const getCellEmoji = (cell) => {
  switch (cell) {
    case CELL.BOX:
    case CELL.BOX_ON_TARGET:
      return '📦'
    case CELL.PLAYER:
    case CELL.PLAYER_ON_TARGET:
      return '😊'
    case CELL.TARGET:
      return '⭕'
    default:
      return ''
  }
}

const stats = computed(() => countElements(editorMap.value))

const runValidation = () => {
  isValid.value = validateMap(editorMap.value)
}

const handleSaveAndPlay = () => {
  if (validateMap(editorMap.value)) {
    emit('saveAndPlay', {
      name: levelName.value || '自定义关卡',
      difficulty: '自定义',
      map: editorMap.value.map(row => [...row])
    })
  }
}

watch(editorMap, () => {
  runValidation()
}, { deep: true })

const increaseWidth = () => {
  if (mapWidth.value < 15) {
    mapWidth.value++
    resizeMap()
  }
}

const decreaseWidth = () => {
  if (mapWidth.value > 5) {
    mapWidth.value--
    resizeMap()
  }
}

const increaseHeight = () => {
  if (mapHeight.value < 15) {
    mapHeight.value++
    resizeMap()
  }
}

const decreaseHeight = () => {
  if (mapHeight.value > 5) {
    mapHeight.value--
    resizeMap()
  }
}
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
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div class="bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto my-4">
        <div class="sticky top-0 bg-slate-800 z-10 p-4 sm:p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <span class="text-2xl">🎨</span> 关卡编辑器
          </h2>
          <button 
            @click="emit('close')"
            class="p-2 rounded-xl hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="p-4 sm:p-6 space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-2">关卡名称</label>
              <input 
                v-model="levelName"
                type="text"
                class="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="输入关卡名称"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-400 mb-2">地图宽度</label>
              <div class="flex items-center gap-2">
                <button 
                  @click="decreaseWidth"
                  class="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                >
                  <Minus class="w-4 h-4" />
                </button>
                <span class="flex-1 text-center py-2 bg-slate-900 rounded-lg text-white font-bold">{{ mapWidth }}</span>
                <button 
                  @click="increaseWidth"
                  class="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                >
                  <Plus class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-400 mb-2">地图高度</label>
              <div class="flex items-center gap-2">
                <button 
                  @click="decreaseHeight"
                  class="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                >
                  <Minus class="w-4 h-4" />
                </button>
                <span class="flex-1 text-center py-2 bg-slate-900 rounded-lg text-white font-bold">{{ mapHeight }}</span>
                <button 
                  @click="increaseHeight"
                  class="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                >
                  <Plus class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-400 mb-3">选择工具</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="tool in TOOLS"
                :key="tool.id"
                @click="selectedTool = tool.id"
                :class="[
                  'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200',
                  selectedTool === tool.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 scale-105'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                ]"
              >
                <component :is="tool.icon" class="w-5 h-5" />
                {{ tool.name }}
              </button>
              <button
                @click="clearMap"
                class="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 bg-red-500/20 text-red-400 hover:bg-red-500/30"
              >
                <Trash2 class="w-5 h-5" />
                清空
              </button>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div class="bg-slate-900/50 rounded-xl p-3 text-center">
              <div class="text-2xl mb-1">😊</div>
              <div class="text-slate-400 text-xs">玩家</div>
              <div class="text-cyan-400 font-bold">{{ stats.playerCount }}</div>
            </div>
            <div class="bg-slate-900/50 rounded-xl p-3 text-center">
              <div class="text-2xl mb-1">📦</div>
              <div class="text-slate-400 text-xs">箱子</div>
              <div class="text-amber-400 font-bold">{{ stats.boxCount }}</div>
            </div>
            <div class="bg-slate-900/50 rounded-xl p-3 text-center">
              <div class="text-2xl mb-1">⭕</div>
              <div class="text-slate-400 text-xs">终点</div>
              <div class="text-emerald-400 font-bold">{{ stats.targetCount }}</div>
            </div>
          </div>

          <div class="flex justify-center">
            <div class="inline-grid gap-1 p-4 bg-slate-900/50 rounded-2xl border border-slate-700" :style="{ gridTemplateColumns: `repeat(${mapWidth}, minmax(0, 1fr))` }">
              <template v-for="(row, y) in editorMap" :key="y">
                <div
                  v-for="(cell, x) in row"
                  :key="`${x}-${y}`"
                  :class="getCellClass(cell)"
                  @click="setCell(x, y)"
                >
                  <span class="select-none">{{ getCellEmoji(cell) }}</span>
                </div>
              </template>
            </div>
          </div>

          <div v-if="errors.length > 0" class="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div class="flex items-start gap-3">
              <div class="text-red-400 mt-0.5">
                <X class="w-5 h-5" />
              </div>
              <div>
                <h4 class="font-medium text-red-400 mb-1">验证失败</h4>
                <ul class="text-sm text-red-300 space-y-1">
                  <li v-for="(error, i) in errors" :key="i">• {{ error }}</li>
                </ul>
              </div>
            </div>
          </div>

          <div v-else-if="isValid" class="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div class="flex items-center gap-3">
              <div class="text-emerald-400">
                <Check class="w-5 h-5" />
              </div>
              <div>
                <h4 class="font-medium text-emerald-400">地图验证通过！</h4>
                <p class="text-sm text-emerald-300">关卡有效，可以开始游戏了</p>
              </div>
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <button
              @click="emit('close')"
              class="flex-1 px-6 py-3 rounded-xl font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
            >
              取消
            </button>
            <button
              @click="handleSaveAndPlay"
              :disabled="!isValid"
              :class="[
                'flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200',
                isValid
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02]'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              ]"
            >
              <Play class="w-5 h-5" />
              保存并开始游戏
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
