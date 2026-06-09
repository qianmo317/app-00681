import { ref } from 'vue'

const CELL = {
  FLOOR: 0,
  WALL: 1,
  BOX: 2,
  TARGET: 3,
  PLAYER: 4,
  BOX_ON_TARGET: 5,
  PLAYER_ON_TARGET: 6
}

export function useLevelValidator() {
  const errors = ref([])

  const deepCopyMap = (map) => {
    return map.map(row => [...row])
  }

  const getBaseTerrain = (map) => {
    const base = []
    for (let y = 0; y < map.length; y++) {
      const row = []
      for (let x = 0; x < map[y].length; x++) {
        const cell = map[y][x]
        if (cell === CELL.WALL) {
          row.push(CELL.WALL)
        } else if (cell === CELL.TARGET || cell === CELL.BOX_ON_TARGET || cell === CELL.PLAYER_ON_TARGET) {
          row.push(CELL.TARGET)
        } else {
          row.push(CELL.FLOOR)
        }
      }
      base.push(row)
    }
    return base
  }

  const countElements = (map) => {
    let playerCount = 0
    let boxCount = 0
    let targetCount = 0

    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const cell = map[y][x]
        if (cell === CELL.PLAYER || cell === CELL.PLAYER_ON_TARGET) playerCount++
        if (cell === CELL.BOX || cell === CELL.BOX_ON_TARGET) boxCount++
        if (cell === CELL.TARGET || cell === CELL.BOX_ON_TARGET || cell === CELL.PLAYER_ON_TARGET) targetCount++
      }
    }

    return { playerCount, boxCount, targetCount }
  }

  const isWalkable = (map, x, y, ignoreBoxes = false) => {
    if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) return false
    const cell = map[y][x]
    if (cell === CELL.WALL) return false
    if (!ignoreBoxes && (cell === CELL.BOX || cell === CELL.BOX_ON_TARGET)) return false
    return true
  }

  const getPlayerPosition = (map) => {
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        if (map[y][x] === CELL.PLAYER || map[y][x] === CELL.PLAYER_ON_TARGET) {
          return { x, y }
        }
      }
    }
    return null
  }

  const getBoxesAndTargets = (map) => {
    const boxes = []
    const targets = []
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const cell = map[y][x]
        if (cell === CELL.BOX) boxes.push({ x, y, onTarget: false })
        if (cell === CELL.BOX_ON_TARGET) boxes.push({ x, y, onTarget: true })
        if (cell === CELL.TARGET || cell === CELL.BOX_ON_TARGET || cell === CELL.PLAYER_ON_TARGET) {
          targets.push({ x, y })
        }
      }
    }
    return { boxes, targets }
  }

  const floodFill = (map, startX, startY, ignoreBoxes = false) => {
    const visited = new Set()
    const queue = [{ x: startX, y: startY }]
    const reachable = []

    while (queue.length > 0) {
      const { x, y } = queue.shift()
      const key = `${x},${y}`

      if (visited.has(key)) continue
      visited.add(key)
      reachable.push({ x, y })

      const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]]
      for (const [dx, dy] of directions) {
        const nx = x + dx
        const ny = y + dy
        if (isWalkable(map, nx, ny, ignoreBoxes) && !visited.has(`${nx},${ny}`)) {
          queue.push({ x: nx, y: ny })
        }
      }
    }

    return reachable
  }

  const buildMapWithBoxes = (baseTerrain, boxPositions) => {
    const tempMap = deepCopyMap(baseTerrain)
    for (const box of boxPositions) {
      if (tempMap[box.y] && tempMap[box.y][box.x] !== undefined) {
        if (tempMap[box.y][box.x] === CELL.TARGET) {
          tempMap[box.y][box.x] = CELL.BOX_ON_TARGET
        } else if (tempMap[box.y][box.x] === CELL.FLOOR) {
          tempMap[box.y][box.x] = CELL.BOX
        }
      }
    }
    return tempMap
  }

  const canReachPosition = (baseTerrain, playerX, playerY, targetX, targetY, boxPositions) => {
    const tempMap = buildMapWithBoxes(baseTerrain, boxPositions)
    const reachable = floodFill(tempMap, playerX, playerY, false)
    return reachable.some(pos => pos.x === targetX && pos.y === targetY)
  }

  const canPushBoxToTarget = (baseTerrain, startBox, target, boxes, playerStart) => {
    const queue = []
    const visited = new Set()
    
    const initialState = {
      boxX: startBox.x,
      boxY: startBox.y,
      playerX: playerStart.x,
      playerY: playerStart.y
    }
    
    queue.push(initialState)
    visited.add(`${initialState.boxX},${initialState.boxY},${initialState.playerX},${initialState.playerY}`)

    let iterations = 0
    const maxIterations = 15000

    while (queue.length > 0 && iterations < maxIterations) {
      iterations++
      const state = queue.shift()
      const { boxX, boxY, playerX, playerY } = state

      if (boxX === target.x && boxY === target.y) {
        return true
      }

      const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]]
      
      for (const [dx, dy] of directions) {
        const newBoxX = boxX + dx
        const newBoxY = boxY + dy
        const playerNeededX = boxX - dx
        const playerNeededY = boxY - dy

        if (newBoxY < 0 || newBoxY >= baseTerrain.length || newBoxX < 0 || newBoxX >= baseTerrain[0].length) continue
        if (baseTerrain[newBoxY][newBoxX] === CELL.WALL) continue

        const otherBoxes = boxes.filter(b => !(b.x === startBox.x && b.y === startBox.y))
        const currentOtherBoxes = otherBoxes.concat([{ x: boxX, y: boxY }])
        const boxesForReachCheck = currentOtherBoxes.filter(b => !(b.x === newBoxX && b.y === newBoxY))
        
        if (!canReachPosition(baseTerrain, playerX, playerY, playerNeededX, playerNeededY, boxesForReachCheck)) {
          continue
        }

        const newStateKey = `${newBoxX},${newBoxY},${boxX},${boxY}`
        if (!visited.has(newStateKey)) {
          visited.add(newStateKey)
          queue.push({
            boxX: newBoxX,
            boxY: newBoxY,
            playerX: boxX,
            playerY: boxY
          })
        }
      }
    }

    return false
  }

  const isDeadPosition = (baseTerrain, x, y) => {
    if (baseTerrain[y][x] === CELL.WALL) return true
    if (baseTerrain[y][x] === CELL.TARGET) return false

    const upWall = y > 0 && baseTerrain[y-1][x] === CELL.WALL
    const downWall = y < baseTerrain.length - 1 && baseTerrain[y+1][x] === CELL.WALL
    const leftWall = x > 0 && baseTerrain[y][x-1] === CELL.WALL
    const rightWall = x < baseTerrain[0].length - 1 && baseTerrain[y][x+1] === CELL.WALL

    if ((upWall || downWall) && (leftWall || rightWall)) {
      return true
    }

    return false
  }

  const hasDeadCorners = (baseTerrain, boxes) => {
    for (const box of boxes) {
      if (!box.onTarget && isDeadPosition(baseTerrain, box.x, box.y)) {
        return true
      }
    }
    return false
  }

  const validateMap = (map) => {
    errors.value = []

    if (!map || map.length === 0) {
      errors.value.push('地图不能为空')
      return false
    }

    const width = map[0].length
    for (let y = 0; y < map.length; y++) {
      if (map[y].length !== width) {
        errors.value.push('地图的每一行长度必须相同')
        return false
      }
    }

    const { playerCount, boxCount, targetCount } = countElements(map)

    if (playerCount === 0) {
      errors.value.push('地图必须包含至少一个玩家')
    }
    if (playerCount > 1) {
      errors.value.push('地图只能包含一个玩家')
    }
    if (boxCount === 0) {
      errors.value.push('地图必须包含至少一个箱子')
    }
    if (targetCount === 0) {
      errors.value.push('地图必须包含至少一个终点')
    }
    if (boxCount !== targetCount) {
      errors.value.push(`箱子数量(${boxCount})必须与终点数量(${targetCount})相等`)
    }

    if (errors.value.length > 0) return false

    const playerPos = getPlayerPosition(map)
    const { boxes, targets } = getBoxesAndTargets(map)
    const baseTerrain = getBaseTerrain(map)

    if (hasDeadCorners(baseTerrain, boxes)) {
      errors.value.push('检测到箱子位于无法移动的死角位置')
      return false
    }

    const reachableNoBoxes = floodFill(baseTerrain, playerPos.x, playerPos.y, true)
    const reachableSet = new Set(reachableNoBoxes.map(r => `${r.x},${r.y}`))

    for (const box of boxes) {
      const adjacentPositions = [
        { x: box.x, y: box.y - 1 },
        { x: box.x, y: box.y + 1 },
        { x: box.x - 1, y: box.y },
        { x: box.x + 1, y: box.y }
      ]
      const canReachBox = adjacentPositions.some(pos => reachableSet.has(`${pos.x},${pos.y}`))
      if (!canReachBox) {
        errors.value.push('玩家无法到达所有箱子的位置')
        return false
      }
    }

    for (const target of targets) {
      let canReach = false
      for (const box of boxes) {
        if (canPushBoxToTarget(baseTerrain, box, target, boxes, playerPos)) {
          canReach = true
          break
        }
      }
      if (!canReach) {
        errors.value.push('存在无法将箱子推到的终点')
        return false
      }
    }

    return true
  }

  return {
    errors,
    validateMap,
    countElements,
    CELL
  }
}
