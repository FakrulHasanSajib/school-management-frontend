<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

// অটো বেস URL
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
const reportCard = ref(null)
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

// ৩. সেকশন পাল্টালে স্টুডেন্ট লোড
const handleSectionChange = async () => {
  students.value = []
  if (!filter.value.section_id) return
  const res = await axios.get(`${BASE_URL}/students/section/${filter.value.section_id}`, apiConfig)
  students.value = res.data.data
}

// ৪. রেজাল্ট বের করা
const getResult = async () => {
  if (!filter.value.exam_id || !filter.value.student_id) {
    return Swal.fire({
      icon: 'warning',
      title: 'Warning',
      text: 'Please select Exam and Student',
      background: '#1e1e2d',
      color: '#fff',
    })
  }

  loading.value = true
  reportCard.value = null

  try {
    const res = await axios.get(
      `${BASE_URL}/results/exam/${filter.value.exam_id}/student/${filter.value.student_id}`,
      apiConfig,
    )

    if (res.data.status === true) {
      reportCard.value = res.data.data
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Result Generated!',
        background: '#1e1e2d',
        color: '#fff',
        confirmButtonColor: '#3b82f6',
        timer: 1500,
      })
    } else {
      reportCard.value = null
      Swal.fire({
        icon: 'info',
        title: 'Info',
        text: res.data.message,
        background: '#1e1e2d',
        color: '#fff',
      })
    }
  } catch (error) {
    console.error(error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Server Error',
      background: '#1e1e2d',
      color: '#fff',
    })
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
  <div class="page-container">
    <div class="header-action no-print">
      <div>
        <h2 class="page-title">📊 Result Management</h2>
        <p class="page-subtitle">View and print student result cards</p>
      </div>
    </div>

    <div class="glass-card filter-card no-print">
      <div class="form-grid">
        <div class="form-group">
          <label>Exam</label>
          <div class="input-wrapper">
            <span class="icon">📝</span>
            <select v-model="filter.exam_id">
              <option value="">Select Exam</option>
              <option v-for="e in exams" :key="e.id" :value="e.id">{{ e.name }}</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Class</label>
          <div class="input-wrapper">
            <span class="icon">🏫</span>
            <select v-model="filter.class_id" @change="handleClassChange">
              <option value="">Select Class</option>
              <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Section</label>
          <div class="input-wrapper">
            <span class="icon">🔖</span>
            <select v-model="filter.section_id" @change="handleSectionChange">
              <option value="">Select Section</option>
              <option v-for="s in sections" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Student</label>
          <div class="input-wrapper">
            <span class="icon">👨‍🎓</span>
            <select v-model="filter.student_id">
              <option value="">Select Student</option>
              <option v-for="st in students" :key="st.id" :value="st.id">
                {{ st.name }} (Roll: {{ st.roll_no }})
              </option>
            </select>
          </div>
        </div>

        <div class="form-group btn-wrapper">
          <button @click="getResult" class="btn search-btn" :disabled="loading">
            {{ loading ? 'Searching...' : '🔍 Get Result' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="reportCard" class="glass-card report-card mt-4" id="print-area">
      <div class="report-header text-center">
        <h2>Software IT School & College</h2>
        <h4>Academic Transcript</h4>
        <p class="exam-name">{{ reportCard.exam_name }}</p>
      </div>

      <div class="student-info-box">
        <div class="info-row">
          <span
            >Name: <strong>{{ reportCard.student_name }}</strong></span
          >
          <span
            >Roll No: <strong>{{ reportCard.student_roll }}</strong></span
          >
        </div>
      </div>

      <div class="table-responsive">
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
              <td class="subject-col">{{ row.subject }}</td>
              <td>{{ row.marks }}</td>
              <td :class="{ 'grade-f': row.grade === 'F' }">{{ row.grade }}</td>
              <td>{{ row.gpa }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="summary-row">
              <td colspan="2" class="text-right">
                Total Marks: {{ reportCard.summary.total_marks }}
              </td>
              <td>Grade: {{ reportCard.summary.final_grade }}</td>
              <td>GPA: {{ reportCard.summary.final_gpa }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="report-footer text-center">
        <div class="result-status">
          <span class="label">FINAL RESULT:</span>
          <span
            class="status-badge"
            :class="{
              'status-pass': reportCard.summary.result_status === 'PASS',
              'status-fail': reportCard.summary.result_status === 'FAIL',
            }"
          >
            {{ reportCard.summary.result_status }}
          </span>
        </div>

        <button @click="printResult" class="btn print-btn no-print">🖨️ Print Result Card</button>
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

/* Glass Card */
.glass-card {
  background: #1e1e2d;
  border-radius: 12px;
  padding: 25px;
  border: 1px solid #2b2b40;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}
.mt-4 {
  margin-top: 30px;
}

/* Filter Grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  align-items: end;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
label {
  font-size: 13px;
  font-weight: 600;
  color: #a1a5b7;
}

/* Inputs */
.input-wrapper {
  position: relative;
}
.icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  margin-top: 1px;
}
select {
  width: 100%;
  background: #151521;
  border: 1px solid #2b2b40;
  padding: 12px 12px 12px 40px;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  outline: none;
  transition: 0.3s;
}
select:focus {
  border-color: #3b82f6;
}

/* Buttons */
.btn-wrapper {
  justify-content: flex-end;
}
.btn {
  padding: 12px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
  width: 100%;
}
.search-btn {
  background: #3b82f6;
  color: white;
}
.search-btn:hover {
  background: #2563eb;
  transform: translateY(-2px);
}
.print-btn {
  background: #10b981;
  color: white;
  margin-top: 20px;
  width: auto;
  padding: 10px 30px;
}
.print-btn:hover {
  background: #059669;
}

/* Report Card Design (Screen) */
.report-header h2 {
  color: #fff;
  margin: 0;
  font-size: 24px;
  text-transform: uppercase;
}
.report-header h4 {
  color: #a1a5b7;
  margin: 5px 0;
  font-weight: 400;
}
.exam-name {
  color: #3b82f6;
  font-weight: bold;
  margin-top: 5px;
  font-size: 16px;
}

.student-info-box {
  background: #151521;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #2b2b40;
  margin: 20px 0;
}
.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 15px;
  color: #e2e8f0;
}
.info-row strong {
  color: #fff;
}

/* Table */
.table-responsive {
  overflow-x: auto;
}
.result-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}
.result-table th {
  background: #151521;
  padding: 12px;
  color: #a1a5b7;
  font-weight: 600;
  border: 1px solid #2b2b40;
}
.result-table td {
  padding: 12px;
  border: 1px solid #2b2b40;
  color: #e2e8f0;
}
.subject-col {
  text-align: left;
  padding-left: 20px;
}
.grade-f {
  color: #ef4444;
  font-weight: bold;
}

.summary-row td {
  background: #151521;
  font-weight: bold;
  color: #fff;
}
.text-right {
  text-align: right;
  padding-right: 20px;
}

/* Result Status */
.result-status {
  margin-top: 20px;
  font-size: 18px;
}
.result-status .label {
  color: #a1a5b7;
  margin-right: 10px;
}
.status-badge {
  padding: 5px 15px;
  border-radius: 6px;
  font-weight: 800;
}
.status-pass {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}
.status-fail {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}
.text-center {
  text-align: center;
}

/* Print Styles */
@media print {
  /* Hide everything else */
  body * {
    visibility: hidden;
  }

  /* Reset container */
  .page-container {
    width: 100%;
    margin: 0;
    padding: 0;
    background: white;
    position: absolute;
    left: 0;
    top: 0;
  }

  /* Show only Report Card */
  .report-card,
  .report-card * {
    visibility: visible;
  }

  .report-card {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 40px;
    background: white !important;
    color: black !important;
    border: none !important;
    box-shadow: none !important;
  }

  /* Hide buttons */
  .no-print {
    display: none !important;
  }

  /* Print specific styling */
  .report-header h2 {
    color: black !important;
    font-size: 28px;
  }
  .report-header h4 {
    color: #555 !important;
  }
  .exam-name {
    color: black !important;
    text-decoration: underline;
  }

  .student-info-box {
    background: white !important;
    border: 1px solid #000 !important;
    color: black !important;
  }
  .info-row {
    color: black !important;
  }
  .info-row strong {
    color: black !important;
  }

  /* Table for Print */
  .result-table th,
  .result-table td {
    border: 1px solid #000 !important;
    color: black !important;
  }
  .result-table th {
    background: #f0f0f0 !important;
  }
  .summary-row td {
    background: #f0f0f0 !important;
    color: black !important;
  }

  /* Status Colors for Print */
  .status-pass {
    color: green !important;
    background: none !important;
    border: 1px solid green;
  }
  .status-fail {
    color: red !important;
    background: none !important;
    border: 1px solid red;
  }
}
</style>
