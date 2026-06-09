import { ref, computed } from 'vue'

const STORAGE_KEY = 'sokoban-custom-levels'

const CELL_TYPES = {
  FLOOR: 0,
  WALL: 1,
  BOX: 2,
  TARGET: 3,
  PLAYER: 4,
  BOX_ON_TARGET: 5,
  PLAYER_ON_TARGET: 6
}

const TOOLS = [
  { id: 'wall', label: '墙壁', cellValue: 1, emoji: '🧱', color: 'slate' },
  { id: 'floor', label: '地板', cellValue: 0, emoji: '⬜', color: 'gray' },
  { id: 'box', label: '箱子', cellValue: 2, emoji: '📦', color: 'amber' },
  { id: 'target', label: '终点', cellValue: 3, emoji: '🎯', color: 'emerald' },
  { id: 'player', label: '玩家', cellValue: 4, emoji: '😊', color: 'cyan' },
  { id: 'eraser', label: '橡皮', cellValue: 0, emoji: '🧹', color: 'rose' }
]

export function useLevelEditor() {
  const editorMap = ref([])
  const rows = ref(8)
  const cols = ref(8)
  const currentTool = ref('wall')
  const levelName = ref('')
  const isPainting = ref(false)

  const customLevels = ref(loadCustomLevels())

  const currentToolConfig = computed(() => {
    return TOOLS.find(t => t.id === currentTool.value) || TOOLS[0]
  })

  function createEmptyMap(r, c) {
    const map = []
    for (let y = 0; y < r; y++) {
      const row = []
      for (let x = 0; x < c; x++) {
        if (y === 0 || y === r - 1 || x === 0 || x === c - 1) {
          row.push(1)
        } else {
          row.push(0)
        }
      }
      map.push(row)
    }
    return map
  }

  function initEditor() {
    editorMap.value = createEmptyMap(rows.value, cols.value)
    levelName.value = ''
  }

  function resizeMap(newRows, newCols) {
    rows.value = newRows
    cols.value = newCols
    const oldMap = editorMap.value
    const newMap = []
    for (let y = 0; y < newRows; y++) {
      const row = []
      for (let x = 0; x < newCols; x++) {
        if (y === 0 || y === newRows - 1 || x === 0 || x === newCols - 1) {
          row.push(1)
        } else if (oldMap[y] && oldMap[y][x] !== undefined) {
          row.push(oldMap[y][x])
        } else {
          row.push(0)
        }
      }
      newMap.push(row)
    }
    editorMap.value = newMap
  }

  function paintCell(y, x) {
    const tool = currentToolConfig.value
    if (!tool) return

    if (currentTool.value === 'eraser') {
      if (y === 0 || y === rows.value - 1 || x === 0 || x === cols.value - 1) return
      editorMap.value[y][x] = 0
      return
    }

    if (currentTool.value === 'floor') {
      if (y === 0 || y === rows.value - 1 || x === 0 || x === cols.value - 1) return
      editorMap.value[y][x] = 0
      return
    }

    if (tool.cellValue === 4) {
      for (let ry = 0; ry < rows.value; ry++) {
        for (let rx = 0; rx < cols.value; rx++) {
          if (editorMap.value[ry][rx] === 4) {
            editorMap.value[ry][rx] = 0
          }
          if (editorMap.value[ry][rx] === 6) {
            editorMap.value[ry][rx] = 3
          }
        }
      }
    }

    if (tool.cellValue === 2) {
      const current = editorMap.value[y][x]
      if (current === 3) {
        editorMap.value[y][x] = 5
        return
      }
    }

    if (tool.cellValue === 3) {
      const current = editorMap.value[y][x]
      if (current === 2) {
        editorMap.value[y][x] = 5
        return
      }
      if (current === 4) {
        editorMap.value[y][x] = 6
        return
      }
    }

    editorMap.value[y][x] = tool.cellValue
  }

  function onCellMouseDown(y, x) {
    isPainting.value = true
    paintCell(y, x)
  }

  function onCellMouseEnter(y, x) {
    if (isPainting.value) {
      paintCell(y, x)
    }
  }

  function onCellMouseUp() {
    isPainting.value = false
  }

  function validateMap() {
    const errors = []
    let playerCount = 0
    let boxCount = 0
    let targetCount = 0

    for (let y = 0; y < editorMap.value.length; y++) {
      for (let x = 0; x < editorMap.value[y].length; x++) {
        const cell = editorMap.value[y][x]
        if (cell === 4 || cell === 6) playerCount++
        if (cell === 2 || cell === 5) boxCount++
        if (cell === 3 || cell === 5 || cell === 6) targetCount++
      }
    }

    if (playerCount === 0) errors.push('缺少玩家起始位置')
    if (playerCount > 1) errors.push('只能有一个玩家')
    if (boxCount === 0) errors.push('至少需要一个箱子')
    if (targetCount === 0) errors.push('至少需要一个终点')
    if (boxCount !== targetCount) errors.push(`箱子数量(${boxCount})与终点数量(${targetCount})不匹配`)

    return { valid: errors.length === 0, errors }
  }

  function isSolvable(map) {
    let playerX = -1, playerY = -1
    const boxes = []
    const targets = []

    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const cell = map[y][x]
        if (cell === 4) { playerX = x; playerY = y }
        if (cell === 6) { playerX = x; playerY = y; targets.push({ x, y }) }
        if (cell === 2) boxes.push({ x, y })
        if (cell === 3) targets.push({ x, y })
        if (cell === 5) { boxes.push({ x, y }); targets.push({ x, y }) }
      }
    }

    if (playerX === -1 || boxes.length === 0 || targets.length === 0) return false

    const rows = map.length
    const cols = map[0].length
    const isWall = (y, x) => {
      if (y < 0 || y >= rows || x < 0 || x >= cols) return true
      return map[y][x] === 1
    }

    const boxKey = (bx, by) => `${bx},${by}`
    const stateKey = (px, py, boxSet) => {
      const sorted = [...boxSet].sort()
      return `${px},${py}|${sorted.join(';')}`
    }

    const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]]
    const maxStates = 500000
    let stateCount = 0

    const initialBoxSet = new Set(boxes.map(b => boxKey(b.x, b.y)))
    const visited = new Set()
    visited.add(stateKey(playerX, playerY, initialBoxSet))

    const queue = [{ px: playerX, py: playerY, boxSet: initialBoxSet }]

    while (queue.length > 0 && stateCount < maxStates) {
      const { px, py, boxSet } = queue.shift()
      stateCount++

      const allOnTarget = [...boxSet].every(bk => {
        const [bx, by] = bk.split(',').map(Number)
        return targets.some(t => t.x === bx && t.y === by)
      })
      if (allOnTarget) return true

      for (const [dx, dy] of dirs) {
        const nx = px + dx
        const ny = py + dy

        if (isWall(ny, nx)) continue

        const nk = boxKey(nx, ny)
        let newBoxSet = boxSet

        if (boxSet.has(nk)) {
          const bnx = nx + dx
          const bny = ny + dy

          if (isWall(bny, bnx)) continue
          const bnk = boxKey(bnx, bny)
          if (boxSet.has(bnk)) continue

          const isCorner = (bx, by) => {
            const wallUp = isWall(by - 1, bx)
            const wallDown = isWall(by + 1, bx)
            const wallLeft = isWall(by, bx - 1)
            const wallRight = isWall(by, bx + 1)
            return (wallUp && wallLeft) || (wallUp && wallRight) ||
                   (wallDown && wallLeft) || (wallDown && wallRight)
          }

          if (isCorner(bnx, bny) && !targets.some(t => t.x === bnx && t.y === bny)) continue

          newBoxSet = new Set(boxSet)
          newBoxSet.delete(nk)
          newBoxSet.add(bnk)
        }

        const sk = stateKey(nx, ny, newBoxSet)
        if (!visited.has(sk)) {
          visited.add(sk)
          queue.push({ px: nx, py: ny, boxSet: newBoxSet })
        }
      }
    }

    return stateCount >= maxStates ? null : false
  }

  function saveLevel() {
    const validation = validateMap()
    if (!validation.valid) {
      return { success: false, errors: validation.errors }
    }

    const solvable = isSolvable(editorMap.value)
    if (solvable === false) {
      return { success: false, errors: ['该地图无解，请调整布局'] }
    }
    if (solvable === null) {
      return { success: false, errors: ['地图过于复杂，无法验证可解性，请简化地图'] }
    }

    const name = levelName.value.trim() || `自定义关卡 ${customLevels.value.length + 1}`
    const mapCopy = editorMap.value.map(row => [...row])

    const level = {
      name,
      difficulty: '自定义',
      map: mapCopy,
      isCustom: true
    }

    customLevels.value.push(level)
    saveCustomLevels(customLevels.value)

    return { success: true, level }
  }

  function deleteCustomLevel(index) {
    customLevels.value.splice(index, 1)
    saveCustomLevels(customLevels.value)
  }

  function loadCustomLevels() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  function saveCustomLevels(levels) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(levels))
    } catch {
      // ignore
    }
  }

  function loadLevelToEditor(level) {
    rows.value = level.map.length
    cols.value = level.map[0].length
    editorMap.value = level.map.map(row => [...row])
    levelName.value = level.name || ''
  }

  function clearMap() {
    editorMap.value = createEmptyMap(rows.value, cols.value)
  }

  return {
    editorMap,
    rows,
    cols,
    currentTool,
    currentToolConfig,
    levelName,
    isPainting,
    customLevels,
    TOOLS,
    CELL_TYPES,
    initEditor,
    resizeMap,
    paintCell,
    onCellMouseDown,
    onCellMouseEnter,
    onCellMouseUp,
    validateMap,
    isSolvable,
    saveLevel,
    deleteCustomLevel,
    loadLevelToEditor,
    clearMap
  }
}
