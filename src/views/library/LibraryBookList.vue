<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const books = ref([])
const students = ref([]) // স্টুডেন্ট লিস্টের জন্য
const isLoading = ref(false)
const showAddModal = ref(false)
const showIssueModal = ref(false)

// বই অ্যাড করার ফর্ম
const bookForm = ref({
  title: '',
  author: '',
  isbn: '',
  quantity: 1,
  category: '',
})

// বই ইস্যু করার ফর্ম
const issueForm = ref({
  book_id: '',
  book_title: '',
  student_id: '',
  return_date: '',
})

// ১. বইয়ের লিস্ট আনা
const fetchBooks = async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get('http://127.0.0.1:8000/api/library/books', {
      headers: { Authorization: `Bearer ${token}` },
    })
    books.value = res.data.data || res.data
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

// ২. স্টুডেন্ট লিস্ট আনা (ড্রপডাউনের জন্য)
const fetchStudents = async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get('http://127.0.0.1:8000/api/students', {
      headers: { Authorization: `Bearer ${token}` },
    })
    students.value = res.data.data || res.data
  } catch (error) {
    console.error('Failed to load students', error)
  }
}

// ৩. নতুন বই অ্যাড করা
const submitBook = async () => {
  try {
    const token = localStorage.getItem('token')
    await axios.post('http://127.0.0.1:8000/api/library/books', bookForm.value, {
      headers: { Authorization: `Bearer ${token}` },
    })

    Swal.fire('Success', 'Book added successfully!', 'success')
    showAddModal.value = false
    bookForm.value = { title: '', author: '', isbn: '', quantity: 1, category: '' }
    fetchBooks()
  } catch (error) {
    Swal.fire('Error', 'Failed to add book.', 'error')
  }
}

// ৪. ইস্যু মোডাল ওপেন করা
const openIssueModal = (book) => {
  issueForm.value.book_id = book.id
  issueForm.value.book_title = book.title
  issueForm.value.student_id = ''
  issueForm.value.return_date = ''
  showIssueModal.value = true
}

// ৫. বই ইস্যু করা
const submitIssue = async () => {
  try {
    const token = localStorage.getItem('token')
    await axios.post('http://127.0.0.1:8000/api/library/issue', issueForm.value, {
      headers: { Authorization: `Bearer ${token}` },
    })

    Swal.fire('Success', 'Book issued successfully!', 'success')
    showIssueModal.value = false
    fetchBooks() // কোয়ান্টিটি আপডেট দেখতে লিস্ট রিফ্রেশ
  } catch (error) {
    Swal.fire('Error', 'Failed to issue book.', 'error')
  }
}

onMounted(() => {
  fetchBooks()
  fetchStudents() // পেজ লোড হলে স্টুডেন্টরাও লোড হবে
})
</script>

<template>
  <div class="page-container">
    <div class="header-action">
      <h2 class="page-title">📚 Library Books</h2>
      <button @click="showAddModal = true" class="add-btn">➕ Add New Book</button>
    </div>

    <div class="table-card">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>ISBN</th>
            <th>Category</th>
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
            <td>{{ book.isbn }}</td>
            <td>
              <span class="badge">{{ book.category }}</span>
            </td>
            <td>
              <span :class="['stock-badge', book.quantity > 0 ? 'in-stock' : 'out-stock']">
                {{ book.quantity }} Available
              </span>
            </td>
            <td>
              <button
                v-if="book.quantity > 0"
                @click="openIssueModal(book)"
                class="action-btn issue"
                title="Issue to Student"
              >
                🎓 Issue
              </button>
              <button class="action-btn edit" title="Edit">✏️</button>
            </td>
          </tr>
          <tr v-if="books.length === 0">
            <td colspan="6" class="text-center">No books found in library.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showAddModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add New Book</h3>
          <button @click="showAddModal = false" class="close-btn">×</button>
        </div>
        <form @submit.prevent="submitBook" class="modal-body">
          <div class="form-group">
            <label>Book Title</label>
            <input v-model="bookForm.title" type="text" required />
          </div>
          <div class="row">
            <div class="form-group">
              <label>Author</label>
              <input v-model="bookForm.author" type="text" required />
            </div>
            <div class="form-group">
              <label>ISBN</label>
              <input v-model="bookForm.isbn" type="text" required />
            </div>
          </div>
          <div class="row">
            <div class="form-group">
              <label>Category</label>
              <select v-model="bookForm.category" required>
                <option value="">Select</option>
                <option value="Science">Science</option>
                <option value="Literature">Literature</option>
                <option value="Math">Mathematics</option>
              </select>
            </div>
            <div class="form-group">
              <label>Quantity</label>
              <input v-model="bookForm.quantity" type="number" min="1" required />
            </div>
          </div>
          <button type="submit" class="submit-btn">Save Book</button>
        </form>
      </div>
    </div>

    <div v-if="showIssueModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Issue Book: {{ issueForm.book_title }}</h3>
          <button @click="showIssueModal = false" class="close-btn">×</button>
        </div>
        <form @submit.prevent="submitIssue" class="modal-body">
          <div class="form-group">
            <label>Select Student</label>
            <select v-model="issueForm.student_id" required>
              <option value="">Choose a Student...</option>
              <option v-for="student in students" :key="student.id" :value="student.id">
                {{ student.roll_no }} - {{ student.name || 'Unknown' }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Return Date</label>
            <input v-model="issueForm.return_date" type="date" required />
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
.add-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 20px;
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

/* Badges */
.badge {
  background: #4b5563;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.stock-badge {
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 12px;
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

.action-btn {
  background: none;
  border: none;
  width: 35px;
  height: 35px;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 5px;
  transition: 0.2s;
}
.action-btn.issue {
  background: #8b5cf6;
  color: white;
  width: auto;
  padding: 0 10px;
  font-size: 13px;
  font-weight: bold;
}
.action-btn.edit {
  background: #374151;
  color: white;
}
.action-btn:hover {
  transform: translateY(-2px);
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
  width: 500px;
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
.form-group select {
  width: 100%;
  padding: 10px;
  background: #1a1a1a;
  border: 1px solid #444;
  color: white;
  border-radius: 6px;
  outline: none;
}
.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
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
