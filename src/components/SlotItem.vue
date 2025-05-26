<template>
  <div
    class="slot"
    :class="{
      'player-slot': type === 'player',
      'enemy-slot': type === 'enemy',
      'swap-slot': type === 'swap',
      'selected': selected
    }"
    @click="onClick"
  >
    {{ hand }}
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { HandType } from '../types';

const props = defineProps<{
  hand: HandType;
  index: number;
  type: 'player' | 'enemy' | 'swap';
  selected?: boolean;
}>();

const emit = defineEmits<{
  (e: 'click', index: number): void;
}>();

const onClick = () => {
  if (props.type === 'swap' || props.type === 'player') {
    emit('click', props.index);
  }
};
</script>

<style scoped>
.slot {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  border: 2px solid #333;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.player-slot {
  background-color: rgba(144, 238, 144, 0.3);
}

.enemy-slot {
  background-color: rgba(255, 160, 122, 0.3);
}

.swap-slot {
  background-color: rgba(144, 238, 144, 0.3);
}

.selected {
  border: 2px solid #ff6700;
  background-color: rgba(255, 103, 0, 0.2);
  transform: scale(1.1);
}
</style>
