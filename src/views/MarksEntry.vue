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

// ✅ অটোমেটিক বেস URL ডিটেকশন (Localhost vs Hosting)
// যদি লোকালহোস্টে থাকেন তবে ৮০০০ পোর্টে হিট করবে, আর লাইভ সার্ভারে থাকলে রিলেটিভ পাথ (/api) নিবে।
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
    return Swal.fire('Warning', 'ক্লাস এবং সেকশন সিলেক্ট করুন', 'warning')
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
      obtained_mark: '',
    }))
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'স্টুডেন্ট লিস্ট আনা যায়নি', 'error')
  } finally {
    loading.value = false
  }
}

// ৩. মার্কস সেভ করা (✅ 422 Error Fix সহ)
const saveMarks = async () => {
  // ভ্যালিডেশন
  if (!filter.value.exam_id || !filter.value.subject_id || !filter.value.class_id) {
    return Swal.fire('Warning', 'অনুগ্রহ করে পরীক্ষা, ক্লাস এবং বিষয় সিলেক্ট করুন', 'warning')
  }

  // ১. মার্কস লিস্ট তৈরি
  const marksList = students.value
    .filter((s) => s.obtained_mark !== '' && s.obtained_mark !== null)
    .map((s) => ({
      student_id: s.student_id,
      marks_obtained: s.obtained_mark, // ✅ কন্ট্রোলারের সাথে মিল রেখে নাম
    }))

  if (marksList.length === 0) {
    return Swal.fire('Warning', 'কোনো মার্কস দেওয়া হয়নি!', 'warning')
  }

  // ২. সঠিক পে-লোড (আইডিগুলো টপ লেভেলে থাকবে)
  const payload = {
    exam_id: filter.value.exam_id,
    class_id: filter.value.class_id,
    subject_id: filter.value.subject_id,
    marks: marksList,
  }

  try {
    await axios.post(`${BASE_URL}/marks`, payload, apiConfig)

    Swal.fire('Success', 'মার্কস সফলভাবে সেভ হয়েছে!', 'success')

    // সফল হলে ইনপুট ফিল্ড ক্লিয়ার করতে চাইলে নিচের লাইনটি চালু করতে পারেন
    // fetchStudents()
  } catch (error) {
    if (error.response && error.response.status === 422) {
      // ভ্যালিডেশন এরর দেখা
      console.log('Validation Error:', error.response.data)
      const errorMsg = Object.values(error.response.data.errors).flat().join('<br>')
      Swal.fire({ icon: 'error', title: 'Validation Error', html: errorMsg })
    } else {
      Swal.fire('Error', 'মার্কস সেভ করা যায়নি।', 'error')
      console.error(error)
    }
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
          <option value="">বিষয় (Subject)</option>
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
/* কার্ড স্টাইল */
.card {
  background: white !important; /* ব্যাকগ্রাউন্ড সাদা */
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  color: #333 !important; /* টেক্সট কালো */
}

/* হেডিং এর রং কালো */
h3,
h4 {
  color: #333 !important;
}

.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 15px;
}

/* ইনপুট এবং সিলেক্ট ফিক্স (সাদা ব্যাকগ্রাউন্ড, কালো লেখা) */
select,
button,
input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
  background-color: #ffffff !important;
  color: #000000 !important;
}

.btn-go {
  background: #333 !important; /* সার্চ বাটন কালো */
  color: white !important;
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
  background-color: white !important;
}

.marks-table th,
.marks-table td {
  border: 1px solid #eee;
  padding: 10px;
  text-align: left;
  color: #000000 !important; /* টেবিলের লেখা কালো */
}

.marks-table th {
  background: #f8fafc !important;
  color: #334155 !important;
  font-weight: bold;
}

/* ইনপুট ফিল্ড ডিজাইন */
.mark-input {
  width: 100px;
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 5px;
  text-align: center;
  font-weight: bold;
  background-color: #fff !important;
  color: #000 !important;
}

.mark-input:focus {
  outline: 2px solid #2563eb;
  border-color: transparent;
}

.btn-save {
  background: #16a34a !important;
  color: white !important;
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
