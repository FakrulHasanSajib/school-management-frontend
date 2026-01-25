<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

// স্টেটস
const exams = ref([])
const classes = ref([])
const sections = ref([])
const subjects = ref([])
const students = ref([]) // স্টুডেন্ট লিস্ট
const loading = ref(false)

const filter = ref({
  exam_id: '',
  class_id: '',
  section_id: '',
  subject_id: '',
})

const token = localStorage.getItem('token')
const apiConfig = { headers: { Authorization: `Bearer ${token}` } }

// ১. ড্রপডাউন ডাটা লোড করা
const loadInitialData = async () => {
  const [examRes, classRes] = await Promise.all([
    axios.get('http://127.0.0.1:8000/api/exams', apiConfig),
    axios.get('http://127.0.0.1:8000/api/academic/classes', apiConfig),
  ])
  exams.value = examRes.data.data || examRes.data
  classes.value = classRes.data.data
}

// ক্লাস পাল্টালে সেকশন এবং সাবজেক্ট লোড হবে
const handleClassChange = async () => {
  sections.value = []
  subjects.value = []
  if (!filter.value.class_id) return

  const [secRes, subRes] = await Promise.all([
    axios.get(
      `http://127.0.0.1:8000/api/academic/classes/${filter.value.class_id}/sections`,
      apiConfig,
    ),
    axios.get(
      `http://127.0.0.1:8000/api/academic/classes/${filter.value.class_id}/subjects`,
      apiConfig,
    ),
  ])
  sections.value = secRes.data.data
  subjects.value = subRes.data.data
}

// ২. স্টুডেন্ট লিস্ট ফেচ করা (মার্কস বসানোর জন্য)
const fetchStudents = async () => {
  if (!filter.value.class_id || !filter.value.section_id) return

  loading.value = true
  try {
    // সেকশন অনুযায়ী স্টুডেন্ট আনা
    const res = await axios.get(
      `http://127.0.0.1:8000/api/students/section/${filter.value.section_id}`,
      apiConfig,
    )

    // প্রতিটি স্টুডেন্টের সাথে marks ফিল্ড যোগ করা (ডিফল্ট ০)
    students.value = res.data.data.map((student) => ({
      student_id: student.id,
      name: student.name,
      roll: student.roll_no,
      obtained_mark: '', // ইনপুট ফিল্ডের জন্য
    }))
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// ৩. মার্কস সেভ করা
const saveMarks = async () => {
  if (!filter.value.exam_id || !filter.value.subject_id) {
    return Swal.fire('Warning', 'অনুগ্রহ করে পরীক্ষা এবং বিষয় সিলেক্ট করুন', 'warning')
  }

  // শুধু যাদের মার্কস দেওয়া হয়েছে তাদের ফিল্টার করা
  const marksPayload = students.value
    .filter((s) => s.obtained_mark !== '')
    .map((s) => ({
      student_id: s.student_id,
      exam_id: filter.value.exam_id,
      subject_id: filter.value.subject_id,
      marks: s.obtained_mark,
      class_id: filter.value.class_id,
      section_id: filter.value.section_id,
    }))

  if (marksPayload.length === 0) return Swal.fire('Warning', 'কোনো মার্কস দেওয়া হয়নি!', 'warning')

  try {
    await axios.post('http://127.0.0.1:8000/api/marks', { marks: marksPayload }, apiConfig)
    Swal.fire('Success', 'মার্কস সেভ হয়েছে!', 'success')
  } catch (error) {
    Swal.fire('Error', 'মার্কস সেভ করা যায়নি', 'error')
    console.error(error)
  }
}

onMounted(loadInitialData)
</script>

<template>
  <div class="p-4">
    <div class="card no-print">
      <h3>💯 মার্কস এন্ট্রি</h3>

      <div class="filters">
        <select v-model="filter.exam_id">
          <option value="">পরীক্ষা সিলেক্ট করুন</option>
          <option v-for="e in exams" :key="e.id" :value="e.id">{{ e.name }}</option>
        </select>

        <select v-model="filter.class_id" @change="handleClassChange">
          <option value="">ক্লাস</option>
          <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>

        <select v-model="filter.section_id">
          <option value="">সেকশন</option>
          <option v-for="s in sections" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>

        <select v-model="filter.subject_id">
          <option value="">বিষয় (Subject)</option>
          <option v-for="sub in subjects" :key="sub.id" :value="sub.id">{{ sub.name }}</option>
        </select>

        <button @click="fetchStudents" class="btn-go">Search</button>
      </div>
    </div>

    <div v-if="students.length > 0" class="card mt-4">
      <div class="header-flex">
        <h4>স্টুডেন্ট তালিকা</h4>
        <button @click="saveMarks" class="btn-save">💾 সব সেভ করুন</button>
      </div>

      <table class="marks-table">
        <thead>
          <tr>
            <th>রোল</th>
            <th>নাম</th>
            <th>প্রাপ্ত নম্বর (Marks)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in students" :key="student.student_id">
            <td>{{ student.roll }}</td>
            <td>{{ student.name }}</td>
            <td>
              <input
                type="number"
                v-model="student.obtained_mark"
                placeholder="Ex: 80"
                class="mark-input"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div class="action-area">
        <button @click="saveMarks" class="btn-save big">💾 মার্কস সাবমিট করুন</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}
.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 15px;
}
select,
button {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
}
.btn-go {
  background: #333;
  color: white;
  border: none;
}
.mt-4 {
  margin-top: 20px;
}
.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

/* টেবিল ডিজাইন */
.marks-table {
  width: 100%;
  border-collapse: collapse;
}
.marks-table th,
.marks-table td {
  border: 1px solid #eee;
  padding: 10px;
  text-align: left;
}
.marks-table th {
  background: #f8fafc;
}

/* ইনপুট ফিল্ড ডিজাইন */
.mark-input {
  width: 100px;
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 5px;
  text-align: center;
  font-weight: bold;
}
.mark-input:focus {
  outline: 2px solid #2563eb;
  border-color: transparent;
}

.btn-save {
  background: #16a34a;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
}
.btn-save.big {
  width: 100%;
  padding: 15px;
  font-size: 16px;
  margin-top: 20px;
}
.action-area {
  margin-top: 10px;
}
</style>
