<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

// ১. ভেরিয়েবল এবং স্টেট
const classes = ref([])
const sections = ref([])
const reportData = ref([])
const isLoading = ref(false)
const showModal = ref(false)
const selectedStudentCard = ref(null)

// স্কুলের তথ্য
const schoolInfo = ref({
  name: 'Loading School Name...',
  address: '',
  logo: '',
})

const filter = ref({
  class_id: '',
  section_id: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
})

// ২. সেটিংস ডাটা ফেচ করা
const fetchSettings = async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get('http://127.0.0.1:8000/api/general-settings', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.data.data) {
      schoolInfo.value = {
        name: res.data.data.school_name,
        address: res.data.data.school_address,
        logo: res.data.data.logo_url,
      }
    }
  } catch (error) {
    console.error('Settings load error:', error)
  }
}

// ৩. অন্যান্য ডাটা ফেচিং
const fetchClasses = async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get('http://127.0.0.1:8000/api/academic/classes', {
      headers: { Authorization: `Bearer ${token}` },
    })
    classes.value = res.data.data
  } catch (error) {
    console.error(error)
  }
}

const handleClassChange = async () => {
  if (!filter.value.class_id) {
    sections.value = []
    return
  }
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get(
      `http://127.0.0.1:8000/api/academic/classes/${filter.value.class_id}/sections`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    sections.value = res.data.data
  } catch (error) {
    console.error(error)
  }
}

const fetchReport = async () => {
  if (!filter.value.class_id || !filter.value.section_id) {
    return Swal.fire({
      icon: 'warning',
      title: 'Warning',
      text: 'Please select class and section.',
      background: '#1e1e2d',
      color: '#fff',
    })
  }
  isLoading.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get('http://127.0.0.1:8000/api/attendance/report', {
      headers: { Authorization: `Bearer ${token}` },
      params: filter.value,
    })
    reportData.value = res.data.data
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to fetch report.',
      background: '#1e1e2d',
      color: '#fff',
    })
  } finally {
    isLoading.value = false
  }
}

const viewStudentCard = async (studentId) => {
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get(
      `http://127.0.0.1:8000/api/attendance/student/${studentId}/report-card`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { month: filter.value.month, year: filter.value.year },
      },
    )
    selectedStudentCard.value = res.data.data
    showModal.value = true
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to load card.',
      background: '#1e1e2d',
      color: '#fff',
    })
  }
}

const getMonthName = (m) => {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  return months[m - 1]
}

const calculatePercent = (item) => {
  const total = item.present_count + item.absent_count + item.late_count
  return total === 0 ? 0 : ((item.present_count / total) * 100).toFixed(1)
}

const printReport = () => {
  window.print()
}

onMounted(() => {
  fetchClasses()
  fetchSettings()
})
</script>

