<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2' // শুধু ক্লিন করার জন্য ইমপোর্ট করা হলো
import { useRouter } from 'vue-router'

const router = useRouter()
const BASE_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000/api'
    : '/api'
const token = localStorage.getItem('token')
const apiConfig = { headers: { Authorization: `Bearer ${token}` } }

const studentInfo = ref({
  name: 'Student',
  class: '...',
  roll: '...',
  section: '...',
  attendance_status: '...',
  due_fees: 0,
  must_change_password: false,
})

// ✅ ক্লিনআপ ফাংশন: এটি আটকে থাকা পপ-আপ ডিলিট করবে
const forceCleanup = () => {
  // ১. সুইট এলার্ট অফিসিয়ালি বন্ধ করা
  Swal.close()

  // ২. যদি তাও থেকে যায়, জোর করে DOM থেকে রিমুভ করা
  const zombies = document.querySelectorAll('.swal2-container')
  zombies.forEach((el) => el.remove())

  // ৩. বডি আনলক করা
  document.body.classList.remove('swal2-shown', 'swal2-height-auto')
  document.body.style.overflow = 'auto'
  document.body.style.height = 'auto'
}

const checkUserStatus = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/profile`, apiConfig)
    const user = res.data.data

    studentInfo.value.name = user.name
    studentInfo.value.class = user.class_name || '...'
    studentInfo.value.roll = user.roll_no || '...'
    studentInfo.value.section = user.section_name || '...'

    if (user.must_change_password) {
      studentInfo.value.must_change_password = true
    }
  } catch (error) {
    console.error('User fetch error', error)
  }
}

onMounted(() => {
  forceCleanup() // ✅ মাউন্ট হওয়ার সাথে সাথে পুরানো জঞ্জাল পরিষ্কার করবে
  checkUserStatus()
})

// পেজ ছেড়ে যাওয়ার সময়ও ক্লিন করবে
onUnmounted(() => {
  forceCleanup()
})
</script>

<template>
  <div class="student-dashboard">
    <div v-if="studentInfo.must_change_password" class="alert-banner">
      <div class="alert-content">
        <span>⚠️ <strong>Security Alert:</strong> আপনার পাসওয়ার্ড পরিবর্তন করা জরুরি।</span>
        <router-link to="/student/change-password" class="alert-btn"> Change Now </router-link>
      </div>
    </div>

    <div class="header mb-4">
      <h2 class="text-white">Student Dashboard</h2>
      <p class="text-gray">Welcome back, {{ studentInfo.name }}! 👋</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card gradient-1">
        <div class="icon-box">🏫</div>
        <div>
          <p class="stat-label">Class</p>
          <h3 class="stat-value">{{ studentInfo.class }}</h3>
        </div>
      </div>
      <div class="stat-card gradient-2">
        <div class="icon-box">🆔</div>
        <div>
          <p class="stat-label">Roll</p>
          <h3 class="stat-value">{{ studentInfo.roll }}</h3>
        </div>
      </div>
      <div class="stat-card gradient-3">
        <div class="icon-box">📅</div>
        <div>
          <p class="stat-label">Status</p>
          <h3 class="stat-value">{{ studentInfo.attendance_status }}</h3>
        </div>
      </div>
      <div class="stat-card gradient-4">
        <div class="icon-box">💰</div>
        <div>
          <p class="stat-label">Due</p>
          <h3 class="stat-value">৳ {{ studentInfo.due_fees }}</h3>
        </div>
      </div>
    </div>

    <div class="recent-section mt-section">
      <h3>📌 Quick Links</h3>
      <div class="quick-links">
        <router-link to="/student/routine" class="btn-link">📅 Routine</router-link>
        <router-link to="/student/results" class="btn-link">📊 Result</router-link>
        <router-link to="/student/fees" class="btn-link">💳 Pay Fees</router-link>
        <router-link to="/student/change-password" class="btn-link change-pass-btn"
          >🔒 Change Password</router-link
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ✅ আগের সব CSS বাদ দিয়ে ক্লিন স্টাইল */
.student-dashboard {
  padding-bottom: 50px;
}

/* Alert Banner */
.alert-banner {
  background-color: #ef4444;
  color: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}
.alert-content {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
}
.alert-btn {
  background: white;
  color: #ef4444;
  padding: 8px 15px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  font-size: 14px;
}
.alert-btn:hover {
  background: #f9fafb;
}

/* Text & Grid */
.text-white {
  color: white;
  margin-bottom: 5px;
}
.text-gray {
  color: #a1a5b7;
  font-size: 14px;
  margin-top: 0;
}
.mt-section {
  margin-top: 30px;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

/* Cards */
.stat-card {
  padding: 25px;
  border-radius: 15px;
  color: white;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}
.gradient-1 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.gradient-2 {
  background: linear-gradient(135deg, #2af598 0%, #009efd 100%);
}
.gradient-3 {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%);
  color: #fff;
}
.gradient-3 .stat-label,
.gradient-3 .stat-value {
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
.gradient-4 {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
}

.icon-box {
  background: rgba(255, 255, 255, 0.25);
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
.stat-label {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
}
.stat-value {
  margin: 5px 0 0;
  font-size: 22px;
  font-weight: bold;
}

/* Buttons */
.recent-section {
  background: #1e1e2d;
  padding: 25px;
  border-radius: 15px;
  border: 1px solid #2b2b40;
}
.quick-links {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}
.btn-link {
  background: #2b2b40;
  color: #a6a6cc;
  padding: 15px 25px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 500;
  border: 1px solid #3b3b5c;
  transition: 0.3s;
}
.btn-link:hover {
  background: #3699ff;
  color: white;
  border-color: #3699ff;
}
.change-pass-btn {
  border-color: #f59e0b;
  color: #f59e0b;
}
.change-pass-btn:hover {
  background: #f59e0b;
  color: white;
}
</style>
