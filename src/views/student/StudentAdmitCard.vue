<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

// 🔴 FIX: সরাসরি লারাভেলের ঠিকানা ব্যবহার করছি যাতে HTML এরর না আসে
const BASE_URL = 'http://127.0.0.1:8000/api'

const token = localStorage.getItem('token')
const apiConfig = { headers: { Authorization: `Bearer ${token}` } }

const isLoading = ref(false)
const examData = ref(null)
const canDownload = ref(false)
const message = ref('')

// ১. ব্যাকএন্ড থেকে স্ট্যাটাস এবং এক্সাম ডাটা আনা
const checkEligibility = async () => {
  isLoading.value = true
  try {
    const res = await axios.get(`${BASE_URL}/admit-card`, apiConfig)

    // ডাটা সেট করা
    examData.value = res.data.exam_details
    canDownload.value = res.data.can_download
    message.value = res.data.message
  } catch (error) {
    console.error('Admit Card Error:', error)
    // ইউজারকে সুন্দর এরর দেখানো
    Swal.fire({
      icon: 'error',
      title: 'Connection Error',
      text: 'অ্যাডমিট কার্ড লোড করা যাচ্ছে না। ব্যাকএন্ড সার্ভার চালু আছে তো?',
    })
  } finally {
    isLoading.value = false
  }
}

// ২. ডাউনলোড / প্রিন্ট বাটন ফাংশন
const downloadAdmitCard = () => {
  if (!canDownload.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Action Blocked',
      text: message.value || 'Please clear your dues first.',
    })
    return
  }
  // প্রিন্ট উইন্ডো ওপেন
  window.print()
}

onMounted(() => {
  checkEligibility()
})
</script>

<template>
  <div class="page-container">
    <div class="header no-print">
      <h2 class="page-title">🆔 Exam Admit Card</h2>
    </div>

    <div v-if="isLoading" class="loading no-print">
      <div class="spinner"></div>
      <p>Checking Eligibility...</p>
    </div>

    <div v-else-if="examData" class="content-area no-print">
      <div :class="['status-card', canDownload ? 'bg-success' : 'bg-danger']">
        <div class="status-icon">
          {{ canDownload ? '✅' : '🚫' }}
        </div>
        <div class="status-text">
          <h3>{{ canDownload ? 'Eligible' : 'Not Eligible' }}</h3>
          <p>{{ message }}</p>
        </div>
      </div>

      <div class="exam-info-card">
        <h3>📄 Upcoming Exam Details</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Exam Name:</span>
            <span class="value">{{ examData.exam_name }}</span>
          </div>
          <div class="info-item">
            <span class="label">Start Date:</span>
            <span class="value">{{ new Date(examData.start_date).toLocaleDateString() }}</span>
          </div>
          <div class="info-item">
            <span class="label">Center:</span>
            <span class="value">{{ examData.center }}</span>
          </div>
          <div class="info-item">
            <span class="label">Student Name:</span>
            <span class="value">{{ examData.student_name }}</span>
          </div>
          <div class="info-item">
            <span class="label">Roll No:</span>
            <span class="value">{{ examData.roll_no }}</span>
          </div>
        </div>

        <div class="action-area">
          <button
            @click="downloadAdmitCard"
            :disabled="!canDownload"
            :class="['btn-download', { disabled: !canDownload }]"
          >
            🖨️ Download / Print Admit Card
          </button>
          <p v-if="!canDownload" class="help-text">* বকেয়া ফি পরিশোধ করলে এই বাটনটি চালু হবে।</p>
        </div>
      </div>
    </div>

    <div v-else class="empty-state no-print">
      <p>⚠️ কোনো অ্যাডমিট কার্ডের তথ্য পাওয়া যায়নি।</p>
      <button @click="checkEligibility" class="btn-retry">Retry</button>
    </div>

    <div v-if="examData" class="print-only">
      <div class="admit-border">
        <div class="admit-header">
          <div class="header-text">
            <h1>ABC School & College</h1>
            <p>Dhaka, Bangladesh</p>
            <h2 class="admit-title">ADMIT CARD</h2>
          </div>
          <div class="photo-box">Photo</div>
        </div>

        <div class="exam-meta">
          <h3>{{ examData.exam_name }}</h3>
        </div>

        <div class="student-details">
          <table>
            <tr>
              <td><strong>Name:</strong> {{ examData.student_name }}</td>
              <td><strong>Roll No:</strong> {{ examData.roll_no }}</td>
            </tr>
            <tr>
              <td><strong>Class:</strong> {{ examData.class }}</td>
              <td><strong>Center:</strong> {{ examData.center }}</td>
            </tr>
            <tr>
              <td>
                <strong>Start Date:</strong>
                {{ new Date(examData.start_date).toLocaleDateString() }}
              </td>
              <td><strong>Student ID:</strong> {{ examData.student_id || 'N/A' }}</td>
            </tr>
          </table>
        </div>

        <div class="instructions">
          <h4>Instructions for Examinee:</h4>
          <ul>
            <li>Bring this admit card to the exam hall.</li>
            <li>Mobile phones and electronic devices are strictly prohibited.</li>
            <li>Please arrive at least 30 minutes before the exam starts.</li>
          </ul>
        </div>

        <div class="signatures">
          <div class="sig-box">
            <p>________________</p>
            <p>Guardian's Signature</p>
          </div>
          <div class="sig-box">
            <p>________________</p>
            <p>Principal's Signature</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* লেআউট স্টাইল */
