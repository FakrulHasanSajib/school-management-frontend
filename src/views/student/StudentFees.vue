<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

// ✅ সরাসরি ব্যাকএন্ডের API লিংক
const BASE_URL = 'http://127.0.0.1:8000/api'
const token = localStorage.getItem('token')

// ✅ API কনফিগারেশন
const apiConfig = {
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  },
}

const invoices = ref([])
const isLoading = ref(false)
const selectedReceipt = ref(null)

// ✅ ১. ফি লোড করা
const fetchFees = async () => {
  isLoading.value = true
  try {
    // ইউজারের প্রোফাইল থেকে আইডি বের করা
    const profileRes = await axios.get(`${BASE_URL}/profile`, apiConfig)

    // ডাটা ফরম্যাট হ্যান্ডেল করা
    const responseData = profileRes.data
    const user = responseData.data || responseData

    // 🛑 সেফটি চেক: যদি ইউজার না পাওয়া যায়
    if (!user) {
      Swal.fire('Error', 'User profile failed to load.', 'error')
      return
    }

    // ✅ স্টুডেন্ট আইডি খোঁজা
    const studentId =
      user.student_profile?.id ||
      user.studentProfile?.id ||
      user.student?.id ||
      user.student_info?.id

    // যদি আইডি পাওয়া যায়, ইনভয়েস লোড করো
    if (studentId) {
      const res = await axios.get(`${BASE_URL}/accounts/student/${studentId}/invoices`, apiConfig)
      invoices.value = res.data.data || res.data
    } else {
      // 🛑 স্টুডেন্ট প্রোফাইল মিসিং হলে
      Swal.fire({
        title: '⚠️ Student Profile Missing!',
        text: 'আপনার অ্যাকাউন্টের সাথে কোনো স্টুডেন্ট প্রোফাইল লিংক করা নেই।',
        icon: 'warning',
        confirmButtonText: 'OK',
      })
    }
  } catch (error) {
    // যদি সেশন এক্সপায়ার হয় বা অথেনটিকেশন ফেইল করে
    if (error.response && error.response.status === 401) {
      Swal.fire({
        title: 'Session Expired',
        text: 'Please login again.',
        icon: 'warning',
        confirmButtonText: 'Login',
      }).then(() => {
        // window.location.href = '/login';
      })
    } else {
      Swal.fire('Error', 'Failed to load fees information.', 'error')
    }
  } finally {
    isLoading.value = false
  }
}

// ✅ ২. পেমেন্ট শুরু করা (Pay Now বাটনে ক্লিক করলে)
const initiatePayment = async (invoice) => {
  try {
    // লোডিং দেখানো
    Swal.fire({
      title: 'Connecting to Payment Gateway...',
      text: 'Please wait while we redirect you.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      },
    })

    // ব্যাকএন্ডে রিকোয়েস্ট পাঠানো
    const res = await axios.post(
      `${BASE_URL}/payment/init`,
      {
        invoice_id: invoice.id,
      },
      apiConfig,
    )

    // যদি সফলভাবে লিংক পায়
    if (res.data.status && res.data.url) {
      // 🚀 SSLCommerz পেমেন্ট পেজে নিয়ে যাওয়া
      window.location.href = res.data.url
    } else {
      Swal.fire('Error', res.data.message || 'Payment gateway could not be initiated.', 'error')
    }
  } catch (error) {
    Swal.fire('Error', 'Payment initiation failed. Please try again later.', 'error')
  }
}

// ৩. রিসিট প্রিন্ট করা
const printReceipt = (invoice) => {
  selectedReceipt.value = invoice
  setTimeout(() => {
    window.print()
  }, 500)
}

// হেল্পার ফাংশন (দিন গণনা ও ডিজাইন)
const getDaysLeft = (dueDateString, status) => {
  if (status === 'Paid') return { text: 'Paid', class: 'text-success' }
  if (!dueDateString) return { text: 'No Deadline', class: 'text-gray' }

  const today = new Date()
  const due = new Date(dueDateString)
  const diffTime = due - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0)
    return { text: `⚠️ Overdue by ${Math.abs(diffDays)} days`, class: 'text-danger' }
  else if (diffDays === 0) return { text: '🚨 Due Today!', class: 'text-warning' }
  else return { text: `⏳ ${diffDays} days left`, class: 'text-info' }
}

const getStatusClass = (status) => {
  if (status === 'Paid') return 'status-paid'
  if (status === 'Partial') return 'status-partial'
  return 'status-pending'
}

onMounted(() => {
  fetchFees()

  // ✅ পেমেন্ট শেষ করে ফিরে আসলে সাকসেস মেসেজ দেখানো
  const urlParams = new URLSearchParams(window.location.search)
  const status = urlParams.get('status')

  if (status === 'success') {
    Swal.fire({
      title: 'Payment Successful! 🎉',
      text: 'Thank you for your payment.',
      icon: 'success',
      confirmButtonText: 'Download Receipt',
    })
    window.history.replaceState({}, document.title, window.location.pathname)
  } else if (status === 'failed') {
    Swal.fire('Payment Failed', 'Please try again.', 'error')
    window.history.replaceState({}, document.title, window.location.pathname)
  } else if (status === 'cancel') {
    Swal.fire('Cancelled', 'You cancelled the payment.', 'info')
    window.history.replaceState({}, document.title, window.location.pathname)
  }
})
</script>

