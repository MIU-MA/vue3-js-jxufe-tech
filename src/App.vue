<script setup>
import { RouterView } from 'vue-router';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
</script>

<template>
  <AppHeader />

  <div class="pt-[60px]">
    <RouterView />
  </div>

  <AppFooter />
</template>

<style>
/* 这里放置全局的 CSS 变量或重置样式 */
</style>