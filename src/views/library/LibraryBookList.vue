<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const activeTab = ref('books') // books | requests | issued
const books = ref([])
const requests = ref([])
const issuedBooks = ref([])
const students = ref([])
const showAddModal = ref(false)
const showIssueModal = ref(false)

const BASE_URL = 'http://127.0.0.1:8000/api'
const token = localStorage.getItem('token')
const config = { headers: { Authorization: `Bearer ${token}` } }

// Forms
const bookForm = ref({ title: '', author: '', isbn: '', quantity: 1, category: '' })
const issueForm = ref({ book_id: '', book_title: '', student_id: '', return_date: '' })

// ১. ডাটা লোডিং ফাংশন
const fetchBooks = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/library/books`, config)
    books.value = res.data.data || res.data
  } catch (e) {
    console.error(e)
  }
}

const fetchStudents = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/students`, config)
    students.value = res.data.data || res.data
  } catch (e) {
    console.error(e)
  }
}

const fetchRequests = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/library/all-requests`, config)
    requests.value = res.data.data || res.data
  } catch (e) {
    console.error(e)
  }
}

const fetchIssuedBooks = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/library/issued-books`, config)
    issuedBooks.value = res.data.data || res.data
  } catch (e) {
    console.error(e)
  }
}

// ২. বই অ্যাড করা
const submitBook = async () => {
  try {
    await axios.post(`${BASE_URL}/library/books`, bookForm.value, config)
    Swal.fire('Success', 'Book added successfully!', 'success')
    showAddModal.value = false
    bookForm.value = { title: '', author: '', isbn: '', quantity: 1, category: '' }
    fetchBooks()
  } catch (e) {
    Swal.fire('Error', 'Failed to add book.', 'error')
  }
}

// ৩. ম্যানুয়াল ইস্যু মোডাল ওপেন করা
const openManualIssueModal = (book) => {
  issueForm.value.book_id = book.id
  issueForm.value.book_title = book.title
  issueForm.value.student_id = ''
  issueForm.value.return_date = ''
  showIssueModal.value = true
}

// ৪. রিকোয়েস্ট থেকে ইস্যু মোডাল ওপেন করা (Smart Match)
const approveRequest = (req) => {
  issueForm.value.book_id = req.book_id
  issueForm.value.book_title = req.book?.title

  // স্মার্ট স্টুডেন্ট সিলেক্ট লজিক (ID or Name Match)
  let targetStudent = students.value.find((s) => s.user_id == req.user_id)

  if (!targetStudent && req.user?.name) {
    const requestName = req.user.name.toLowerCase().trim()
    targetStudent = students.value.find(
      (s) => (s.user?.name || s.name || '').toLowerCase().trim() === requestName,
    )
  }

  if (targetStudent) {
    issueForm.value.student_id = targetStudent.id
  } else {
    Swal.fire(
      'Warning',
      'Student profile not found via ID or Name. Please select manually.',
      'warning',
    )
    issueForm.value.student_id = ''
  }

  showIssueModal.value = true
}

// ৫. ইস্যু সাবমিট
const submitIssue = async () => {
  if (!issueForm.value.student_id || !issueForm.value.return_date) {
    Swal.fire('Warning', 'Please select a student and return date', 'warning')
    return
  }

  try {
    await axios.post(`${BASE_URL}/library/issue`, issueForm.value, config)
    Swal.fire('Success', 'Book issued successfully!', 'success')
    showIssueModal.value = false

    // সব লিস্ট রিফ্রেশ
    fetchBooks()
    fetchRequests()
    fetchIssuedBooks()
  } catch (e) {
    Swal.fire('Error', e.response?.data?.message || 'Failed to issue book.', 'error')
  }
}

