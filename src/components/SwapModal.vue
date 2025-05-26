<template>
  <div class="modal" :class="{ 'show': visible }">
    <div class="modal-content">
      <h3>调整排布</h3>
      <p>选择两个槽位进行交换</p>
      <div class="swap-slots">
        <SlotItem
          v-for="(hand, index) in playerSlots"
          :key="index"
          :hand="hand"
          :index="index"
          type="swap"
          :selected="selectedSlots.includes(index)"
          @click="selectSlot"
        />
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
import SlotItem from './SlotItem.vue';

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
