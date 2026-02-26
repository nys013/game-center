<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

interface Team {
  id: string
  name: string
  country: string
  pot: number
  flag: string
}

interface Opponent {
  team: Team
  isHome: boolean
}

interface TeamSchedule {
  team: Team
  opponents: Opponent[]
}
// TODO:还有问题，后面有时间再排查吧
// 2024-25赛季欧冠36支球队数据
const teamsData: Team[] = [
  // Pot 1 (9支)
  { id: 'real', name: '皇家马德里', country: 'ESP', pot: 1, flag: '🇪🇸' },
  { id: 'mancity', name: '曼城', country: 'ENG', pot: 1, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'bayern', name: '拜仁慕尼黑', country: 'GER', pot: 1, flag: '🇩🇪' },
  { id: 'psg', name: '巴黎圣日耳曼', country: 'FRA', pot: 1, flag: '🇫🇷' },
  { id: 'liverpool', name: '利物浦', country: 'ENG', pot: 1, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'inter', name: '国际米兰', country: 'ITA', pot: 1, flag: '🇮🇹' },
  { id: 'dortmund', name: '多特蒙德', country: 'GER', pot: 1, flag: '🇩🇪' },
  { id: 'leipzig', name: '莱比锡', country: 'GER', pot: 1, flag: '🇩🇪' },
  { id: 'barcelona', name: '巴塞罗那', country: 'ESP', pot: 1, flag: '🇪🇸' },

  // Pot 2 (9支)
  { id: 'leverkusen', name: '勒沃库森', country: 'GER', pot: 2, flag: '🇩🇪' },
  { id: 'atletico', name: '马德里竞技', country: 'ESP', pot: 2, flag: '🇪🇸' },
  { id: 'atalanta', name: '亚特兰大', country: 'ITA', pot: 2, flag: '🇮🇹' },
  { id: 'juventus', name: '尤文图斯', country: 'ITA', pot: 2, flag: '🇮🇹' },
  { id: 'benfica', name: '本菲卡', country: 'POR', pot: 2, flag: '🇵🇹' },
  { id: 'arsenal', name: '阿森纳', country: 'ENG', pot: 2, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'brugge', name: '布鲁日', country: 'BEL', pot: 2, flag: '🇧🇪' },
  { id: 'shakhtar', name: '顿涅茨克矿工', country: 'UKR', pot: 2, flag: '🇺🇦' },
  { id: 'milan', name: 'AC米兰', country: 'ITA', pot: 2, flag: '🇮🇹' },

  // Pot 3 (9支)
  { id: 'feyenoord', name: '费耶诺德', country: 'NED', pot: 3, flag: '🇳🇱' },
  { id: 'sporting', name: '里斯本竞技', country: 'POR', pot: 3, flag: '🇵🇹' },
  { id: 'psv', name: '埃因霍温', country: 'NED', pot: 3, flag: '🇳🇱' },
  { id: 'celtic', name: '凯尔特人', country: 'SCO', pot: 3, flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { id: 'salzburg', name: '萨尔茨堡', country: 'AUT', pot: 3, flag: '🇦🇹' },
  { id: 'youngboys', name: '年轻人', country: 'SUI', pot: 3, flag: '🇨🇭' },
  { id: 'dinamo', name: '萨格勒布迪纳摩', country: 'CRO', pot: 3, flag: '🇭🇷' },
  { id: 'lille', name: '里尔', country: 'FRA', pot: 3, flag: '🇫🇷' },
  { id: 'redstar', name: '贝尔格莱德红星', country: 'SRB', pot: 3, flag: '🇷🇸' },

  // Pot 4 (9支)
  { id: 'monaco', name: '摩纳哥', country: 'FRA', pot: 4, flag: '🇲🇨' },
  { id: 'sparta', name: '布拉格斯巴达', country: 'CZE', pot: 4, flag: '🇨🇿' },
  { id: 'villa', name: '阿斯顿维拉', country: 'ENG', pot: 4, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'bologna', name: '博洛尼亚', country: 'ITA', pot: 4, flag: '🇮🇹' },
  { id: 'girona', name: '赫罗纳', country: 'ESP', pot: 4, flag: '🇪🇸' },
  { id: 'stuttgart', name: '斯图加特', country: 'GER', pot: 4, flag: '🇩🇪' },
  { id: 'sturm', name: '格拉茨风暴', country: 'AUT', pot: 4, flag: '🇦🇹' },
  { id: 'brest', name: '布雷斯特', country: 'FRA', pot: 4, flag: '🇫🇷' },
  { id: 'slovan', name: '布拉迪斯拉发斯洛万', country: 'SVK', pot: 4, flag: '🇸🇰' },
]

type DrawPhase = 'intro' | 'drawing' | 'result'

const currentPhase = ref<DrawPhase>('intro')
const teams = ref<Team[]>([...teamsData])
const schedules = ref<Map<string, Opponent[]>>(new Map())
const isDrawing = ref(false)
const drawSpeed = ref<'slow' | 'fast' | 'instant'>('fast')
const currentDrawingTeam = ref<Team | null>(null)
const currentDrawingOpponents = ref<Opponent[]>([])
const drawnTeams = ref<Set<string>>(new Set())
const selectedTeam = ref<Team | null>(null)
const allMatches = ref<{ home: Team; away: Team }[]>([])

const teamsByPot = computed(() => {
  const pots: Record<number, Team[]> = { 1: [], 2: [], 3: [], 4: [] }
  teams.value.forEach(team => {
    pots[team.pot].push(team)
  })
  return pots
})

const leagueSchedules = computed<TeamSchedule[]>(() => {
  return teams.value.map(team => ({
    team,
    opponents: schedules.value.get(team.id) || []
  }))
})

const selectedTeamSchedule = computed(() => {
  if (!selectedTeam.value) return null
  return leagueSchedules.value.find(s => s.team.id === selectedTeam.value!.id)
})

const drawProgress = computed(() => {
  return `${drawnTeams.value.size} / ${teams.value.length}`
})

function goHome() {
  router.push('/')
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function getSchedule(teamId: string): Opponent[] {
  return schedules.value.get(teamId) || []
}

function canMatch(team: Team, opponent: Team): boolean {
  if (team.id === opponent.id) return false
  if (team.country === opponent.country) return false

  const teamSchedule = getSchedule(team.id)
  const opponentSchedule = getSchedule(opponent.id)

  // 已经配对过
  if (teamSchedule.some(o => o.team.id === opponent.id)) return false

  // 该队对该档次已满2个对手
  const teamPotCount = teamSchedule.filter(o => o.team.pot === opponent.pot).length
  if (teamPotCount >= 2) return false

  // 对手对该队档次已满2个对手
  const opponentPotCount = opponentSchedule.filter(o => o.team.pot === team.pot).length
  if (opponentPotCount >= 2) return false

  // 每队最多对阵同一国家2支球队
  const teamSameCountry = teamSchedule.filter(o => o.team.country === opponent.country).length
  if (teamSameCountry >= 2) return false

  const opponentSameCountry = opponentSchedule.filter(o => o.team.country === team.country).length
  if (opponentSameCountry >= 2) return false

  return true
}

function canAssignHome(team: Team, opponent: Team, isTeamHome: boolean): boolean {
  const teamSchedule = getSchedule(team.id)
  const opponentSchedule = getSchedule(opponent.id)

  // 该队对该档次已有主/客场
  const teamPotHomeCount = teamSchedule.filter(o => o.team.pot === opponent.pot && o.isHome).length
  const teamPotAwayCount = teamSchedule.filter(o => o.team.pot === opponent.pot && !o.isHome).length

  if (isTeamHome && teamPotHomeCount >= 1) return false
  if (!isTeamHome && teamPotAwayCount >= 1) return false

  // 对手对该档次已有主/客场
  const opponentPotHomeCount = opponentSchedule.filter(o => o.team.pot === team.pot && o.isHome).length
  const opponentPotAwayCount = opponentSchedule.filter(o => o.team.pot === team.pot && !o.isHome).length

  if (isTeamHome && opponentPotAwayCount >= 1) return false
  if (!isTeamHome && opponentPotHomeCount >= 1) return false

  // 总主客场数量限制 (4主4客)
  const teamHomeCount = teamSchedule.filter(o => o.isHome).length
  const teamAwayCount = teamSchedule.filter(o => !o.isHome).length
  const opponentHomeCount = opponentSchedule.filter(o => o.isHome).length
  const opponentAwayCount = opponentSchedule.filter(o => !o.isHome).length

  if (isTeamHome && teamHomeCount >= 4) return false
  if (!isTeamHome && teamAwayCount >= 4) return false
  if (isTeamHome && opponentAwayCount >= 4) return false
  if (!isTeamHome && opponentHomeCount >= 4) return false

  return true
}

function addMatch(team: Team, opponent: Team, isTeamHome: boolean) {
  const teamSchedule = schedules.value.get(team.id) || []
  const opponentSchedule = schedules.value.get(opponent.id) || []

  teamSchedule.push({ team: opponent, isHome: isTeamHome })
  opponentSchedule.push({ team, isHome: !isTeamHome })

  schedules.value.set(team.id, teamSchedule)
  schedules.value.set(opponent.id, opponentSchedule)

  if (isTeamHome) {
    allMatches.value.push({ home: team, away: opponent })
  } else {
    allMatches.value.push({ home: opponent, away: team })
  }
}

function generateAllPairings(): boolean {
  const allTeams = shuffle([...teams.value])
  schedules.value = new Map()
  allMatches.value = []
  allTeams.forEach(t => schedules.value.set(t.id, []))

  // 使用回溯算法生成所有配对
  return backtrack(allTeams, 0)
}

function backtrack(allTeams: Team[], teamIndex: number): boolean {
  if (teamIndex >= allTeams.length) {
    // 检查所有球队是否都有8个对手
    return allTeams.every(t => getSchedule(t.id).length === 8)
  }

  const team = allTeams[teamIndex]
  const currentSchedule = getSchedule(team.id)

  // 如果这支球队已经有8个对手，跳到下一支
  if (currentSchedule.length >= 8) {
    return backtrack(allTeams, teamIndex + 1)
  }

  // 找出需要的对手档次
  const neededPots: number[] = []
  for (let pot = 1; pot <= 4; pot++) {
    const count = currentSchedule.filter(o => o.team.pot === pot).length
    for (let i = count; i < 2; i++) {
      neededPots.push(pot)
    }
  }

  if (neededPots.length === 0) {
    return backtrack(allTeams, teamIndex + 1)
  }

  const targetPot = neededPots[0]
  const potTeams = shuffle(allTeams.filter(t => t.pot === targetPot))

  for (const opponent of potTeams) {
    if (!canMatch(team, opponent)) continue

    // 尝试分配主客场
    const homeOptions = [true, false].filter(isHome => canAssignHome(team, opponent, isHome))
    
    for (const isTeamHome of shuffle(homeOptions)) {
      addMatch(team, opponent, isTeamHome)

      if (backtrack(allTeams, teamIndex)) {
        return true
      }

      // 回溯：移除这场比赛
      const teamSch = getSchedule(team.id)
      const oppSch = getSchedule(opponent.id)
      schedules.value.set(team.id, teamSch.filter(o => o.team.id !== opponent.id))
      schedules.value.set(opponent.id, oppSch.filter(o => o.team.id !== team.id))
      allMatches.value = allMatches.value.filter(
        m => !(m.home.id === team.id && m.away.id === opponent.id) &&
             !(m.home.id === opponent.id && m.away.id === team.id)
      )
    }
  }

  return false
}

async function delay(ms: number) {
  if (drawSpeed.value === 'instant') return
  const actualMs = drawSpeed.value === 'slow' ? ms : ms / 3
  await new Promise(r => setTimeout(r, actualMs))
}

async function startDraw() {
  isDrawing.value = true
  currentPhase.value = 'drawing'
  drawnTeams.value = new Set()
  schedules.value = new Map()
  allMatches.value = []
  teams.value.forEach(t => schedules.value.set(t.id, []))

  // 先生成所有配对
  const success = generateAllPairings()
  if (!success) {
    alert('抽签失败，请重试')
    resetDraw()
    return
  }

  // 按档次顺序展示抽签过程
  const drawOrder = shuffle([...teams.value]).sort((a, b) => a.pot - b.pot)

  for (const team of drawOrder) {
    currentDrawingTeam.value = team
    currentDrawingOpponents.value = []
    await delay(300)

    const teamSchedule = getSchedule(team.id)
    for (const opponent of teamSchedule) {
      if (!drawnTeams.value.has(opponent.team.id)) {
        currentDrawingOpponents.value.push(opponent)
        await delay(200)
      }
    }

    drawnTeams.value.add(team.id)
    await delay(400)
  }

  currentDrawingTeam.value = null
  currentDrawingOpponents.value = []
  isDrawing.value = false
  currentPhase.value = 'result'
}

function resetDraw() {
  currentPhase.value = 'intro'
  schedules.value = new Map()
  allMatches.value = []
  drawnTeams.value = new Set()
  currentDrawingTeam.value = null
  currentDrawingOpponents.value = []
  selectedTeam.value = null
  isDrawing.value = false
}

function selectTeam(team: Team) {
  selectedTeam.value = selectedTeam.value?.id === team.id ? null : team
}

function skipAnimation() {
  drawSpeed.value = 'instant'
}
</script>

<template>
  <div class="draw-page">
    <button class="back-btn" @click="goHome">← 返回</button>

    <h1 class="title">🏆 欧冠抽签模拟器</h1>
    <p class="subtitle">2024-25赛季 · 联赛阶段</p>

    <!-- 介绍页面 -->
    <div v-if="currentPhase === 'intro'" class="intro-section">
      <div class="pots-container">
        <div v-for="pot in 4" :key="pot" class="pot-card">
          <h3 class="pot-title">第{{ pot }}档</h3>
          <div class="pot-teams">
            <div
              v-for="team in teamsByPot[pot]"
              :key="team.id"
              class="team-item"
            >
              <span class="team-flag">{{ team.flag }}</span>
              <span class="team-name">{{ team.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="rules-card">
        <h3>📋 联赛阶段抽签规则</h3>
        <ul>
          <li>36支球队分为4个档次，每档9支球队</li>
          <li>每队进行8场比赛（4主4客）</li>
          <li>每队对阵每个档次的2支球队（1主1客）</li>
          <li>同国球队不能相遇</li>
          <li>每队最多对阵同一国家的2支球队</li>
        </ul>
      </div>

      <div class="speed-selector">
        <span class="speed-label">抽签速度：</span>
        <button 
          class="speed-btn" 
          :class="{ active: drawSpeed === 'slow' }"
          @click="drawSpeed = 'slow'"
        >慢速</button>
        <button 
          class="speed-btn" 
          :class="{ active: drawSpeed === 'fast' }"
          @click="drawSpeed = 'fast'"
        >快速</button>
        <button 
          class="speed-btn" 
          :class="{ active: drawSpeed === 'instant' }"
          @click="drawSpeed = 'instant'"
        >瞬间</button>
      </div>

      <button class="action-btn" @click="startDraw">
        开始联赛阶段抽签
      </button>
    </div>

    <!-- 抽签进行中 -->
    <div v-if="currentPhase === 'drawing'" class="drawing-section">
      <div class="drawing-header">
        <h2>抽签进行中</h2>
        <p class="progress">{{ drawProgress }}</p>
        <button v-if="drawSpeed !== 'instant'" class="skip-btn" @click="skipAnimation">
          跳过动画
        </button>
      </div>

      <div class="drawing-area">
        <div v-if="currentDrawingTeam" class="current-team-card">
          <div class="current-team-header">
            <span class="pot-badge">第{{ currentDrawingTeam.pot }}档</span>
          </div>
          <div class="current-team-info">
            <span class="team-flag large">{{ currentDrawingTeam.flag }}</span>
            <span class="team-name large">{{ currentDrawingTeam.name }}</span>
          </div>
          <div class="opponents-area">
            <h4>对阵：</h4>
            <div class="opponents-list">
              <div
                v-for="(opponent, index) in currentDrawingOpponents"
                :key="index"
                class="opponent-item"
                :class="{ 'animate-in': true }"
              >
                <span class="home-away">{{ opponent.isHome ? '主' : '客' }}</span>
                <span class="opponent-flag">{{ opponent.team.flag }}</span>
                <span class="opponent-name">{{ opponent.team.name }}</span>
                <span class="opponent-pot">第{{ opponent.team.pot }}档</span>
              </div>
            </div>
          </div>
        </div>

        <div class="drawn-teams-sidebar">
          <h4>已抽球队</h4>
          <div class="drawn-teams-list">
            <div
              v-for="team in teams.filter(t => drawnTeams.has(t.id))"
              :key="team.id"
              class="drawn-team-item"
            >
              <span class="team-flag small">{{ team.flag }}</span>
              <span class="team-name small">{{ team.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 抽签结果 -->
    <div v-if="currentPhase === 'result'" class="result-section">
      <h2 class="section-title">联赛阶段抽签结果</h2>
      <p class="section-desc">点击球队查看完整赛程</p>

      <div class="result-container">
        <div class="teams-grid">
          <div v-for="pot in 4" :key="pot" class="pot-section">
            <h3 class="pot-header">第{{ pot }}档</h3>
            <div class="pot-teams-list">
              <div
                v-for="team in teamsByPot[pot]"
                :key="team.id"
                class="team-card"
                :class="{ selected: selectedTeam?.id === team.id }"
                @click="selectTeam(team)"
              >
                <span class="team-flag">{{ team.flag }}</span>
                <span class="team-name">{{ team.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="selectedTeamSchedule" class="schedule-panel">
          <div class="schedule-header">
            <span class="team-flag large">{{ selectedTeam?.flag }}</span>
            <span class="team-name large">{{ selectedTeam?.name }}</span>
          </div>
          <div class="schedule-grid">
            <div class="schedule-column">
              <h4>🏠 主场 (4场)</h4>
              <div class="matches-list">
                <div
                  v-for="match in selectedTeamSchedule.opponents.filter(o => o.isHome)"
                  :key="match.team.id"
                  class="match-item"
                >
                  <span class="opponent-flag">{{ match.team.flag }}</span>
                  <span class="opponent-name">{{ match.team.name }}</span>
                  <span class="opponent-pot">第{{ match.team.pot }}档</span>
                </div>
              </div>
            </div>
            <div class="schedule-column">
              <h4>✈️ 客场 (4场)</h4>
              <div class="matches-list">
                <div
                  v-for="match in selectedTeamSchedule.opponents.filter(o => !o.isHome)"
                  :key="match.team.id"
                  class="match-item"
                >
                  <span class="opponent-flag">{{ match.team.flag }}</span>
                  <span class="opponent-name">{{ match.team.name }}</span>
                  <span class="opponent-pot">第{{ match.team.pot }}档</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="schedule-placeholder">
          <p>👆 点击左侧球队查看赛程</p>
        </div>
      </div>

      <div class="action-buttons">
        <button class="action-btn secondary" @click="resetDraw">重新抽签</button>
        <button class="action-btn disabled" disabled>
          附加赛抽签 (待定)
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.draw-page {
  min-height: 100vh;
  padding: 20px;
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
}

.back-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  z-index: 100;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(-3px);
}

.title {
  color: #fff;
  font-size: 36px;
  text-align: center;
  margin-top: 60px;
  margin-bottom: 5px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.subtitle {
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  font-size: 18px;
  margin-bottom: 30px;
}

.intro-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.pots-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  width: 100%;
}

.pot-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
}

.pot-title {
  color: #ffd700;
  font-size: 18px;
  margin-bottom: 15px;
  text-align: center;
}

.pot-teams {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.team-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.team-flag {
  font-size: 20px;
}

.team-flag.large {
  font-size: 32px;
}

.team-flag.small {
  font-size: 16px;
}

.team-name {
  color: #fff;
  font-size: 14px;
}

.team-name.large {
  font-size: 24px;
  font-weight: bold;
}

.team-name.small {
  font-size: 12px;
}

.rules-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 25px;
  max-width: 600px;
}

.rules-card h3 {
  color: #fff;
  font-size: 20px;
  margin-bottom: 15px;
}

.rules-card ul {
  color: rgba(255, 255, 255, 0.9);
  padding-left: 20px;
  line-height: 1.8;
}

.speed-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.speed-label {
  color: rgba(255, 255, 255, 0.8);
}

.speed-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.speed-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.speed-btn.active {
  background: rgba(255, 215, 0, 0.3);
  color: #ffd700;
}

.action-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 15px 40px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

.action-btn:disabled,
.action-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.2);
}

/* Drawing Section */
.drawing-section {
  padding-top: 20px;
}

.drawing-header {
  text-align: center;
  margin-bottom: 30px;
}

.drawing-header h2 {
  color: #fff;
  font-size: 28px;
  margin-bottom: 10px;
}

.progress {
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
  margin-bottom: 15px;
}

.skip-btn {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
}

.drawing-area {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 20px;
}

@media (max-width: 768px) {
  .drawing-area {
    grid-template-columns: 1fr;
  }
}

.current-team-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
}

.current-team-header {
  margin-bottom: 15px;
}

.pot-badge {
  background: rgba(255, 215, 0, 0.3);
  color: #ffd700;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 14px;
}

.current-team-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.opponents-area h4 {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 15px;
  font-size: 16px;
}

.opponents-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.opponent-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.home-away {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 3px 10px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: bold;
  min-width: 28px;
  text-align: center;
}

.opponent-flag {
  font-size: 22px;
}

.opponent-name {
  color: #fff;
  flex: 1;
  font-size: 15px;
}

.opponent-pot {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.drawn-teams-sidebar {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  max-height: 500px;
  overflow-y: auto;
}

.drawn-teams-sidebar h4 {
  color: #fff;
  margin-bottom: 15px;
  font-size: 16px;
}

.drawn-teams-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.drawn-team-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
}

/* Result Section */
.result-section {
  padding-top: 20px;
}

.section-title {
  color: #fff;
  font-size: 28px;
  text-align: center;
  margin-bottom: 5px;
}

.section-desc {
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  font-size: 16px;
  margin-bottom: 25px;
}

.result-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
}

@media (max-width: 900px) {
  .result-container {
    grid-template-columns: 1fr;
  }
}

.teams-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pot-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px;
}

.pot-header {
  color: #ffd700;
  font-size: 16px;
  margin-bottom: 12px;
}

.pot-teams-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

@media (max-width: 600px) {
  .pot-teams-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

.team-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.team-card:hover {
  background: rgba(255, 255, 255, 0.2);
}

.team-card.selected {
  background: rgba(255, 215, 0, 0.2);
  box-shadow: 0 0 0 2px #ffd700;
}

.schedule-panel,
.schedule-placeholder {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 25px;
  position: sticky;
  top: 100px;
}

.schedule-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.schedule-placeholder p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
}

.schedule-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.schedule-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.schedule-column h4 {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 12px;
  font-size: 15px;
}

.matches-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.match-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.match-item .opponent-flag {
  font-size: 18px;
}

.match-item .opponent-name {
  flex: 1;
  font-size: 13px;
}

.match-item .opponent-pot {
  font-size: 11px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
}

@media (max-width: 600px) {
  .title {
    font-size: 28px;
    margin-top: 80px;
  }

  .pots-container {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .action-btn {
    width: 100%;
    max-width: 300px;
  }

  .schedule-grid {
    grid-template-columns: 1fr;
  }
}
</style>
