<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

// সার্ভার কনফিগারেশন
const BASE_URL = 'http://127.0.0.1:8000/api'
const token = localStorage.getItem('token')
const apiConfig = { headers: { Authorization: `Bearer ${token}` } }

// Tabs Control
const activeTab = ref('setup')

// States
const feeTypes = ref([])
const classes = ref([])
const sections = ref([])
const students = ref([])
const studentInvoices = ref([])
const allInvoices = ref([])
const selectedReceipt = ref(null)

// Forms
const newFeeType = ref({ name: '', amount: '', due_date: '' })
const isEditing = ref(false)
const editId = ref(null)

// Invoice Form
const invoiceForm = ref({
  class_id: '',
  section_id: '',
  student_id: '',
  fee_type_id: '',
  amount: '',
  due_date: new Date().toISOString().substr(0, 10),
})

const collectionFilter = ref({ class_id: '', section_id: '', student_id: '' })
const paymentForm = ref({ invoice_id: null, amount: '', method: 'Cash' })

// --- ১. ডাটা লোডিং ---
const loadInitialData = async () => {
  try {
    const [ftRes, clsRes] = await Promise.all([
      axios.get(`${BASE_URL}/accounts/fee-types`, apiConfig),
      axios.get(`${BASE_URL}/academic/classes`, apiConfig),
    ])
    feeTypes.value = ftRes.data.data || ftRes.data
    classes.value = clsRes.data.data || clsRes.data
  } catch (error) {
    console.error('Initial Load Error:', error)
  }
}

const loadSections = async (classId) => {
  if (!classId) return
  const res = await axios.get(`${BASE_URL}/academic/classes/${classId}/sections`, apiConfig)
  sections.value = res.data.data || res.data
}

const loadStudents = async (sectionId) => {
  if (!sectionId) return
  const res = await axios.get(`${BASE_URL}/students/section/${sectionId}`, apiConfig)
  students.value = res.data.data || res.data
}

// --- ২. ফি সেটআপ (CRUD) ---
const saveFeeType = async () => {
  if (!newFeeType.value.name || !newFeeType.value.amount) {
    Swal.fire('Warning', 'Name and Amount are required', 'warning')
    return
  }

  try {
    if (isEditing.value) {
      await axios.put(`${BASE_URL}/accounts/fee-types/${editId.value}`, newFeeType.value, apiConfig)
      Swal.fire('Updated!', 'Fee type updated successfully.', 'success')
    } else {
      await axios.post(`${BASE_URL}/accounts/fee-types`, newFeeType.value, apiConfig)
      Swal.fire('Created!', 'Fee type created successfully.', 'success')
    }

    cancelEdit()
    loadInitialData()
  } catch (e) {
    Swal.fire('Error', 'Operation failed', 'error')
  }
}

const editFeeType = (fee) => {
  newFeeType.value = {
    name: fee.name,
    amount: fee.amount,
    due_date: fee.due_date || '',
  }
  editId.value = fee.id
  isEditing.value = true
}

const cancelEdit = () => {
  newFeeType.value = { name: '', amount: '', due_date: '' }
  isEditing.value = false
  editId.value = null
}

const deleteFeeType = async (id) => {
  const confirm = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  })

  if (confirm.isConfirmed) {
    try {
      await axios.delete(`${BASE_URL}/accounts/fee-types/${id}`, apiConfig)
      Swal.fire('Deleted!', 'Fee type has been deleted.', 'success')
      loadInitialData()
    } catch (e) {
      Swal.fire('Error', 'Failed to delete. It might be in use.', 'error')
    }
  }
}

// --- ৩. জেনারেট ইনভয়েস ---
const onInvoiceFeeTypeChange = () => {
  const selected = feeTypes.value.find((ft) => ft.id == invoiceForm.value.fee_type_id)
  if (selected) {
    invoiceForm.value.amount = selected.amount
  } else {
    invoiceForm.value.amount = ''
  }
}

