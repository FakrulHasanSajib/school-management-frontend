<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const classes = ref([])
const sections = ref([])
const students = ref([])
const isLoading = ref(false)

// টোকেন এবং লগইন করা টিচারের ডাটা
const token = localStorage.getItem('token')
const currentTeacher = JSON.parse(localStorage.getItem('user')) || { name: 'Admin' }

const form = ref({
  class_id: '',
  section_id: '',
  date: new Date().toISOString().substr(0, 10),
})

const apiConfig = {
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  },
}

// ১. ক্লাস লিস্ট আনা
const fetchData = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/academic/classes', apiConfig)
    classes.value = res.data.data
  } catch (error) {
    console.error(error)
  }
}

// ২. সেকশন লোড করা
const handleClassChange = async () => {
  if (!form.value.class_id) return
  const res = await axios.get(
    `http://127.0.0.1:8000/api/academic/classes/${form.value.class_id}/sections`,
    apiConfig,
  )
  sections.value = res.data.data
}

// ৩. স্টুডেন্ট লিস্ট আনা
const fetchStudents = async () => {
  if (!form.value.class_id || !form.value.section_id) return
  isLoading.value = true
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/students', {
      ...apiConfig,
      params: { class_id: form.value.class_id, section_id: form.value.section_id },
    })

    students.value = res.data.data.map((s) => ({
      student_id: s.student_profile?.id || s.id,
      name: s.name,
      roll_no: s.roll_no,
      status: 'Present', // ডিফল্ট প্রেজেন্ট
      image: s.student_profile?.image
        ? s.student_profile.image.startsWith('http')
          ? s.student_profile.image
          : `http://127.0.0.1:8000/storage/${s.student_profile.image}`
        : null,
    }))
  } finally {
    isLoading.value = false
  }
}

// ৪. সব মার্ক করা
const markAll = (status) => {
  students.value.forEach((s) => (s.status = status))
}

// ৫. হাজিরা জমা দেওয়া
const submitAttendance = async () => {
  if (students.value.length === 0) return

  try {
    const payload = {
      class_id: form.value.class_id,
      section_id: form.value.section_id,
      date: form.value.date,
      attendances: students.value.map((s) => ({
        student_id: s.student_id,
        status: s.status,
        remarks: `Taken by: ${currentTeacher.name}`,
      })),
    }

    await axios.post('http://127.0.0.1:8000/api/attendance/store', payload, apiConfig)

    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Attendance submitted successfully.',
      background: '#1e1e2d',
      color: '#fff',
      confirmButtonColor: '#3b82f6',
    })

    // রিসেট বা রিফ্রেশ করতে চাইলে
    // students.value = []
  } catch (error) {
    const msg = error.response?.data?.message || 'Failed to submit attendance.'
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: msg,
      background: '#1e1e2d',
      color: '#fff',
    })
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="page-container">
    <div class="header-action">
      <div>
        <h2 class="page-title">📝 Student Attendance</h2>
        <p class="page-subtitle">Mark daily attendance for students</p>
      </div>
      <div class="teacher-info">
        <span
          >Taken By: <strong>{{ currentTeacher.name }}</strong></span
        >
        <input type="date" v-model="form.date" class="date-picker" />
      </div>
    </div>

    <div class="filter-card">
      <div class="filter-group">
        <label>Select Class</label>
        <select v-model="form.class_id" @change="handleClassChange">
          <option value="">Choose Class</option>
          <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Select Section</label>
        <select v-model="form.section_id" @change="fetchStudents" :disabled="!sections.length">
          <option value="">Choose Section</option>
          <option v-for="s in sections" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </div>
    </div>

    <div v-if="students.length > 0" class="bulk-actions">
      <button @click="markAll('Present')" class="btn present-all">✅ Mark All Present</button>
      <button @click="markAll('Absent')" class="btn absent-all">❌ Mark All Absent</button>
      <button @click="markAll('Late')" class="btn late-all">⚠️ Mark All Late</button>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading students...</p>
    </div>

    <div v-else-if="students.length === 0 && form.section_id" class="empty-state">
      <p>No students found in this section.</p>
    </div>

    <div v-else-if="students.length > 0" class="table-card">
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Student Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in students" :key="student.student_id">
              <td class="roll-col">{{ student.roll_no }}</td>

              <td>
                <div class="user-info">
                  <div class="avatar-wrapper">
                    <img v-if="student.image" :src="student.image" class="avatar-img" />
                    <div v-else class="avatar-placeholder">{{ student.name.charAt(0) }}</div>
                  </div>
                  <span class="user-name">{{ student.name }}</span>
                </div>
              </td>

              <td>
                <div class="status-options">
                  <label class="radio-label present">
                    <input type="radio" v-model="student.status" value="Present" />
                    <span>Present</span>
                  </label>
                  <label class="radio-label absent">
                    <input type="radio" v-model="student.status" value="Absent" />
                    <span>Absent</span>
                  </label>
                  <label class="radio-label late">
                    <input type="radio" v-model="student.status" value="Late" />
                    <span>Late</span>
                  </label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="form-actions">
        <button @click="submitAttendance" class="submit-btn">💾 Submit Attendance</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Page Layout */
