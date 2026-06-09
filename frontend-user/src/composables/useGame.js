import { ref, computed } from 'vue'
import { LEVELS } from '../data/levels'

const CUSTOM_LEVELS_KEY = 'sokoban_custom_levels'

export function useGame() {
  const currentLevelIndex = ref(0) // 当前关卡索引
  const gameMap = ref([]) // 当前游戏地图
  const steps = ref(0) // 步数统计
  const history = ref([]) // 历史状态记录（用于撤销）
  const playerPos = ref({ x: 0, y: 0 }) // 玩家位置
  const isGameWon = ref(false) // 游戏胜利状态
  const isMoving = ref(false) // 是否正在移动（用于动画锁定）
  const customLevels = ref([]) // 自定义关卡列表

  // 加载自定义关卡
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

  // 获取所有关卡（预设 + 自定义）
  const getAllLevels = () => {
    loadCustomLevels()
    return [...LEVELS, ...customLevels.value]
  }

  // 当前关卡信息
  const currentLevel = computed(() => {
    const allLevels = getAllLevels()
    return allLevels[currentLevelIndex.value] || allLevels[0]
  })

  // 总关卡数
  const totalLevels = computed(() => {
    return getAllLevels().length
  })

  // 检查是否胜利
  const checkWin = computed(() => {
    for (let y = 0; y < gameMap.value.length; y++) {
      for (let x = 0; x < gameMap.value[y].length; x++) {
        // 如果存在没有箱子的终点（值为3），则未胜利
        if (gameMap.value[y][x] === 3 || gameMap.value[y][x] === 6) {
          return false
        }
      }
    }
    return true
  })

  // 深拷贝地图数据
  const deepCopyMap = (map) => {
    return map.map(row => [...row])
  }

  // 初始化关卡
  const initLevel = (levelIndex = currentLevelIndex.value) => {
    currentLevelIndex.value = levelIndex
    isGameWon.value = false
    steps.value = 0
    history.value = []
    
    const allLevels = getAllLevels()
    // 深拷贝原始地图
    gameMap.value = deepCopyMap(allLevels[levelIndex].map)
    
    // 查找玩家初始位置
    for (let y = 0; y < gameMap.value.length; y++) {
      for (let x = 0; x < gameMap.value[y].length; x++) {
        if (gameMap.value[y][x] === 4 || gameMap.value[y][x] === 6) {
          playerPos.value = { x, y }
          return
        }
      }
    }
  }

  // 刷新关卡列表（保存自定义关卡后调用）
  const refreshLevels = () => {
    loadCustomLevels()
  }

  // 保存当前状态到历史记录
  const saveHistory = () => {
    history.value.push({
      map: deepCopyMap(gameMap.value),
      playerPos: { ...playerPos.value },
      steps: steps.value
    })
  }

  // 撤销上一步
  const undo = () => {
    if (history.value.length === 0 || isMoving.value) return
    
    const lastState = history.value.pop()
    gameMap.value = lastState.map
    playerPos.value = lastState.playerPos
    steps.value = lastState.steps
    isGameWon.value = false
  }

  // 重置当前关卡
  const resetLevel = () => {
    initLevel(currentLevelIndex.value)
  }

  // 移动玩家
  const movePlayer = (dx, dy) => {
    if (isGameWon.value || isMoving.value) return
    
    const newX = playerPos.value.x + dx
    const newY = playerPos.value.y + dy
    
    // 检查边界
    if (newY < 0 || newY >= gameMap.value.length || 
        newX < 0 || newX >= gameMap.value[0].length) {
      return
    }
    
    const targetCell = gameMap.value[newY][newX]
    
    // 目标是墙壁，无法移动
    if (targetCell === 1) return
    
    // 保存历史状态
    saveHistory()
    
    // 获取当前位置的底层（可能是地板或终点）
    const currentCell = gameMap.value[playerPos.value.y][playerPos.value.x]
    
    // 目标是箱子或箱子在终点上
    if (targetCell === 2 || targetCell === 5) {
      // 计算箱子推动后的位置
      const boxNewX = newX + dx
      const boxNewY = newY + dy
      
      // 检查箱子推动后的位置是否有效
      if (boxNewY < 0 || boxNewY >= gameMap.value.length ||
          boxNewX < 0 || boxNewX >= gameMap.value[0].length) {
        history.value.pop() // 撤销保存的历史
        return
      }
      
      const beyondCell = gameMap.value[boxNewY][boxNewX]
      
      // 箱子后面是墙壁或另一个箱子，无法推动
      if (beyondCell === 1 || beyondCell === 2 || beyondCell === 5) {
        history.value.pop() // 撤销保存的历史
        return
      }
      
      // 移动箱子
      // 箱子新位置：如果是终点(3)则变成箱子在终点(5)，否则变成普通箱子(2)
      gameMap.value[boxNewY][boxNewX] = beyondCell === 3 ? 5 : 2
      
      // 箱子原位置变成玩家
      // 如果箱子原来在终点上(5)，则玩家现在在终点上(6)，否则玩家在普通地板(4)
      gameMap.value[newY][newX] = targetCell === 5 ? 6 : 4
      
      // 玩家原位置：如果玩家原来在终点上(6)，则恢复为终点(3)，否则恢复为地板(0)
      gameMap.value[playerPos.value.y][playerPos.value.x] = currentCell === 6 ? 3 : 0
      
      // 更新玩家位置
      playerPos.value = { x: newX, y: newY }
      steps.value++
      
      // 添加移动动画锁定
      isMoving.value = true
      setTimeout(() => {
        isMoving.value = false
      }, 150)
      
      // 检查胜利
      if (checkWin.value) {
        isGameWon.value = true
      }
      
      return
    }
    
    // 目标是地板或终点，直接移动
    if (targetCell === 0 || targetCell === 3) {
      // 玩家新位置：如果是终点(3)则变成玩家在终点(6)，否则变成普通玩家(4)
      gameMap.value[newY][newX] = targetCell === 3 ? 6 : 4
      
      // 玩家原位置：如果玩家原来在终点上(6)，则恢复为终点(3)，否则恢复为地板(0)
      gameMap.value[playerPos.value.y][playerPos.value.x] = currentCell === 6 ? 3 : 0
      
      // 更新玩家位置
      playerPos.value = { x: newX, y: newY }
      steps.value++
      
      // 添加移动动画锁定
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
  
  // 选关
  const selectLevel = (index) => {
    initLevel(index)
  }

  // 下一关
  const nextLevel = () => {
    const allLevels = getAllLevels()
    if (currentLevelIndex.value < allLevels.length - 1) {
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
    totalLevels,
    customLevels,
    initLevel,
    undo,
    resetLevel,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    selectLevel,
    nextLevel,
    getAllLevels,
    refreshLevels,
    loadCustomLevels
  }
}