const generateInvoice = async () => {
  if (!invoiceForm.value.student_id || !invoiceForm.value.fee_type_id) {
    Swal.fire('Warning', 'Please select Student and Fee Type', 'warning')
    return
  }
  if (!invoiceForm.value.amount) {
    Swal.fire('Warning', 'Amount is required!', 'warning')
    return
  }

  try {
    await axios.post(`${BASE_URL}/accounts/invoices`, invoiceForm.value, apiConfig)
    Swal.fire('Success', 'Invoice generated successfully!', 'success')
    invoiceForm.value.fee_type_id = ''
    invoiceForm.value.amount = ''
    invoiceForm.value.student_id = ''
  } catch (e) {
    let msg = 'Failed to generate invoice'
    if (e.response && e.response.data && e.response.data.message) {
      msg = e.response.data.message
    }
    Swal.fire('Error', msg, 'error')
  }
}

// --- ৪. ফি কালেকশন ---
const getDues = async () => {
  if (!collectionFilter.value.student_id) return
  try {
    const res = await axios.get(
      `${BASE_URL}/accounts/student/${collectionFilter.value.student_id}/invoices`,
      apiConfig,
    )
    studentInvoices.value = res.data.data || res.data
  } catch (e) {
    Swal.fire('Error', 'Could not load dues', 'error')
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
      `<label>Amount</label><input id="swal-amount" class="swal2-input" value="${paymentForm.value.amount}">` +
      `<label>Method</label><select id="swal-method" class="swal2-input"><option value="Cash">Cash</option><option value="Bkash">Bkash</option><option value="Bank">Bank</option></select>`,
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
      Swal.fire('Paid!', 'Payment collected successfully.', 'success')
      getDues()
    } catch (e) {
      let msg = 'Payment failed'
      if (e.response && e.response.data.message) msg = e.response.data.message
      Swal.fire('Error', msg, 'error')
    }
  }
}

