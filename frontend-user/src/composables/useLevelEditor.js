import { ref, computed } from 'vue'
import { LEVELS } from '../data/levels'

const CUSTOM_LEVELS_KEY = 'sokoban_custom_levels'

export const CELL_TYPES = {
  FLOOR: 0,
  WALL: 1,
  BOX: 2,
  TARGET: 3,
  PLAYER: 4,
  BOX_ON_TARGET: 5,
  PLAYER_ON_TARGET: 6
}

export const TOOL_TYPES = {
  FLOOR: 'floor',
  WALL: 'wall',
  BOX: 'box',
  TARGET: 'target',
  PLAYER: 'player'
}

export function useLevelEditor() {
  const editorMap = ref([])
  const mapWidth = ref(10)
  const mapHeight = ref(10)
  const currentTool = ref(TOOL_TYPES.WALL)
  const customLevels = ref([])
  const levelName = ref('')
  const isPainting = ref(false)

  const loadCustomLevels = () => {
    try {
      const saved = localStorage.getItem(CUSTOM_LEVELS_KEY)
      if (saved) {
        customLevels.value = JSON.parse(saved)
      }
    } catch (e) {
      customLevels.value = []
    }
  }

  const saveCustomLevelsToStorage = () => {
    try {
      localStorage.setItem(CUSTOM_LEVELS_KEY, JSON.stringify(customLevels.value))
    } catch (e) {
      console.error('保存自定义关卡失败:', e)
    }
  }

  const createEmptyMap = (width = mapWidth.value, height = mapHeight.value) => {
    const newMap = []
    for (let y = 0; y < height; y++) {
      const row = []
      for (let x = 0; x < width; x++) {
        if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
          row.push(CELL_TYPES.WALL)
        } else {
          row.push(CELL_TYPES.FLOOR)
        }
      }
      newMap.push(row)
    }
    editorMap.value = newMap
  }

  const initEditor = () => {
    loadCustomLevels()
    levelName.value = `自定义关卡 ${customLevels.value.length + 1}`
    createEmptyMap()
  }

  const setCell = (x, y, type) => {
    if (y < 0 || y >= editorMap.value.length || x < 0 || x >= editorMap.value[0].length) {
      return
    }

    const currentCell = editorMap.value[y][x]
    let newCell = type

    if (type === TOOL_TYPES.FLOOR) {
      newCell = CELL_TYPES.FLOOR
    } else if (type === TOOL_TYPES.WALL) {
      newCell = CELL_TYPES.WALL
    } else if (type === TOOL_TYPES.BOX) {
      if (currentCell === CELL_TYPES.TARGET || currentCell === CELL_TYPES.PLAYER_ON_TARGET) {
        newCell = CELL_TYPES.BOX_ON_TARGET
      } else {
        newCell = CELL_TYPES.BOX
      }
    } else if (type === TOOL_TYPES.TARGET) {
      if (currentCell === CELL_TYPES.BOX) {
        newCell = CELL_TYPES.BOX_ON_TARGET
      } else if (currentCell === CELL_TYPES.PLAYER) {
        newCell = CELL_TYPES.PLAYER_ON_TARGET
      } else {
        newCell = CELL_TYPES.TARGET
      }
    } else if (type === TOOL_TYPES.PLAYER) {
      removeExistingPlayer()
      if (currentCell === CELL_TYPES.TARGET || currentCell === CELL_TYPES.BOX_ON_TARGET) {
        newCell = CELL_TYPES.PLAYER_ON_TARGET
      } else {
        newCell = CELL_TYPES.PLAYER
      }
    }

    editorMap.value[y][x] = newCell
  }

  const removeExistingPlayer = () => {
    for (let y = 0; y < editorMap.value.length; y++) {
      for (let x = 0; x < editorMap.value[y].length; x++) {
        if (editorMap.value[y][x] === CELL_TYPES.PLAYER) {
          editorMap.value[y][x] = CELL_TYPES.FLOOR
        } else if (editorMap.value[y][x] === CELL_TYPES.PLAYER_ON_TARGET) {
          editorMap.value[y][x] = CELL_TYPES.TARGET
        }
      }
    }
  }

  const handleCellClick = (x, y) => {
    setCell(x, y, currentTool.value)
  }

  const handleMouseDown = (x, y) => {
    isPainting.value = true
    setCell(x, y, currentTool.value)
  }

  const handleMouseEnter = (x, y) => {
    if (isPainting.value && currentTool.value !== TOOL_TYPES.PLAYER) {
      setCell(x, y, currentTool.value)
    }
  }

  const handleMouseUp = () => {
    isPainting.value = false
  }

  const resizeMap = (width, height) => {
    mapWidth.value = width
    mapHeight.value = height
    createEmptyMap(width, height)
  }

  const clearMap = () => {
    createEmptyMap()
  }

  const getStats = computed(() => {
    let playerCount = 0
    let boxCount = 0
    let targetCount = 0

    for (let y = 0; y < editorMap.value.length; y++) {
      for (let x = 0; x < editorMap.value[y].length; x++) {
        const cell = editorMap.value[y][x]
        if (cell === CELL_TYPES.PLAYER || cell === CELL_TYPES.PLAYER_ON_TARGET) {
          playerCount++
        }
        if (cell === CELL_TYPES.BOX || cell === CELL_TYPES.BOX_ON_TARGET) {
          boxCount++
        }
        if (cell === CELL_TYPES.TARGET || cell === CELL_TYPES.BOX_ON_TARGET || cell === CELL_TYPES.PLAYER_ON_TARGET) {
          targetCount++
        }
      }
    }

    return { playerCount, boxCount, targetCount }
  })

  const validateBasic = () => {
    const stats = getStats.value
    const errors = []

    if (stats.playerCount === 0) {
      errors.push('地图必须有且仅有一个玩家')
    } else if (stats.playerCount > 1) {
      errors.push('地图只能有一个玩家')
    }

    if (stats.boxCount === 0) {
      errors.push('地图至少需要一个箱子')
    }

    if (stats.targetCount === 0) {
      errors.push('地图至少需要一个终点')
    }

    if (stats.boxCount !== stats.targetCount) {
      errors.push(`箱子数量(${stats.boxCount})必须等于终点数量(${stats.targetCount})`)
    }

    return errors
  }

  const deepCopyMap = (map) => {
    return map.map(row => [...row])
  }

  const findPlayer = (map) => {
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        if (map[y][x] === CELL_TYPES.PLAYER || map[y][x] === CELL_TYPES.PLAYER_ON_TARGET) {
          return { x, y }
        }
      }
    }
    return null
  }

  const getBoxPositions = (map) => {
    const boxes = []
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        if (map[y][x] === CELL_TYPES.BOX || map[y][x] === CELL_TYPES.BOX_ON_TARGET) {
          boxes.push({ x, y })
        }
      }
    }
    return boxes
  }

  const stateToKey = (playerPos, boxes) => {
    const boxKey = boxes.map(b => `${b.x},${b.y}`).sort().join('|')
    return `${playerPos.x},${playerPos.y}|${boxKey}`
  }

  const isWin = (map) => {
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        if (map[y][x] === CELL_TYPES.TARGET || map[y][x] === CELL_TYPES.PLAYER_ON_TARGET) {
          return false
        }
      }
    }
    return true
  }

  const canSolve = () => {
    const basicErrors = validateBasic()
    if (basicErrors.length > 0) {
      return { solvable: false, reason: basicErrors.join('；') }
    }

    const map = deepCopyMap(editorMap.value)
    const playerPos = findPlayer(map)
    if (!playerPos) {
      return { solvable: false, reason: '找不到玩家位置' }
    }

    const initialBoxes = getBoxPositions(map)
    const visited = new Set()
    const queue = [{ map: deepCopyMap(map), playerPos: { ...playerPos }, boxes: [...initialBoxes] }]
    visited.add(stateToKey(playerPos, initialBoxes))

    const directions = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 }
    ]

    let iterations = 0
    const maxIterations = 50000

    while (queue.length > 0) {
      iterations++
      if (iterations > maxIterations) {
        return { solvable: false, reason: '搜索步数超限，可能关卡过难或无解' }
      }

      const current = queue.shift()

      if (isWin(current.map)) {
        return { solvable: true, reason: '' }
      }

      for (const dir of directions) {
        const newX = current.playerPos.x + dir.dx
        const newY = current.playerPos.y + dir.dy

        if (newY < 0 || newY >= current.map.length || newX < 0 || newX >= current.map[0].length) {
          continue
        }

        const targetCell = current.map[newY][newX]

        if (targetCell === CELL_TYPES.WALL) {
          continue
        }

        const newMap = deepCopyMap(current.map)
        let newPlayerPos = { x: newX, y: newY }
        let newBoxes = [...current.boxes]

        const currentCell = current.map[current.playerPos.y][current.playerPos.x]

        if (targetCell === CELL_TYPES.BOX || targetCell === CELL_TYPES.BOX_ON_TARGET) {
          const boxNewX = newX + dir.dx
          const boxNewY = newY + dir.dy

          if (boxNewY < 0 || boxNewY >= current.map.length || boxNewX < 0 || boxNewX >= current.map[0].length) {
            continue
          }

          const beyondCell = current.map[boxNewY][boxNewX]

          if (beyondCell === CELL_TYPES.WALL || beyondCell === CELL_TYPES.BOX || beyondCell === CELL_TYPES.BOX_ON_TARGET) {
            continue
          }

          newMap[boxNewY][boxNewX] = beyondCell === CELL_TYPES.TARGET ? CELL_TYPES.BOX_ON_TARGET : CELL_TYPES.BOX
          newMap[newY][newX] = targetCell === CELL_TYPES.BOX_ON_TARGET ? CELL_TYPES.PLAYER_ON_TARGET : CELL_TYPES.PLAYER
          newMap[current.playerPos.y][current.playerPos.x] = currentCell === CELL_TYPES.PLAYER_ON_TARGET ? CELL_TYPES.TARGET : CELL_TYPES.FLOOR

          newBoxes = newBoxes.map(b => {
            if (b.x === newX && b.y === newY) {
              return { x: boxNewX, y: boxNewY }
            }
            return b
          })
        } else {
          newMap[newY][newX] = targetCell === CELL_TYPES.TARGET ? CELL_TYPES.PLAYER_ON_TARGET : CELL_TYPES.PLAYER
          newMap[current.playerPos.y][current.playerPos.x] = currentCell === CELL_TYPES.PLAYER_ON_TARGET ? CELL_TYPES.TARGET : CELL_TYPES.FLOOR
        }

        const stateKey = stateToKey(newPlayerPos, newBoxes)
        if (!visited.has(stateKey)) {
          visited.add(stateKey)
          queue.push({ map: newMap, playerPos: newPlayerPos, boxes: newBoxes })
        }
      }
    }

    return { solvable: false, reason: '该关卡无解，请调整地图设计' }
  }

  const saveLevel = () => {
    const validation = canSolve()
    if (!validation.solvable) {
      return { success: false, error: validation.reason }
    }

    const newLevel = {
      name: levelName.value || `自定义关卡 ${customLevels.value.length + 1}`,
      difficulty: '自定义',
      map: deepCopyMap(editorMap.value),
      isCustom: true,
      createdAt: Date.now()
    }

    customLevels.value.push(newLevel)
    saveCustomLevelsToStorage()

    return { success: true, level: newLevel, index: customLevels.value.length - 1 }
  }

  const deleteLevel = (index) => {
    if (index >= 0 && index < customLevels.value.length) {
      customLevels.value.splice(index, 1)
      saveCustomLevelsToStorage()
    }
  }

  const editLevel = (index) => {
    if (index >= 0 && index < customLevels.value.length) {
      const level = customLevels.value[index]
      levelName.value = level.name
      mapHeight.value = level.map.length
      mapWidth.value = level.map[0].length
      editorMap.value = deepCopyMap(level.map)
    }
  }

  const getAllLevels = () => {
    loadCustomLevels()
    return [...LEVELS, ...customLevels.value]
  }

  const getCustomLevelIndex = (globalIndex) => {
    return globalIndex - LEVELS.length
  }

  const isCustomLevel = (globalIndex) => {
    return globalIndex >= LEVELS.length
  }

  return {
    editorMap,
    mapWidth,
    mapHeight,
    currentTool,
    customLevels,
    levelName,
    isPainting,
    getStats,
    initEditor,
    createEmptyMap,
    setCell,
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
    editLevel,
    loadCustomLevels,
    getAllLevels,
    getCustomLevelIndex,
    isCustomLevel,
    CELL_TYPES,
    TOOL_TYPES
  }
}
