<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { newsData } from '../data/newsData.js'; // 导入数据

const route = useRoute();
const router = useRouter();

// 1. 获取当前路由参数中的 id (比如 /news/first -> id="first")
const newsId = route.params.id;

// 2. 根据 id 在数据中查找对应的文章
const article = computed(() => {
  return newsData.find(item => item.id === newsId);
});

// 3. 如果找不到文章（比如乱输了 /news/abc），跳回首页或显示错误
if (!article.value) {
  // router.replace('/404'); // 如果有404页面的话
  // 或者直接显示“文章不存在”
}

onMounted(() => {
  setTimeout(() => document.querySelector('.article-container')?.classList.add('is-visible'), 100);
});
</script>

<template>
  <main class="page-container">
    <article v-if="article" class="article-container fade-in-on-scroll">
      <h1>{{ article.title }}</h1>
      
      <div class="article-meta">
        <span>发布日期: {{ article.date }}</span>
      </div>
      
      <div v-if="article.cover" class="article-cover-image">
        <img :src="article.cover" :alt="article.title" style="width:100%;max-width:600px;display:block;margin:15px auto;border-radius:8px;">
      </div>
      
      <div class="article-content">
        <p class="article-intro" style="margin-top: 25px; font-size: 1.1em; line-height: 1.7;">
            {{ article.intro }}
        </p>

        <div v-html="article.contentHtml"></div>
      </div>
      
      <RouterLink to="/" class="back-link">« 返回首页</RouterLink>
    </article>

    <div v-else class="not-found" style="text-align:center; padding: 50px;">
      <h2>文章不存在</h2>
      <RouterLink to="/" class="back-link">返回首页</RouterLink>
    </div>
  </main>
</template>

<style scoped>
/* 这里可以复用之前的样式，或者引用 main.css */
</style>