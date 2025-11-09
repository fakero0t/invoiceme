import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

// Import global styles - ORDER MATTERS!
import './styles/index.css';

console.log('🚀 Starting Invoice MVP Frontend...');
console.log('🔓 Auth disabled - Development Mode');

const app = createApp(App);
const pinia = createPinia();

console.log('📦 Installing Pinia...');
app.use(pinia);

console.log('🛣️  Installing Router...');
app.use(router);

console.log('🎨 Mounting app...');
app.mount('#app');
console.log('✅ App mounted successfully!');
