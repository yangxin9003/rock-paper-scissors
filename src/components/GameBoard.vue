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
            v-for="(hand, index) in gameStore.enemySlots"
            :key="index"
            :hand="hand"
            :index="index"
            type="enemy"
          />
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
import { HandType, BattleResult } from '../types';
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
const battleRounds = ref<Array<{
  round: number;
  playerHand: HandType;
  enemyHand: HandType;
  result: string;
  remainingPlayerHands: HandType[];
  remainingEnemyHands: HandType[];
}>>([]);

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

// 模拟单回合战斗
const simulateBattleRound = (
  playerHand: HandType,
  enemyHand: HandType,
  playerHandsCopy: HandType[],
  enemyHandsCopy: HandType[],
  round: number
) => {
  // 判断胜负
  const result = gameStore.determineWinner(playerHand, enemyHand);

  // 根据胜负创建结果后的手牌数组副本
  const newPlayerHands = [...playerHandsCopy];
  const newEnemyHands = [...enemyHandsCopy];

  if (result === 'player') {
    // 玩家胜：玩家保留手势，敌人失去手势
    newEnemyHands.shift();
  } else if (result === 'enemy') {
    // 敌人胜：敌人保留手势，玩家失去手势
    newPlayerHands.shift();
  } else {
    // 平局：双方都失去手势
    newPlayerHands.shift();
    newEnemyHands.shift();
  }

  // 返回本回合结果
  return {
    round,
    playerHand,
    enemyHand,
    result,
    remainingPlayerHands: newPlayerHands,
    remainingEnemyHands: newEnemyHands
  };
};

// 开始战斗
const startBattle = () => {
  if (!canStartBattle.value) return;

  // 重置战斗回合数据
  battleRounds.value = [];

  // 拷贝初始手势状态
  let playerHandsCopy = [...gameStore.playerSlots];
  let enemyHandsCopy = [...gameStore.enemySlots];
  let round = 1;

  // 预先计算所有回合数据
  while (playerHandsCopy.length > 0 && enemyHandsCopy.length > 0) {
    // 获取双方的当前手势（始终是第一个）
    const playerHand = playerHandsCopy[0];
    const enemyHand = enemyHandsCopy[0];

    // 模拟本回合并获取结果
    const roundResult = simulateBattleRound(
      playerHand,
      enemyHand,
      playerHandsCopy,
      enemyHandsCopy,
      round
    );

    // 添加到回合数据
    battleRounds.value.push(roundResult);

    // 更新手牌状态为下一回合
    playerHandsCopy = roundResult.remainingPlayerHands;
    enemyHandsCopy = roundResult.remainingEnemyHands;

    round++;
  }

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

// 当回合播放完成时的回调
const onRoundComplete = (round: number) => {
  // 这里可以添加回合播放完成的逻辑
  // 例如更新界面其他部分，播放音效等
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
</style>
