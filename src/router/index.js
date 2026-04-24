import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MembersView from '../views/MembersView.vue'
import PastPresidentsView from '../views/PastPresidentsView.vue' 
import NewsDetailView from '../views/NewsDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/members', name: 'members', component: MembersView },
    { path: '/presidents', name: 'presidents', component: PastPresidentsView },
    { 
      path: '/news/:id', 
      name: 'news-detail', 
      component: NewsDetailView 
    }
  ],
  // 核心：处理滚动行为
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 60, 
      }
    }
    return { top: 0 } // 切换页面时滚动到顶部
  }
})

export default router