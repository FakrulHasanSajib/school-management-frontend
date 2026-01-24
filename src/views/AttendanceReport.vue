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

// ✅ পরিবর্তন ১: স্কুল ইনফো এখন রিয়েক্টিভ (ডাটাবেস থেকে আসবে)
const schoolInfo = ref({
  name: 'স্কুলের নাম লোড হচ্ছে...',
  address: '',
  logo: '',
})

const token = localStorage.getItem('token')

const filter = ref({
  class_id: '',
  section_id: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
})

const apiConfig = {
  headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
}

// ✅ পরিবর্তন ২: সেটিংস ডাটা ফেচ করা (নাম ও লোগো)
const fetchSettings = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/general-settings', apiConfig)
    if (res.data.data) {
      schoolInfo.value = {
        name: res.data.data.school_name,
        address: res.data.data.school_address,
        logo: res.data.data.logo_url, // ব্যাকএন্ডের Accessor
      }
    }
  } catch (error) {
    console.error('Settings load error:', error)
  }
}

// ৩. অন্যান্য ডাটা ফেচিং
const fetchClasses = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/academic/classes', apiConfig)
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
  const res = await axios.get(
    `http://127.0.0.1:8000/api/academic/classes/${filter.value.class_id}/sections`,
    apiConfig,
  )
  sections.value = res.data.data
}

const fetchReport = async () => {
  if (!filter.value.class_id || !filter.value.section_id) {
    return Swal.fire('সতর্কতা', 'ক্লাস এবং সেকশন সিলেক্ট করুন', 'warning')
  }
  isLoading.value = true
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/attendance/report', {
      ...apiConfig,
      params: filter.value,
    })
    reportData.value = res.data.data
  } catch (error) {
    Swal.fire('ভুল হয়েছে', 'সার্ভার থেকে রিপোর্ট পাওয়া যায়নি।', 'error')
  } finally {
    isLoading.value = false
  }
}

