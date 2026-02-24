<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const grid = ref<number[][]>([])
const score = ref(0)
const best = ref(0)
const gameWon = ref(false)
const showGameOver = ref(false)
const isWin = ref(false)

const STORAGE_KEY = 'best2048'

function init() {
  grid.value = Array(4).fill(null).map(() => Array(4).fill(0))
  score.value = 0
  gameWon.value = false
  showGameOver.value = false
  best.value = parseInt(localStorage.getItem(STORAGE_KEY) || '0')
  addRandomTile()
  addRandomTile()
}

function addRandomTile() {
  const empty: { i: number; j: number }[] = []
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid.value[i][j] === 0) {
        empty.push({ i, j })
      }
    }
  }
  if (empty.length > 0) {
    const { i, j } = empty[Math.floor(Math.random() * empty.length)]
    grid.value[i][j] = Math.random() < 0.9 ? 2 : 4
  }
}

function slide(row: number[]): number[] {
  let arr = row.filter(val => val !== 0)
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2
      score.value += arr[i]
      if (arr[i] === 2048 && !gameWon.value) {
        gameWon.value = true
        setTimeout(() => {
          isWin.value = true
          showGameOver.value = true
        }, 300)
      }
      arr.splice(i + 1, 1)
    }
  }
  while (arr.length < 4) arr.push(0)
  return arr
}

function move(direction: 'up' | 'down' | 'left' | 'right') {
  const oldGrid = JSON.stringify(grid.value)

  if (direction === 'left') {
    for (let i = 0; i < 4; i++) {
      grid.value[i] = slide(grid.value[i])
    }
  } else if (direction === 'right') {
    for (let i = 0; i < 4; i++) {
      grid.value[i] = slide([...grid.value[i]].reverse()).reverse()
    }
  } else if (direction === 'up') {
    for (let j = 0; j < 4; j++) {
      let col = [grid.value[0][j], grid.value[1][j], grid.value[2][j], grid.value[3][j]]
      col = slide(col)
      for (let i = 0; i < 4; i++) grid.value[i][j] = col[i]
    }
  } else if (direction === 'down') {
    for (let j = 0; j < 4; j++) {
      let col = [grid.value[3][j], grid.value[2][j], grid.value[1][j], grid.value[0][j]]
      col = slide(col)
      for (let i = 0; i < 4; i++) grid.value[3 - i][j] = col[i]
    }
  }

  if (JSON.stringify(grid.value) !== oldGrid) {
    addRandomTile()
    updateScore()
    if (!canMove()) {
      setTimeout(() => {
        isWin.value = false
        showGameOver.value = true
      }, 300)
    }
  }
}

function updateScore() {
  if (score.value > best.value) {
    best.value = score.value
    localStorage.setItem(STORAGE_KEY, String(best.value))
  }
}

function canMove(): boolean {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid.value[i][j] === 0) return true
      if (j < 3 && grid.value[i][j] === grid.value[i][j + 1]) return true
      if (i < 3 && grid.value[i][j] === grid.value[i + 1][j]) return true
    }
  }
  return false
}

function newGame() {
  init()
}

function goHome() {
  router.push('/')
}

function getCellClass(value: number): string {
  if (value === 0) return ''
  return `cell-${value}`
}

const flatGrid = computed(() => {
  const cells: { value: number; row: number; col: number }[] = []
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      cells.push({ value: grid.value[i]?.[j] || 0, row: i, col: j })
    }
  }
  return cells
})

function handleKeydown(e: KeyboardEvent) {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault()
    const directions: Record<string, 'up' | 'down' | 'left' | 'right'> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right'
    }
    move(directions[e.key])
  }
}

let touchStartX = 0
let touchStartY = 0

function handleTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

function handleTouchEnd(e: TouchEvent) {
  if (!touchStartX || !touchStartY) return
  const touchEndX = e.changedTouches[0].clientX
  const touchEndY = e.changedTouches[0].clientY
  const dx = touchEndX - touchStartX
  const dy = touchEndY - touchStartY
  const minSwipe = 30

  if (Math.abs(dx) > Math.abs(dy)) {
    if (Math.abs(dx) > minSwipe) {
      move(dx > 0 ? 'right' : 'left')
    }
  } else {
    if (Math.abs(dy) > minSwipe) {
      move(dy > 0 ? 'down' : 'up')
    }
  }
  touchStartX = 0
  touchStartY = 0
}

