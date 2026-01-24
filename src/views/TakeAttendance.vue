<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const classes = ref([])
const sections = ref([])
const students = ref([])
const isLoading = ref(false)

// ১. টোকেন এবং লগইন করা টিচারের ডাটা
const token = localStorage.getItem('token')
const currentTeacher = JSON.parse(localStorage.getItem('user')) || { name: 'Admin' }

const form = ref({
  class_id: '',
  section_id: '',
  date: new Date().toISOString().substr(0, 10),
})

// ✅ এপিআই কনফিগারেশন
const apiConfig = {
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  },
}

const fetchData = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/academic/classes', apiConfig)
    classes.value = res.data.data
  } catch (error) {
    console.error(error)
  }
}

const handleClassChange = async () => {
  if (!form.value.class_id) return
  const res = await axios.get(
    `http://127.0.0.1:8000/api/academic/classes/${form.value.class_id}/sections`,
    apiConfig,
  )
  sections.value = res.data.data
}

const fetchStudents = async () => {
  if (!form.value.class_id || !form.value.section_id) return
  isLoading.value = true
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/students', {
      ...apiConfig,
      params: { class_id: form.value.class_id, section_id: form.value.section_id },
    })
    students.value = res.data.data.map((s) => ({
      // ✅ এখানে নিশ্চিত করুন স্টুডেন্ট প্রোফাইল আইডি পাঠানো হচ্ছে
      student_id: s.student_profile?.id || s.id,
      name: s.name,
      roll_no: s.roll_no,
      status: 'Present',
    }))
  } finally {
    isLoading.value = false
  }
}

const markAll = (status) => {
  students.value.forEach((s) => (s.status = status))
}

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
    // ✅ ইউআরএল ফিক্স করা হয়েছে
    await axios.post('http://127.0.0.1:8000/api/attendance/store', payload, apiConfig)
    Swal.fire('সফল!', 'হাজিরা সেভ হয়েছে এবং অনুপস্থিতদের এসএমএস প্রসেস করা হয়েছে।', 'success')
  } catch (error) {
    const msg = error.response?.data?.message || 'সার্ভারে ডাটা পাঠানো যায়নি।'
    Swal.fire('ভুল হয়েছে', msg, 'error')
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="attendance-container">
    <div class="header">
      <h2>📝 স্টুডেন্ট হাজিরা</h2>
      <p class="teacher-name">
        শিক্ষক: <b>{{ currentTeacher.name }}</b>
      </p>
      <input type="date" v-model="form.date" class="date-picker" />
    </div>

    <div class="filter-card">
      <select v-model="form.class_id" @change="handleClassChange">
        <option value="">ক্লাস সিলেক্ট করুন</option>
        <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <select v-model="form.section_id" @change="fetchStudents">
        <option value="">সেকশন সিলেক্ট করুন</option>
        <option v-for="s in sections" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
    </div>

    <div v-if="students.length > 0" class="bulk-actions">
      <button @click="markAll('Present')" class="btn-p">সবাই উপস্থিত (P)</button>
      <button @click="markAll('Absent')" class="btn-a">সবাই অনুপস্থিত (A)</button>
    </div>

    <div v-if="students.length > 0" class="table-card">
      <table class="attendance-table">
        <thead>
          <tr>
            <th>রোল</th>
            <th>নাম</th>
            <th>অবস্থা</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in students" :key="student.student_id">
            <td class="text-dark">{{ student.roll_no }}</td>
            <td class="text-dark">{{ student.name }}</td>
            <td>
              <div class="options">
                <label class="p-text"
                  ><input type="radio" v-model="student.status" value="Present" /> P</label
                >
                <label class="a-text"
                  ><input type="radio" v-model="student.status" value="Absent" /> A</label
                >
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <button @click="submitAttendance" class="save-btn">✅ হাজিরা জমা দিন</button>
    </div>
  </div>
</template>

<style scoped>
.attendance-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 15px;
  border-radius: 10px;
}
.filter-card {
  background: #1e293b;
  padding: 20px;
  border-radius: 10px;
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}
select {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  background: #0f172a;
  color: white;
  border: 1px solid #334155;
}
.bulk-actions {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}
.btn-p {
  background: #dcfce7;
  color: #166534;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid #166534;
}
.btn-a {
  background: #fee2e2;
  color: #991b1b;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid #991b1b;
}

/* ✅ ভিজিবিলিটি ফিক্স */
.table-card {
  background: #ffffff !important;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #ddd;
}
.attendance-table {
  width: 100%;
  border-collapse: collapse;
}
.attendance-table td {
  padding: 15px !important;
  color: #1e293b !important;
  background-color: #ffffff !important;
  border-bottom: 1px solid #f1f5f9;
}
.text-dark {
  color: #1e293b !important;
  font-weight: 700;
}
.p-text {
  color: #16a34a;
  font-weight: bold;
  margin-right: 10px;
}
.a-text {
  color: #dc2626;
  font-weight: bold;
}
.save-btn {
  width: 100%;
  margin-top: 20px;
  background: #2563eb;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}
</style>
