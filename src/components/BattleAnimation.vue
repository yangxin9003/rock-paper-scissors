<template>
  <div
    class="battle-animation-container"
    :class="{ 'show': visible }"
    @click="close"
  >
    <div class="battle-animation">
      <div class="battle-sides">
        <div class="battle-side player-side">
          <div class="hand player-hand">{{ playerHand }}</div>
          <div class="hand-label">你的手势</div>
        </div>

        <div class="battle-vs">VS</div>

        <div class="battle-side enemy-side">
          <div class="hand enemy-hand">{{ enemyHand }}</div>
          <div class="hand-label">敌人的手势</div>
        </div>
      </div>

      <div class="battle-result" :class="resultClass">
        {{ resultText }}
      </div>

      <div class="battle-remaining">
        <h4>本轮对战后剩余手势</h4>
        <div class="remaining-hands">
          <div class="remaining-side">
            <div class="remaining-label">你的剩余手势:</div>
            <div class="remaining-slots">
              <div v-for="(hand, index) in playerSlots" :key="`p-${index}`" class="remaining-slot">
                {{ hand }}
              </div>
              <div v-if="playerSlots.length === 0" class="no-hands">无</div>
            </div>
          </div>

          <div class="remaining-side">
            <div class="remaining-label">敌人的剩余手势:</div>
            <div class="remaining-slots">
              <div v-for="(hand, index) in enemySlots" :key="`e-${index}`" class="remaining-slot">
                {{ hand }}
              </div>
              <div v-if="enemySlots.length === 0" class="no-hands">无</div>
            </div>
          </div>
        </div>
      </div>

      <p class="animation-hint">(点击任意位置继续)</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';
import { HandType } from '../types';

const props = defineProps<{
  visible: boolean;
  playerHand: HandType | null;
  enemyHand: HandType | null;
  result: string;
  playerSlots: HandType[];
  enemySlots: HandType[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const resultText = computed(() => {
  if (props.result === 'player') {
    return '你赢了! 你保留手势，敌人失去手势';
  } else if (props.result === 'enemy') {
    return '敌人赢了! 敌人保留手势，你失去手势';
  } else {
    return '平局! 双方都失去手势';
  }
});

const resultClass = computed(() => {
  if (props.result === 'player') {
    return 'win';
  } else if (props.result === 'enemy') {
    return 'lose';
  } else {
    return 'draw';
  }
});

const close = () => {
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
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
}

.battle-sides {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.battle-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hand {
  font-size: 4rem;
  margin-bottom: 10px;
  animation: handShake 0.5s ease-in-out 0.2s;
}

@keyframes handShake {
  0% { transform: translateY(0); }
  25% { transform: translateY(-20px); }
  50% { transform: translateY(0); }
  75% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}

.battle-vs {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 20px;
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
  animation: resultAppear 0.5s ease-in-out 0.7s both;
}

@keyframes resultAppear {
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
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
}

.no-hands {
  color: #999;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
}

.animation-hint {
  color: #777;
  font-size: 0.9rem;
  margin-top: 20px;
  font-style: italic;
}
</style>
