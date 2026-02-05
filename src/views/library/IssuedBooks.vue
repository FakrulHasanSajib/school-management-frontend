<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const issuedList = ref([])
const isLoading = ref(false)

// ১. ইস্যু লিস্ট লোড করা
const fetchIssuedBooks = async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get('http://127.0.0.1:8000/api/library/issued-books', {
      headers: { Authorization: `Bearer ${token}` },
    })
    issuedList.value = res.data.data
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

// ২. বই ফেরত নেওয়া (Return Book)
const returnBook = async (id) => {
  const result = await Swal.fire({
    title: 'Confirm Return?',
    text: 'Mark this book as returned?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, Return it!',
  })

  if (result.isConfirmed) {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `http://127.0.0.1:8000/api/library/return/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      Swal.fire('Returned!', 'Book marked as returned.', 'success')
      fetchIssuedBooks() // লিস্ট রিফ্রেশ
    } catch (error) {
      Swal.fire('Error', 'Failed to return book.', 'error')
    }
  }
}

// দিন বাকি আছে কিনা চেক করা
const getStatus = (returnDate, status) => {
  if (status === 'Returned') return { text: 'Returned', class: 'badge-success' }

  const today = new Date()
  const due = new Date(returnDate)

  if (today > due) return { text: 'Overdue (Late)', class: 'badge-danger' }
  return { text: 'Issued', class: 'badge-warning' }
}

onMounted(() => {
  fetchIssuedBooks()
})
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">📖 Issued Books History</h2>

    <div class="table-card">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Book Title</th>
            <th>Issue Date</th>
            <th>Return Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in issuedList" :key="item.id">
            <td>
              <div class="user-info">
                <strong>{{ item.student?.user?.name || 'Unknown' }}</strong>
                <small>Roll: {{ item.student?.roll_no }}</small>
              </div>
            </td>
            <td>{{ item.book?.title }}</td>
            <td>{{ new Date(item.issue_date).toLocaleDateString() }}</td>
            <td>{{ new Date(item.return_date).toLocaleDateString() }}</td>
            <td>
              <span :class="['badge', getStatus(item.return_date, item.status).class]">
                {{ getStatus(item.return_date, item.status).text }}
              </span>
            </td>
            <td>
              <button
                v-if="item.status !== 'Returned'"
                @click="returnBook(item.id)"
                class="return-btn"
              >
                ↩ Return
              </button>
              <span v-else class="text-muted">✔ Completed</span>
            </td>
          </tr>
          <tr v-if="issuedList.length === 0">
            <td colspan="6" class="text-center">No books issued yet.</td>
          </tr>
        </tbody>
      </table>
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

.user-info {
  display: flex;
  flex-direction: column;
}
.user-info small {
  color: #aaa;
  font-size: 12px;
}

/* Badges */
.badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}
.badge-success {
  background: #064e3b;
  color: #34d399;
} /* Returned */
.badge-warning {
  background: #78350f;
  color: #fcd34d;
} /* Issued */
.badge-danger {
  background: #7f1d1d;
  color: #f87171;
} /* Late */

.return-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: bold;
}
.return-btn:hover {
  background: #2563eb;
}
.text-muted {
  color: #6b7280;
  font-size: 13px;
}
</style>
