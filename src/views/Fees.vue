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

// Tabs: 'setup', 'invoice', 'collection', 'history'
const activeTab = ref('collection')

// States
const feeTypes = ref([])
const classes = ref([])
const sections = ref([])
const students = ref([])
const studentInvoices = ref([]) // কালেকশন ট্যাবের জন্য
const allInvoices = ref([]) // হিস্ট্রি ট্যাবের জন্য (সব ডাটা)
const loading = ref(false)

// Forms
const newFeeType = ref({ name: '', amount: '' })
const invoiceForm = ref({
  class_id: '',
  section_id: '',
  student_id: '',
  fee_type_id: '',
  due_date: '',
})
const collectionFilter = ref({ class_id: '', section_id: '', student_id: '' })
const paymentForm = ref({ invoice_id: null, amount: '', method: 'Cash' })

// ১. ডাটা লোড
const loadInitialData = async () => {
  try {
    const [ftRes, clsRes] = await Promise.all([
      axios.get(`${BASE_URL}/accounts/fee-types`, apiConfig),
      axios.get(`${BASE_URL}/academic/classes`, apiConfig),
    ])
    feeTypes.value = ftRes.data.data
    classes.value = clsRes.data.data
  } catch (error) {
    console.error(error)
  }
}

const loadSections = async (classId) => {
  if (!classId) return
  const res = await axios.get(`${BASE_URL}/academic/classes/${classId}/sections`, apiConfig)
  sections.value = res.data.data
}
const loadStudents = async (sectionId) => {
  if (!sectionId) return
  const res = await axios.get(`${BASE_URL}/students/section/${sectionId}`, apiConfig)
  students.value = res.data.data
}

// --- TAB 1: FEE SETUP ---
const createFeeType = async () => {
  try {
    await axios.post(`${BASE_URL}/accounts/fee-types`, newFeeType.value, apiConfig)
    Swal.fire('Success', 'Fee type created!', 'success')
    newFeeType.value = { name: '', amount: '' }
    loadInitialData()
  } catch (e) {
    Swal.fire('Error', 'Failed to create fee type', 'error')
  }
}

// --- TAB 2: GENERATE INVOICE ---
const generateInvoice = async () => {
  try {
    await axios.post(`${BASE_URL}/accounts/invoices`, invoiceForm.value, apiConfig)
    Swal.fire('Success', 'Invoice generated!', 'success')
  } catch (e) {
    if (e.response && e.response.data) {
      Swal.fire('Error', e.response.data.message, 'error')
    } else {
      Swal.fire('Error', 'Failed to generate invoice', 'error')
    }
  }
}

