<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const BASE_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000/api'
    : '/api'
const token = localStorage.getItem('token')
const apiConfig = { headers: { Authorization: `Bearer ${token}` } }

const exams = ref([])
const classes = ref([])
const sections = ref([])
const results = ref([])
const subjectHeaders = ref([])

const filter = ref({ exam_id: '', class_id: '', section_id: '' })
const loading = ref(false)

// ১. ডাটা লোড
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

const handleClassChange = async () => {
  sections.value = []
  if (!filter.value.class_id) return
  const res = await axios.get(
    `${BASE_URL}/academic/classes/${filter.value.class_id}/sections`,
    apiConfig,
  )
  sections.value = res.data.data
}

// ২. ট্যাবুলেশন শিট আনা
const getTabulation = async () => {
  if (!filter.value.exam_id || !filter.value.section_id) {
    return Swal.fire({
      icon: 'warning',
      title: 'Warning',
      text: 'Please select Exam and Section',
      background: '#1e1e2d',
      color: '#fff',
    })
  }

  loading.value = true
  results.value = []
  subjectHeaders.value = []

  try {
    const res = await axios.get(
      `${BASE_URL}/results/tabulation/exam/${filter.value.exam_id}/section/${filter.value.section_id}`,
      apiConfig,
    )

    if (res.data.status) {
      results.value = res.data.data

      if (results.value.length > 0) {
        subjectHeaders.value = results.value[0].subjects.map((s) => s.subject)
      }

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Tabulation Sheet Generated!',
        background: '#1e1e2d',
        color: '#fff',
        confirmButtonColor: '#3b82f6',
        timer: 1500,
      })
    } else {
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
      text: 'Failed to load results',
      background: '#1e1e2d',
      color: '#fff',
    })
  } finally {
    loading.value = false
  }
}

const printSheet = () => {
  window.print()
}

onMounted(loadInitialData)
</script>

<template>
  <div class="page-container">
    <div class="header-action no-print">
      <div>
        <h2 class="page-title">📋 Tabulation Sheet</h2>
        <p class="page-subtitle">View class-wise result summary</p>
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
            <select v-model="filter.section_id">
              <option value="">Select Section</option>
              <option v-for="s in sections" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
        </div>

        <div class="form-group btn-wrapper">
          <button @click="getTabulation" class="btn search-btn" :disabled="loading">
            {{ loading ? 'Generating...' : '📊 View Sheet' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="results.length > 0" class="glass-card sheet-card mt-4" id="print-area">
      <div class="sheet-header text-center">
        <h2>ABC School & College</h2>
        <h4>Tabulation Sheet</h4>
      </div>

      <div class="table-responsive">
        <table class="tab-table">
          <thead>
            <tr>
              <th>Roll</th>
              <th>Name</th>
              <th v-for="(sub, i) in subjectHeaders" :key="i">{{ sub }}</th>
              <th>Total</th>
              <th>GPA</th>
              <th>Grade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in results" :key="student.student_id">
              <td class="roll-col">{{ student.roll }}</td>
              <td class="name-col text-left">{{ student.name }}</td>

              <td v-for="(sub, i) in student.subjects" :key="i" class="mark-cell">
                <span class="mark-val">{{ sub.marks }}</span>
                <small class="grade-val">({{ sub.grade }})</small>
              </td>

              <td
                v-if="student.subjects.length < subjectHeaders.length"
                :colspan="subjectHeaders.length - student.subjects.length"
                class="absent-col"
              >
                Abs
              </td>

              <td>
                <strong>{{ student.total_marks }}</strong>
              </td>
              <td>
                <strong>{{ student.gpa }}</strong>
              </td>
              <td>
                <span class="badge" :class="student.status === 'PASS' ? 'bg-green' : 'bg-red'">
                  {{ student.grade }}
                </span>
              </td>
              <td :class="student.status === 'PASS' ? 'text-pass' : 'text-fail'">
                {{ student.status }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="sheet-footer text-center">
        <button @click="printSheet" class="btn print-btn no-print">🖨️ Print Sheet</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Page Layout */
.page-container {
  padding: 25px;
  color: #fff;
  max-width: 1200px;
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

/* Sheet Header (Screen) */
.sheet-header h2 {
  color: #fff;
  margin: 0;
  font-size: 24px;
  text-transform: uppercase;
}
.sheet-header h4 {
  color: #a1a5b7;
  margin: 5px 0;
  font-weight: 400;
}

/* Table */
.table-responsive {
  overflow-x: auto;
  margin-top: 20px;
}
.tab-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}
.tab-table th {
  background: #151521;
  padding: 12px;
  color: #a1a5b7;
  font-weight: 600;
  border: 1px solid #2b2b40;
  white-space: nowrap;
}
.tab-table td {
  padding: 10px;
  border: 1px solid #2b2b40;
  color: #e2e8f0;
  font-size: 13px;
}
.roll-col {
  font-weight: bold;
  color: #a1a5b7;
}
.name-col {
  text-align: left;
  padding-left: 10px;
  font-weight: 600;
  white-space: nowrap;
}
.mark-cell {
  line-height: 1.2;
}
.grade-val {
  font-size: 11px;
  color: #a1a5b7;
  display: block;
}
.absent-col {
  color: #ef4444;
  font-weight: bold;
  background: rgba(239, 68, 68, 0.1);
}

/* Status Badges */
.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}
.bg-green {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}
.bg-red {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}
.text-pass {
  color: #10b981;
  font-weight: bold;
}
.text-fail {
  color: #ef4444;
  font-weight: bold;
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

  /* Show only Sheet Card */
  .sheet-card,
  .sheet-card * {
    visibility: visible;
  }

  .sheet-card {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 20px;
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
  .sheet-header h2 {
    color: black !important;
    font-size: 24px;
  }
  .sheet-header h4 {
    color: #555 !important;
  }

  /* Table for Print */
  .tab-table th,
  .tab-table td {
    border: 1px solid #000 !important;
    color: black !important;
    padding: 6px;
    font-size: 12px;
  }
  .tab-table th {
    background: #f0f0f0 !important;
  }

  /* Status Colors for Print */
  .bg-green {
    background: none !important;
    border: 1px solid green;
    color: green !important;
  }
  .bg-red {
    background: none !important;
    border: 1px solid red;
    color: red !important;
  }
  .text-pass {
    color: green !important;
  }
  .text-fail {
    color: red !important;
  }
  .grade-val {
    color: #555 !important;
  }
}
</style>
