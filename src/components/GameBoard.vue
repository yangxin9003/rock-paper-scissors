<template>
  <div class="container">
    <h1>石头剪刀布游戏</h1>

    <div class="level-info">
      <div class="level">当前关卡：{{ gameStore.level }}</div>
    </div>

    <div class="hp-display">
      <div class="hp-bar player">
        <div class="hp-label">你的血量:</div>
        <div class="hp-bar-container">
          <div class="hp-bar-fill" :style="{width: playerHPPercent + '%'}"></div>
        </div>
        <div class="hp-value">{{ gameStore.playerHP }}/{{ gameStore.maxPlayerHP }}</div>
      </div>

      <div class="hp-bar enemy">
        <div class="hp-label">敌人血量:</div>
        <div class="hp-bar-container">
          <div class="hp-bar-fill" :style="{width: enemyHPPercent + '%'}"></div>
        </div>
        <div class="hp-value">{{ gameStore.enemyHP }}/{{ gameStore.maxEnemyHP }}</div>
      </div>
    </div>

    <div class="game-area">
      <div class="player-side">
        <h2>我方</h2>
        <div class="slots player-slots">
          <SlotItem
            v-for="(hand, index) in gameStore.playerSlots"
            :key="index"
            :hand="hand"
            :index="index"
            type="player"
          />
        </div>
        <div class="controls">
          <button
            @click="openSwapModal"
            :disabled="gameStore.swapsLeft <= 0 || gameStore.battleStarted"
          >
            调整排布
          </button>
          <p id="swap-info">剩余调整次数: <span>{{ gameStore.swapsLeft }}</span></p>
        </div>
      </div>

      <div class="enemy-side">
        <h2>敌方</h2>
        <div class="slots enemy-slots">
          <SlotItem
            v-for="(hand, index) in gameStore.maskedEnemySlots"
            :key="index"
            :hand="hand"
            :index="index"
            type="enemy"
          />
        </div>
        <div v-if="hasMaskedHands" class="mask-info">
          <span class="mask-icon">❓</span>
          <p>敌人使用了 {{ maskedCount }} 个遮罩隐藏手势<br>战斗开始后才能看到全部</p>
        </div>
      </div>
    </div>

    <div class="battle-controls">
      <button
        @click="startBattle"
        :disabled="!canStartBattle"
      >
        开始对战
      </button>
      <button @click="resetGame">重新开始</button>
    </div>

    <BattleLog :logs="gameStore.battleLog" />

    <BattleAnimation
      :visible="battleAnimationVisible"
      :battle-rounds="battleRounds"
      @close="closeBattleAnimation"
      @round-complete="onRoundComplete"
      @animation-complete="finalizeBattle"
    />

    <SwapModal
      :visible="swapModalVisible"
      :player-slots="gameStore.playerSlots"
      :selected-slots="gameStore.selectedSlots"
      @select="selectSlotForSwap"
      @confirm="confirmSwap"
      @cancel="cancelSwap"
    />

    <ResultModal
      :visible="resultModalVisible"
      :result="battleResult"
      @close="closeResultModal"
      @next-level="goToNextLevel"
      @restart="resetGame"
      @continue="continueGame"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useGameStore } from '../stores/gameStore';
import { HandType, BattleResult, BattleRound } from '../types';
import SlotItem from './SlotItem.vue';
import BattleLog from './BattleLog.vue';
import BattleAnimation from './BattleAnimation.vue';
import SwapModal from './SwapModal.vue';
import ResultModal from './ResultModal.vue';

const gameStore = useGameStore();

// 模态框状态
const swapModalVisible = ref(false);
const resultModalVisible = ref(false);
const battleAnimationVisible = ref(false);

// 战斗结果
const battleResult = ref<BattleResult | null>(null);

// 战斗回合数据
const battleRounds = ref<BattleRound[]>([]);

// 计算血量百分比
const playerHPPercent = computed(() => {
  return (gameStore.playerHP / gameStore.maxPlayerHP) * 100;
});

const enemyHPPercent = computed(() => {
  return (gameStore.enemyHP / gameStore.maxEnemyHP) * 100;
});

// 是否可以开始战斗
const canStartBattle = computed(() => {
  return gameStore.playerSlots.length > 0 &&
         gameStore.enemySlots.length > 0 &&
         !gameStore.battleStarted;
});

// 是否有被遮罩的手势
const hasMaskedHands = computed(() => {
  return gameStore.maskedEnemySlots.some(hand => hand === HandType.Masked);
});

// 计算被遮罩的手势数量
const maskedCount = computed(() => {
  return gameStore.maskedEnemySlots.filter(hand => hand === HandType.Masked).length;
});

