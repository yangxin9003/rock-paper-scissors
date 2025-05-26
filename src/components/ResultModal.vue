<template>
  <div class="modal" :class="{ 'show': visible }">
    <div class="modal-content">
      <h2 :class="{
        'win': result?.winner === 'player',
        'lose': result?.winner === 'enemy',
        'draw': result?.winner === 'draw'
      }">
        {{ resultMessage }}
      </h2>

      <div class="hp-info" v-if="result">
        <div class="hp-bar">
          <div class="hp-label">你的血量:</div>
          <div class="hp-bar-container">
            <div class="hp-bar-fill player" :style="{width: playerHPPercent + '%'}"></div>
          </div>
          <div class="hp-value">{{ result.playerHP }}/{{ maxPlayerHP }}</div>
        </div>

        <div class="hp-bar">
          <div class="hp-label">敌人血量:</div>
          <div class="hp-bar-container">
            <div class="hp-bar-fill enemy" :style="{width: enemyHPPercent + '%'}"></div>
          </div>
          <div class="hp-value">{{ result.enemyHP }}/{{ maxEnemyHP }}</div>
        </div>
      </div>

      <p v-if="result?.gameOver" class="game-over-message">
        游戏结束！你在第 {{ result.level }} 关失败了。
      </p>

      <p v-else-if="result?.nextLevel" class="next-level-message">
        恭喜！你通过了第 {{ result.level }} 关！
      </p>

      <p v-else-if="result?.canContinue" class="continue-message">
        本轮战斗结束，准备下一轮战斗！
      </p>

      <p v-else class="continue-message">
        战斗结束，点击查看详细对战结果
      </p>

      <div class="button-group">
        <button
          v-if="result?.canContinue"
          @click="continueBattle"
          class="btn-continue"
        >
          继续战斗
        </button>

        <button
          v-if="result?.nextLevel"
          @click="goToNextLevel"
          class="btn-next-level"
        >
          进入第 {{ result.level + 1 }} 关
        </button>

        <button
          v-if="result?.gameOver"
          @click="restart"
          class="btn-restart"
        >
          重新开始
        </button>

        <button
          v-if="!result?.canContinue && !result?.nextLevel && !result?.gameOver"
          @click="close"
          class="btn-main"
        >
          查看战斗详情
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';
import { BattleResult } from '../types';
import { useGameStore } from '../stores/gameStore';

const gameStore = useGameStore();

const props = defineProps<{
  visible: boolean;
  result: BattleResult | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'next-level'): void;
  (e: 'restart'): void;
  (e: 'continue'): void;
}>();

const resultMessage = computed(() => {
  if (!props.result) return '';

  const { playerWins, enemyWins, draws, winner } = props.result;

  if (props.result.gameOver) {
    return `游戏结束，你失败了！`;
  } else if (props.result.nextLevel) {
    return `恭喜！你击败了敌人！`;
  } else if (props.result.canContinue) {
    return `双方还有生命值，继续战斗！`;
  } else {
    if (winner === 'player') {
      return `本轮你占优势！(${playerWins} 胜 ${enemyWins} 负 ${draws} 平)`;
    } else if (winner === 'enemy') {
      return `本轮敌人占优势！(${playerWins} 胜 ${enemyWins} 负 ${draws} 平)`;
    } else {
      return `本轮战成平手！(${playerWins} 胜 ${enemyWins} 负 ${draws} 平)`;
    }
  }
});

const maxPlayerHP = computed(() => gameStore.maxPlayerHP);
const maxEnemyHP = computed(() => gameStore.maxEnemyHP);

const playerHPPercent = computed(() => {
  if (!props.result) return 0;
  return (props.result.playerHP / maxPlayerHP.value) * 100;
});

const enemyHPPercent = computed(() => {
  if (!props.result) return 0;
  return (props.result.enemyHP / maxEnemyHP.value) * 100;
});

const close = () => {
  emit('close');
};

const goToNextLevel = () => {
  emit('next-level');
};

const restart = () => {
  emit('restart');
};

const continueBattle = () => {
  emit('continue');
};
</script>

<style scoped>
.modal {
  display: none;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
}

.modal.show {
  display: flex;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.win {
  color: #4CAF50;
}

.lose {
  color: #f44336;
}

.draw {
  color: #2196F3;
}

.hp-info {
  margin: 20px 0;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.hp-bar {
  margin: 10px 0;
  display: flex;
  align-items: center;
}

.hp-label {
  width: 80px;
  text-align: right;
  margin-right: 10px;
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

.hp-bar-fill.player {
  background-color: #4CAF50;
}

.hp-bar-fill.enemy {
  background-color: #f44336;
}

.hp-value {
  width: 60px;
  text-align: left;
}

.game-over-message {
  color: #f44336;
  font-weight: bold;
}

.next-level-message {
  color: #4CAF50;
  font-weight: bold;
}

.continue-message {
  color: #555;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

button {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.btn-main {
  background-color: #2196F3;
  color: white;
}

.btn-main:hover {
  background-color: #0b7dda;
}

.btn-continue {
  background-color: #FF9800;
  color: white;
}

.btn-continue:hover {
  background-color: #e68a00;
}

.btn-next-level {
  background-color: #4CAF50;
  color: white;
}

.btn-next-level:hover {
  background-color: #45a049;
}

.btn-restart {
  background-color: #f44336;
  color: white;
}

.btn-restart:hover {
  background-color: #d32f2f;
}
</style>