.page-container {
  padding: 20px;
  color: white;
  max-width: 800px;
  margin: 0 auto;
}
.page-title {
  border-bottom: 1px solid #333;
  padding-bottom: 15px;
  margin-bottom: 20px;
  font-size: 24px;
}
.loading,
.empty-state {
  text-align: center;
  margin-top: 50px;
  color: #aaa;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #333;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
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

/* স্ট্যাটাস কার্ড */
.status-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 25px;
  color: white;
}
.bg-success {
  background: linear-gradient(135deg, #10b981, #059669);
}
.bg-danger {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
}
.status-icon {
  font-size: 40px;
  margin-right: 20px;
}
.status-text h3 {
  margin: 0 0 5px 0;
  font-size: 20px;
}
.status-text p {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

/* ইনফো কার্ড */
.exam-info-card {
  background: #1e1e2d;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 25px;
}
.exam-info-card h3 {
  margin-top: 0;
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
  margin-bottom: 15px;
  font-size: 18px;
  color: #e5e7eb;
}
.info-grid {
  display: grid;
  gap: 12px;
  margin-bottom: 25px;
}
.info-item {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px dashed #333;
  padding-bottom: 8px;
}
.label {
  color: #9ca3af;
}
.value {
  font-weight: bold;
  color: #fff;
}

/* বাটন */
.action-area {
  text-align: center;
}
.btn-download {
  width: 100%;
  padding: 14px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.btn-download:hover:not(.disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}
.btn-download.disabled {
  background: #4b5563;
  cursor: not-allowed;
  opacity: 0.7;
}
.btn-retry {
  margin-top: 10px;
  padding: 8px 20px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.help-text {
  color: #f87171;
  font-size: 13px;
  margin-top: 12px;
}

/* 🖨️ PRINT STYLES (শুধুমাত্র প্রিন্ট করার সময় কাজ করবে) */
@media screen {
  .print-only {
    display: none;
  }
}

@media print {
  body * {
    visibility: hidden;
  }
  .no-print {
    display: none !important;
  }
  .print-only,
  .print-only * {
    visibility: visible;
  }
  .print-only {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: white;
    color: black;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 20px;
  }

  .admit-border {
    border: 2px solid #000;
    padding: 40px;
    width: 90%;
    max-width: 800px;
    min-height: 80vh;
  }

  .admit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #000;
    padding-bottom: 15px;
    margin-bottom: 20px;
  }
  .header-text {
    text-align: center;
    flex-grow: 1;
  }
  .header-text h1 {
    margin: 0;
    font-size: 26px;
    text-transform: uppercase;
  }
  .admit-title {
    margin: 10px 0 0;
    background: #000;
    color: #fff;
    display: inline-block;
    padding: 5px 25px;
    border-radius: 20px;
    font-size: 18px;
  }
  .photo-box {
    width: 110px;
    height: 130px;
    border: 1px solid #000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }

  .exam-meta {
    text-align: center;
    margin-bottom: 30px;
  }
  .exam-meta h3 {
    margin: 0;
    font-size: 20px;
    text-decoration: underline;
  }

  .student-details table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 40px;
  }
  .student-details td {
    padding: 12px 5px;
    font-size: 16px;
    border-bottom: 1px dotted #999;
    vertical-align: bottom;
  }

  .instructions {
    border-top: 1px solid #000;
    padding-top: 15px;
    margin-bottom: 80px;
  }
  .instructions h4 {
    margin: 0 0 10px 0;
    text-decoration: underline;
  }
  .instructions ul {
    margin: 0;
    padding-left: 20px;
  }

  .signatures {
    display: flex;
    justify-content: space-between;
  }
  .sig-box {
    text-align: center;
    width: 200px;
  }
  .sig-box p:first-child {
    margin-bottom: 5px;
    font-weight: bold;
  }
}
</style>