// --- ৫. হিস্ট্রি ---
const loadHistory = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/accounts/invoices`, apiConfig)
    allInvoices.value = res.data.data || res.data
  } catch (e) {
    console.error('History Error:', e)
  }
}

const goToHistory = () => {
  activeTab.value = 'history'
  loadHistory()
}

const printReceipt = (invoice) => {
  selectedReceipt.value = invoice
  setTimeout(() => {
    window.print()
  }, 500)
}

onMounted(loadInitialData)
</script>

<template>
  <div class="page-container">
    <div class="glass-card mb-4 no-print">
      <div class="tabs">
        <button :class="{ active: activeTab === 'setup' }" @click="activeTab = 'setup'">
          ⚙️ Setup
        </button>
        <button :class="{ active: activeTab === 'invoice' }" @click="activeTab = 'invoice'">
          📄 Invoice
        </button>
        <button :class="{ active: activeTab === 'collection' }" @click="activeTab = 'collection'">
          💰 Collection
        </button>
        <button :class="{ active: activeTab === 'history' }" @click="goToHistory">
          📜 History
        </button>
      </div>
    </div>

    <div v-if="activeTab === 'setup'" class="glass-card no-print">
      <div class="card-header">
        <h3>{{ isEditing ? '✏️ Edit Fee Type' : '➕ Add New Fee Type' }}</h3>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label>Fee Name</label>
          <input v-model="newFeeType.name" placeholder="e.g. Monthly Fee" />
        </div>
        <div class="form-group">
          <label>Amount</label>
          <input v-model="newFeeType.amount" type="number" placeholder="500" />
        </div>
        <div class="form-group">
          <label>Due Date (Optional)</label>
          <input v-model="newFeeType.due_date" type="date" />
        </div>

        <div class="form-actions">
          <button v-if="isEditing" @click="cancelEdit" class="btn cancel-btn">Cancel</button>
          <button @click="saveFeeType" class="btn save-btn">
            {{ isEditing ? 'Update Fee' : 'Save Fee' }}
          </button>
        </div>
      </div>

      <div class="table-responsive mt-4">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th class="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ft in feeTypes" :key="ft.id">
              <td>{{ ft.name }}</td>
              <td>{{ ft.amount }}</td>
              <td>{{ ft.due_date || 'N/A' }}</td>
              <td class="text-center">
                <button @click="editFeeType(ft)" class="btn-icon edit" title="Edit">✏️</button>
                <button @click="deleteFeeType(ft.id)" class="btn-icon delete" title="Delete">
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="activeTab === 'invoice'" class="glass-card no-print">
      <div class="card-header">
        <h3>📄 Generate Invoice</h3>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label>Class</label>
          <select v-model="invoiceForm.class_id" @change="loadSections(invoiceForm.class_id)">
            <option value="">-- Select Class --</option>
            <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Section</label>
          <select v-model="invoiceForm.section_id" @change="loadStudents(invoiceForm.section_id)">
            <option value="">-- Select Section --</option>
            <option v-for="s in sections" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Student</label>
          <select v-model="invoiceForm.student_id">
            <option value="">-- Select Student --</option>
            <option v-for="st in students" :key="st.id" :value="st.id">
              {{ st.name }} (Roll: {{ st.roll_no }})
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Fee Type</label>
          <select v-model="invoiceForm.fee_type_id" @change="onInvoiceFeeTypeChange">
            <option value="">-- Select Fee Type --</option>
            <option v-for="ft in feeTypes" :key="ft.id" :value="ft.id">{{ ft.name }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Amount</label>
          <input v-model="invoiceForm.amount" type="number" placeholder="Amount" />
        </div>

        <div class="form-group">
          <label>Due Date</label>
          <input v-model="invoiceForm.due_date" type="date" />
        </div>
      </div>
      <div class="mt-4">
        <button @click="generateInvoice" class="btn save-btn full-width">🚀 Generate Bill</button>
      </div>
    </div>

    <div v-if="activeTab === 'collection'" class="glass-card no-print">
      <div class="card-header">
        <h3>💰 Collect Fees</h3>
      </div>
      <div class="filters">
        <select
          v-model="collectionFilter.class_id"
          @change="loadSections(collectionFilter.class_id)"
        >
          <option value="">Select Class</option>
          <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <select
          v-model="collectionFilter.section_id"
          @change="loadStudents(collectionFilter.section_id)"
        >
          <option value="">Select Section</option>
          <option v-for="s in sections" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
        <select v-model="collectionFilter.student_id">
          <option value="">Select Student</option>
          <option v-for="st in students" :key="st.id" :value="st.id">{{ st.name }}</option>
        </select>
        <button @click="getDues" class="btn search-btn">Search</button>
      </div>

      <div class="table-responsive mt-4" v-if="studentInvoices.length">
        <table class="custom-table">
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
              <td class="text-red">{{ inv.due_amount }}</td>
              <td>
                <span class="badge">{{ inv.status }}</span>
              </td>
              <td>
                <button
                  v-if="inv.status !== 'Paid'"
                  @click="openPaymentModal(inv)"
                  class="btn pay-btn"
                >
                  💳 Pay
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="activeTab === 'history'" class="glass-card no-print">
      <div class="card-header">
        <h3>📜 Payment History</h3>
      </div>
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Student</th>
              <th>Fee Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Print</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inv in allInvoices" :key="inv.id">
              <td>#{{ inv.id }}</td>
              <td>{{ new Date(inv.created_at).toLocaleDateString() }}</td>
              <td>{{ inv.student?.user?.name || 'Unknown' }}</td>
              <td>{{ inv.fee_type?.name }}</td>
              <td>{{ inv.total_amount }}</td>
              <td>
                <span class="badge" :class="inv.status === 'Paid' ? 'bg-green' : 'bg-red'">{{
                  inv.status
                }}</span>
              </td>
              <td>
                <button
                  v-if="inv.status === 'Paid' || inv.status === 'Partial'"
                  @click="printReceipt(inv)"
                  class="btn-icon print"
                >
                  🖨️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="selectedReceipt" class="receipt-container print-only">
      <div class="receipt-header">
        <h2>ABC School & College</h2>
        <p>Dhaka, Bangladesh</p>
        <h3>Money Receipt</h3>
      </div>
      <div class="receipt-body">
        <div class="row">
          <p>
            <strong>Receipt No:</strong> #{{
              selectedReceipt.payments?.[0]?.transaction_id || selectedReceipt.id
            }}
          </p>
          <p><strong>Date:</strong> {{ new Date().toLocaleDateString() }}</p>
        </div>
        <hr />
        <p><strong>Student Name:</strong> {{ selectedReceipt.student?.user?.name }}</p>
        <p><strong>Roll No:</strong> {{ selectedReceipt.student?.roll_no }}</p>
        <p><strong>Class:</strong> {{ selectedReceipt.student?.school_class?.name || 'N/A' }}</p>
        <hr />
        <table class="receipt-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ selectedReceipt.fee_type?.name }}</td>
              <td>{{ selectedReceipt.total_amount }}</td>
            </tr>
            <tr>
              <td class="text-right"><strong>Paid Amount</strong></td>
              <td>
                <strong>{{ selectedReceipt.paid_amount }}</strong>
              </td>
            </tr>
            <tr>
              <td class="text-right">Due</td>
              <td>{{ selectedReceipt.due_amount }}</td>
            </tr>
          </tbody>
        </table>
        <div class="payment-info mt-2">
          <p><strong>Method:</strong> {{ selectedReceipt.payments?.[0]?.method || 'Cash' }}</p>
        </div>
      </div>
      <div class="receipt-footer">
        <div class="signature">
          <p>__________________</p>
          <p>Accounts Officer</p>
        </div>
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

/* Glass Card */
.glass-card {
  background: #1e1e2d;
  border-radius: 12px;
  padding: 25px;
  border: 1px solid #2b2b40;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
}
.card-header h3 {
  margin: 0 0 20px 0;
  color: #3b82f6;
  border-bottom: 1px solid #2b2b40;
  padding-bottom: 10px;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.tabs button {
  padding: 10px 20px;
  border: none;
  background: #2b2b40;
  cursor: pointer;
  border-radius: 8px;
  font-weight: 600;
  color: #a1a5b7;
  transition: 0.3s;
}
.tabs button.active {
  background: #3b82f6;
  color: white;
}
.tabs button:hover {
  background: #323248;
  color: white;
}

/* Form Grid */
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
input,
select {
  width: 100%;
  background: #151521;
  border: 1px solid #2b2b40;
  padding: 12px;
  border-radius: 8px;
  color: white;
  outline: none;
  transition: 0.3s;
}
input:focus,
select:focus {
  border-color: #3b82f6;
}

/* Buttons */
.btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
}
.save-btn {
  background: #3b82f6;
  color: white;
}
.save-btn:hover {
  background: #2563eb;
}
.cancel-btn {
  background: #2b2b40;
  color: #a1a5b7;
}
.cancel-btn:hover {
  background: #323248;
  color: white;
}
.search-btn {
  background: #10b981;
  color: white;
}
.search-btn:hover {
  background: #059669;
}
.pay-btn {
  background: #f59e0b;
  color: white;
  padding: 6px 12px;
  font-size: 12px;
}
.full-width {
  width: 100%;
}

/* Filters */
.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* Table */
.table-responsive {
  overflow-x: auto;
}
.custom-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
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
}
.text-center {
  text-align: center;
}
.text-green {
  color: #10b981;
  font-weight: bold;
}
.text-red {
  color: #ef4444;
  font-weight: bold;
}

/* Badges */
.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
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

/* Action Icons */
.btn-icon {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 2px;
}
.edit {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}
.delete {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}
.print {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

/* Print Styles */
.print-only {
  display: none;
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
    padding: 40px;
    background: white !important;
    color: black !important;
    display: block !important;
  }

  .receipt-header {
    text-align: center;
    margin-bottom: 30px;
    border-bottom: 2px solid black;
    padding-bottom: 10px;
  }
  .receipt-header h2 {
    font-size: 24px;
    margin: 0;
  }
  .receipt-header p {
    margin: 5px 0;
    font-size: 14px;
  }
  .receipt-header h3 {
    margin-top: 10px;
    text-decoration: underline;
  }

  .receipt-body p {
    margin: 5px 0;
    font-size: 14px;
  }
  .row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  hr {
    border-top: 1px solid #000;
    margin: 10px 0;
  }

  .receipt-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  .receipt-table th,
  .receipt-table td {
    border: 1px solid black;
    padding: 8px;
    text-align: left;
  }
  .text-right {
    text-align: right;
  }

  .receipt-footer {
    margin-top: 60px;
    text-align: right;
  }
  .signature p {
    margin: 5px 0;
  }
}
</style>
