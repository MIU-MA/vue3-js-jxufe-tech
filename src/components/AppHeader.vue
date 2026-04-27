<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

// 控制移动端菜单开关的状态
const isMenuOpen = ref(false);

// 切换菜单
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// 点击链接后自动关闭菜单（移动端体验优化）
const closeMenu = () => {
  if (window.innerWidth <= 768) {
    isMenuOpen.value = false;
  }
};
</script>

<template>
  <header>
    <div class="logo">
      <img src="/logo.jpg" alt="数智技术协会会徽">
      江西财经大学数智技术协会
    </div>
    
    <button 
      class="menu-toggle" 
      @click="toggleMenu" 
      aria-label="Toggle Navigation" 
      :aria-expanded="isMenuOpen"
    >
      &#9776;
    </button>

    <nav :class="{ 'menu-open': isMenuOpen }">
      <ul>
        <li><RouterLink :to="{ path: '/', hash: '#about-us-hero' }" @click="closeMenu">社团简介</RouterLink></li>
        <li><RouterLink :to="{ path: '/', hash: '#news-hero' }" @click="closeMenu">最新动态</RouterLink></li>
        <li><a href="/members" @click="closeMenu">加入我们</a></li>
        <li><RouterLink to="/presidents" @click="closeMenu">历届负责人</RouterLink></li> 
        <li><RouterLink to="/members" @click="closeMenu">优秀成员</RouterLink></li> 
      </ul>
    </nav>
  </header>
</template>

<style scoped>
header {
    background-color: #003a7a; 
    position: fixed;
    top: 0;
    width: 100%;
    padding: 0 20px; 
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    box-shadow: 0 2px 8px rgba(0, 58, 122, 0.2);
    z-index: 2000;
    height: 60px;
}
header .logo {
    display: flex;
    align-items: center;
    font-size: 1.2em; 
    font-weight: 500;
    color: white;
    flex-shrink: 1; 
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
header .logo img {
    height: 35px; 
    width: 35px;
    margin-right: 8px;
    border-radius: 50%;
    background-color: white;
}
.menu-toggle {
    display: block; 
    background: none;
    border: 1px solid white;
    color: white;
    font-size: 1.5em; 
    cursor: pointer;
    padding: 5px 10px;
    line-height: 1;
    border-radius: 4px;
    margin-left: auto;
}
.menu-toggle:hover { background-color: #002a5a; }

/* 移动端菜单 */
header nav {
    position: absolute;
    top: 60px; left: 0; width: 100%;
    max-height: 0; overflow: hidden;
    background-color: #003a7a; 
    transition: max-height 0.3s ease-in-out;
    box-shadow: 0 4px 8px rgba(0, 58, 122, 0.2);
}
header nav.menu-open { max-height: 500px; }
header nav ul { list-style: none; padding: 0; margin: 0; text-align: center; }
header nav ul li a {
    color: white; display: block; padding: 15px;
    border-bottom: 1px solid #002a5a;
}
header nav ul li a:hover { background-color: #002a5a; }

/* PC 端适配 */
@media (min-width: 768px) {
    header { padding: 0 5%; }
    .menu-toggle { display: none; }
    header nav {
        position: static; max-height: none; background: transparent;
        box-shadow: none; width: auto; display: flex;
    }
    header nav ul { display: flex; }
    header nav ul li a { border: none; padding: 0 15px; opacity: 0.9; }
    header nav ul li a:hover { background: transparent; opacity: 1; }
    header nav ul li a.router-link-exact-active,
    header nav ul li a.router-link-active { opacity: 1; font-weight: 600; }
}
</style>