<script setup>
defineProps({
  title: {
    type: String,
    default: 'style.css'
  },
  code: {
    type: String,
    default: ''
  },
  language: { // 可选：用于显示不同的圆点颜色组合或其他逻辑，目前暂时只用通用样式
    type: String,
    default: 'css'
  }
});
</script>

<template>
  <div class="card">
    <div class="header">
      <div class="top">
        <div class="circle">
          <span class="red circle2"></span>
        </div>
        <div class="circle">
          <span class="yellow circle2"></span>
        </div>
        <div class="circle">
          <span class="green circle2"></span>
        </div>
        <div class="title">
          <p class="card-title-text">{{ title }}</p>
        </div>
      </div>
    </div>
    <div class="code-container">
      <textarea class="area" readonly :value="code"></textarea>
    </div>
  </div>
</template>

<style scoped>
.card {
  width: 260px;  /* 稍微改小一点默认宽度 */
  height: 320px; /* 稍微改小一点默认高度 */
  background-color: #24233b;
  border-radius: 8px;
  z-index: 1;
  box-shadow: 0px 10px 20px rgba(0,0,0,0.3);
  transition: 0.5s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-7px) scale(1.05); /* 悬停微放大 */
  box-shadow: 0px 15px 25px rgba(0,0,0,0.5);
  z-index: 10; /* 悬停时层级最高 */
}

.top {
  display: flex;
  align-items: center;
  padding-left: 10px;
  height: 30px;
  background-color: #2e2c45; /* 稍微深一点的标题栏背景 */
}

.circle { padding: 0 4px; }
.circle2 { display: inline-block; width: 10px; height: 10px; border-radius: 50%; }
.red { background-color: #ff605c; }
.yellow { background-color: #ffbd44; }
.green { background-color: #00ca4e; }

.card-title-text {
  color: #aaa;
  font-size: 12px;
  margin-left: 15px;
  font-family: sans-serif;
}

.code-container {
  flex: 1;
  padding: 10px;
}

.area {
  width: 100%;
  height: 100%;
  resize: none;
  background-color: transparent;
  border: none;
  color: #a9a9b3;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  line-height: 1.5;
}
.area:focus { outline: none; }
</style>