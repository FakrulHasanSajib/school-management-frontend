<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const classes = ref([])
const sections = ref([])
const students = ref([])
const isLoading = ref(false)

const form = ref({
  class_id: '',
  section_id: '',
  date: new Date().toISOString().slice(0, 10),
})

// ১. ক্লাস লোড (Academic Controller)
const fetchClasses = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/academic/classes', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    classes.value = res.data.data
  } catch (e) {
    console.error(e)
  }
}

// ২. সেকশন লোড
// ২. সেকশন লোড
const fetchSections = async () => {
  sections.value = [] // আগের ডাটা ক্লিয়ার করুন
  form.value.section_id = '' // সিলেক্টেড সেকশন রিসেট

  if (!form.value.class_id) return

  try {
    const res = await axios.get(
      `http://127.0.0.1:8000/api/academic/classes/${form.value.class_id}/sections`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      },
    )

    // কনসোলে রেসপন্স প্রিন্ট করে দেখুন ডাটা আসছে কিনা
    console.log('Sections Data:', res.data)

    // ✅ ফিক্স: যদি ডাটা 'data' র‍্যাপারের ভেতরে থাকে
    if (res.data.data) {
      sections.value = res.data.data
    } else {
      sections.value = res.data
    }
  } catch (e) {
    console.error('Section load error:', e)
  }
}

// ৩. স্টুডেন্ট লোড (আপনার মেইন AttendanceController)
const fetchStudents = async () => {
  if (!form.value.class_id || !form.value.section_id) {
    Swal.fire('Warning', 'Select Class and Section first!', 'warning')
    return
  }

  isLoading.value = true
  try {
    const res = await axios.post('http://127.0.0.1:8000/api/attendance/get-students', form.value, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })

    // ডাটা যদি data র‍্যাপারে থাকে
    students.value = res.data.data || res.data

    if (students.value.length === 0) {
      Swal.fire('Info', 'No students found.', 'info')
    }
  } catch (e) {
    console.error(e)
    Swal.fire('Error', 'Failed to fetch students.', 'error')
  } finally {
    isLoading.value = false
  }
}

// ৪. হাজিরা সেভ করা
const submitAttendance = async () => {
  try {
    const payload = {
      class_id: form.value.class_id,
      section_id: form.value.section_id,
      date: form.value.date,
      attendances: students.value.map((s) => ({
        student_id: s.student_id,
        status: s.status,
        remarks: '',
      })),
    }

    await axios.post('http://127.0.0.1:8000/api/attendance/store', payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })

    Swal.fire({
      icon: 'success',
      title: 'Saved!',
      text: 'Attendance submitted successfully!',
      timer: 1500,
      showConfirmButton: false,
    })
  } catch (e) {
    console.error(e)
    Swal.fire('Error', 'Failed to save attendance.', 'error')
  }
}

onMounted(() => {
  fetchClasses()
})
</script>

<template>
  <div class="attendance-container">
    <div class="glass-card header-section">
      <h2>📅 Take Attendance</h2>
      <div class="filters">
        <select v-model="form.class_id" @change="fetchSections">
          <option value="">Select Class</option>
          <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
        </select>

        <select v-model="form.section_id">
          <option value="">Select Section</option>
          <option v-for="sec in sections" :key="sec.id" :value="sec.id">{{ sec.name }}</option>
        </select>

        <input type="date" v-model="form.date" />

        <button @click="fetchStudents" class="btn-go">
          {{ isLoading ? 'Loading...' : 'Go' }}
        </button>
      </div>
    </div>

    <div v-if="students.length > 0" class="glass-card list-section">
      <div class="list-header">
        <h3>Student List ({{ students.length }})</h3>
        <button @click="submitAttendance" class="btn-save">💾 Save Attendance</button>
      </div>

      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Roll</th>
              <th>Name</th>
              <th class="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="student in students"
              :key="student.student_id"
              :class="{ 'absent-row': student.status === 'Absent' }"
            >
              <td>{{ student.roll }}</td>
              <td>{{ student.name }}</td>
              <td class="status-options">
                <label class="radio-btn present">
                  <input
                    type="radio"
                    v-model="student.status"
                    value="Present"
                    :name="'s-' + student.student_id"
                  />
                  <span>P</span>
                </label>
                <label class="radio-btn absent">
                  <input
                    type="radio"
                    v-model="student.status"
                    value="Absent"
                    :name="'s-' + student.student_id"
                  />
                  <span>A</span>
                </label>
                <label class="radio-btn late">
                  <input
                    type="radio"
                    v-model="student.status"
                    value="Late"
                    :name="'s-' + student.student_id"
                  />
                  <span>L</span>
                </label>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.attendance-container {
  max-width: 900px;
  margin: 0 auto;
  color: white;
}
.glass-card {
  background: #1e1e2d;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 25px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.header-section h2 {
  color: #3699ff;
  margin-bottom: 20px;
}
.filters {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}
select,
input {
  background: #151521;
  border: 1px solid #333;
  color: white;
  padding: 12px;
  border-radius: 8px;
  flex: 1;
  outline: none;
}
.btn-go {
  background: #3699ff;
  color: white;
  border: none;
  padding: 0 25px;
  border-radius: 8px;
  cursor: pointer;
}
.btn-save {
  background: #10b981;
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 8px;
  cursor: pointer;
}
.list-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}
.custom-table {
  width: 100%;
  border-collapse: collapse;
}
.custom-table th,
.custom-table td {
  padding: 15px;
  border-bottom: 1px solid #333;
  text-align: left;
}
.status-options {
  display: flex;
  gap: 10px;
  justify-content: center;
}
.radio-btn {
  padding: 5px 15px;
  border-radius: 20px;
  background: #2b2b40;
  cursor: pointer;
  border: 1px solid transparent;
}
.radio-btn input {
  display: none;
}
.radio-btn.present:has(input:checked) {
  background: #10b98120;
  color: #10b981;
  border-color: #10b981;
}
.radio-btn.absent:has(input:checked) {
  background: #ef444420;
  color: #ef4444;
  border-color: #ef4444;
}
.radio-btn.late:has(input:checked) {
  background: #f59e0b20;
  color: #f59e0b;
  border-color: #f59e0b;
}
.absent-row {
  background: rgba(239, 68, 68, 0.05);
}
</style>