// --- TAB 3: COLLECTION (Single Student) ---
const getDues = async () => {
  if (!collectionFilter.value.student_id) return
  loading.value = true
  try {
    const res = await axios.get(
      `${BASE_URL}/accounts/student/${collectionFilter.value.student_id}/invoices`,
      apiConfig,
    )
    studentInvoices.value = res.data.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const openPaymentModal = (inv) => {
  paymentForm.value.invoice_id = inv.id
  paymentForm.value.amount = inv.due_amount
  collectPayment()
}

const collectPayment = async () => {
  const { value: formValues } = await Swal.fire({
    title: 'Collect Payment',
    html:
      `<input id="swal-amount" class="swal2-input" placeholder="Amount" value="${paymentForm.value.amount}">` +
      `<select id="swal-method" class="swal2-input"><option value="Cash">Cash</option><option value="Bkash">Bkash</option></select>`,
    focusConfirm: false,
    preConfirm: () => {
      return {
        amount: document.getElementById('swal-amount').value,
        method: document.getElementById('swal-method').value,
      }
    },
  })

  if (formValues) {
    try {
      await axios.post(
        `${BASE_URL}/accounts/payments`,
        {
          fee_invoice_id: paymentForm.value.invoice_id,
          amount: formValues.amount,
          payment_method: formValues.method,
        },
        apiConfig,
      )

      Swal.fire('Paid!', 'Payment received.', 'success')
      getDues() // রিফ্রেশ
    } catch (e) {
      Swal.fire('Error', e.response.data.message || 'Payment failed', 'error')
    }
  }
}

// --- TAB 4: HISTORY (All Invoices) ---
const loadHistory = async () => {
  loading.value = true
  try {
    const res = await axios.get(`${BASE_URL}/accounts/history`, apiConfig)
    allInvoices.value = res.data.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// Function to handle History Tab click safely
const goToHistory = () => {
  activeTab.value = 'history'
  loadHistory()
}

onMounted(loadInitialData)
</script>

<template>
  <div class="p-4">
    <div class="card mb-4 no-print">
      <div class="tabs">
        <button :class="{ active: activeTab === 'setup' }" @click="activeTab = 'setup'">
          ⚙️ Fee Setup
        </button>
        <button :class="{ active: activeTab === 'invoice' }" @click="activeTab = 'invoice'">
          📄 Generate Bill
        </button>
        <button :class="{ active: activeTab === 'collection' }" @click="activeTab = 'collection'">
          💰 Collect Fee
        </button>

        <button :class="{ active: activeTab === 'history' }" @click="goToHistory">
          📜 History & Reports
        </button>
      </div>
    </div>

    <div v-if="activeTab === 'setup'" class="card">
      <h3>Add New Fee Type</h3>
      <div class="form-grid">
        <input v-model="newFeeType.name" placeholder="Fee Name (e.g. Monthly Fee)" />
        <input v-model="newFeeType.amount" type="number" placeholder="Default Amount" />
        <button @click="createFeeType" class="btn-save">Save Fee Type</button>
      </div>
      <table class="table mt-4">
        <thead>
          <tr>
            <th>Name</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ft in feeTypes" :key="ft.id">
            <td>{{ ft.name }}</td>
            <td>{{ ft.amount }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="activeTab === 'invoice'" class="card">
      <h3>Generate Invoice for Student</h3>
      <div class="form-grid">
        <select v-model="invoiceForm.class_id" @change="loadSections(invoiceForm.class_id)">
          <option value="">Select Class</option>
          <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <select v-model="invoiceForm.section_id" @change="loadStudents(invoiceForm.section_id)">
          <option value="">Select Section</option>
          <option v-for="s in sections" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
        <select v-model="invoiceForm.student_id">
          <option value="">Select Student</option>
          <option v-for="st in students" :key="st.id" :value="st.id">
            {{ st.name }} (Roll: {{ st.roll_no }})
          </option>
        </select>
        <select v-model="invoiceForm.fee_type_id">
          <option value="">Select Fee Type</option>
          <option v-for="ft in feeTypes" :key="ft.id" :value="ft.id">
            {{ ft.name }} - {{ ft.amount }}
          </option>
        </select>
        <input v-model="invoiceForm.due_date" type="date" />
        <button @click="generateInvoice" class="btn-save">Generate Invoice</button>
      </div>
    </div>

    <div v-if="activeTab === 'collection'" class="card">
      <h3>Collect Fees</h3>
      <div class="filters">
        <select
          v-model="collectionFilter.class_id"
          @change="loadSections(collectionFilter.class_id)"
        >
          <option value="">Class</option>
          <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <select
          v-model="collectionFilter.section_id"
          @change="loadStudents(collectionFilter.section_id)"
        >
          <option value="">Section</option>
          <option v-for="s in sections" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
        <select v-model="collectionFilter.student_id">
          <option value="">Student</option>
          <option v-for="st in students" :key="st.id" :value="st.id">{{ st.name }}</option>
        </select>
        <button @click="getDues" class="btn-search">Find Dues</button>
      </div>
      <table class="table mt-4" v-if="studentInvoices.length">
        <thead>
          <tr>
            <th>Title</th>
            <th>Due Date</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Due</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inv in studentInvoices" :key="inv.id">
            <td>{{ inv.fee_type?.name }}</td>
            <td>{{ inv.due_date }}</td>
            <td>{{ inv.total_amount }}</td>
            <td class="text-green">{{ inv.paid_amount }}</td>
            <td class="text-red font-bold">{{ inv.due_amount }}</td>
            <td>
              <span class="badge" :class="inv.status === 'Paid' ? 'bg-green' : 'bg-red'">{{
                inv.status
              }}</span>
            </td>
            <td>
              <button v-if="inv.status !== 'Paid'" @click="openPaymentModal(inv)" class="btn-pay">
                Pay Now
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="activeTab === 'history'" class="card">
      <h3>📜 Payment & Invoice History</h3>
      <button onclick="window.print()" class="btn-search mb-2 no-print">Print Report</button>
      <div class="table-responsive">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Date</th>
              <th>Student Name</th>
              <th>Roll</th>
              <th>Fee Type</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inv in allInvoices" :key="inv.id">
              <td>{{ new Date(inv.created_at).toLocaleDateString() }}</td>
              <td>{{ inv.student?.user?.name || 'Unknown' }}</td>
              <td>{{ inv.student?.roll_no }}</td>
              <td>{{ inv.fee_type?.name }}</td>
              <td>{{ inv.total_amount }}</td>
              <td>
                <span
                  class="badge"
                  :class="
                    inv.status === 'Paid'
                      ? 'bg-green'
                      : inv.status === 'Partial'
                        ? 'bg-yellow'
                        : 'bg-red'
                  "
                >
                  {{ inv.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles remain the same */
.card {
  background: white !important;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  color: #333 !important;
}
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 0;
  flex-wrap: wrap;
}
.tabs button {
  padding: 10px 20px;
  border: none;
  background: #e0e0e0;
  cursor: pointer;
  border-radius: 5px;
  font-weight: bold;
  color: #333;
}
.tabs button.active {
  background: #2563eb;
  color: white;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}
input,
select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  width: 100%;
  background: #fff !important;
  color: #000 !important;
}
.btn-save {
  background: #2563eb !important;
  color: white !important;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.btn-search {
  background: #333 !important;
  color: white !important;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.btn-pay {
  background: #16a34a !important;
  color: white !important;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  background: #fff !important;
}
.table th,
.table td {
  padding: 10px;
  border: 1px solid #eee;
  text-align: left;
  color: #000 !important;
}
.table th {
  background: #f8fafc !important;
  font-weight: bold;
}
.text-red {
  color: red !important;
}
.text-green {
  color: green !important;
}
.bg-green {
  background: #dcfce7;
  color: #166534;
  padding: 2px 6px;
  border-radius: 4px;
}
.bg-red {
  background: #fee2e2;
  color: #991b1b;
  padding: 2px 6px;
  border-radius: 4px;
}
.bg-yellow {
  background: #fef9c3;
  color: #854d0e;
  padding: 2px 6px;
  border-radius: 4px;
}

@media print {
  .no-print {
    display: none !important;
  }
  .card {
    box-shadow: none;
    border: none;
    padding: 0;
  }
}
</style>
