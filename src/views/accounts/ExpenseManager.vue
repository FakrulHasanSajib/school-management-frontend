<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const expenses = ref([])
const categories = ref([])
const showExpenseModal = ref(false)
const showCategoryModal = ref(false)

const expenseForm = ref({
  expense_category_id: '',
  amount: '',
  expense_date: new Date().toISOString().slice(0, 10),
  description: '',
})

const categoryForm = ref({ name: '', description: '' })

// ১. ডাটা লোড করা
const fetchData = async () => {
  try {
    const token = localStorage.getItem('token')
    const config = { headers: { Authorization: `Bearer ${token}` } }

    // ক্যাটাগরি এবং এক্সপেন্স একসাথে লোড
    const [catRes, expRes] = await Promise.all([
      axios.get('http://127.0.0.1:8000/api/expenses/categories', config),
      axios.get('http://127.0.0.1:8000/api/expenses', config),
    ])

    categories.value = catRes.data.data
    expenses.value = expRes.data.data
  } catch (error) {
    console.error(error)
  }
}

// ২. খরচ সেভ করা
const submitExpense = async () => {
  try {
    const token = localStorage.getItem('token')
    await axios.post('http://127.0.0.1:8000/api/expenses', expenseForm.value, {
      headers: { Authorization: `Bearer ${token}` },
    })

    Swal.fire('Success', 'Expense added successfully', 'success')
    showExpenseModal.value = false
    fetchData() // রিফ্রেশ

    // ফর্ম রিসেট
    expenseForm.value = { expense_category_id: '', amount: '', expense_date: '', description: '' }
  } catch (error) {
    Swal.fire('Error', 'Failed to add expense', 'error')
  }
}

// ৩. ক্যাটাগরি সেভ করা
const submitCategory = async () => {
  try {
    const token = localStorage.getItem('token')
    await axios.post('http://127.0.0.1:8000/api/expenses/categories', categoryForm.value, {
      headers: { Authorization: `Bearer ${token}` },
    })

    Swal.fire('Success', 'Category added!', 'success')
    showCategoryModal.value = false
    fetchData()
    categoryForm.value = { name: '', description: '' }
  } catch (error) {
    Swal.fire('Error', 'Failed to add category', 'error')
  }
}

// ৪. ডিলিট করা
const deleteExpense = async (id) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
  })

  if (result.isConfirmed) {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://127.0.0.1:8000/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      Swal.fire('Deleted!', 'Record has been deleted.', 'success')
      fetchData()
    } catch (error) {
      Swal.fire('Error', 'Failed to delete.', 'error')
    }
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="page-container">
    <div class="header-action">
      <h2 class="page-title">💰 Expense Manager</h2>
      <div class="btn-group">
        <button @click="showCategoryModal = true" class="btn-secondary">➕ New Category</button>
        <button @click="showExpenseModal = true" class="btn-primary">➕ Add Expense</button>
      </div>
    </div>

    <div class="table-card">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="expense in expenses" :key="expense.id">
            <td>{{ new Date(expense.expense_date).toLocaleDateString() }}</td>
            <td>
              <span class="badge">{{ expense.category?.name || 'General' }}</span>
            </td>
            <td>{{ expense.description || '-' }}</td>
            <td class="amount">৳ {{ expense.amount }}</td>
            <td>
              <button @click="deleteExpense(expense.id)" class="delete-btn">🗑️</button>
            </td>
          </tr>
          <tr v-if="expenses.length === 0">
            <td colspan="5" class="text-center">No expenses recorded yet.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showExpenseModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add New Expense</h3>
          <button @click="showExpenseModal = false" class="close-btn">×</button>
        </div>
        <form @submit.prevent="submitExpense" class="modal-body">
          <div class="form-group">
            <label>Expense Date</label>
            <input v-model="expenseForm.expense_date" type="date" required />
          </div>
          <div class="form-group">
            <label>Category</label>
            <select v-model="expenseForm.expense_category_id" required>
              <option value="">Select Category</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Amount (৳)</label>
            <input v-model="expenseForm.amount" type="number" min="1" required />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="expenseForm.description" rows="2"></textarea>
          </div>
          <button type="submit" class="submit-btn">Save Expense</button>
        </form>
      </div>
    </div>

    <div v-if="showCategoryModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add Category</h3>
          <button @click="showCategoryModal = false" class="close-btn">×</button>
        </div>
        <form @submit.prevent="submitCategory" class="modal-body">
          <div class="form-group">
            <label>Category Name</label>
            <input
              v-model="categoryForm.name"
              type="text"
              placeholder="e.g. Electricity Bill"
              required
            />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="categoryForm.description" rows="2"></textarea>
          </div>
          <button type="submit" class="submit-btn">Save Category</button>
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
.header-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-title {
  font-size: 24px;
  border-bottom: 1px solid #444;
  padding-bottom: 10px;
}
.btn-group {
  display: flex;
  gap: 10px;
}
.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}
.btn-secondary {
  background: #4b5563;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

/* Table */
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
}
.custom-table td {
  padding: 15px;
  border-bottom: 1px solid #333;
  color: white;
}
.text-center {
  text-align: center;
  color: #aaa;
  padding: 20px;
}
.amount {
  color: #f87171;
  font-weight: bold;
} /* খরচের টাকা লাল রঙে */
.badge {
  background: #374151;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
}
.delete-btn:hover {
  transform: scale(1.1);
}

/* Modal */
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
  border-radius: 12px;
  padding: 25px;
  color: white;
  border: 1px solid #444;
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
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  background: #1a1a1a;
  border: 1px solid #444;
  color: white;
  border-radius: 6px;
  outline: none;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 15px;
}
.submit-btn:hover {
  opacity: 0.9;
}
</style>
