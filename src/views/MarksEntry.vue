<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

// স্টেটস
const exams = ref([])
const classes = ref([])
const sections = ref([])
const subjects = ref([])
const students = ref([])
const loading = ref(false)

const filter = ref({
  exam_id: '',
  class_id: '',
  section_id: '',
  subject_id: '',
})

// অটোমেটিক বেস URL ডিটেকশন
const BASE_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000/api'
    : '/api'

const token = localStorage.getItem('token')
const apiConfig = { headers: { Authorization: `Bearer ${token}` } }

// ১. ড্রপডাউন ডাটা লোড করা
const loadInitialData = async () => {
  try {
    const [examRes, classRes] = await Promise.all([
      axios.get(`${BASE_URL}/exams`, apiConfig),
      axios.get(`${BASE_URL}/academic/classes`, apiConfig),
    ])
    exams.value = examRes.data.data || examRes.data
    classes.value = classRes.data.data
  } catch (error) {
    console.error('Initial load error:', error)
  }
}

// ক্লাস পাল্টালে সেকশন এবং সাবজেক্ট লোড হবে
const handleClassChange = async () => {
  sections.value = []
  subjects.value = []
  filter.value.section_id = ''
  filter.value.subject_id = ''

  if (!filter.value.class_id) return

  try {
    const [secRes, subRes] = await Promise.all([
      axios.get(`${BASE_URL}/academic/classes/${filter.value.class_id}/sections`, apiConfig),
      axios.get(`${BASE_URL}/academic/classes/${filter.value.class_id}/subjects`, apiConfig),
    ])
    sections.value = secRes.data.data
    subjects.value = subRes.data.data
  } catch (error) {
    console.error(error)
  }
}

// ২. স্টুডেন্ট লিস্ট ফেচ করা
const fetchStudents = async () => {
  if (!filter.value.class_id || !filter.value.section_id) {
    return Swal.fire({
      icon: 'warning',
      title: 'Warning',
      text: 'Please select class and section.',
      background: '#1e1e2d',
      color: '#fff',
    })
  }

  loading.value = true
  try {
    const res = await axios.get(
      `${BASE_URL}/students/section/${filter.value.section_id}`,
      apiConfig,
    )

    students.value = res.data.data.map((student) => ({
      student_id: student.id,
      name: student.name,
      roll: student.roll_no,
      obtained_mark: '', // ডিফল্ট খালি
      image: student.student_profile?.image
        ? student.student_profile.image.startsWith('http')
          ? student.student_profile.image
          : `http://127.0.0.1:8000/storage/${student.student_profile.image}`
        : null,
    }))
  } catch (error) {
    console.error(error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to load students.',
      background: '#1e1e2d',
      color: '#fff',
    })
  } finally {
    loading.value = false
  }
}

// ৩. মার্কস সেভ করা
const saveMarks = async () => {
  if (!filter.value.exam_id || !filter.value.subject_id || !filter.value.class_id) {
    return Swal.fire({
      icon: 'warning',
      title: 'Warning',
      text: 'Please select exam, class and subject.',
      background: '#1e1e2d',
      color: '#fff',
    })
  }

  const marksList = students.value
    .filter((s) => s.obtained_mark !== '' && s.obtained_mark !== null)
    .map((s) => ({
      student_id: s.student_id,
      marks_obtained: s.obtained_mark,
    }))

  if (marksList.length === 0) {
    return Swal.fire({
      icon: 'warning',
      title: 'Warning',
      text: 'No marks entered.',
      background: '#1e1e2d',
      color: '#fff',
    })
  }

  const payload = {
    exam_id: filter.value.exam_id,
    class_id: filter.value.class_id,
    subject_id: filter.value.subject_id,
    marks: marksList,
  }

  try {
    await axios.post(`${BASE_URL}/marks`, payload, apiConfig)

    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Marks saved successfully.',
      background: '#1e1e2d',
      color: '#fff',
      confirmButtonColor: '#3b82f6',
    })
  } catch (error) {
    if (error.response && error.response.status === 422) {
      const errorMsg = Object.values(error.response.data.errors).flat().join('<br>')
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        html: errorMsg,
        background: '#1e1e2d',
        color: '#fff',
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save marks.',
        background: '#1e1e2d',
        color: '#fff',
      })
    }
  }
}

