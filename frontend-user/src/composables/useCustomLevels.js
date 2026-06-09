import { ref } from 'vue'

const STORAGE_KEY = 'sokoban_custom_levels_v1'

// 模块级单例：所有组件共享同一份自定义关卡列表
const customLevels = ref(loadFromStorage())

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch (e) {
    return []
  }
}

function saveToStorage(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    // 忽略存储失败
  }
}

export function useCustomLevels() {
  // 添加一个新关卡，返回新关卡在列表中的索引
  const addCustomLevel = (level) => {
    const newList = [...customLevels.value, level]
    customLevels.value = newList
    saveToStorage(newList)
    return newList.length - 1
  }

  // 更新指定索引的关卡
  const updateCustomLevel = (index, level) => {
    if (index < 0 || index >= customLevels.value.length) return
    const newList = [...customLevels.value]
    newList[index] = level
    customLevels.value = newList
    saveToStorage(newList)
  }

  // 删除指定索引的关卡
  const removeCustomLevel = (index) => {
    if (index < 0 || index >= customLevels.value.length) return
    const newList = customLevels.value.filter((_, i) => i !== index)
    customLevels.value = newList
    saveToStorage(newList)
  }

  return {
    customLevels,
    addCustomLevel,
    updateCustomLevel,
    removeCustomLevel
  }
}