.page-container {
  padding: 25px;
  color: #fff;
  max-width: 1000px;
  margin: 0 auto;
}
.header-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}
.page-title {
  font-size: 26px;
  font-weight: 700;
  margin: 0;
  color: white;
}
.page-subtitle {
  color: #a1a5b7;
  font-size: 14px;
  margin-top: 5px;
}

.teacher-info {
  display: flex;
  align-items: center;
  gap: 15px;
}
.teacher-info span {
  color: #a1a5b7;
  font-size: 14px;
}
.teacher-info strong {
  color: #3b82f6;
}
.date-picker {
  padding: 8px 12px;
  background: #1e1e2d;
  border: 1px solid #2b2b40;
  color: white;
  border-radius: 8px;
  outline: none;
  cursor: pointer;
}
.date-picker::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

/* Filter Card */
.filter-card {
  background: #1e1e2d;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
  border: 1px solid #2b2b40;
}
.filter-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.filter-group label {
  color: #a1a5b7;
  font-size: 13px;
  font-weight: 600;
}
.filter-group select {
  padding: 12px;
  background: #151521;
  border: 1px solid #2b2b40;
  border-radius: 8px;
  color: white;
  outline: none;
  width: 100%;
  cursor: pointer;
}

/* Bulk Actions */
.bulk-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: flex-end;
}
.btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: 0.3s;
}
.present-all {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}
.present-all:hover {
  background: #10b981;
  color: white;
}
.absent-all {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}
.absent-all:hover {
  background: #ef4444;
  color: white;
}
.late-all {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}
.late-all:hover {
  background: #f59e0b;
  color: white;
}

/* Table Card */
.table-card {
  background: #1e1e2d;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #2b2b40;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
.custom-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.custom-table th {
  background: #151521;
  padding: 15px;
  color: #a1a5b7;
  font-weight: 600;
  font-size: 13px;
  border-bottom: 1px solid #2b2b40;
}
.custom-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #2b2b40;
  color: #e2e8f0;
  vertical-align: middle;
}
.roll-col {
  font-weight: bold;
  color: #a1a5b7;
  width: 80px;
  text-align: center;
}

/* User Info */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar-img,
.avatar-placeholder {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
}
.avatar-placeholder {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}
.user-name {
  font-weight: 600;
  color: white;
}

/* Status Radio Buttons */
.status-options {
  display: flex;
  gap: 15px;
}
.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
  transition: 0.2s;
  border: 1px solid transparent;
}
.radio-label input {
  accent-color: currentColor;
}

/* Active States for Radio Labels */
.radio-label:has(input:checked) {
  border-color: currentColor;
  background: rgba(255, 255, 255, 0.05);
}

.present {
  color: #10b981;
}
.absent {
  color: #ef4444;
}
.late {
  color: #f59e0b;
}

/* Submit Button */
.form-actions {
  padding: 20px;
  border-top: 1px solid #2b2b40;
  display: flex;
  justify-content: flex-end;
}
.submit-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.3s;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}
.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}

/* Loading & Empty */
.loading-state,
.empty-state {
  text-align: center;
  padding: 50px;
  color: #a1a5b7;
}
.spinner {
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 600px) {
  .header-action,
  .filter-card {
    flex-direction: column;
    align-items: stretch;
  }
  .status-options {
    flex-direction: column;
    gap: 5px;
  }
}
</style>
