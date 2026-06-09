import { ref, computed } from 'vue'

// 单元格类型常量
export const CELL = {
  FLOOR: 0,
  WALL: 1,
  BOX: 2,
  GOAL: 3,
  PLAYER: 4,
  BOX_ON_GOAL: 5,
  PLAYER_ON_GOAL: 6
}

// 工具类型（编辑器画笔）
export const TOOLS = {
  FLOOR: 'floor',
  WALL: 'wall',
  BOX: 'box',
  GOAL: 'goal',
  PLAYER: 'player',
  ERASER: 'eraser'
}

// 创建一个空白地图
const createEmptyMap = (rows, cols) => {
  const map = []
  for (let y = 0; y < rows; y++) {
    const row = []
    for (let x = 0; x < cols; x++) {
      // 边界默认是墙壁，内部是地板
      const isEdge = y === 0 || y === rows - 1 || x === 0 || x === cols - 1
      row.push(isEdge ? CELL.WALL : CELL.FLOOR)
    }
    map.push(row)
  }
  return map
}

// 深拷贝地图
const deepCopyMap = (map) => map.map(row => [...row])

/**
 * 提取地图中的玩家、箱子、终点信息
 */
const extractEntities = (map) => {
  const players = []
  const boxes = []
  const goals = []
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      const cell = map[y][x]
      if (cell === CELL.PLAYER || cell === CELL.PLAYER_ON_GOAL) {
        players.push({ x, y })
      }
      if (cell === CELL.BOX || cell === CELL.BOX_ON_GOAL) {
        boxes.push({ x, y })
      }
      if (cell === CELL.GOAL || cell === CELL.BOX_ON_GOAL || cell === CELL.PLAYER_ON_GOAL) {
        goals.push({ x, y })
      }
    }
  }
  return { players, boxes, goals }
}

/**
 * 推箱子求解器（BFS）
 * 返回 { solvable: boolean, reason?: string }
 *
 * 状态编码：玩家位置 + 箱子位置排序集合
 * 限制：最大状态数 200000，避免大型地图卡死
 */
const MAX_STATES = 200000

const solveSokoban = (map) => {
  const rows = map.length
  const cols = map[0]?.length || 0
  if (rows === 0 || cols === 0) return false

  const { players, boxes, goals } = extractEntities(map)
  if (players.length !== 1) return false
  if (boxes.length === 0 || goals.length === 0) return false
  if (boxes.length !== goals.length) return false

  // 静态墙壁信息
  const isWall = (x, y) => {
    if (y < 0 || y >= rows || x < 0 || x >= cols) return true
    return map[y][x] === CELL.WALL
  }

  // 终点集合
  const goalSet = new Set(goals.map(g => `${g.x},${g.y}`))

  const player = players[0]
  // 初始箱子位置（排序后用作哈希）
  const sortBoxes = (arr) => arr
    .map(b => `${b.x},${b.y}`)
    .sort()
    .join('|')

  const initBoxKey = sortBoxes(boxes)
  // 检查初始状态是否已经胜利
  if (boxes.every(b => goalSet.has(`${b.x},${b.y}`))) return true

  const visited = new Set()
  const initState = `${player.x},${player.y}#${initBoxKey}`
  visited.add(initState)

  // BFS 队列
  const queue = [{
    px: player.x,
    py: player.y,
    boxes: boxes.map(b => ({ ...b }))
  }]

  const dirs = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 }
  ]

  let processed = 0

  while (queue.length > 0) {
    const state = queue.shift()
    processed++
    if (processed > MAX_STATES) return false

    // 当前箱子位置集合（用于 O(1) 查找）
    const boxPosSet = new Set(state.boxes.map(b => `${b.x},${b.y}`))

    for (const { dx, dy } of dirs) {
      const nx = state.px + dx
      const ny = state.py + dy

      if (isWall(nx, ny)) continue

      const targetKey = `${nx},${ny}`

      if (boxPosSet.has(targetKey)) {
        // 推动箱子
        const bx = nx + dx
        const by = ny + dy
        if (isWall(bx, by)) continue
        if (boxPosSet.has(`${bx},${by}`)) continue

        // 死锁剪枝：如果箱子推到非终点的角落，剪枝
        if (!goalSet.has(`${bx},${by}`) && isCornerDeadlock(bx, by, isWall)) {
          continue
        }

        // 生成新箱子集合
        const newBoxes = state.boxes.map(b =>
          (b.x === nx && b.y === ny) ? { x: bx, y: by } : { ...b }
        )
        const newBoxKey = sortBoxes(newBoxes)
        const newState = `${nx},${ny}#${newBoxKey}`
        if (visited.has(newState)) continue
        visited.add(newState)

        // 检查胜利
        if (newBoxes.every(b => goalSet.has(`${b.x},${b.y}`))) {
          return true
        }

        queue.push({ px: nx, py: ny, boxes: newBoxes })
      } else {
        // 普通移动
        const newState = `${nx},${ny}#${sortBoxes(state.boxes)}`
        if (visited.has(newState)) continue
        visited.add(newState)
        queue.push({ px: nx, py: ny, boxes: state.boxes })
      }
    }
  }

  return false
}

