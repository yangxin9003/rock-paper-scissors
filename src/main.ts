import { createApp } from 'vue';
import App from './App.vue';
import pinia from './stores';
import './style.css';

const app = createApp(App);

// 使用Pinia
app.use(pinia);

// 挂载应用
app.mount('#app');
