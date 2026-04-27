<script setup>
</script>

<template>
  <main class="page-container">
    <section class="members-header">
      <h1>历届负责人</h1>
    </section>

    <section class="term-section">
      <div class="term-title">2025届</div>
      <div class="members-grid">
        
        <div class="member-card">
          <img src="/images/jt.jpg" alt="jt照片" class="member-photo"> 
          <h3>MIUMA</h3>
          <span class="member-role">大数据241</span>
          <p class="member-bio">睡觉大王</p>
        </div>

      </div>
    </section>
  </main>
</template>

<style scoped>
.members-header {
    text-align: center;
    margin-bottom: 40px;
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.members-header h1 {
    color: #ff6f00; 
    font-size: 2em;
    margin: 0;
}

.term-section {
    margin-bottom: 30px;
}

.term-title {
    color: #003a7a; 
    font-size: 1.8em; 
    border-bottom: 3px solid #e0f7fa;
    padding-bottom: 10px;
    margin-bottom: 20px; 
    font-weight: 700;
    text-align: center;
}

.members-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center; 
    gap: 20px; 
    margin-top: 20px; 
}

.member-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    width: 100%; 
    max-width: 500px;
    text-align: center;
    padding: 25px 15px;
    transition: transform 0.3s;
}

.member-card:hover {
    transform: translateY(-5px);
}

.member-photo {
    width: 120px; 
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #e0f7fa;
    margin: 0 auto 15px; 
    display: block;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.member-card:hover .member-photo {
    border-color: #003a7a;
    transform: scale(1.05); 
}

.member-card h3 {
    color: #003a7a; 
    margin: 0 0 5px 0;
    font-size: 1.3em;
}

.member-role {
    color: #ff6f00;
    font-weight: bold;
    display: block;
    margin-bottom: 10px;
    font-size: 0.9em;
}

.member-bio {
    padding: 0 10px;
    font-size: 0.9em;
    color: #666;
    background-color: #f5f5f5;
    line-height: 1.5;
}

/* 桌面端适配 */
@media (min-width: 768px) {
    .member-card {
        width: 920px; 
        max-width: 920px;
    }
    .member-photo {
        width: 180px; 
        height: 180px;
    }
    .term-title {
        font-size: 2em;
    }
}

</style>