// 初始化游戏
onMounted(() => {
  resetGame();
});

// 重置游戏
const resetGame = () => {
  gameStore.resetGame();
  battleResult.value = null;
  battleRounds.value = [];
};

// 进入下一关
const goToNextLevel = () => {
  gameStore.nextLevel();
  resultModalVisible.value = false;
  battleResult.value = null;
  battleRounds.value = [];
};

// 继续游戏
const continueGame = () => {
  gameStore.continueGame();
  resultModalVisible.value = false;
  battleResult.value = null;
  battleRounds.value = [];
};

// 当回合播放完成时的回调
const onRoundComplete = (round: number) => {
  // 这里可以添加回合播放完成的逻辑
  // 例如更新界面其他部分，播放音效等
};

// 开始战斗
const startBattle = () => {
  if (!canStartBattle.value) return;

  // 使用gameStore中的方法准备战斗回合数据
  battleRounds.value = gameStore.prepareBattleRounds();

  // 标记战斗开始
  gameStore.battleStarted = true;

  // 显示战斗动画
  if (battleRounds.value.length > 0) {
    battleAnimationVisible.value = true;
    gameStore.setAnimationInProgress(true);
  } else {
    // 如果没有回合数据（极少情况），直接获取最终结果
    finalizeBattle();
  }
};

// 关闭战斗动画
const closeBattleAnimation = () => {
  battleAnimationVisible.value = false;
  gameStore.setAnimationInProgress(false);
};

// 计算战斗最终结果
const finalizeBattle = () => {
  // 关闭动画界面
  closeBattleAnimation();

  // 执行gameStore的startBattle来获取最终结果并更新游戏状态
  battleResult.value = gameStore.startBattle();

  // 显示战斗结果模态框
  resultModalVisible.value = true;
};

// 打开交换模态框
const openSwapModal = () => {
  gameStore.selectedSlots = [];
  swapModalVisible.value = true;
};

// 选择要交换的槽位
const selectSlotForSwap = (index: number) => {
  gameStore.selectSlotForSwap(index);
};

// 确认交换
const confirmSwap = () => {
  gameStore.swapSlots();
  swapModalVisible.value = false;
};

// 取消交换
const cancelSwap = () => {
  gameStore.selectedSlots = [];
  swapModalVisible.value = false;
};

// 关闭结果模态框
const closeResultModal = () => {
  resultModalVisible.value = false;
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.level-info {
  text-align: center;
  margin-bottom: 10px;
}

.level {
  display: inline-block;
  padding: 5px 15px;
  background-color: #2196F3;
  color: white;
  border-radius: 20px;
  font-weight: bold;
}

.hp-display {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.hp-bar {
  display: flex;
  align-items: center;
}

.hp-label {
  width: 80px;
  text-align: right;
  margin-right: 10px;
  font-weight: bold;
}

.hp-bar-container {
  flex-grow: 1;
  height: 20px;
  background-color: #ddd;
  border-radius: 10px;
  overflow: hidden;
  margin-right: 10px;
}

.hp-bar-fill {
  height: 100%;
  transition: width 0.5s ease;
}

.player .hp-bar-fill {
  background-color: #4CAF50;
}

.enemy .hp-bar-fill {
  background-color: #f44336;
}

.hp-value {
  width: 60px;
  text-align: left;
}

.game-area {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}

.player-side, .enemy-side {
  flex: 1;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.player-side {
  background-color: rgba(144, 238, 144, 0.1);
  margin-right: 10px;
}

.enemy-side {
  background-color: rgba(255, 160, 122, 0.1);
  margin-left: 10px;
}

h2 {
  text-align: center;
  margin-bottom: 15px;
  font-size: 1.3rem;
  color: #444;
}

.slots {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
}

button {
  padding: 8px 16px;
  margin: 5px;
  border: none;
  border-radius: 4px;
  background-color: #4CAF50;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.battle-controls {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.battle-controls button:last-child {
  background-color: #f44336;
}

.battle-controls button:last-child:hover {
  background-color: #d32f2f;
}

#swap-info {
  margin-top: 10px;
  font-size: 0.9rem;
  color: #666;
}

.mask-info {
  text-align: center;
  margin-top: 10px;
  padding: 8px;
  background-color: rgba(255, 193, 7, 0.1);
  border: 1px dashed #FFC107;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.mask-icon {
  font-size: 1.8rem;
  color: #FF9800;
  margin-bottom: 5px;
  animation: pulsate 1.5s infinite ease-in-out;
}

@keyframes pulsate {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

.mask-info p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}
</style>
