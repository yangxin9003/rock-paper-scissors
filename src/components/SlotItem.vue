<template>
  <div
    class="slot-item"
    :class="{
      'slot-selected': isSelected,
      'player-slot': type === 'player',
      'enemy-slot': type === 'enemy',
      'masked-slot': hand === HandType.Masked && !shouldRevealMask
    }"
    @click="onSlotClick"
  >
    <span class="hand">
      {{ displayHand }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { HandType } from '../types';
import { useGameStore } from '../stores/gameStore';
import { computed } from 'vue';

const props = defineProps<{
  hand: HandType;
  index: number;
  type: 'player' | 'enemy';
}>();

const gameStore = useGameStore();

// 判断槽位是否被选中（用于交换）
const isSelected = computed(() => {
  if (props.type !== 'player') return false;
  return gameStore.selectedSlots.includes(props.index);
});

// 是否应该显示真实手势（解除遮罩）
const shouldRevealMask = computed(() => {
  return props.type === 'enemy' && gameStore.revealMasks;
});

// 计算要显示的手势
const displayHand = computed(() => {
  // 如果是敌方遮罩手势且不应该解除遮罩，则显示问号
  if (props.hand === HandType.Masked && !shouldRevealMask.value) {
    return HandType.Masked;
  }

  // 如果是敌方且有遮罩模式
  if (props.type === 'enemy' && gameStore.maskedEnemySlots.length > 0) {
    // 当需要显示真实手势时，从原始敌人手势中获取
    if (shouldRevealMask.value) {
      return gameStore.enemySlots[props.index];
    }
    // 否则显示可能被遮罩的手势
    return gameStore.maskedEnemySlots[props.index];
  }

  // 默认显示传入的手势
  return props.hand;
});

// 点击槽位的处理函数
const onSlotClick = () => {
  // 只有在玩家槽位，且游戏尚未开始时才允许交换
  if (props.type === 'player' && !gameStore.battleStarted) {
    gameStore.selectSlotForSwap(props.index);
  }
};
</script>

<style scoped>
.slot-item {
  width: 60px;
  height: 60px;
  border: 2px solid #ccc;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 5px;
  cursor: pointer;
  background-color: #f9f9f9;
  transition: all 0.2s;
}

.hand {
  font-size: 2rem;
}

.player-slot {
  border-color: #4CAF50;
}

.player-slot:hover {
  background-color: rgba(76, 175, 80, 0.1);
}

.enemy-slot {
  border-color: #f44336;
}

.masked-slot {
  background-color: rgba(0, 0, 0, 0.05);
}

.masked-slot .hand {
  font-size: 1.8rem;
  color: #555;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  animation: pulsate 1.5s infinite ease-in-out;
}

@keyframes pulsate {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

.slot-selected {
  background-color: rgba(76, 175, 80, 0.3);
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}
</style>
