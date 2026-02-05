<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const teachers = ref([])
const history = ref([]) // ✅ হিস্ট্রি রাখার জন্য ভেরিয়েবল
const isLoading = ref(false)
const showModal = ref(false)
const processing = ref(false)

// পেমেন্ট ফর্ম ডাটা
const paymentForm = ref({
  teacher_id: '',
  teacher_name: '',
  salary_month: new Date().toISOString().slice(0, 7), // YYYY-MM format
  amount: '',
  bonus: 0,
  deduction: 0,
  note: '',
})

// ১. শিক্ষকদের লিস্ট আনা
const fetchTeachers = async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get('http://127.0.0.1:8000/api/teachers', {
      headers: { Authorization: `Bearer ${token}` },
    })
    teachers.value = res.data.data || res.data
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

// ✅ ২. পেমেন্ট হিস্ট্রি লোড করা (নতুন ফাংশন)
const fetchHistory = async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get('http://127.0.0.1:8000/api/hr/payroll/history', {
      headers: { Authorization: `Bearer ${token}` },
    })
    history.value = res.data.data || []
  } catch (error) {
    console.error('History load failed:', error)
  }
}

// ৩. পেমেন্ট মোডাল ওপেন করা
const openPaymentModal = (teacher) => {
  paymentForm.value.teacher_id = teacher.id
  paymentForm.value.teacher_name = teacher.name
  paymentForm.value.amount = ''
  paymentForm.value.bonus = 0
  paymentForm.value.deduction = 0
  showModal.value = true
}

// ৪. স্যালারি সাবমিট করা
const submitSalary = async () => {
  processing.value = true
  try {
    const token = localStorage.getItem('token')

    await axios.post('http://127.0.0.1:8000/api/hr/payroll/pay', paymentForm.value, {
      headers: { Authorization: `Bearer ${token}` },
    })

    Swal.fire('Success!', 'Salary paid successfully.', 'success')
    showModal.value = false

    // ✅ পেমেন্ট সফল হলে হিস্ট্রি রিফ্রেশ হবে
    fetchHistory()
  } catch (error) {
    Swal.fire('Error!', 'Failed to pay salary.', 'error')
    console.error(error)
  } finally {
    processing.value = false
  }
}

onMounted(() => {
  fetchTeachers()
  fetchHistory() // ✅ পেজ লোড হলে হিস্ট্রিও লোড হবে
})
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">💸 Staff Payroll & Salary</h2>

    <div class="table-card">
      <table class="custom-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Designation</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="teacher in teachers" :key="teacher.id">
            <td>#{{ teacher.id }}</td>
            <td>
              <div class="user-info">
                <strong>{{ teacher.name }}</strong>
                <small>{{ teacher.email }}</small>
              </div>
            </td>
            <td>
              <span class="badge">{{ teacher.teacher_profile?.designation || 'Staff' }}</span>
            </td>
            <td>
              <button @click="openPaymentModal(teacher)" class="pay-btn">💰 Pay Salary</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="history-section">
      <h3 class="section-title">📜 Payment History</h3>

      <div class="table-card">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Teacher Name</th>
              <th>Month</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in history" :key="record.id">
              <td>{{ new Date(record.payment_date).toLocaleDateString() }}</td>
              <td>{{ record.user?.name || 'Unknown' }}</td>
              <td>{{ record.salary_month }}</td>
              <td class="amount">৳ {{ record.net_salary }}</td>
              <td>
                <span class="badge success">Paid</span>
              </td>
            </tr>
            <tr v-if="history.length === 0">
              <td colspan="5" style="text-align: center; padding: 20px; color: #aaa">
                No payment records found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Pay Salary: {{ paymentForm.teacher_name }}</h3>
          <button @click="showModal = false" class="close-btn">×</button>
        </div>

        <form @submit.prevent="submitSalary" class="modal-body">
          <div class="form-group">
            <label>Salary Month</label>
            <input v-model="paymentForm.salary_month" type="month" required />
          </div>

          <div class="form-group">
            <label>Basic Salary (Amount)</label>
            <input v-model="paymentForm.amount" type="number" placeholder="Enter Amount" required />
          </div>

          <div class="row">
            <div class="form-group">
              <label>Bonus (+)</label>
              <input v-model="paymentForm.bonus" type="number" placeholder="0" />
            </div>
            <div class="form-group">
              <label>Deduction (-)</label>
              <input v-model="paymentForm.deduction" type="number" placeholder="0" />
            </div>
          </div>

          <div class="form-group">
            <label>Net Payable</label>
            <div class="total-amount">
              ৳
              {{
                Number(paymentForm.amount) +
                Number(paymentForm.bonus) -
                Number(paymentForm.deduction)
              }}
            </div>
          </div>

          <button type="submit" class="submit-btn" :disabled="processing">
            {{ processing ? 'Processing...' : 'Confirm Payment' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 20px;
  color: #fff;
  max-width: 1000px;
  margin: 0 auto;
}
.page-title {
  margin-bottom: 20px;
  font-size: 24px;
  border-bottom: 1px solid #444;
  padding-bottom: 10px;
}

/* Table Styles */
.table-card {
  background: #1e1e2d;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #333;
}
.custom-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.custom-table th {
  background: #2b2b40;
  padding: 15px;
  color: #a1a5b7;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
}
.custom-table td {
  padding: 15px;
  border-bottom: 1px solid #333;
  color: white;
}
.pay-btn {
  background: #22c55e;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.3s;
}
.pay-btn:hover {
  background: #16a34a;
}
.badge {
  background: #3b82f6;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}
.badge.success {
  background: #059669;
  color: white;
}

/* ✅ History Section Style */
.history-section {
  margin-top: 50px;
}
.section-title {
  font-size: 20px;
  margin-bottom: 15px;
  color: #a1a5b7;
  border-left: 4px solid #3b82f6;
  padding-left: 10px;
}
.amount {
  font-weight: bold;
  color: #4ade80;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}
.modal-content {
  background: #2e2e2e;
  width: 400px;
  border-radius: 16px;
  padding: 25px;
  color: white;
  border: 1px solid #444;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #444;
  padding-bottom: 10px;
}
.close-btn {
  background: none;
  border: none;
  color: #aaa;
  font-size: 28px;
  cursor: pointer;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #ccc;
  font-size: 14px;
}
.form-group input {
  width: 100%;
  padding: 12px;
  background: #1a1a1a;
  border: 1px solid #444;
  color: white;
  border-radius: 8px;
  outline: none;
}
.form-group input:focus {
  border-color: #3b82f6;
}
.row {
  display: flex;
  gap: 15px;
}
.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 15px;
  transition: 0.3s;
}
.submit-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
.total-amount {
  font-size: 24px;
  font-weight: bold;
  color: #22c55e;
  text-align: right;
  background: #1a1a1a;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #444;
}
</style>