onMounted(loadInitialData)
</script>

<template>
  <div class="page-container">
    <div class="header-action">
      <div>
        <h2 class="page-title">💯 Marks Entry</h2>
        <p class="page-subtitle">Input subject-wise marks for students</p>
      </div>
    </div>

    <div class="filter-card">
      <div class="filter-group">
        <label>Exam</label>
        <select v-model="filter.exam_id">
          <option value="">Select Exam</option>
          <option v-for="e in exams" :key="e.id" :value="e.id">{{ e.name }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Class</label>
        <select v-model="filter.class_id" @change="handleClassChange">
          <option value="">Select Class</option>
          <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Section</label>
        <select v-model="filter.section_id">
          <option value="">Select Section</option>
          <option v-for="s in sections" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Subject</label>
        <select v-model="filter.subject_id">
          <option value="">Select Subject</option>
          <option v-for="sub in subjects" :key="sub.id" :value="sub.id">{{ sub.name }}</option>
        </select>
      </div>

      <button @click="fetchStudents" class="btn search-btn">Search</button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading student list...</p>
    </div>

    <div v-else-if="students.length === 0 && filter.section_id" class="empty-state">
      <p>No students found for this section.</p>
    </div>

    <div v-else-if="students.length > 0" class="table-card">
      <div class="table-header">
        <h4>Student List</h4>
        <button @click="saveMarks" class="btn save-btn-sm">💾 Save All</button>
      </div>

      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Roll</th>
              <th>Student Name</th>
              <th>Obtained Marks</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in students" :key="student.student_id">
              <td class="roll-col">{{ student.roll }}</td>
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
                <input
                  type="number"
                  v-model="student.obtained_mark"
                  placeholder="00"
                  class="mark-input"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="form-actions">
        <button @click="saveMarks" class="btn save-btn">💾 Submit Marks</button>
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

/* Filter Card */
.filter-card {
  background: #1e1e2d;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
  align-items: flex-end;
  flex-wrap: wrap;
  border: 1px solid #2b2b40;
}
.filter-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 150px;
}
.filter-group label {
  color: #a1a5b7;
  font-size: 13px;
  font-weight: 600;
}
.filter-group select {
  padding: 10px;
  background: #151521;
  border: 1px solid #2b2b40;
  border-radius: 8px;
  color: white;
  outline: none;
  width: 100%;
  cursor: pointer;
}

/* Buttons */
.btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
}
.search-btn {
  background: #3b82f6;
  color: white;
  height: 42px;
}
.search-btn:hover {
  background: #2563eb;
}
.save-btn {
  background: #10b981;
  color: white;
  width: 100%;
  margin-top: 10px;
}
.save-btn:hover {
  background: #059669;
}
.save-btn-sm {
  background: #10b981;
  color: white;
  padding: 6px 12px;
  font-size: 12px;
}

/* Table Card */
.table-card {
  background: #1e1e2d;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #2b2b40;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
.table-header {
  padding: 15px 20px;
  border-bottom: 1px solid #2b2b40;
  background: #151521;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.table-header h4 {
  margin: 0;
  color: #3b82f6;
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

/* Input Field */
.mark-input {
  width: 80px;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #2b2b40;
  background: #151521;
  color: white;
  text-align: center;
  font-weight: bold;
  outline: none;
}
.mark-input:focus {
  border-color: #3b82f6;
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
  .filter-card {
    flex-direction: column;
    align-items: stretch;
  }
  .table-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
}
</style>
