<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const activeTab = ref('books') // books | my_books | requests
const books = ref([])
const myIssuedBooks = ref([])
const myRequests = ref([])
const isLoading = ref(false)

const BASE_URL = 'http://127.0.0.1:8000/api'
const token = localStorage.getItem('token')
const config = { headers: { Authorization: `Bearer ${token}` } }

// ১. সব বইয়ের লিস্ট
const fetchBooks = async () => {
  isLoading.value = true
  try {
    const res = await axios.get(`${BASE_URL}/library/books`, config)
    books.value = res.data.data || res.data
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

// ২. আমার ইস্যু করা বই
const fetchMyIssuedBooks = async () => {
  try {
    // ইউজারের প্রোফাইল আইডি বের করা (issued_books টেবিলে student_id চেক করার জন্য)
    const userRes = await axios.get(`${BASE_URL}/profile`, config)
    // ডাটা স্ট্রাকচার অনুযায়ী সঠিক আইডি নেওয়া
    const myStudentId =
      userRes.data.student_profile?.id || userRes.data.data?.student?.id || userRes.data.id

    const res = await axios.get(`${BASE_URL}/library/issued-books`, config)
    const allIssued = res.data.data || res.data

    // ফিল্টার: শুধু আমার বইগুলো
    myIssuedBooks.value = allIssued.filter((item) => item.student_id == myStudentId)
  } catch (e) {
    console.error(e)
  }
}

// ৩. আমার রিকোয়েস্ট স্ট্যাটাস (NEW)
const fetchMyRequests = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/library/my-requests`, config)
    myRequests.value = res.data.data
  } catch (e) {
    console.error(e)
  }
}

// ৪. বইয়ের জন্য রিকোয়েস্ট পাঠানো (NEW)
const requestBook = async (book) => {
  const confirm = await Swal.fire({
    title: 'Request Book?',
    text: `Do you want to request "${book.title}"?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, Request it!',
  })

  if (confirm.isConfirmed) {
    try {
      await axios.post(`${BASE_URL}/library/request`, { book_id: book.id }, config)
      Swal.fire('Sent!', 'Your request has been sent to the librarian.', 'success')
      fetchMyRequests() // রিকোয়েস্ট ট্যাব আপডেট হবে
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to request book', 'error')
    }
  }
}

const getStatusClass = (date, status) => {
  if (status === 'Returned') return 'text-green'
  return new Date(date) < new Date() ? 'text-red' : 'text-yellow'
}

onMounted(() => {
  fetchBooks()
  fetchMyIssuedBooks()
  fetchMyRequests()
})
</script>

<template>
  <div class="page-container">
    <div class="tabs">
      <button :class="{ active: activeTab === 'books' }" @click="activeTab = 'books'">
        📚 Book Catalog
      </button>
      <button :class="{ active: activeTab === 'requests' }" @click="activeTab = 'requests'">
        ⏳ My Requests
      </button>
      <button :class="{ active: activeTab === 'my_books' }" @click="activeTab = 'my_books'">
        🎓 Borrowed Books
      </button>
    </div>

    <div v-if="activeTab === 'books'" class="content">
      <div v-if="isLoading" class="loading">Loading Library...</div>
      <table v-else class="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Category</th>
            <th>Availability</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in books" :key="book.id">
            <td>{{ book.title }}</td>
            <td>{{ book.author }}</td>
            <td>
              <span class="badge">{{ book.category || 'General' }}</span>
            </td>
            <td>
              <span v-if="book.quantity > 0" class="badge-stock in"
                >In Stock ({{ book.quantity }})</span
              >
              <span v-else class="badge-stock out">Out of Stock</span>
            </td>
            <td>
              <button v-if="book.quantity > 0" @click="requestBook(book)" class="btn-request">
                ✋ Request
              </button>
              <button v-else disabled class="btn-disabled">🚫 Unavailable</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="activeTab === 'requests'" class="content">
      <div v-if="myRequests.length === 0" class="empty-state">No pending requests found.</div>
      <table v-else class="table">
        <thead>
          <tr>
            <th>Book Title</th>
            <th>Request Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="req in myRequests" :key="req.id">
            <td>{{ req.book?.title }}</td>
            <td>{{ new Date(req.request_date).toLocaleDateString() }}</td>
            <td>
              <span :class="['status-badge', req.status.toLowerCase()]">{{ req.status }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="activeTab === 'my_books'" class="content">
      <div v-if="myIssuedBooks.length === 0" class="empty-state">
        You currently have no borrowed books.
      </div>
      <div v-else class="card-grid">
        <div v-for="item in myIssuedBooks" :key="item.id" class="book-card">
          <h3>📖 {{ item.book?.title }}</h3>
          <p><strong>Issued:</strong> {{ new Date(item.issue_date).toLocaleDateString() }}</p>
          <p><strong>Return By:</strong> {{ new Date(item.return_date).toLocaleDateString() }}</p>
          <div class="status-line">
            Status:
            <span :class="getStatusClass(item.return_date, item.status)">
              {{
                item.status === 'Returned'
                  ? 'Returned'
                  : new Date(item.return_date) < new Date()
                    ? 'Overdue!'
                    : 'Issued'
              }}
            </span>
          </div>
        </div>
      </div>
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
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.tabs button {
  background: #2b2b40;
  color: #aaa;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  flex: 1;
  transition: 0.3s;
}
.tabs button.active {
  background: #3699ff;
  color: white;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: #1e1e2d;
  border-radius: 8px;
  overflow: hidden;
}
.table th,
.table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #333;
}
.table th {
  background: #2b2b40;
  color: #aaa;
}

.badge {
  background: #444;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.badge-stock {
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: bold;
}
.badge-stock.in {
  background: #064e3b;
  color: #34d399;
}
.badge-stock.out {
  background: #7f1d1d;
  color: #f87171;
}

/* Buttons */
.btn-request {
  background: #8b5cf6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;
}
.btn-request:hover {
  background: #7c3aed;
}
.btn-disabled {
  background: #444;
  color: #888;
  border: none;
  padding: 6px 12px;
  border-radius: 5px;
  cursor: not-allowed;
}

/* Status Badges */
.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}
.status-badge.pending {
  background: #f59e0b;
  color: #000;
}
.status-badge.approved {
  background: #10b981;
  color: white;
}
.status-badge.rejected {
  background: #ef4444;
  color: white;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}
.book-card {
  background: #1e1e2d;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #333;
}
.text-red {
  color: #ff5252;
  font-weight: bold;
}
.text-green {
  color: #4caf50;
  font-weight: bold;
}
.text-yellow {
  color: #ffeb3b;
}
.empty-state {
  text-align: center;
  color: #aaa;
  padding: 40px;
}
.loading {
  text-align: center;
  padding: 20px;
  font-size: 18px;
  color: #aaa;
}
</style>
