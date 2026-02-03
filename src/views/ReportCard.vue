<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

// অটো বেস URL (লোকালহোস্ট ও লাইভ দুটোর জন্যই)
const BASE_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000/api'
    : '/api'

const token = localStorage.getItem('token')
const apiConfig = { headers: { Authorization: `Bearer ${token}` } }

// স্টেটস
const exams = ref([])
const classes = ref([])
const sections = ref([])
const students = ref([])
const reportCard = ref(null) // রেজাল্ট ডাটা এখানে থাকবে
const loading = ref(false)

const filter = ref({
  exam_id: '',
  class_id: '',
  section_id: '',
  student_id: '',
})

// ১. প্রাথমিক ডাটা লোড
const loadInitialData = async () => {
  try {
    const [examRes, classRes] = await Promise.all([
      axios.get(`${BASE_URL}/exams`, apiConfig),
      axios.get(`${BASE_URL}/academic/classes`, apiConfig),
    ])
    exams.value = examRes.data.data || examRes.data
    classes.value = classRes.data.data
  } catch (error) {
    console.error(error)
  }
}

// ২. ক্লাস পাল্টালে সেকশন লোড
const handleClassChange = async () => {
  sections.value = []
  if (!filter.value.class_id) return
  const res = await axios.get(
    `${BASE_URL}/academic/classes/${filter.value.class_id}/sections`,
    apiConfig,
  )
  sections.value = res.data.data
}

// ৩. সেকশন পাল্টালে স্টুডেন্ট লোড (ড্রপডাউনের জন্য)
const handleSectionChange = async () => {
  students.value = []
  if (!filter.value.section_id) return
  const res = await axios.get(`${BASE_URL}/students/section/${filter.value.section_id}`, apiConfig)
  students.value = res.data.data
}

// ৪. রেজাল্ট বের করা (✅ নতুন আপডেট)
const getResult = async () => {
  if (!filter.value.exam_id || !filter.value.student_id) {
    return Swal.fire('Warning', 'দয়া করে পরীক্ষা এবং ছাত্র সিলেক্ট করুন', 'warning')
  }

  loading.value = true
  reportCard.value = null

  try {
    const res = await axios.get(
      `${BASE_URL}/results/exam/${filter.value.exam_id}/student/${filter.value.student_id}`,
      apiConfig,
    )

    // ✅ এখানে চেক করা হচ্ছে রেজাল্ট আছে কিনা
    if (res.data.status === true) {
      reportCard.value = res.data.data
      Swal.fire('Success', 'রেজাল্ট জেনারেট হয়েছে!', 'success')
    } else {
      // যদি মার্কস না থাকে তবে ব্যাকএন্ড থেকে আসা মেসেজ দেখাবে
      reportCard.value = null
      Swal.fire('Info', res.data.message, 'info')
    }
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'সার্ভারে সমস্যা হয়েছে।', 'error')
  } finally {
    loading.value = false
  }
}

// ৫. প্রিন্ট করার ফাংশন
const printResult = () => {
  window.print()
}

onMounted(loadInitialData)
</script>

<template>
  <div class="p-4">
    <div class="card no-print mb-4">
      <h3>📊 রেজাল্ট কার্ড দেখুন</h3>
      <div class="filters">
        <select v-model="filter.exam_id">
          <option value="">পরীক্ষা</option>
          <option v-for="e in exams" :key="e.id" :value="e.id">{{ e.name }}</option>
        </select>
        <select v-model="filter.class_id" @change="handleClassChange">
          <option value="">ক্লাস</option>
          <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <select v-model="filter.section_id" @change="handleSectionChange">
          <option value="">সেকশন</option>
          <option v-for="s in sections" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
        <select v-model="filter.student_id">
          <option value="">ছাত্র/ছাত্রী</option>
          <option v-for="st in students" :key="st.id" :value="st.id">
            {{ st.name }} (Roll: {{ st.roll_no }})
          </option>
        </select>
        <button @click="getResult" class="btn-search">Search Result</button>
      </div>
    </div>

    <div v-if="reportCard" class="card report-card">
      <div class="header text-center">
        <h2>ABC School & College</h2>
        <h4>Academic Transcript</h4>
        <p><strong>Exam:</strong> {{ reportCard.exam_name }}</p>
      </div>

      <div class="student-info">
        <p><strong>Name:</strong> {{ reportCard.student_name }}</p>
        <p><strong>Roll No:</strong> {{ reportCard.student_roll }}</p>
      </div>

      <table class="result-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Marks</th>
            <th>Grade</th>
            <th>GPA</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in reportCard.details" :key="index">
            <td>{{ row.subject }}</td>
            <td>{{ row.marks }}</td>
            <td>{{ row.grade }}</td>
            <td>{{ row.gpa }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="summary-row">
            <td colspan="2">
              <strong>Total Marks: {{ reportCard.summary.total_marks }}</strong>
            </td>
            <td>
              <strong>Final Grade: {{ reportCard.summary.final_grade }}</strong>
            </td>
            <td>
              <strong>GPA: {{ reportCard.summary.final_gpa }}</strong>
            </td>
          </tr>
        </tfoot>
      </table>

      <div class="footer text-center mt-4">
        <h3
          :class="{
            'text-pass': reportCard.summary.result_status === 'PASS',
            'text-fail': reportCard.summary.result_status === 'FAIL',
          }"
        >
          RESULT: {{ reportCard.summary.result_status }}
        </h3>
        <button @click="printResult" class="btn-print no-print">🖨️ Print Result</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* সাধারণ স্টাইল - CSS !important দিয়ে ফিক্স করা হয়েছে */