/**
 * 简单角落死锁检测：箱子被推到非终点位置且两侧相邻是墙壁形成角
 */
const isCornerDeadlock = (x, y, isWall) => {
  const up = isWall(x, y - 1)
  const down = isWall(x, y + 1)
  const left = isWall(x - 1, y)
  const right = isWall(x + 1, y)
  return (up && left) || (up && right) || (down && left) || (down && right)
}

/**
 * 验证地图，返回 { ok, errors }
 */
export const validateLevelMap = (map) => {
  const errors = []
  if (!Array.isArray(map) || map.length === 0) {
    errors.push('地图为空')
    return { ok: false, errors }
  }

  const { players, boxes, goals } = extractEntities(map)

  if (players.length === 0) errors.push('地图必须包含一个玩家')
  if (players.length > 1) errors.push('地图只能包含一个玩家')
  if (boxes.length === 0) errors.push('地图必须至少包含一个箱子')
  if (goals.length === 0) errors.push('地图必须至少包含一个终点')
  if (boxes.length !== goals.length) {
    errors.push(`箱子数(${boxes.length})与终点数(${goals.length})不一致`)
  }

  if (errors.length > 0) return { ok: false, errors }

  // 求解器验证
  const solvable = solveSokoban(map)
  if (!solvable) {
    errors.push('地图无解，无法被通关（请检查布局是否合理）')
    return { ok: false, errors }
  }

  return { ok: true, errors: [] }
}

/**
 * 关卡编辑器 Composable
 */
