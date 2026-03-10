<script setup>
import { onMounted, ref } from 'vue';

// 1. 成员数据列表 (根据您提供的 members.html 实时更新)
const members = ref([
 
]);

// 2. 滚动渐入动画初始化
onMounted(() => {
  const animatedElements = document.querySelectorAll('.fade-in-on-scroll');
  if (animatedElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    animatedElements.forEach(el => observer.observe(el));
  }
});
</script>

<template>
  <main class="page-container">
      <div class="gallery-header reveal-on-scroll">
        <div class="title-wrap">
          <h1>核心团队<span class="accent">/</span>MEMBERS</h1>
        </div>
      </div>
    <div class="members-grid fade-in-on-scroll">
      <div v-for="(member, index) in members" :key="index" class="member-card">
        <div class="position-badge">{{ member.badge }}</div>
        
        <img :src="member.img" :alt="member.name + ' 肖像'" class="member-photo">
        
        <h3>{{ member.name }}</h3>
        <span class="member-role">{{ member.role }}</span>
        
        <p class="member-bio">{{ member.bio }}</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* 页面标题样式 */
.members-header {
    text-align: center;
    margin-bottom: 50px;
    padding: 30px;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 58, 122, 0.08);
}

.members-header h1 {
    color: #ff6f00;
    font-size: 2.5em;
    margin: 0 0 10px 0;
    font-weight: 700;
}

.header-subtitle {
    color: #64748b;
    font-size: 1.1em;
}

/* 成员网格布局 */
.members-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    padding-bottom: 60px;
}

/* 成员卡片基础样式 */
.member-card {
    background: white;
    position: relative;
    border-radius: 16px;
    padding: 40px 20px 30px;
    text-align: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 6px -1px rgba(0, 58, 122, 0.05), 0 10px 15px -3px rgba(0, 58, 122, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.5);
}

.member-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 25px -5px rgba(0, 58, 122, 0.15);
}

/* 职位勋章样式 */
.position-badge {
    position: absolute;
    top: 0;
    left: 0;
    background: linear-gradient(135deg, #003a7a 0%, #0056b3 100%);
    color: white;
    padding: 6px 16px;
    border-radius: 16px 0 16px 0;
    font-size: 0.85em;
    font-weight: 600;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
}

/* 头像样式 */
.member-photo {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    object-fit: cover;
    margin: 0 auto 20px;
    border: 4px solid #e0f7fa;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.member-card:hover .member-photo {
    border-color: #003a7a;
    transform: scale(1.05);
}

.member-card h3 {
    color: #003a7a;
    font-size: 1.5rem;
    margin: 0 0 8px 0;
}

.member-role {
    color: #ff6f00;
    font-weight: 700;
    display: block;
    margin-bottom: 15px;
    font-size: 0.95em;
}

/* 简介文字样式 */
.member-bio {
    padding: 15px;
    font-size: 0.92em;
    color: #475569;
    line-height: 1.6;
    background-color: #f8fafc;
    border-radius: 8px;
    text-align: left;
}

/* 移动端适配 */
@media (max-width: 768px) {
    .members-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    
    .members-header h1 {
        font-size: 2em;
    }
}
</style>