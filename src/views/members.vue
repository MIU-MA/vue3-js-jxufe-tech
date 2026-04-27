<script setup>
import { ref } from 'vue';
import MemberCard from '../components/MemberCard.vue';
import { useScrollReveal } from '../composables/useScrollReveal';

const members = ref([

]);

useScrollReveal();
</script>

<template>
  <main class="page-container">
      <div class="members-header fade-in-on-scroll">
        <div class="title-wrap">
          <h1>核心团队<span class="accent">/</span>MEMBERS</h1>
        </div>
      </div>
    <div class="members-grid fade-in-on-scroll">
      <MemberCard v-for="(member, index) in members" :key="index"
        :img="member.img"
        :name="member.name"
        :role="member.role"
        :bio="member.bio"
        :badge="member.badge"
      />
    </div>
  </main>
</template>

<style scoped>
.title-wrap { text-align: center; }

.title-wrap h1 {
  color: #ff6f00;
  font-size: 2.5em;
  margin: 0 0 10px 0;
  font-weight: 700;
}

.title-wrap .accent { color: #334155; font-weight: 300; }

.members-header {
    text-align: center;
    margin-bottom: 50px;
    padding: 30px;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 58, 122, 0.08);
}

.members-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    padding-bottom: 60px;
}

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