<template>
  <div class="page-container">
    <div class="header no-print">
      <h2 class="page-title">💰 My Fees & Payments</h2>
    </div>

    <div v-if="isLoading" class="loading no-print">
      <div class="spinner"></div>
      <p>লোড হচ্ছে...</p>
    </div>

    <div v-else-if="invoices.length > 0" class="fees-grid no-print">
      <div v-for="inv in invoices" :key="inv.id" class="fee-card">
        <div class="fee-header">
          <div>
            <h3>{{ inv.fee_type?.name || 'School Fee' }}</h3>
            <span class="date">Issued: {{ new Date(inv.created_at).toLocaleDateString() }}</span>
          </div>
          <span :class="['status-badge', getStatusClass(inv.status)]">
            {{ inv.status }}
          </span>
        </div>

        <div class="fee-body">
          <div class="row">
            <span>Total Amount</span>
            <strong>৳ {{ inv.total_amount }}</strong>
          </div>
          <div class="row paid">
            <span>Paid</span>
            <span>৳ {{ inv.paid_amount }}</span>
          </div>
          <div class="row due">
            <span>Due Amount</span>
            <span>৳ {{ inv.due_amount }}</span>
          </div>
          <hr class="divider" />
          <div class="row last-date-row">
            <span
              >Last Date:
              {{ inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A' }}</span
            >
            <span :class="['days-left', getDaysLeft(inv.due_date, inv.status).class]">
              {{ getDaysLeft(inv.due_date, inv.status).text }}
            </span>
          </div>

          <div class="action-buttons">
            <button v-if="inv.status !== 'Paid'" @click="initiatePayment(inv)" class="btn-pay">
              💳 Pay Now
            </button>

            <button
              v-if="inv.status === 'Paid' || inv.status === 'Partial'"
              @click="printReceipt(inv)"
              class="btn-print"
            >
              🖨️ Receipt
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state no-print">
      <p>🎉 কোনো বকেয়া নেই।</p>
    </div>

    <div v-if="selectedReceipt" class="receipt-container print-only">
      <div class="receipt-header-print">
        <h1>ABC School & College</h1>
        <p>Dhaka, Bangladesh</p>
        <h3 class="receipt-title">Money Receipt</h3>
      </div>
      <div class="receipt-info">
        <div class="info-left">
          <p><strong>Receipt No:</strong> #{{ selectedReceipt.id }}</p>
          <p>
            <strong>Student:</strong>
            {{ selectedReceipt.student?.user?.name }}
          </p>
          <p><strong>Roll No:</strong> {{ selectedReceipt.student?.roll_no }}</p>
        </div>
        <div class="info-right">
          <p><strong>Date:</strong> {{ new Date().toLocaleDateString() }}</p>
          <p><strong>Payment Method:</strong> SSLCommerz (Online)</p>
        </div>
      </div>
      <table class="receipt-table">
        <thead>
          <tr>
            <th>Description</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ selectedReceipt.fee_type?.name }}</td>
            <td class="text-right">{{ selectedReceipt.total_amount }}</td>
          </tr>
          <tr>
            <td class="text-right"><strong>Paid Amount</strong></td>
            <td class="text-right">
              <strong>{{ selectedReceipt.paid_amount }}</strong>
            </td>
          </tr>
          <tr>
            <td class="text-right">Due</td>
            <td class="text-right">{{ selectedReceipt.due_amount }}</td>
          </tr>
        </tbody>
      </table>
      <div class="receipt-footer">
        <div class="signature">
          <p>___________________</p>
          <p>Authorized Signature</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* স্টাইল আগের মতোই রাখা হয়েছে */
.page-container {
  padding: 20px;
  color: white;
  max-width: 1000px;
  margin: 0 auto;
}
.page-title {
  margin-bottom: 25px;
  font-size: 24px;
  border-bottom: 1px solid #333;
  padding-bottom: 15px;
}
.fees-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}
.fee-card {
  background: #1e1e2d;
  border-radius: 12px;
  border: 1px solid #333;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.fee-header {
  background: #2b2b40;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #333;
}
.fee-header h3 {
  margin: 0;
  font-size: 16px;
  color: white;
}
.date {
  font-size: 12px;
  color: #a1a5b7;
  display: block;
  margin-top: 4px;
}
.fee-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-grow: 1;
}
.row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #a1a5b7;
}
.row strong {
  color: white;
  font-size: 16px;
}
.paid span:last-child {
  color: #22c55e;
}
.due span:last-child {
  color: #ef4444;
  font-weight: bold;
}
.divider {
  border-top: 1px solid #333;
  margin: 5px 0;
}
.action-buttons {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}
.btn-pay {
  flex: 1;
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}
.btn-pay:hover {
  background: #1d4ed8;
}
.btn-print {
  flex: 1;
  background: #374151;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}
.status-badge {
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
}
.status-paid {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}
.status-pending {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
.status-partial {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}
.text-danger {
  color: #ff4d4d;
}
.text-warning {
  color: #ffcc00;
}
.text-info {
  color: #3699ff;
}
.text-success {
  color: #22c55e;
}

/* Print CSS */
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
    padding: 40px;
  }
  .receipt-header-print {
    text-align: center;
    border-bottom: 2px solid #000;
    padding-bottom: 10px;
    margin-bottom: 30px;
  }
  .receipt-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 40px;
  }
  .receipt-table th,
  .receipt-table td {
    border: 1px solid #000;
    padding: 10px;
    text-align: left;
  }
  .text-right {
    text-align: right;
  }
  .receipt-footer {
    text-align: right;
    margin-top: 50px;
  }
  .signature {
    border-top: 1px solid #000;
    display: inline-block;
    padding-top: 5px;
    width: 200px;
    text-align: center;
  }
}
</style>
