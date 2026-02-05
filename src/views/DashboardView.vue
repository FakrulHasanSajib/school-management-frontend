<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Doughnut } from 'vue-chartjs'

// Chart.js রেজিস্টার করা
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
)

const BASE_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000/api'
    : '/api'
const token = localStorage.getItem('token')
const apiConfig = { headers: { Authorization: `Bearer ${token}` } }

// States
const stats = ref({
  total_students: 0,
  total_teachers: 0,
  total_income: 0,
  total_expense: 0, // ✅ নতুন: খরচ
  net_balance: 0, // ✅ নতুন: ব্যালেন্স
  todays_present: 0,
})
const recentPayments = ref([])
const loading = ref(true)
const chartsLoaded = ref(false)

// Chart Data (Reactive)
const incomeChartData = ref(null)
const attendanceChartData = ref(null)

// Options (Legend টপে দেওয়া হয়েছে যাতে ইনকাম/খরচ বোঝা যায়)
const incomeChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
  },
}
const attendanceChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
}

// Data Load
const loadDashboardData = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/dashboard/stats`, apiConfig)
    if (res.data.status) {
      // ১. কার্ড আপডেট
      stats.value = res.data.data.stats

      // ২. রিসেন্ট পেমেন্ট আপডেট
      recentPayments.value = res.data.data.recent_payments

      // ৩. ইনকাম vs এক্সপেন্স চার্ট আপডেট (Dynamic)
      incomeChartData.value = {
        labels: res.data.data.chart_data.months,
        datasets: [
          {
            label: 'Income',
            backgroundColor: '#3b82f6', // নীল
            data: res.data.data.chart_data.income,
            borderRadius: 4,
          },
          {
            label: 'Expense',
            backgroundColor: '#ef4444', // লাল
            data: res.data.data.chart_data.expense, // ✅ ব্যাকএন্ড থেকে আসা খরচের ডাটা
            borderRadius: 4,
          },
        ],
      }

      // ৪. এটেন্ডেন্স চার্ট আপডেট (Dynamic)
      attendanceChartData.value = {
        labels: ['Present', 'Absent', 'Late'],
        datasets: [
          {
            backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
            data: res.data.data.chart_data.attendance,
          },
        ],
      }

      chartsLoaded.value = true // চার্ট ডাটা রেডি
    }
  } catch (error) {
    console.error('Dashboard failed:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<template>
  <div class="dashboard-container">
    <div class="header mb-4">
      <h2 class="text-white">Admin Dashboard</h2>
      <p class="text-gray">Overview of school finances and attendance.</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card gradient-1">
        <div class="icon-box">👨‍🎓</div>
        <div>
          <p class="stat-label">Students</p>
          <h3 class="stat-value">{{ loading ? '...' : stats.total_students }}</h3>
        </div>
      </div>

      <div class="stat-card gradient-2">
        <div class="icon-box">💰</div>
        <div>
          <p class="stat-label">Total Income</p>
          <h3 class="stat-value">৳ {{ loading ? '...' : stats.total_income }}</h3>
        </div>
      </div>

      <div class="stat-card gradient-red">
        <div class="icon-box">💸</div>
        <div>
          <p class="stat-label">Total Expense</p>
          <h3 class="stat-value">৳ {{ loading ? '...' : stats.total_expense }}</h3>
        </div>
      </div>

      <div class="stat-card gradient-green">
        <div class="icon-box">🏦</div>
        <div>
          <p class="stat-label">Net Balance</p>
          <h3 class="stat-value">৳ {{ loading ? '...' : stats.net_balance }}</h3>
        </div>
      </div>
    </div>

    <div class="charts-grid mt-section">
      <div class="chart-card">
        <h4>Cash Flow (Income vs Expense)</h4>
        <div class="chart-container">
          <Bar v-if="chartsLoaded" :data="incomeChartData" :options="incomeChartOptions" />
          <p v-else class="loading-text">Loading Chart...</p>
        </div>
      </div>
      <div class="chart-card">
        <h4>Today's Attendance Ratio</h4>
        <div class="chart-container">
          <Doughnut
            v-if="chartsLoaded"
            :data="attendanceChartData"
            :options="attendanceChartOptions"
          />
          <p v-else class="loading-text">Loading Chart...</p>
        </div>
      </div>
    </div>

    <div class="recent-section mt-section">
      <div class="section-header">
        <h3>Recent Fee Collections</h3>
        <router-link to="/fees" class="btn-sm">View All</router-link>
      </div>

      <div class="table-responsive">
        <table class="styled-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Fee Type</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="text-center">Loading...</td>
            </tr>
            <tr v-for="pay in recentPayments" :key="pay.id">
              <td>
                <div class="user-info">
                  <div class="avatar">{{ pay.student_name.charAt(0) }}</div>
                  <span>{{ pay.student_name }}</span>
                </div>
              </td>
              <td>{{ pay.fee_type }}</td>
              <td class="font-bold">৳ {{ pay.amount }}</td>
              <td>{{ pay.date }}</td>
              <td><span class="badge success">Paid</span></td>
            </tr>
            <tr v-if="!loading && recentPayments.length === 0">
              <td colspan="5" class="text-center py-4">No recent payments found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Dashboard Container */
.dashboard-container {
  padding-bottom: 50px;
}
.text-gray {
  color: #a1a5b7;
  font-size: 14px;
}
.mt-section {
  margin-top: 30px;
}

/* 1. Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 25px;
}

.stat-card {
  padding: 25px;
  border-radius: 15px;
  color: white;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
}
.stat-card:hover {
  transform: translateY(-5px);
}

/* Gradient Backgrounds */
.gradient-1 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.gradient-2 {
  background: linear-gradient(135deg, #2af598 0%, #009efd 100%);
}

/* ✅ নতুন কার্ডের স্টাইল */
.gradient-red {
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
} /* Expense */
.gradient-green {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
} /* Net Balance */

.icon-box {
  background: rgba(255, 255, 255, 0.25);
  width: 55px;
  height: 55px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
}
.stat-label {
  margin: 0;
  font-size: 14px;
  opacity: 0.95;
  font-weight: 500;
}
.stat-value {
  margin: 5px 0 0;
  font-size: 26px;
  font-weight: 800;
}

/* 2. Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 25px;
}
@media (max-width: 900px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

.chart-card {
  background: #1e1e2d;
  padding: 25px;
  border-radius: 15px;
  border: 1px solid #2b2b40;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
.chart-card h4 {
  color: #fff;
  margin-bottom: 20px;
  font-size: 16px;
  border-bottom: 1px solid #2b2b40;
  padding-bottom: 10px;
}
.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}
.loading-text {
  color: #888;
  text-align: center;
  margin-top: 50px;
}

/* 3. Recent Table */
.recent-section {
  background: #1e1e2d;
  padding: 25px;
  border-radius: 15px;
  border: 1px solid #2b2b40;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.section-header h3 {
  color: white;
  margin: 0;
  font-size: 18px;
}
.btn-sm {
  background: #3699ff;
  color: white;
  text-decoration: none;
  padding: 6px 15px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  transition: 0.2s;
}
.btn-sm:hover {
  background: #2b7ce0;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
}
.styled-table th {
  text-align: left;
  padding: 15px;
  color: #565674;
  font-size: 13px;
  border-bottom: 1px solid #2b2b40;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.styled-table td {
  padding: 15px;
  color: #b5b5c3;
  font-size: 14px;
  border-bottom: 1px solid #2b2b40;
}
.styled-table tr:last-child td {
  border-bottom: none;
}
.styled-table tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 35px;
  height: 35px;
  background: #3699ff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  text-transform: uppercase;
}

.badge.success {
  background: rgba(28, 209, 107, 0.15);
  color: #1cd16b;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
}
.text-center {
  text-align: center;
}
.font-bold {
  font-weight: bold;
  color: #fff;
}
.py-4 {
  padding-top: 20px;
  padding-bottom: 20px;
}
</style>
