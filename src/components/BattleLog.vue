<template>
  <div class="battle-log">
    <h3>对战记录</h3>
    <div class="battle-log-content">
      <div
        v-for="(log, index) in logs"
        :key="index"
        class="log-entry"
        :class="log.className || ''"
      >
        {{ log.message }}
      </div>
      <div v-if="logs.length === 0" class="empty-log">
        对战尚未开始，点击"开始对战"按钮开始游戏
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

defineProps<{
  logs: Array<{message: string, className?: string}>;
}>();
</script>

<style scoped>
.battle-log {
  margin-top: 20px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.battle-log h3 {
  margin-bottom: 10px;
  text-align: center;
}

.battle-log-content {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  max-height: 300px;
  overflow-y: auto;
  background-color: #f9f9f9;
}

.log-entry {
  margin-bottom: 5px;
  padding: 5px;
  border-radius: 4px;
}

.empty-log {
  color: #888;
  text-align: center;
  padding: 20px;
  font-style: italic;
}

.win {
  background-color: rgba(144, 238, 144, 0.3);
}

.lose {
  background-color: rgba(255, 160, 122, 0.3);
}

.draw {
  background-color: rgba(211, 211, 211, 0.5);
}

.info {
  color: #666;
  font-size: 0.9em;
  margin-left: 10px;
}

.separator {
  border-bottom: 1px dashed #ccc;
  margin: 8px 0;
  height: 1px;
}
</style>
