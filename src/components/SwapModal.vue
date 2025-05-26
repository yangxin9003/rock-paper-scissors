<template>
  <div class="modal" :class="{ 'show': visible }">
    <div class="modal-content">
      <h3>调整排布</h3>
      <p>选择两个槽位进行交换</p>
      <div class="swap-slots">
        <div
          v-for="(hand, index) in playerSlots"
          :key="index"
          class="swap-slot-item"
          :class="{ 'selected': selectedSlots.includes(index) }"
          @click="selectSlot(index)"
        >
          <span class="hand">{{ hand }}</span>
        </div>
      </div>
      <div class="modal-controls">
        <button
          @click="confirmSwap"
          :disabled="selectedSlots.length !== 2"
        >
          确认交换
        </button>
        <button @click="cancel">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { HandType } from '../types';

const props = defineProps<{
  visible: boolean;
  playerSlots: HandType[];
  selectedSlots: number[];
}>();

const emit = defineEmits<{
  (e: 'select', index: number): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const selectSlot = (index: number) => {
  emit('select', index);
};

const confirmSwap = () => {
  if (props.selectedSlots.length === 2) {
    emit('confirm');
  }
};

const cancel = () => {
  emit('cancel');
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
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.swap-slots {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin: 20px 0;
}

.swap-slot-item {
  width: 60px;
  height: 60px;
  border: 2px solid #4CAF50;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 5px;
  cursor: pointer;
  background-color: rgba(76, 175, 80, 0.1);
  transition: all 0.2s;
}

.swap-slot-item:hover {
  background-color: rgba(76, 175, 80, 0.2);
}

.swap-slot-item.selected {
  background-color: rgba(76, 175, 80, 0.3);
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
  border-color: #2E7D32;
}

.hand {
  font-size: 2rem;
}

.modal-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #4CAF50;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

button:last-child {
  background-color: #f44336;
}

button:last-child:hover {
  background-color: #d32f2f;
}
</style>