.card {
  background: white !important;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  color: #333 !important; /* টেক্সট কালো */
}
.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 15px;
}
/* ইনপুট এবং সিলেক্ট ফিক্স (সাদা ব্যাকগ্রাউন্ড, কালো লেখা) */
select,
button {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
  background: #fff !important;
  color: #000 !important;
}
.btn-search {
  background: #2563eb !important;
  color: white !important;
  border: none;
}

/* রেজাল্ট টেবিল */
.result-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background: #fff !important;
}
.result-table th,
.result-table td {
  border: 1px solid #000;
  padding: 10px;
  text-align: center;
  color: #000 !important; /* টেবিলের লেখা কালো */
}
.result-table th {
  background: #f0f0f0 !important;
  font-weight: bold;
}
.summary-row {
  background: #eef2ff !important;
  font-weight: bold;
  color: #000 !important;
}

/* রেজাল্ট স্ট্যাটাস */
.text-pass {
  color: green !important;
}
.text-fail {
  color: red !important;
}
.text-center {
  text-align: center;
}

.btn-print {
  background: #333 !important;
  color: white !important;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  margin-top: 10px;
  cursor: pointer;
}

/* প্রিন্ট করার সময় বাটন এবং ফিল্টার লুকানো */
@media print {
  .no-print {
    display: none !important;
  }
  .card {
    box-shadow: none;
    border: none;
  }
  body {
    background: white;
  }
  /* সাধারণ স্টাইল - স্ক্রিনে কেমন দেখাবে */
  .card {
    background: white !important;
    padding: 40px; /* প্রিন্টের জন্য একটু প্যাডিং বাড়ানো হলো */
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    color: #333 !important;
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
    background: #fff !important;
    color: #000 !important;
  }

  .btn-search {
    background: #2563eb !important;
    color: white !important;
    border: none;
  }

  /* টেবিল ডিজাইন */
  .result-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    background: #fff !important;
  }

  .result-table th,
  .result-table td {
    border: 1px solid #000 !important; /* প্রিন্টে বর্ডার স্পষ্ট আসার জন্য */
    padding: 12px;
    text-align: center;
    color: #000 !important;
  }

  .result-table th {
    background: #f0f0f0 !important;
    font-weight: bold;
  }

  .summary-row {
    background: #eef2ff !important;
    font-weight: bold;
    color: #000 !important;
  }

  /* পাস/ফেইল কালার */
  .text-pass {
    color: green !important;
  }
  .text-fail {
    color: red !important;
  }
  .text-center {
    text-align: center;
  }

  .student-info {
    margin-bottom: 20px;
    font-size: 16px;
  }
  .student-info p {
    margin: 5px 0;
  }

  .btn-print {
    background: #333 !important;
    color: white !important;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    margin-top: 20px;
    cursor: pointer;
  }

  /* 🔥🔥 প্রিন্ট ফিক্স (মেইন অংশ) 🔥🔥 */
  @media print {
    /* ১. পেজের সব কিছু লুকিয়ে ফেলা */
    body * {
      visibility: hidden;
    }

    /* ২. লেআউটের ঝামেলা এড়াতে রুট এলিমেন্ট রিসেট */
    #app,
    .layout-container,
    .main-content,
    .page-view {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      height: auto !important;
      overflow: visible !important;
      position: static !important;
    }

    /* ৩. শুধু রিপোর্ট কার্ড এবং তার ভেতরের কন্টেন্ট দৃশ্যমান করা */
    .report-card,
    .report-card * {
      visibility: visible;
    }

    /* ৪. রিপোর্ট কার্ডকে টেনে পেজের একদম টপ-লেফটে বসানো */
    .report-card {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      margin: 0;
      padding: 20px; /* প্রিন্ট পেজে মার্জিন */
      border: none !important;
      box-shadow: none !important;
    }

    /* ৫. বাটন এবং ফিল্টারগুলো নিশ্চিতভাবে লুকানো */
    .no-print,
    .filters,
    .btn-print,
    .sidebar,
    .top-bar {
      display: none !important;
    }
  }
}
</style>
