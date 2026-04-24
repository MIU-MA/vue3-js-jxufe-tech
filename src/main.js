import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'    // 引入全局样式

const app = createApp(App)

app.use(router) // 告诉 Vue 使用路由
app.mount('#app') // 挂载到 index.html 的 id="app" 元素上