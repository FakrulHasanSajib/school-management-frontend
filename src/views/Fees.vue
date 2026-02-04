<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const BASE_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000/api'
    : '/api'
const token = localStorage.getItem('token')
const apiConfig = { headers: { Authorization: `Bearer ${token}` } }

// Tabs
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
const isEditing = ref(false) // ✅ এডিট মোড ট্র্যাকার
const editId = ref(null) // ✅ কোন ফি এডিট হচ্ছে তার আইডি

const invoiceForm = ref({
  class_id: '',
  section_id: '',
  student_id: '',
  fee_type_id: '',
  due_date: '',
})
const collectionFilter = ref({ class_id: '', section_id: '', student_id: '' })
const paymentForm = ref({ invoice_id: null, amount: '', method: 'Cash' })

// ডাটা লোড
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

// ✅ ফি তৈরি অথবা আপডেট করার ফাংশন
const saveFeeType = async () => {
  if (!newFeeType.value.name || !newFeeType.value.amount) {
    Swal.fire('Warning', 'Name and Amount are required', 'warning')
    return
  }

  try {
    if (isEditing.value) {
      // আপডেট রিকোয়েস্ট (PUT)
      await axios.put(`${BASE_URL}/accounts/fee-types/${editId.value}`, newFeeType.value, apiConfig)
      Swal.fire('Updated!', 'Fee type updated successfully.', 'success')
    } else {
      // নতুন তৈরি রিকোয়েস্ট (POST)
      await axios.post(`${BASE_URL}/accounts/fee-types`, newFeeType.value, apiConfig)
      Swal.fire('Created!', 'Fee type created successfully.', 'success')
    }

    cancelEdit() // ফর্ম রিসেট
    loadInitialData() // লিস্ট রিফ্রেশ
  } catch (e) {
    Swal.fire('Error', 'Operation failed', 'error')
  }
}

// ✅ এডিট মোড চালু করা
const editFeeType = (fee) => {
  newFeeType.value = {
    name: fee.name,
    amount: fee.amount,
    due_date: fee.due_date || '',
  }
  editId.value = fee.id
  isEditing.value = true
}

// ✅ এডিট বাতিল করা
const cancelEdit = () => {
  newFeeType.value = { name: '', amount: '', due_date: '' }
  isEditing.value = false
  editId.value = null
}

// ✅ ফি ডিলিট করা
const deleteFeeType = async (id) => {
  const confirm = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
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

const generateInvoice = async () => {
  try {
    await axios.post(`${BASE_URL}/accounts/invoices`, invoiceForm.value, apiConfig)
    Swal.fire('Success', 'Invoice generated!', 'success')
  } catch (e) {
    Swal.fire('Error', 'Failed', 'error')
  }
}

const getDues = async () => {
  if (!collectionFilter.value.student_id) return
  try {
    const res = await axios.get(
      `${BASE_URL}/accounts/student/${collectionFilter.value.student_id}/invoices`,
      apiConfig,
    )
    studentInvoices.value = res.data.data
  } catch (e) {
    console.error(e)
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
      `<input id="swal-amount" class="swal2-input" value="${paymentForm.value.amount}">` +
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
      Swal.fire('Paid!', 'Success', 'success')
      getDues()
    } catch (e) {
      Swal.fire('Error', e.response.data.message, 'error')
    }
  }
}

