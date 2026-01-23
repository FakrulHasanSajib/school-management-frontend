<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const teacher = ref(null)
const isLoading = ref(true)

const fetchTeacherProfile = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`http://127.0.0.1:8000/api/teachers/${route.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    // ApiResponse এর কারণে data.data ব্যবহার করা হয়েছে
    teacher.value = response.data.data
    isLoading.value = false
  } catch (error) {
    console.error(error)
    isLoading.value = false
  }
}

onMounted(fetchTeacherProfile)
</script>

<template>
  <div class="profile-container">
    <div v-if="isLoading" class="loading">
      <p>প্রোফাইল লোড হচ্ছে...</p>
    </div>

    <div v-else-if="teacher" class="profile-card">
      <div class="card-header">
        <button @click="router.back()" class="back-btn">← ব্যাক</button>
        <h2>শিক্ষক প্রোফাইল</h2>
        <button @click="router.push(`/admin/teachers/edit/${teacher.id}`)" class="edit-btn">
          ✏️ এডিট
        </button>
      </div>

      <div class="profile-body">
        <div class="profile-left">
          <div class="avatar-large">
            {{ teacher.name.charAt(0) }}
          </div>
          <h3 class="name">{{ teacher.name }}</h3>
          <p class="role-badge">{{ teacher.teacher_profile?.designation || 'শিক্ষক' }}</p>
          <p class="email">{{ teacher.email }}</p>
        </div>

        <div class="profile-right">
          <div class="info-group">
            <label>মোবাইল নম্বর:</label>
            <p>{{ teacher.teacher_profile?.phone || 'N/A' }}</p>
          </div>
          <div class="info-group">
            <label>শিক্ষাগত যোগ্যতা:</label>
            <p>{{ teacher.teacher_profile?.qualification || 'N/A' }}</p>
          </div>
          <div class="info-group">
            <label>যোগদানের তারিখ:</label>
            <p>{{ teacher.teacher_profile?.joining_date || 'N/A' }}</p>
          </div>
          <div class="info-group">
            <label>স্ট্যাটাস:</label>
            <span class="status-active">Active</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 2rem auto;
  font-family: 'Segoe UI', sans-serif;
}
.profile-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
.card-header {
  background: #f8fafc;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}
.profile-body {
  display: flex;
  flex-wrap: wrap;
  padding: 2rem;
  gap: 2rem;
}

/* বাম পাশ */
.profile-left {
  flex: 1;
  min-width: 250px;
  text-align: center;
  border-right: 1px solid #f1f5f9;
  padding-right: 1rem;
}
.avatar-large {
  width: 100px;
  height: 100px;
  background: #6366f1;
  color: white;
  font-size: 40px;
  font-weight: bold;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}
.name {
  margin: 0;
  color: #1e293b;
  font-size: 1.5rem;
}
.role-badge {
  background: #e0e7ff;
  color: #4338ca;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  display: inline-block;
  margin: 0.5rem 0;
}
.email {
  color: #64748b;
}

/* ডান পাশ */
.profile-right {
  flex: 2;
  min-width: 250px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
.info-group label {
  display: block;
  color: #94a3b8;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}
.info-group p {
  color: #334155;
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0;
}
.status-active {
  color: #16a34a;
  background: #dcfce7;
  padding: 5px 10px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 0.9rem;
}

.back-btn,
.edit-btn {
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}
.back-btn {
  background: #e2e8f0;
  color: #475569;
}
.edit-btn {
  background: #2563eb;
  color: white;
}
</style>