export function useLevelEditor() {
  const DEFAULT_ROWS = 8
  const DEFAULT_COLS = 8

  const editorMap = ref(createEmptyMap(DEFAULT_ROWS, DEFAULT_COLS))
  const editorRows = ref(DEFAULT_ROWS)
  const editorCols = ref(DEFAULT_COLS)
  const currentTool = ref(TOOLS.WALL)
  const levelName = ref('')
  const levelDifficulty = ref('自定义')

  // 编辑器状态信息
  const editorStats = computed(() => {
    const { players, boxes, goals } = extractEntities(editorMap.value)
    return {
      players: players.length,
      boxes: boxes.length,
      goals: goals.length
    }
  })

  // 选中工具
  const selectTool = (tool) => {
    currentTool.value = tool
  }

  // 在指定单元格上应用当前工具
  const paintCell = (x, y) => {
    if (y < 0 || y >= editorMap.value.length) return
    if (x < 0 || x >= editorMap.value[y].length) return

    const tool = currentTool.value
    const current = editorMap.value[y][x]

    let newCell = current

    switch (tool) {
      case TOOLS.WALL:
        newCell = CELL.WALL
        break
      case TOOLS.FLOOR:
        newCell = CELL.FLOOR
        break
      case TOOLS.ERASER:
        newCell = CELL.FLOOR
        break
      case TOOLS.BOX: {
        // 箱子放置：如果当前格已是终点，则变成"箱子在终点上"
        const onGoal = current === CELL.GOAL || current === CELL.BOX_ON_GOAL || current === CELL.PLAYER_ON_GOAL
        newCell = onGoal ? CELL.BOX_ON_GOAL : CELL.BOX
        break
      }
      case TOOLS.GOAL: {
        // 放置终点：根据当前格上面的内容叠加
        if (current === CELL.BOX) newCell = CELL.BOX_ON_GOAL
        else if (current === CELL.PLAYER) newCell = CELL.PLAYER_ON_GOAL
        else newCell = CELL.GOAL
        break
      }
      case TOOLS.PLAYER: {
        // 玩家是唯一的：先清掉旧的玩家
        for (let yy = 0; yy < editorMap.value.length; yy++) {
          for (let xx = 0; xx < editorMap.value[yy].length; xx++) {
            const c = editorMap.value[yy][xx]
            if (c === CELL.PLAYER) editorMap.value[yy][xx] = CELL.FLOOR
            else if (c === CELL.PLAYER_ON_GOAL) editorMap.value[yy][xx] = CELL.GOAL
          }
        }
        // 重新读取当前位置（因为可能已被清理）
        const refreshed = editorMap.value[y][x]
        const onGoal = refreshed === CELL.GOAL || refreshed === CELL.BOX_ON_GOAL
        newCell = onGoal ? CELL.PLAYER_ON_GOAL : CELL.PLAYER
        break
      }
    }

    if (newCell !== editorMap.value[y][x]) {
      editorMap.value[y][x] = newCell
      // 触发响应式更新
      editorMap.value = [...editorMap.value]
    }
  }

  // 调整地图尺寸
  const resizeMap = (rows, cols) => {
    const r = Math.max(3, Math.min(20, parseInt(rows) || DEFAULT_ROWS))
    const c = Math.max(3, Math.min(20, parseInt(cols) || DEFAULT_COLS))
    const newMap = createEmptyMap(r, c)
    // 尝试保留原来内容
    for (let y = 0; y < Math.min(r, editorMap.value.length); y++) {
      for (let x = 0; x < Math.min(c, editorMap.value[0].length); x++) {
        newMap[y][x] = editorMap.value[y][x]
      }
    }
    editorMap.value = newMap
    editorRows.value = r
    editorCols.value = c
  }

  // 清空地图
  const clearMap = () => {
    editorMap.value = createEmptyMap(editorRows.value, editorCols.value)
  }

  // 加载已有关卡到编辑器
  const loadLevel = (level) => {
    if (!level || !Array.isArray(level.map)) return
    editorMap.value = deepCopyMap(level.map)
    editorRows.value = level.map.length
    editorCols.value = level.map[0]?.length || 0
    levelName.value = level.name || ''
    levelDifficulty.value = level.difficulty || '自定义'
  }

  // 重置编辑器到初始状态
  const resetEditor = () => {
    editorMap.value = createEmptyMap(DEFAULT_ROWS, DEFAULT_COLS)
    editorRows.value = DEFAULT_ROWS
    editorCols.value = DEFAULT_COLS
    levelName.value = ''
    levelDifficulty.value = '自定义'
    currentTool.value = TOOLS.WALL
  }

  // 验证当前编辑器地图
  const validateEditorMap = () => validateLevelMap(editorMap.value)

  // 构建关卡数据（与 LEVELS 数组兼容）
  const buildLevelData = () => ({
    name: (levelName.value || '').trim() || '未命名自定义关卡',
    difficulty: levelDifficulty.value || '自定义',
    map: deepCopyMap(editorMap.value),
    custom: true
  })

  return {
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
    loadLevel,
    resetEditor,
    validateEditorMap,
    buildLevelData
  }
}