const loadHistory = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/accounts/history`, apiConfig)
    allInvoices.value = res.data.data
  } catch (e) {
    console.error(e)
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

    <div v-if="activeTab === 'setup'" class="card no-print">
      <h3>{{ isEditing ? 'Edit Fee Type' : 'Add New Fee Type' }}</h3>

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

        <div
          class="form-group button-group"
          style="display: flex; align-items: flex-end; gap: 10px"
        >
          <button
            @click="saveFeeType"
            :class="isEditing ? 'btn-update' : 'btn-save'"
            style="flex: 1"
          >
            {{ isEditing ? 'Update Fee' : 'Save Fee' }}
          </button>
          <button v-if="isEditing" @click="cancelEdit" class="btn-cancel" style="flex: 1">
            Cancel
          </button>
        </div>
      </div>

      <table class="table mt-4">
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
              <button @click="editFeeType(ft)" class="btn-icon btn-edit" title="Edit">✏️</button>
              <button @click="deleteFeeType(ft.id)" class="btn-icon btn-delete" title="Delete">
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="activeTab === 'invoice'" class="card no-print">
      <h3>Generate Invoice</h3>
      <div class="form-grid">
        <select v-model="invoiceForm.class_id" @change="loadSections(invoiceForm.class_id)">
          <option value="">Class</option>
          <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <select v-model="invoiceForm.section_id" @change="loadStudents(invoiceForm.section_id)">
          <option value="">Section</option>
          <option v-for="s in sections" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
        <select v-model="invoiceForm.student_id">
          <option value="">Student</option>
          <option v-for="st in students" :key="st.id" :value="st.id">{{ st.name }}</option>
        </select>
        <select v-model="invoiceForm.fee_type_id">
          <option value="">Fee Type</option>
          <option v-for="ft in feeTypes" :key="ft.id" :value="ft.id">{{ ft.name }}</option>
        </select>
        <input v-model="invoiceForm.due_date" type="date" placeholder="Due Date" />
        <button @click="generateInvoice" class="btn-save">Generate</button>
      </div>
    </div>

    <div v-if="activeTab === 'collection'" class="card no-print">
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
        <button @click="getDues" class="btn-search">Search</button>
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
            <td class="text-red">{{ inv.due_amount }}</td>
            <td>{{ inv.status }}</td>
            <td>
              <button v-if="inv.status !== 'Paid'" @click="openPaymentModal(inv)" class="btn-pay">
                Pay
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="activeTab === 'history'" class="card no-print">
      <h3>📜 Payment History</h3>
      <div class="table-responsive">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Roll</th>
              <th>Fee Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Print</th>
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
                <span class="badge" :class="inv.status === 'Paid' ? 'bg-green' : 'bg-red'">{{
                  inv.status
                }}</span>
              </td>
              <td>
                <button
                  v-if="inv.status === 'Paid' || inv.status === 'Partial'"
                  @click="printReceipt(inv)"
                  class="btn-print"
                >
                  🖨️ Receipt
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
        <p><strong>Student ID / Roll:</strong> {{ selectedReceipt.student?.roll_no }}</p>
        <p>
          <strong>Class:</strong> {{ selectedReceipt.student?.class_id }} (Section:
          {{ selectedReceipt.student?.section_id }})
        </p>
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
          <p>
            <strong>Payment Method:</strong> {{ selectedReceipt.payments?.[0]?.method || 'Cash' }}
          </p>
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
/* Common Card Styles */
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

/* Form Styles */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
  align-items: flex-start;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.form-group label {
  font-size: 14px;
  font-weight: bold;
  color: #555;
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

/* Buttons */
.btn-save {
  background: #2563eb !important;
  color: white !important;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.btn-update {
  background: #d97706 !important;
  color: white !important;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.btn-cancel {
  background: #6b7280 !important;
  color: white !important;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.btn-search,
.btn-print {
  background: #333 !important;
  color: white !important;
  padding: 5px 15px;
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

/* Action Buttons */
.btn-icon {
  border: none;
  background: none;
  font-size: 18px;
  cursor: pointer;
  margin: 0 5px;
  transition: transform 0.2s;
}
.btn-icon:hover {
  transform: scale(1.2);
}
.btn-edit {
  color: #d97706;
}
.btn-delete {
  color: #dc2626;
}

/* Table */
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
.text-center {
  text-align: center !important;
}

/* Status Colors */
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

/* Print Styles */
@media screen {
  .print-only {
    display: none;
  }
}
@media print {
  body * {
    visibility: hidden;
  }
  .print-only,
  .print-only * {
    visibility: visible;
  }
  .no-print {
    display: none !important;
  }
  .print-only {
    display: block !important;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    padding: 20px;
    border: 1px solid #000;
  }
  .receipt-header {
    text-align: center;
    margin-bottom: 20px;
  }
  .receipt-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }
  .receipt-table th,
  .receipt-table td {
    border: 1px solid #000;
    padding: 8px;
  }
  .text-right {
    text-align: right;
  }
  .receipt-footer {
    margin-top: 50px;
    text-align: right;
  }
}
</style>