<template>
  <div class="page-container">
    <div class="screen-view no-print">
      <div class="header-action">
        <div>
          <h2 class="page-title">📊 Attendance Report</h2>
          <p class="page-subtitle">View monthly attendance summary</p>
        </div>
      </div>

      <div class="filter-card">
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
          <label>Month</label>
          <select v-model="filter.month">
            <option v-for="m in 12" :key="m" :value="m">{{ getMonthName(m) }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Year</label>
          <select v-model="filter.year">
            <option v-for="y in [2024, 2025, 2026]" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>

        <div class="button-group">
          <button @click="fetchReport" class="btn search-btn" :disabled="isLoading">
            {{ isLoading ? 'Loading...' : '🔍 Search' }}
          </button>
          <button v-if="reportData.length > 0" @click="printReport" class="btn print-btn">
            🖨️ Print
          </button>
        </div>
      </div>

      <div v-if="reportData.length > 0" class="table-card">
        <div class="table-header">
          <h4>Results: {{ getMonthName(filter.month) }}, {{ filter.year }}</h4>
        </div>
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Late</th>
                <th>Percentage</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in reportData" :key="item.id">
                <td class="roll-col">{{ item.roll_no }}</td>
                <td class="name-col">{{ item.name }}</td>
                <td class="text-success">{{ item.present_count }}</td>
                <td class="text-danger">{{ item.absent_count }}</td>
                <td class="text-warning">{{ item.late_count }}</td>
                <td class="percent-col">{{ calculatePercent(item) }}%</td>
                <td>
                  <button @click="viewStudentCard(item.id)" class="btn-icon view" title="View Card">
                    👁️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Student Card Preview</h3>
            <button @click="showModal = false" class="close-btn">×</button>
          </div>
          <div class="modal-body" v-if="selectedStudentCard">
            <div class="student-info">
              <img
                v-if="selectedStudentCard.student_info.image"
                :src="selectedStudentCard.student_info.image"
                class="student-img"
              />
              <div v-else class="avatar-placeholder">
                {{ selectedStudentCard.student_info.name.charAt(0) }}
              </div>
              <div>
                <h4>{{ selectedStudentCard.student_info.name }}</h4>
                <p>Roll: {{ selectedStudentCard.student_info.roll_no }}</p>
              </div>
            </div>
            <div class="stats-grid">
              <div class="stat-box present">
                <span>Present</span>
                <strong>{{ selectedStudentCard.summary.present }}</strong>
              </div>
              <div class="stat-box absent">
                <span>Absent</span>
                <strong>{{ selectedStudentCard.summary.absent }}</strong>
              </div>
              <div class="stat-box late">
                <span>Late</span>
                <strong>{{ selectedStudentCard.summary.late }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="print-view-container" id="printableArea">
      <div class="print-header">
        <img v-if="schoolInfo.logo" :src="schoolInfo.logo" alt="Logo" class="print-logo" />
        <div class="print-school-info">
          <h1>{{ schoolInfo.name }}</h1>
          <p>{{ schoolInfo.address }}</p>
          <h3>Monthly Attendance Report - {{ getMonthName(filter.month) }}, {{ filter.year }}</h3>
        </div>
      </div>

      <table class="print-table">
        <thead>
          <tr>
            <th>Roll No</th>
            <th class="text-left">Student Name</th>
            <th>Total Classes</th>
            <th>Present</th>
            <th>Absent</th>
            <th>Late</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in reportData" :key="item.id">
            <td>{{ item.roll_no }}</td>
            <td class="text-left">{{ item.name }}</td>
            <td>{{ item.present_count + item.absent_count + item.late_count }}</td>
            <td>{{ item.present_count }}</td>
            <td>{{ item.absent_count }}</td>
            <td>{{ item.late_count }}</td>
            <td>{{ calculatePercent(item) }}%</td>
          </tr>
        </tbody>
      </table>

      <div class="print-footer">
        <div class="signature">___________________<br />Class Teacher</div>
        <div class="signature">___________________<br />Principal</div>
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
  margin-bottom: 25px;
  display: flex;
  gap: 15px;
  align-items: flex-end;
  flex-wrap: wrap;
  border: 1px solid #2b2b40;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
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
.button-group {
  display: flex;
  gap: 10px;
}
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
}
.search-btn:hover {
  background: #2563eb;
}
.print-btn {
  background: #10b981;
  color: white;
}
.print-btn:hover {
  background: #059669;
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
}
.table-header h4 {
  margin: 0;
  color: #3b82f6;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
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
}
.name-col {
  text-align: left;
  font-weight: 600;
  color: white;
}
.text-success {
  color: #10b981;
  font-weight: bold;
}
.text-danger {
  color: #ef4444;
  font-weight: bold;
}
.text-warning {
  color: #f59e0b;
  font-weight: bold;
}
.percent-col {
  font-family: 'Courier New', monospace;
  font-weight: bold;
}

/* Action Button */
.btn-icon {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.3s;
}
.view {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}
.view:hover {
  background: #f59e0b;
  color: white;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}
.modal-content {
  background: #1e1e2d;
  padding: 25px;
  width: 350px;
  border-radius: 12px;
  border: 1px solid #2b2b40;
  color: white;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  border-bottom: 1px solid #2b2b40;
  padding-bottom: 10px;
}
.close-btn {
  background: none;
  border: none;
  color: #a1a5b7;
  font-size: 20px;
  cursor: pointer;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}
.student-img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}
.avatar-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  text-align: center;
}
.stat-box {
  padding: 10px;
  border-radius: 8px;
  background: #151521;
  border: 1px solid #2b2b40;
}
.stat-box span {
  display: block;
  font-size: 11px;
  color: #a1a5b7;
}
.stat-box strong {
  font-size: 16px;
  display: block;
  margin-top: 5px;
}
.stat-box.present strong {
  color: #10b981;
}
.stat-box.absent strong {
  color: #ef4444;
}
.stat-box.late strong {
  color: #f59e0b;
}

/* Print Styles */
.print-view-container {
  display: none;
}

@media print {
  body * {
    visibility: hidden;
  }
  .no-print {
    display: none !important;
  }

  .print-view-container,
  .print-view-container * {
    visibility: visible;
  }
  .print-view-container {
    display: block !important;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 20px;
    background: white;
    color: black;
    z-index: 99999;
  }

  .print-header {
    text-align: center;
    border-bottom: 2px solid black;
    padding-bottom: 15px;
    margin-bottom: 20px;
  }
  .print-logo {
    height: 60px;
    margin-bottom: 10px;
  }
  .print-school-info h1 {
    margin: 0;
    font-size: 24px;
    color: black;
  }
  .print-school-info p {
    margin: 5px 0;
    color: #333;
  }
  .print-school-info h3 {
    margin-top: 10px;
    color: black;
  }

  .print-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  .print-table th,
  .print-table td {
    border: 1px solid black !important;
    padding: 8px;
    text-align: center;
    color: black;
  }
  .text-left {
    text-align: left !important;
    padding-left: 10px !important;
  }

  .print-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 50px;
    padding: 0 50px;
  }
  .signature {
    text-align: center;
    color: black;
  }
}
</style>
