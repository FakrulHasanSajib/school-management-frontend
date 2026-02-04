<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const BASE_URL = 'http://127.0.0.1:8000/api'
const token = localStorage.getItem('token')
const apiConfig = { headers: { Authorization: `Bearer ${token}` } }

const exams = ref([])
const selectedExam = ref('')
const resultData = ref(null)
const isLoading = ref(false)
const studentId = ref(null)

// ১. প্রথমে স্টুডেন্ট আইডি এবং এক্সাম লিস্ট আনা
const initData = async () => {
  try {
    // প্রোফাইল থেকে স্টুডেন্ট আইডি বের করা
    const profileRes = await axios.get(`${BASE_URL}/profile`, apiConfig)
    const user = profileRes.data.data
    studentId.value = user.student_profile?.id || user.studentProfile?.id

    // এক্সাম লিস্ট আনা
    const examRes = await axios.get(`${BASE_URL}/exams`, apiConfig)
    exams.value = examRes.data.data
  } catch (error) {
    console.error('Data Load Error', error)
  }
}

// ২. রেজাল্ট সার্চ করা
const fetchResult = async () => {
  if (!selectedExam.value || !studentId.value) return

  isLoading.value = true
  resultData.value = null

  try {
    // আপনার API রাউট অনুযায়ী কল করা হচ্ছে
    const res = await axios.get(
      `${BASE_URL}/results/exam/${selectedExam.value}/student/${studentId.value}`,
      apiConfig,
    )
    resultData.value = res.data.data
  } catch (error) {
    console.error('Result Error', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  initData()
})
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">📊 Exam Results</h2>

    <div class="search-box">
      <select v-model="selectedExam" @change="fetchResult" class="exam-select">
        <option value="" disabled>Select an Exam</option>
        <option v-for="exam in exams" :key="exam.id" :value="exam.id">
          {{ exam.name }} ({{ exam.session }})
        </option>
      </select>
    </div>

    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>রেজাল্ট লোড হচ্ছে...</p>
    </div>

    <div v-else-if="resultData" class="result-card">
      <div class="result-header">
        <div>
          <h3>{{ resultData.student?.user?.name }}</h3>
          <p>
            Roll: {{ resultData.student?.roll_no }} | Class:
            {{ resultData.student?.school_class?.name }}
          </p>
        </div>
        <div class="gpa-box">
          <span>Total Marks</span>
          <strong>{{ resultData.total_marks }}</strong>
        </div>
      </div>

      <table class="result-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Marks</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="mark in resultData.marks" :key="mark.id">
            <td>{{ mark.subject?.name }}</td>
            <td>{{ mark.marks_obtained }}</td>
            <td>
              <span :class="['grade-badge', mark.grade === 'F' ? 'fail' : 'pass']">
                {{ mark.grade || '-' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="selectedExam" class="empty-state">
      <p>📭 এই পরীক্ষার জন্য আপনার কোনো রেজাল্ট পাওয়া যায়নি।</p>
    </div>

    <div v-else class="empty-state">
      <p>👆 রেজাল্ট দেখতে উপরে একটি পরীক্ষা সিলেক্ট করুন।</p>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 20px;
  color: white;
  max-width: 900px;
  margin: 0 auto;
}
.page-title {
  margin-bottom: 25px;
  font-size: 24px;
  border-bottom: 1px solid #333;
  padding-bottom: 15px;
}

/* ইনপুট ডিজাইন */
.search-box {
  margin-bottom: 30px;
}
.exam-select {
  width: 100%;
  padding: 15px;
  background: #1e1e2d;
  border: 1px solid #333;
  color: white;
  border-radius: 10px;
  font-size: 16px;
  outline: none;
}
.exam-select:focus {
  border-color: #3699ff;
}

/* রেজাল্ট কার্ড */
.result-card {
  background: #1e1e2d;
  border-radius: 15px;
  overflow: hidden;
  border: 1px solid #333;
  animation: fadeIn 0.5s;
}
.result-header {
  background: #2b2b40;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
}
.result-header h3 {
  margin: 0 0 5px 0;
  font-size: 20px;
}
.result-header p {
  margin: 0;
  color: #a1a5b7;
  font-size: 14px;
}

.gpa-box {
  text-align: center;
  background: rgba(54, 153, 255, 0.1);
  padding: 10px 20px;
  border-radius: 10px;
  border: 1px solid #3699ff;
  color: #3699ff;
}
.gpa-box span {
  display: block;
  font-size: 12px;
}
.gpa-box strong {
  font-size: 20px;
}

/* টেবিল */
.result-table {
  width: 100%;
  border-collapse: collapse;
}
.result-table th {
  background: #151521;
  color: #a1a5b7;
  padding: 15px;
  text-align: left;
  font-weight: 500;
}
.result-table td {
  padding: 15px;
  border-bottom: 1px solid #2b2b40;
  color: white;
}
.result-table tr:last-child td {
  border-bottom: none;
}

.grade-badge {
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
}
.pass {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}
.fail {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* লোডিং & এম্পটি স্টেট */
.loading,
.empty-state {
  text-align: center;
  padding: 40px;
  background: #1e1e2d;
  border-radius: 10px;
  color: #a1a5b7;
  border: 1px solid #333;
}
.spinner {
  border: 4px solid rgba(255, 255, 255, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #3699ff;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