onMounted(() => {
  init()
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('touchstart', handleTouchStart)
  document.addEventListener('touchend', handleTouchEnd)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('touchstart', handleTouchStart)
  document.removeEventListener('touchend', handleTouchEnd)
})
</script>

<template>
  <div class="game-page">
    <button class="back-btn" @click="goHome">← 返回</button>
    
    <h1 class="game-title">2048</h1>

    <div class="game-header">
      <div class="score-container">
        <div class="score-label">得分</div>
        <div class="score-value">{{ score }}</div>
      </div>
      <div class="score-container">
        <div class="score-label">最高分</div>
        <div class="score-value">{{ best }}</div>
      </div>
    </div>

    <div class="game-container">
      <div class="grid">
        <div
          v-for="(cell, index) in flatGrid"
          :key="index"
          class="cell"
          :class="getCellClass(cell.value)"
        >
          {{ cell.value || '' }}
        </div>
      </div>
    </div>

    <div class="controls">
      <button class="control-btn" @click="newGame">新游戏</button>
    </div>

    <p class="instructions">使用 ↑ ↓ ← → 键或滑动来移动方块</p>

    <div v-if="showGameOver" class="game-over-overlay">
      <div class="game-over-content">
        <h2 :class="{ win: isWin }">
          {{ isWin ? '🎉 恭喜你赢了！' : '游戏结束' }}
        </h2>
        <p>最终得分: {{ score }}</p>
        <button class="control-btn" @click="newGame">再来一局</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
}

.back-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(-3px);
}

.game-title {
  color: #fff;
  font-size: 48px;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.game-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.score-container {
  background: rgba(255, 255, 255, 0.2);
  padding: 10px 20px;
  border-radius: 10px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.score-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  text-transform: uppercase;
}

.score-value {
  color: #fff;
  font-size: 28px;
  font-weight: bold;
}

.game-container {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 15px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 90px);
  grid-template-rows: repeat(4, 90px);
  gap: 10px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 10px;
}

.cell {
  width: 90px;
  height: 90px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  color: #776e65;
  transition: all 0.15s ease;
}

.cell-2 { background: #eee4da; }
.cell-4 { background: #ede0c8; }
.cell-8 { background: #f2b179; color: #fff; }
.cell-16 { background: #f59563; color: #fff; }
.cell-32 { background: #f67c5f; color: #fff; }
.cell-64 { background: #f65e3b; color: #fff; }
.cell-128 { background: #edcf72; color: #fff; font-size: 28px; }
.cell-256 { background: #edcc61; color: #fff; font-size: 28px; }
.cell-512 { background: #edc850; color: #fff; font-size: 28px; }
.cell-1024 { background: #edc53f; color: #fff; font-size: 24px; }
.cell-2048 { background: #edc22e; color: #fff; font-size: 24px; box-shadow: 0 0 30px #edc22e; }

.controls {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.control-btn {
  background: rgba(255, 255, 255, 0.9);
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  color: #776e65;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.instructions {
  color: rgba(255, 255, 255, 0.8);
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
}

.game-over-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.game-over-content {
  background: #fff;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
}

.game-over-content h2 {
  color: #776e65;
  font-size: 36px;
  margin-bottom: 10px;
}

.game-over-content h2.win {
  color: #edc22e;
}

.game-over-content p {
  color: #999;
  margin-bottom: 20px;
}

@media (max-width: 480px) {
  .grid {
    grid-template-columns: repeat(4, 70px);
    grid-template-rows: repeat(4, 70px);
    gap: 8px;
  }
  
  .cell {
    width: 70px;
    height: 70px;
    font-size: 24px;
  }
  
  .cell-128,
  .cell-256,
  .cell-512 {
    font-size: 22px;
  }
  
  .cell-1024,
  .cell-2048 {
    font-size: 18px;
  }
  
  .game-title {
    font-size: 36px;
  }
}
</style>
