import { ref, computed } from 'vue'
import { LEVELS } from '../data/levels'

const CUSTOM_STORAGE_KEY = 'sokoban-custom-levels'

function loadCustomLevels() {
  try {
    const stored = localStorage.getItem(CUSTOM_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function useGame() {
  const currentLevelIndex = ref(0)
  const gameMap = ref([])
  const steps = ref(0)
  const history = ref([])
  const playerPos = ref({ x: 0, y: 0 })
  const isGameWon = ref(false)
  const isMoving = ref(false)
  const customLevels = ref(loadCustomLevels())

  const allLevels = computed(() => {
    return [...LEVELS, ...customLevels.value.map(l => ({ ...l, isCustom: true }))]
  })

  const currentLevel = computed(() => allLevels.value[currentLevelIndex.value])

  const checkWin = computed(() => {
    for (let y = 0; y < gameMap.value.length; y++) {
      for (let x = 0; x < gameMap.value[y].length; x++) {
        if (gameMap.value[y][x] === 3 || gameMap.value[y][x] === 6) {
          return false
        }
      }
    }
    return true
  })

  const deepCopyMap = (map) => {
    return map.map(row => [...row])
  }

  const initLevel = (levelIndex = currentLevelIndex.value) => {
    currentLevelIndex.value = levelIndex
    isGameWon.value = false
    steps.value = 0
    history.value = []

    const level = allLevels.value[levelIndex]
    if (!level) return

    gameMap.value = deepCopyMap(level.map)

    for (let y = 0; y < gameMap.value.length; y++) {
      for (let x = 0; x < gameMap.value[y].length; x++) {
        if (gameMap.value[y][x] === 4 || gameMap.value[y][x] === 6) {
          playerPos.value = { x, y }
          return
        }
      }
    }
  }

  const initCustomLevel = (levelData) => {
    const existingIndex = customLevels.value.findIndex(
      l => l.name === levelData.name && JSON.stringify(l.map) === JSON.stringify(levelData.map)
    )

    if (existingIndex >= 0) {
      initLevel(LEVELS.length + existingIndex)
    } else {
      customLevels.value.push(levelData)
      initLevel(allLevels.value.length - 1)
    }
  }

  const refreshCustomLevels = () => {
    customLevels.value = loadCustomLevels()
  }

  const saveHistory = () => {
    history.value.push({
      map: deepCopyMap(gameMap.value),
      playerPos: { ...playerPos.value },
      steps: steps.value
    })
  }

  const undo = () => {
    if (history.value.length === 0 || isMoving.value) return

    const lastState = history.value.pop()
    gameMap.value = lastState.map
    playerPos.value = lastState.playerPos
    steps.value = lastState.steps
    isGameWon.value = false
  }

  const resetLevel = () => {
    initLevel(currentLevelIndex.value)
  }

  const movePlayer = (dx, dy) => {
    if (isGameWon.value || isMoving.value) return

    const newX = playerPos.value.x + dx
    const newY = playerPos.value.y + dy

    if (newY < 0 || newY >= gameMap.value.length ||
        newX < 0 || newX >= gameMap.value[0].length) {
      return
    }

    const targetCell = gameMap.value[newY][newX]

    if (targetCell === 1) return

    saveHistory()

    const currentCell = gameMap.value[playerPos.value.y][playerPos.value.x]

    if (targetCell === 2 || targetCell === 5) {
      const boxNewX = newX + dx
      const boxNewY = newY + dy

      if (boxNewY < 0 || boxNewY >= gameMap.value.length ||
          boxNewX < 0 || boxNewX >= gameMap.value[0].length) {
        history.value.pop()
        return
      }

      const beyondCell = gameMap.value[boxNewY][boxNewX]

      if (beyondCell === 1 || beyondCell === 2 || beyondCell === 5) {
        history.value.pop()
        return
      }

      gameMap.value[boxNewY][boxNewX] = beyondCell === 3 ? 5 : 2
      gameMap.value[newY][newX] = targetCell === 5 ? 6 : 4
      gameMap.value[playerPos.value.y][playerPos.value.x] = currentCell === 6 ? 3 : 0

      playerPos.value = { x: newX, y: newY }
      steps.value++

      isMoving.value = true
      setTimeout(() => {
        isMoving.value = false
      }, 150)

      if (checkWin.value) {
        isGameWon.value = true
      }

      return
    }

    if (targetCell === 0 || targetCell === 3) {
      gameMap.value[newY][newX] = targetCell === 3 ? 6 : 4
      gameMap.value[playerPos.value.y][playerPos.value.x] = currentCell === 6 ? 3 : 0

      playerPos.value = { x: newX, y: newY }
      steps.value++

      isMoving.value = true
      setTimeout(() => {
        isMoving.value = false
      }, 150)
    }
  }

  const moveUp = () => movePlayer(0, -1)
  const moveDown = () => movePlayer(0, 1)
  const moveLeft = () => movePlayer(-1, 0)
  const moveRight = () => movePlayer(1, 0)

  const selectLevel = (index) => {
    initLevel(index)
  }

  const nextLevel = () => {
    if (currentLevelIndex.value < allLevels.value.length - 1) {
      initLevel(currentLevelIndex.value + 1)
    }
  }

  return {
    currentLevelIndex,
    gameMap,
    steps,
    history,
    isGameWon,
    isMoving,
    currentLevel,
    allLevels,
    customLevels,
    initLevel,
    initCustomLevel,
    refreshCustomLevels,
    undo,
    resetLevel,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    selectLevel,
    nextLevel
  }
}
