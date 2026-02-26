<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface GameItem {
  id: string
  name: string
  description: string
  icon: string
  route: string
  available: boolean
}

const router = useRouter()

const games = ref<GameItem[]>([
  {
    id: '2048',
    name: '2048',
    description: '经典数字合成游戏，滑动方块合成2048',
    icon: '🎮',
    route: '/game/2048',
    available: true
  },
  // {
  //   id: 'uefa-draw',
  //   name: '欧冠抽签',
  //   description: '模拟欧冠36队新赛制抽签，联赛阶段',
  //   icon: '🏆',
  //   route: '/game/uefa-draw',
  //   available: false
  // },
  // {
  //   id: 'snake',
  //   name: '贪吃蛇',
  //   description: '控制小蛇吃食物，不断成长',
  //   icon: '🐍',
  //   route: '/game/snake',
  //   available: false
  // },
  // {
  //   id: 'tetris',
  //   name: '俄罗斯方块',
  //   description: '经典方块消除游戏',
  //   icon: '🧱',
  //   route: '/game/tetris',
  //   available: false
  // },
  // {
  //   id: 'minesweeper',
  //   name: '扫雷',
  //   description: '经典益智扫雷游戏',
  //   icon: '💣',
  //   route: '/game/minesweeper',
  //   available: false
  // }
])

function goToGame(game: GameItem) {
  if (game.available) {
    router.push(game.route)
  }
}
</script>

<template>
  <div class="home">
    <header class="header">
      <h1 class="title">游戏中心</h1>
      <p class="subtitle">选择一个游戏开始吧</p>
    </header>

    <main class="game-grid">
      <div
        v-for="game in games"
        :key="game.id"
        class="game-card"
        :class="{ disabled: !game.available }"
        @click="goToGame(game)"
      >
        <div class="game-icon">{{ game.icon }}</div>
        <h2 class="game-name">{{ game.name }}</h2>
        <p class="game-desc">{{ game.description }}</p>
        <span v-if="!game.available" class="coming-soon">即将推出</span>
      </div>
    </main>

    <footer class="footer">
      <p>更多游戏开发中...</p>
    </footer>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  color: #fff;
  font-size: 48px;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  max-width: 1200px;
  width: 100%;
}

.game-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.game-card:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
}

.game-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.game-icon {
  font-size: 64px;
  margin-bottom: 15px;
}

.game-name {
  color: #fff;
  font-size: 24px;
  margin-bottom: 10px;
}

.game-desc {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.5;
}

.coming-soon {
  position: absolute;
  top: 15px;
  right: -30px;
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 5px 40px;
  font-size: 12px;
  transform: rotate(45deg);
}

.footer {
  margin-top: auto;
  padding-top: 40px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

@media (max-width: 600px) {
  .title {
    font-size: 36px;
  }

  .game-grid {
    grid-template-columns: 1fr;
  }
}
</style>
