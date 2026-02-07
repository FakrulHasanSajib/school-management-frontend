<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const classes = ref([])
const sections = ref([])
const exams = ref([])
const subjects = ref([])
const students = ref([])
const isLoading = ref(false)

const form = ref({
  class_id: '',
  section_id: '',
  exam_id: '',
  subject_id: '',
})

// ক্লাস লোড (আগের কোড রিইউজ করতে পারেন বা আবার লিখতে পারেন)
const fetchClasses = async () => {
  const res = await axios.get('http://127.0.0.1:8000/api/teacher/classes', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  })
  classes.value = res.data
}

// সেকশন ও ইনিশিয়াল ডাটা লোড
const handleClassChange = async () => {
  if (!form.value.class_id) return
  const token = localStorage.getItem('token')

  // সেকশন লোড
  const secRes = await axios.get(
    `http://127.0.0.1:8000/api/teacher/sections/${form.value.class_id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  sections.value = secRes.data

  // এক্সাম ও সাবজেক্ট লোড
  const initRes = await axios.get(
    `http://127.0.0.1:8000/api/teacher/init-data/${form.value.class_id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  exams.value = initRes.data.exams
  subjects.value = initRes.data.subjects
}

// মার্কশিট লোড করা
const loadMarksSheet = async () => {
  if (!form.value.exam_id || !form.value.subject_id) {
    Swal.fire('Warning', 'Select Exam and Subject first', 'warning')
    return
  }
  isLoading.value = true
  try {
    const res = await axios.post('http://127.0.0.1:8000/api/teacher/get-marks-sheet', form.value, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    students.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

// মার্কস সেভ করা
const saveMarks = async () => {
  try {
    await axios.post(
      'http://127.0.0.1:8000/api/teacher/save-marks',
      {
        ...form.value,
        marks: students.value,
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      },
    )
    Swal.fire('Success', 'Marks updated successfully!', 'success')
  } catch (e) {
    Swal.fire('Error', 'Failed to save marks', 'error')
  }
}

onMounted(() => fetchClasses())
</script>

<template>
  <div class="marks-container">
    <div class="card header-card">
      <h2>📝 Enter Marks</h2>
      <div class="filters">
        <select v-model="form.class_id" @change="handleClassChange">
          <option value="">Select Class</option>
          <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <select v-model="form.section_id">
          <option value="">Select Section</option>
          <option v-for="s in sections" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
        <select v-model="form.exam_id">
          <option value="">Select Exam</option>
          <option v-for="e in exams" :key="e.id" :value="e.id">{{ e.name }}</option>
        </select>
        <select v-model="form.subject_id">
          <option value="">Select Subject</option>
          <option v-for="sub in subjects" :key="sub.id" :value="sub.id">{{ sub.name }}</option>
        </select>
        <button @click="loadMarksSheet" class="btn-go">Go</button>
      </div>
    </div>

    <div v-if="students.length > 0" class="card list-card">
      <div class="flex-between">
        <h3>Student List</h3>
        <button @click="saveMarks" class="btn-save">💾 Save Marks</button>
      </div>
      <table class="custom-table">
        <thead>
          <tr>
            <th>Roll</th>
            <th>Name</th>
            <th>Marks Obtained</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in students" :key="student.student_id">
            <td>{{ student.roll }}</td>
            <td>{{ student.name }}</td>
            <td>
              <input
                type="number"
                v-model="student.marks_obtained"
                class="marks-input"
                placeholder="00"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.marks-container {
  max-width: 900px;
  margin: 0 auto;
  color: white;
}
.card {
  background: #1e1e2d;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}
.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 15px;
}
select {
  background: #151521;
  border: 1px solid #333;
  color: white;
  padding: 10px;
  border-radius: 6px;
  flex: 1;
}
.btn-go {
  background: #3699ff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}
.btn-save {
  background: #10b981;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}
.custom-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}
.custom-table th,
.custom-table td {
  padding: 12px;
  border-bottom: 1px solid #333;
  text-align: left;
}
.marks-input {
  background: #151521;
  border: 1px solid #444;
  color: white;
  padding: 8px;
  width: 80px;
  border-radius: 4px;
  text-align: center;
}
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
