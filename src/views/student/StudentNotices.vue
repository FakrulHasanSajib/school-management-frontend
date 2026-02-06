<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const notices = ref([])
const isLoading = ref(false)

const fetchNotices = async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get('http://127.0.0.1:8000/api/notices', {
      headers: { Authorization: `Bearer ${token}` },
    })

    // শুধু 'all' অথবা 'student' টাইপের নোটিশ ফিল্টার করা হচ্ছে
    notices.value = res.data.filter(
      (n) => n.recipient_type === 'all' || n.recipient_type === 'student',
    )
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchNotices)
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">📢 Notice Board</h2>

    <div v-if="isLoading" class="loading">Loading Notices...</div>

    <div v-else class="notice-list">
      <div v-if="notices.length === 0" class="empty-state">No notices found for you.</div>

      <div v-for="notice in notices" :key="notice.id" class="notice-card">
        <div class="notice-icon">🔔</div>
        <div class="notice-content">
          <div class="meta">
            <span class="date">📅 {{ new Date(notice.published_at).toLocaleDateString() }}</span>
            <span class="badge">{{ notice.recipient_type }}</span>
          </div>
          <h3>{{ notice.title }}</h3>
          <p>{{ notice.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 20px;
  color: #fff;
  max-width: 800px;
  margin: 0 auto;
}
.page-title {
  border-bottom: 1px solid #444;
  padding-bottom: 10px;
  margin-bottom: 20px;
}
.loading,
.empty-state {
  text-align: center;
  color: #aaa;
  margin-top: 50px;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.notice-card {
  background: #1e1e2d;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #333;
  display: flex;
  gap: 15px;
  transition: transform 0.2s;
}
.notice-card:hover {
  transform: translateY(-3px);
  border-color: #3699ff;
}

.notice-icon {
  font-size: 24px;
  background: #2b2b40;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
.notice-content {
  flex: 1;
}

.meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
  margin-bottom: 5px;
  color: #888;
}
.badge {
  background: #3699ff;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: capitalize;
}

h3 {
  margin: 0 0 8px 0;
  color: white;
}
p {
  margin: 0;
  color: #b5b5c3;
  line-height: 1.5;
  font-size: 14px;
}
</style>