const viewStudentCard = async (studentId) => {
  try {
    const res = await axios.get(
      `http://127.0.0.1:8000/api/attendance/student/${studentId}/report-card`,
      {
        ...apiConfig,
        params: { month: filter.value.month, year: filter.value.year },
      },
    )
    selectedStudentCard.value = res.data.data
    showModal.value = true
  } catch (error) {
    Swal.fire('এরর', 'কার্ড লোড করা যায়নি', 'error')
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

// প্রিন্ট ফাংশন
const printReport = () => {
  window.print()
}

// ✅ পরিবর্তন ৩: মাউন্ট হওয়ার সাথে সাথে সেটিংস কল করা
onMounted(() => {
  fetchClasses()
  fetchSettings()
})
</script>

<template>
  <div class="page-wrapper">
    <div class="screen-view">
      <div class="filter-card">
        <h3>📊 হাজিরা রিপোর্ট ফিল্টার</h3>
        <div class="filters">
          <select v-model="filter.class_id" @change="handleClassChange">
            <option value="">ক্লাস সিলেক্ট করুন</option>
            <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
          <select v-model="filter.section_id">
            <option value="">সেকশন সিলেক্ট করুন</option>
            <option v-for="s in sections" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
          <select v-model="filter.month">
            <option v-for="m in 12" :key="m" :value="m">{{ getMonthName(m) }}</option>
          </select>
          <select v-model="filter.year">
            <option v-for="y in [2024, 2025, 2026]" :key="y" :value="y">{{ y }}</option>
          </select>
          <button @click="fetchReport" class="btn-search" :disabled="isLoading">
            🔍 রিপোর্ট দেখুন
          </button>

          <button v-if="reportData.length > 0" @click="printReport" class="btn-print">
            🖨️ প্রিন্ট করুন
          </button>
        </div>
      </div>

      <div v-if="reportData.length > 0" class="report-table-card">
        <h4 class="text-dark">ফলাফল: {{ getMonthName(filter.month) }}, {{ filter.year }}</h4>
        <table class="dashboard-table">
          <thead>
            <tr>
              <th>রোল</th>
              <th>নাম</th>
              <th>P</th>
              <th>A</th>
              <th>%</th>
              <th>অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in reportData" :key="item.id">
              <td>{{ item.roll_no }}</td>
              <td class="font-bold">{{ item.name }}</td>
              <td class="text-success">{{ item.present_count }}</td>
              <td class="text-danger">{{ item.absent_count }}</td>
              <td>{{ calculatePercent(item) }}%</td>
              <td><button @click="viewStudentCard(item.id)" class="btn-view">👁️ কার্ড</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>কার্ড প্রিভিউ</h3>
            <button @click="showModal = false">×</button>
          </div>
          <div class="card-body" v-if="selectedStudentCard">
            <p>নাম: {{ selectedStudentCard.student_info.name }}</p>
            <p>
              উপস্থিত: {{ selectedStudentCard.summary.present }} | অনুপস্থিত:
              {{ selectedStudentCard.summary.absent }}
            </p>
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
          <h3>মাসিক হাজিরা রিপোর্ট - {{ getMonthName(filter.month) }}, {{ filter.year }}</h3>
        </div>
      </div>

      <table class="print-table">
        <thead>
          <tr>
            <th>রোল</th>
            <th class="text-left">নাম</th>
            <th>মোট ক্লাস</th>
            <th>উপস্থিত</th>
            <th>অনুপস্থিত</th>
            <th>শতকরা</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in reportData" :key="item.id">
            <td>{{ item.roll_no }}</td>
            <td class="text-left">{{ item.name }}</td>
            <td>{{ item.present_count + item.absent_count + item.late_count }}</td>
            <td>{{ item.present_count }}</td>
            <td>{{ item.absent_count }}</td>
            <td>{{ calculatePercent(item) }}%</td>
          </tr>
        </tbody>
      </table>

      <div class="print-footer">
        <div class="signature">___________________<br />শ্রেণি শিক্ষক</div>
        <div class="signature">___________________<br />অধ্যক্ষ</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ড্যাশবোর্ড স্টাইল */
.page-wrapper {
  padding: 20px;
}
.filter-card {
  background: #1e293b;
  color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}
.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
select,
button {
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
}
.btn-search {
  background: #2563eb;
  color: white;
  border: none;
}
.btn-print {
  background: #10b981;
  color: white;
  border: none;
}
.btn-view {
  background: #f59e0b;
  color: white;
  border: none;
  padding: 5px 10px;
}
.report-table-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
}
.text-dark {
  color: #333;
}
.dashboard-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
.dashboard-table th,
.dashboard-table td {
  border: 1px solid #ddd;
  padding: 10px;
  color: #333;
}
.text-success {
  color: green;
  font-weight: bold;
}
.text-danger {
  color: red;
  font-weight: bold;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background: white;
  padding: 20px;
  width: 300px;
  border-radius: 8px;
  color: black;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

/* প্রিন্ট ভিউ শুরুতে হাইড থাকবে */
.print-view-container {
  display: none;
}

/* =========================================
   🔥 প্রিন্ট ফিক্স (Blank Page Solution)
   ========================================= */
@media print {
  /* ১. বডির সবকিছু অদৃশ্য করে দাও */
  body * {
    visibility: hidden;
  }

  /* ২. শুধুমাত্র প্রিন্ট কন্টেইনার এবং তার ভেতরের সবকিছু দৃশ্যমান করো */
  .print-view-container,
  .print-view-container * {
    visibility: visible;
  }

  /* ৩. প্রিন্ট কন্টেইনারকে পজিশন করে একদম সামনে নিয়ে আসো */
  .print-view-container {
    display: block !important;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 20px;
    background: white;
    z-index: 99999;
  }

  /* ৪. প্রিন্ট টেবিল ডিজাইন */
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
    color: black !important;
    font-size: 14px;
  }
  .print-header {
    text-align: center;
    margin-bottom: 20px;
    border-bottom: 2px solid black;
    padding-bottom: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
  }
  .print-logo {
    height: 60px;
    object-fit: contain;
  }
  .print-school-info h1 {
    margin: 0;
    color: black !important;
    font-size: 24px;
  }
  .print-school-info p,
  h3 {
    color: black !important;
    margin: 5px 0;
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
    color: black !important;
    text-align: center;
  }

  /* পেজ মার্জিন সেটআপ */
  @page {
    size: A4;
    margin: 10mm;
  }
}
</style>
