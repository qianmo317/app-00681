export const PRESET_LEVELS = [
  {
    name: "第一关 - 入门",
    difficulty: "简单",
    map: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 2, 0, 0, 0, 1],
      [1, 0, 0, 0, 3, 0, 1],
      [1, 0, 0, 4, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ],
  },
  {
    name: "第二关 - 进阶",
    difficulty: "中等",
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 2, 0, 2, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 4, 0, 0, 0, 1],
      [1, 0, 3, 0, 3, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ],
  },
  {
    name: "第三关 - 挑战",
    difficulty: "困难",
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 2, 0, 2, 0, 2, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 0, 0, 4, 0, 0, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 3, 0, 3, 0, 3, 0, 1],
      [1, 0, 0, 1, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
  },
];

const STORAGE_KEY = 'sokoban_custom_levels';

const loadCustomLevels = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveCustomLevels = (levels) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
  } catch {
  }
};

let customLevels = loadCustomLevels();

export const getLevels = () => {
  return [...PRESET_LEVELS, ...customLevels];
};

export const addCustomLevel = (level) => {
  customLevels = [...customLevels, level];
  saveCustomLevels(customLevels);
  return PRESET_LEVELS.length + customLevels.length - 1;
};

export const clearCustomLevels = () => {
  customLevels = [];
  saveCustomLevels(customLevels);
};

export const LEVELS = getLevels();