// ৬. বই ফেরত নেওয়া (Return Book)
const returnBook = async (id) => {
  const confirm = await Swal.fire({
    title: 'Return Book?',
    text: 'Mark this book as returned by student?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    confirmButtonText: 'Yes, Return it!',
  })

  if (confirm.isConfirmed) {
    try {
      await axios.post(`${BASE_URL}/library/return/${id}`, {}, config)
      Swal.fire('Returned!', 'Book marked as returned.', 'success')
      fetchIssuedBooks() // আপডেট লিস্ট
      fetchBooks() // স্টক আপডেট
    } catch (e) {
      Swal.fire('Error', 'Failed to return book', 'error')
    }
  }
}

// ৭. রিজেক্ট (Coming Soon)
const rejectRequest = async (id) => {
  Swal.fire('Info', 'Reject feature coming soon', 'info')
}

onMounted(() => {
  fetchBooks()
  fetchStudents()
  fetchRequests()
  fetchIssuedBooks()
})
</script>

<template>
  <div class="page-container">
    <div class="header-action">
      <h2 class="page-title">📚 Library Management</h2>
      <div class="tabs">
        <button :class="{ active: activeTab === 'books' }" @click="activeTab = 'books'">
          📖 Books
        </button>
        <button :class="{ active: activeTab === 'requests' }" @click="activeTab = 'requests'">
          🔔 Requests <span v-if="requests.length" class="badge-count">{{ requests.length }}</span>
        </button>
        <button :class="{ active: activeTab === 'issued' }" @click="activeTab = 'issued'">
          🎓 Issued / Return
        </button>
      </div>
    </div>

    <div v-if="activeTab === 'books'">
      <button @click="showAddModal = true" class="add-btn mb-3">➕ Add New Book</button>
      <div class="table-card">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Stock</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="book in books" :key="book.id">
              <td>
                <strong>{{ book.title }}</strong>
              </td>
              <td>{{ book.author }}</td>
              <td>
                <span :class="['stock-badge', book.quantity > 0 ? 'in-stock' : 'out-stock']">
                  {{ book.quantity }} Available
                </span>
              </td>
              <td>
                <button
                  v-if="book.quantity > 0"
                  @click="openManualIssueModal(book)"
                  class="action-btn issue"
                >
                  🎓 Issue
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="activeTab === 'requests'">
      <div class="table-card">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Requested Book</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in requests" :key="req.id">
              <td>
                {{ req.user?.name || 'Unknown' }}
                <small style="display: block; color: #aaa">User ID: {{ req.user_id }}</small>
              </td>
              <td>{{ req.book?.title }}</td>
              <td>{{ new Date(req.request_date).toLocaleDateString() }}</td>
              <td><span class="badge-status pending">Pending</span></td>
              <td>
                <button @click="approveRequest(req)" class="btn-approve">✅ Approve</button>
                <button @click="rejectRequest(req.id)" class="btn-reject">❌ Reject</button>
              </td>
            </tr>
            <tr v-if="requests.length === 0">
              <td colspan="5" class="text-center">No pending requests.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="activeTab === 'issued'">
      <div class="table-card">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Book Title</th>
              <th>Issued On</th>
              <th>Return Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="issue in issuedBooks" :key="issue.id">
              <td>
                <strong>{{ issue.student?.user?.name || issue.student?.name }}</strong>
                <br /><small style="color: #aaa">Roll: {{ issue.student?.roll_no }}</small>
              </td>
              <td>{{ issue.book?.title }}</td>
              <td>{{ new Date(issue.issue_date).toLocaleDateString() }}</td>
              <td>{{ new Date(issue.return_date).toLocaleDateString() }}</td>
              <td>
                <span v-if="issue.status === 'Returned'" class="badge-status returned"
                  >Returned</span
                >
                <span
                  v-else
                  :class="
                    new Date(issue.return_date) < new Date()
                      ? 'badge-status overdue'
                      : 'badge-status issued'
                  "
                >
                  {{ new Date(issue.return_date) < new Date() ? 'Overdue' : 'Issued' }}
                </span>
              </td>
              <td>
                <button
                  v-if="issue.status !== 'Returned'"
                  @click="returnBook(issue.id)"
                  class="btn-return"
                >
                  ↩ Return
                </button>
                <span v-else class="text-muted">✔ Done</span>
              </td>
            </tr>
            <tr v-if="issuedBooks.length === 0">
              <td colspan="6" class="text-center">No books currently issued.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showAddModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add New Book</h3>
          <button @click="showAddModal = false" class="close-btn">×</button>
        </div>
        <form @submit.prevent="submitBook" class="modal-body">
          <div class="form-group">
            <label>Title</label><input v-model="bookForm.title" required />
          </div>
          <div class="row">
            <div class="form-group">
              <label>Author</label><input v-model="bookForm.author" required />
            </div>
            <div class="form-group">
              <label>ISBN</label><input v-model="bookForm.isbn" required />
            </div>
          </div>
          <div class="row">
            <div class="form-group">
              <label>Category</label><input v-model="bookForm.category" />
            </div>
            <div class="form-group">
              <label>Qty</label><input v-model="bookForm.quantity" type="number" />
            </div>
          </div>
          <button type="submit" class="submit-btn">Save</button>
        </form>
      </div>
    </div>

    <div v-if="showIssueModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Issue: {{ issueForm.book_title }}</h3>
          <button @click="showIssueModal = false" class="close-btn">×</button>
        </div>
        <form @submit.prevent="submitIssue" class="modal-body">
          <div class="form-group">
            <label>Select Student</label>
            <select v-model="issueForm.student_id" required>
              <option value="">Choose Student...</option>
              <option v-for="s in students" :key="s.id" :value="s.id">
                {{ s.user?.name || s.name }} (Roll: {{ s.roll_no }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Return Date</label><input v-model="issueForm.return_date" type="date" required />
          </div>
          <button type="submit" class="submit-btn">Confirm Issue</button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 20px;
  color: white;
  max-width: 1000px;
  margin: 0 auto;
}
.header-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.tabs button {
  background: #2b2b40;
  color: #aaa;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  margin-left: 10px;
  cursor: pointer;
}
.tabs button.active {
  background: #3699ff;
  color: white;
}
.badge-count {
  background: red;
  color: white;
  padding: 2px 6px;
  border-radius: 50%;
  font-size: 10px;
  position: relative;
  top: -8px;
}

.table-card {
  background: #1e1e2d;
  border-radius: 12px;
  overflow: hidden;
}
.custom-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.custom-table th,
.custom-table td {
  padding: 15px;
  border-bottom: 1px solid #333;
}
.custom-table th {
  background: #2b2b40;
  color: #aaa;
}

/* Buttons & Badges */
.btn-approve {
  background: #10b981;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 5px;
}
.btn-reject {
  background: #ef4444;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}
.btn-return {
  background: #f59e0b;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}
.btn-return:hover {
  background: #d97706;
}
.add-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 15px;
}
.action-btn.issue {
  background: #8b5cf6;
  color: white;
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
  border: none;
  font-weight: bold;
}

.badge-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
}
.badge-status.pending {
  background: #f59e0b;
  color: #000;
}
.badge-status.returned {
  background: #064e3b;
  color: #34d399;
}
.badge-status.issued {
  background: #3b82f6;
  color: white;
}
.badge-status.overdue {
  background: #7f1d1d;
  color: #f87171;
}
.stock-badge {
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: bold;
}
.in-stock {
  background: #064e3b;
  color: #34d399;
}
.out-stock {
  background: #7f1d1d;
  color: #f87171;
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
}
.modal-content {
  background: #2e2e2e;
  padding: 25px;
  border-radius: 12px;
  width: 500px;
}
.form-group {
  margin-bottom: 15px;
}
.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  background: #1a1a1a;
  border: 1px solid #444;
  color: white;
  border-radius: 6px;
}
.submit-btn {
  width: 100%;
  padding: 12px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.text-center {
  text-align: center;
  color: #aaa;
  padding: 20px;
}
.text-muted {
  color: #666;
  font-style: italic;
}
</style>
