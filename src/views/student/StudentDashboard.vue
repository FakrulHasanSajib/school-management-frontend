<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const BASE_URL = 'http://127.0.0.1:8000/api'
const token = localStorage.getItem('token')
const apiConfig = { headers: { Authorization: `Bearer ${token}` } }

const studentInfo = ref({
  name: 'Student',
  class: 'Loading...',
  roll: '...',
  section: '',
  attendance_status: 'Present',
  due_fees: 0,
})

const checkUserStatus = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/profile`, apiConfig)
    const user = res.data.data

    studentInfo.value.name = user.name

    // প্রোফাইল ডাটা সেট করা
    const profile = user.student_profile || user.studentProfile
    if (profile) {
      studentInfo.value.roll = profile.roll_no
      studentInfo.value.class = profile.school_class?.name || 'N/A'
      studentInfo.value.section = profile.section?.name || ''
    } else {
      studentInfo.value.class = 'Profile Missing'
    }

    // ✅ যদি পাসওয়ার্ড চেঞ্জ দরকার হয়, পপ-আপ দেখাবে
    if (user.must_change_password) {
      showChangePasswordModal()
    }
  } catch (error) {
    console.error('Dashboard Error:', error)
    studentInfo.value.class = 'Error'
  }
}

// ✅ পপ-আপ ফাংশন (Strong CSS & Events Fix)
const showChangePasswordModal = async () => {
  await Swal.fire({
    title: '⚠️ পাসওয়ার্ড পরিবর্তন করুন',
    text: 'নিরাপত্তার জন্য আপনার ডিফল্ট পাসওয়ার্ড পরিবর্তন করুন।',
    icon: 'warning',
    // ইনপুট ফিল্ড
    html: `
      <div style="text-align: left; z-index: 999999;">
        <label style="color: #333; font-weight: bold;">New Password</label>
        <input id="swal-pass" type="password" class="swal2-input custom-input" placeholder="New Password">

        <label style="color: #333; font-weight: bold;">Confirm Password</label>
        <input id="swal-confirm" type="password" class="swal2-input custom-input" placeholder="Confirm Password">
      </div>
    `,
    showCancelButton: true,
    cancelButtonText: 'পরে করব', // ❌ কেটে দেওয়ার বাটন
    confirmButtonText: 'চেঞ্জ করুন',
    confirmButtonColor: '#4f46e5',
    cancelButtonColor: '#d33',
    background: '#ffffff', // সাদা ব্যাকগ্রাউন্ড
    allowOutsideClick: true, // ✅ বাইরে ক্লিক করলে কাটবে
    allowEscapeKey: true, // ✅ Esc চাপলে কাটবে
    width: '400px',

    // ✅ ফোকাস এবং ক্লিক ফিক্স
    didOpen: () => {
      // জোর করে ফোকাস আনা
      const popup = Swal.getPopup()
      if (popup) {
        popup.style.pointerEvents = 'auto' // ক্লিক এনাবল
      }
      const input = document.getElementById('swal-pass')
      if (input) input.focus()
    },

    preConfirm: async () => {
      const pass = document.getElementById('swal-pass').value
      const confirm = document.getElementById('swal-confirm').value

      if (!pass || !confirm) return Swal.showValidationMessage('উভয় ফিল্ড পূরণ করুন')
      if (pass.length < 6) return Swal.showValidationMessage('কমপক্ষে ৬ সংখ্যা দিন')
      if (pass !== confirm) return Swal.showValidationMessage('পাসওয়ার্ড মিলছে না')

      try {
        await axios.post(
          `${BASE_URL}/change-password`,
          {
            new_password: pass,
            new_password_confirmation: confirm,
          },
          apiConfig,
        )
      } catch (error) {
        Swal.showValidationMessage(error.response?.data?.message || 'Error')
      }
    },
  }).then((result) => {
    if (result.isConfirmed) Swal.fire('সফল!', 'পাসওয়ার্ড আপডেট হয়েছে', 'success')
  })
}

onMounted(() => {
  checkUserStatus()
})
</script>

<template>
  <div class="student-dashboard">
    <div class="header mb-4">
      <h2 class="text-white">Student Dashboard</h2>
      <p class="text-gray">Welcome back, {{ studentInfo.name }}! 👋</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card gradient-1">
        <div class="icon-box">🏫</div>
        <div>
          <p class="stat-label">Class & Section</p>
          <h3 class="stat-value">
            {{ studentInfo.class }}
            <span v-if="studentInfo.section">({{ studentInfo.section }})</span>
          </h3>
        </div>
      </div>

      <div class="stat-card gradient-2">
        <div class="icon-box">🆔</div>
        <div>
          <p class="stat-label">Roll Number</p>
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
          <p class="stat-label">Due Fees</p>
          <h3 class="stat-value">৳ {{ studentInfo.due_fees }}</h3>
        </div>
      </div>
    </div>

    <div class="recent-section mt-section">
      <h3>📌 Quick Links</h3>
      <div class="quick-links">
        <router-link to="/student/routine" class="btn-link">📅 Class Routine</router-link>
        <router-link to="/student/results" class="btn-link">📊 Exam Result</router-link>
        <router-link to="/student/change-password" class="btn-link change-pass-btn"
          >🔒 Change Password</router-link
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ড্যাশবোর্ড স্টাইল */
.student-dashboard {
  padding-bottom: 50px;
}
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
.stat-card {
  padding: 25px;
  border-radius: 15px;
  color: white;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
  transition: 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #3b3b5c;
}
.btn-link:hover {
  background: #3699ff;
  color: white;
  border-color: #3699ff;
  transform: translateY(-2px);
}
.change-pass-btn {
  border: 1px solid #f59e0b;
  color: #f59e0b;
}
.change-pass-btn:hover {
  background: #f59e0b;
  color: white;
}
</style>

<style>
/* ১. SweetAlert কন্টেইনারকে সবকিছুর উপরে রাখা */
.swal2-container {
  z-index: 2000000 !important; /* সবার উপরে */
  pointer-events: auto !important; /* মাউস ক্লিক এনাবল */
}

/* ২. পপ-আপ বডি */
.swal2-popup {
  background: white !important; /* সাদা ব্যাকগ্রাউন্ড */
  opacity: 1 !important; /* দৃশ্যমান */
  pointer-events: auto !important;
}

/* ৩. ইনপুট ফিল্ড ফিক্স */
.custom-input {
  background: white !important;
  color: black !important;
  border: 1px solid #ccc !important;
  margin-bottom: 10px;
  width: 100%;
  height: 40px;
  padding: 5px;
  display: block !important;
  opacity: 1 !important;
}

/* ৪. ইনপুটে ফোকাস */
.custom-input:focus {
  border-color: #4f46e5 !important;
  outline: none;
}
</style>
