<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const activeTab = ref('books') // books | my_books
const books = ref([])
const myIssuedBooks = ref([])
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

// ২. আমার ইস্যু করা বই (Filter logic added)
const fetchMyIssuedBooks = async () => {
  isLoading.value = true
  try {
    // প্রথমে নিজের প্রোফাইল এনে স্টুডেন্ট আইডি বের করা হচ্ছে
    const userRes = await axios.get(`${BASE_URL}/profile`, config)
    const myStudentId = userRes.data.student_profile?.id || userRes.data.data?.student?.id

    // সব ইস্যু লিস্ট এনে ফিল্টার করা হচ্ছে
    const res = await axios.get(`${BASE_URL}/library/issued-books`, config)
    const allIssued = res.data.data || res.data

    // শুধু নিজের বইগুলো ফিল্টার
    myIssuedBooks.value = allIssued.filter((item) => item.student_id === myStudentId)
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

const getStatusClass = (date, status) => {
  if (status === 'Returned') return 'text-green'
  return new Date(date) < new Date() ? 'text-red' : 'text-yellow'
}

onMounted(() => {
  fetchBooks()
  fetchMyIssuedBooks()
})
</script>

<template>
  <div class="page-container">
    <div class="tabs">
      <button :class="{ active: activeTab === 'books' }" @click="activeTab = 'books'">
        📚 Book Catalog
      </button>
      <button :class="{ active: activeTab === 'my_books' }" @click="activeTab = 'my_books'">
        🎓 My Issued Books
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
            <th>Status</th>
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
              <span v-if="book.quantity > 0" class="badge-stock in">Available</span>
              <span v-else class="badge-stock out">Out of Stock</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="activeTab === 'my_books'" class="content">
      <div v-if="myIssuedBooks.length === 0" class="empty-state">
        You haven't borrowed any books yet.
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
}
.tabs button {
  background: #2b2b40;
  color: #aaa;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
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
</style>
