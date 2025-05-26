<template>
    <div
      class="battle-animation-container"
      :class="{ 'show': visible }"
    >
      <div class="battle-animation">
        <div class="battle-round">回合 {{ currentRound + 1 }}/{{ battleRounds.length }}</div>

        <div class="battle-sides">
          <div class="battle-side player-side">
            <div
              class="hand player-hand"
              :class="{
                'hand-fly': animationStarted,
                'hand-win': currentRoundData?.result === 'player' && animationFinished,
                'hand-lose': currentRoundData?.result === 'enemy' && animationFinished,
                'hand-draw': currentRoundData?.result === 'draw' && animationFinished
              }"
            >{{ currentRoundData?.playerHand }}</div>
            <div class="hand-label">你的手势</div>
          </div>

          <div class="battle-vs" :class="{'vs-hide': animationStarted}">VS</div>

          <div class="battle-collision" :class="{'collision-show': collisionShown}">
            <div class="collision-effect">💥</div>
          </div>

          <div class="battle-side enemy-side">
            <div
              class="hand enemy-hand"
              :class="{
                'hand-fly': animationStarted,
                'hand-win': currentRoundData?.result === 'enemy' && animationFinished,
                'hand-lose': currentRoundData?.result === 'player' && animationFinished,
                'hand-draw': currentRoundData?.result === 'draw' && animationFinished
              }"
            >{{ currentRoundData?.enemyHand }}</div>
            <div class="hand-label">敌人的手势</div>
          </div>
        </div>

        <div
          class="battle-result"
          :class="[resultClass, {'result-show': animationFinished}]"
        >
          {{ resultText }}
        </div>

        <div class="battle-remaining" v-if="animationFinished">
          <h4>本轮对战后剩余手势</h4>
          <div class="remaining-hands">
            <div class="remaining-side">
              <div class="remaining-label">你的剩余手势:</div>
              <div class="remaining-slots">
                <div v-for="(hand, index) in currentRoundData?.remainingPlayerHands" :key="`p-${index}`" class="remaining-slot">
                  {{ hand }}
                </div>
                <div v-if="!currentRoundData?.remainingPlayerHands?.length" class="no-hands">无</div>
              </div>
            </div>

            <div class="remaining-side">
              <div class="remaining-label">敌人的剩余手势:</div>
              <div class="remaining-slots">
                <div v-for="(hand, index) in currentRoundData?.remainingEnemyHands" :key="`e-${index}`" class="remaining-slot">
                  {{ hand }}
                </div>
                <div v-if="!currentRoundData?.remainingEnemyHands?.length" class="no-hands">无</div>
              </div>
            </div>
          </div>
        </div>

        <div class="animation-controls" v-if="animationFinished">
          <button
            class="control-btn prev-btn"
            @click="prevRound"
            :disabled="currentRound <= 0"
          >
            上一回合
          </button>

          <button
            class="control-btn next-btn"
            @click="nextRound"
            :disabled="currentRound >= battleRounds.length - 1"
          >
            下一回合
          </button>

          <button
            class="control-btn finish-btn"
            @click="finishAnimation"
          >
            完成
          </button>
        </div>

        <p class="animation-hint" v-if="!animationFinished">(动画播放中...)</p>
      </div>
    </div>
  </template>

  <script setup lang="ts">
  import { defineProps, defineEmits, computed, ref, watch } from 'vue';
  import { HandType } from '../types';

  // 定义回合数据类型
  interface RoundData {
    round: number;
    playerHand: HandType;
    enemyHand: HandType;
    result: string;
    remainingPlayerHands: HandType[];
    remainingEnemyHands: HandType[];
  }

  const props = defineProps<{
    visible: boolean;
    battleRounds: RoundData[];
  }>();

  const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'round-complete', round: number): void;
    (e: 'animation-complete'): void;
  }>();

  // 动画状态控制
  const animationStarted = ref(false);
  const collisionShown = ref(false);
  const animationFinished = ref(false);
  const currentRound = ref(0);

  // 当前回合数据
  const currentRoundData = computed(() => {
    if (props.battleRounds && props.battleRounds.length > currentRound.value) {
      return props.battleRounds[currentRound.value];
    }
    return null;
  });

  // 当对话框显示状态改变时
  watch(() => props.visible, (newValue) => {
    if (newValue) {
      // 初始化为第一回合
      currentRound.value = 0;
      startAnimation();
    } else {
      resetAnimationState();
    }
  });

  // 当回合变化时重新开始动画
  watch(() => currentRound.value, () => {
    if (props.visible) {
      startAnimation();
    }
  });

  // 重置动画状态
  const resetAnimationState = () => {
    animationStarted.value = false;
    collisionShown.value = false;
    animationFinished.value = false;
  };

  // 开始动画序列
  const startAnimation = () => {
    resetAnimationState();

    // 延迟开始手势飞行动画
    setTimeout(() => {
      animationStarted.value = true;

      // 飞行中途显示碰撞效果
      setTimeout(() => {
        collisionShown.value = true;

        // 碰撞后显示结果
        setTimeout(() => {
          animationFinished.value = true;
        }, 500);
      }, 400);
    }, 600);
  };

  // 回合结果文本
  const resultText = computed(() => {
    if (!currentRoundData.value) return '';

    if (currentRoundData.value.result === 'player') {
      return '你赢了! 你保留手势，敌人失去手势';
    } else if (currentRoundData.value.result === 'enemy') {
      return '敌人赢了! 敌人保留手势，你失去手势';
    } else {
      return '平局! 双方都失去手势';
    }
  });

  // 结果CSS类名
  const resultClass = computed(() => {
    if (!currentRoundData.value) return '';

    if (currentRoundData.value.result === 'player') {
      return 'win';
    } else if (currentRoundData.value.result === 'enemy') {
      return 'lose';
    } else {
      return 'draw';
    }
  });

  // 前往上一回合
  const prevRound = () => {
    if (currentRound.value > 0) {
      currentRound.value--;
      emit('round-complete', currentRound.value);
    }
  };

  // 前往下一回合
  const nextRound = () => {
    if (currentRound.value < props.battleRounds.length - 1) {
      currentRound.value++;
      emit('round-complete', currentRound.value);
    }
  };

  // 完成动画
  const finishAnimation = () => {
    emit('animation-complete');
    emit('close');
  };
  </script>

  <style scoped>
  .battle-animation-container {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }

  .battle-animation-container.show {
    display: flex;
  }

  .battle-animation {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 90%;
    width: 600px;
    text-align: center;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5), 0 0 30px rgba(50, 150, 255, 0.3);
    position: relative;
    overflow: hidden;
    z-index: 10;
  }

  .battle-round {
    background-color: #2196F3;
    color: white;
    font-weight: bold;
    padding: 5px 15px;
    border-radius: 20px;
    display: inline-block;
    margin-bottom: 15px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }

  .battle-sides {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    position: relative;
    height: 150px;
  }

  .battle-side {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }

  .hand {
    font-size: 4rem;
    margin-bottom: 10px;
    transition: transform 0.5s ease-out;
    position: relative;
    z-index: 2;
  }

  /* 手势飞行动画 */
  .player-hand.hand-fly {
    animation: none;
    transform: translateX(125px);
  }

  .enemy-hand.hand-fly {
    animation: none;
    transform: translateX(-125px);
  }

  /* 胜利动画 */
  .hand-win {
    animation: handWin 0.5s ease-out forwards !important;
  }

  @keyframes handWin {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1.2); filter: drop-shadow(0 0 10px gold); }
  }

  /* 失败动画 */
  .hand-lose {
    animation: handLose 0.5s ease-out forwards !important;
    opacity: 0.7;
  }

  @keyframes handLose {
    0% { transform: scale(1); }
    100% { transform: scale(0.8) rotate(15deg); opacity: 0.7; }
  }

  /* 平局动画 */
  .hand-draw {
    animation: handDraw 0.5s ease-out forwards !important;
  }

  @keyframes handDraw {
    0% { transform: scale(1); }
    50% { transform: rotate(-15deg); }
    100% { transform: scale(0.9) rotate(0); opacity: 0.8; }
  }

  .battle-vs {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0 20px;
    transition: opacity 0.3s ease;
    position: relative;
    z-index: 1;
  }

  .vs-hide {
    opacity: 0;
  }

  /* 碰撞效果 */
  .battle-collision {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
    opacity: 0;
    transition: opacity 0.2s ease-in;
  }

  .collision-show {
    opacity: 1;
  }

  .collision-effect {
    font-size: 5rem;
    animation: collisionPulse 0.5s ease-out;
  }

  @keyframes collisionPulse {
    0% { transform: scale(0); }
    50% { transform: scale(1.5); }
    100% { transform: scale(1); }
  }

  .hand-label {
    font-size: 1rem;
  }

  .battle-result {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 20px 0;
    padding: 10px;
    border-radius: 8px;
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.5s ease;
  }

  .result-show {
    opacity: 1;
    transform: scale(1);
  }

  .win {
    background-color: rgba(144, 238, 144, 0.3);
    color: #2e8b57;
  }

  .lose {
    background-color: rgba(255, 160, 122, 0.3);
    color: #d32f2f;
  }

  .draw {
    background-color: rgba(211, 211, 211, 0.5);
    color: #555;
  }

  .battle-remaining {
    margin-top: 20px;
    border-top: 1px solid #eee;
    padding-top: 20px;
  }

  .battle-remaining h4 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #555;
  }

  .remaining-hands {
    display: flex;
    justify-content: space-between;
  }

  .remaining-side {
    flex: 1;
    padding: 0 10px;
  }

  .remaining-label {
    font-size: 0.9rem;
    margin-bottom: 5px;
    text-align: center;
  }

  .remaining-slots {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    min-height: 50px;
  }

  .remaining-slot {
    font-size: 1.5rem;
    width: 40px;
    height: 40px;
    border: 1px solid #ccc;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 3px;
    animation: appearIn 0.3s ease-out forwards;
  }

  @keyframes appearIn {
    0% { opacity: 0; transform: scale(0.5); }
    100% { opacity: 1; transform: scale(1); }
  }

  .no-hands {
    color: #999;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
  }

  .animation-controls {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    gap: 10px;
  }

  .control-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background-color: #4CAF50;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .control-btn:hover:not(:disabled) {
    background-color: #45a049;
    transform: translateY(-2px);
  }

  .control-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  .prev-btn {
    background-color: #607D8B;
  }

  .prev-btn:hover:not(:disabled) {
    background-color: #546E7A;
  }

  .finish-btn {
    background-color: #2196F3;
  }

  .finish-btn:hover {
    background-color: #1E88E5;
  }

  .animation-hint {
    color: #777;
    margin-top: 20px;
    margin-bottom: 0;
    font-size: 0.9rem;
  }
  </style>
