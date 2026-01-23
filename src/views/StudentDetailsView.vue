<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const student = ref(null)
const isLoading = ref(true)

const fetchStudentDetails = async () => {
  try {
    const id = route.params.id
    const response = await axios.get(`http://127.0.0.1:8000/api/students/${id}`)
    student.value = response.data.data // StudentResource থেকে ডাটা আসবে
  } catch (error) {
    console.error('Error fetching details:', error)
    alert('স্টুডেন্টের তথ্য পাওয়া যায়নি!')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchStudentDetails()
})
</script>

<template>
  <div class="profile-container">
    <div class="header">
      <h2>👤 স্টুডেন্ট প্রোফাইল</h2>
      <button @click="router.back()" class="back-btn">⬅ ফিরে যান</button>
    </div>

    <div v-if="isLoading" class="loading">লোড হচ্ছে...</div>

    <div v-else-if="student" class="profile-card">
      <div class="profile-header">
        <div class="avatar-big">{{ student.name.charAt(0) }}</div>
        <div class="user-meta">
          <h3>{{ student.name }}</h3>
          <p class="role-badge">ID: {{ student.id }}</p>
        </div>
      </div>

      <div class="details-grid">
        <div class="detail-item">
          <label>ইমেইল:</label>
          <span>{{ student.email }}</span>
        </div>
        <div class="detail-item">
          <label>অ্যাডমিশন নং:</label>
          <span>{{ student.admission_no }}</span>
        </div>
        <div class="detail-item">
          <label>রোল নং:</label>
          <span>{{ student.roll_no }}</span>
        </div>
        <div class="detail-item">
          <label>ক্লাস:</label>
          <span class="badge">{{ student.class }}</span>
        </div>
        <div class="detail-item">
          <label>সেকশন:</label>
          <span class="badge">{{ student.section }}</span>
        </div>
        <div class="detail-item">
          <label>লিঙ্গ:</label>
          <span>{{ student.gender }}</span>
        </div>
        <div class="detail-item">
          <label>জন্ম তারিখ:</label>
          <span>{{ student.dob }}</span>
        </div>
        <div class="detail-item full">
          <label>বর্তমান ঠিকানা:</label>
          <span>{{ student.address }}</span>
        </div>
      </div>

      <div class="actions">
        <button @click="router.push(`/admin/students/edit/${student.id}`)" class="edit-btn">
          ✏️ তথ্য সংশোধন
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.back-btn {
  background: #f1f5f9;
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
}

.profile-card {
  background: white;
  border-radius: 15px;
  padding: 30px;
  shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}
.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 20px;
  margin-bottom: 20px;
}
.avatar-big {
  width: 80px;
  height: 80px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
}
.user-meta h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #1e293b;
}
.role-badge {
  background: #dcfce7;
  color: #166534;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  display: inline-block;
  margin-top: 5px;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.detail-item {
  display: flex;
  flex-direction: column;
}
.detail-item label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
}
.detail-item span {
  color: #1e293b;
  font-weight: 500;
  margin-top: 5px;
}
.badge {
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}
.full {
  grid-column: span 2;
}

.actions {
  margin-top: 30px;
  text-align: right;
}
.edit-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
</style>
