<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const notices = ref([])
const loading = ref(false)
const showModal = ref(false) // ✅ মোডাল কন্ট্রোল করার জন্য

// নোটিশ ফর্মের ডাটা
const form = ref({
  title: '',
  content: '',
  published_at: new Date().toISOString().slice(0, 10),
  recipient_type: 'all',
})

// ১. নোটিশ লিস্ট লোড করা
const fetchNotices = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get('http://127.0.0.1:8000/api/notices', {
      headers: { Authorization: `Bearer ${token}` },
    })
    // তোমার কন্ট্রোলার সরাসরি লিস্ট রিটার্ন করে
    notices.value = res.data
  } catch (error) {
    console.error('Fetch error:', error)
  } finally {
    loading.value = false
  }
}

// ২. নতুন নোটিশ সেভ করা
const submitNotice = async () => {
  try {
    const token = localStorage.getItem('token')
    // API Route: POST /api/notices
    await axios.post('http://127.0.0.1:8000/api/notices', form.value, {
      headers: { Authorization: `Bearer ${token}` },
    })

    Swal.fire('Success', 'Notice Published Successfully!', 'success')
    showModal.value = false // মোডাল বন্ধ করা
    fetchNotices() // লিস্ট আপডেট করা

    // ফর্ম রিসেট
    form.value = {
      title: '',
      content: '',
      published_at: new Date().toISOString().slice(0, 10),
      recipient_type: 'all',
    }
  } catch (error) {
    Swal.fire('Error', 'Failed to publish notice', 'error')
  }
}

onMounted(() => {
  fetchNotices()
})
</script>

<template>
  <div class="page-container">
    <div class="header-action">
      <h2 class="page-title">📢 Notice Board Management</h2>
      <button @click="showModal = true" class="add-btn">➕ New Notice</button>
    </div>

    <div class="notice-grid">
      <div v-if="loading" class="text-center">Loading notices...</div>

      <div v-for="n in notices" :key="n.id" class="notice-card">
        <div class="notice-meta">
          <span>📅 {{ n.published_at }}</span>
          <span class="badge">{{ n.recipient_type }}</span>
        </div>
        <h3>{{ n.title }}</h3>
        <p>{{ n.content }}</p>
      </div>

      <div v-if="!loading && notices.length === 0" class="text-center">No notices found.</div>
    </div>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Publish New Notice</h3>
          <button @click="showModal = false" class="close-btn">×</button>
        </div>

        <form @submit.prevent="submitNotice" class="modal-body">
          <div class="form-group">
            <label>Notice Title</label>
            <input v-model="form.title" type="text" placeholder="Enter title" required />
          </div>

          <div class="form-group">
            <label>Recipient Type</label>
            <select v-model="form.recipient_type" required>
              <option value="all">Everyone</option>
              <option value="student">Students Only</option>
              <option value="teacher">Teachers Only</option>
            </select>
          </div>

          <div class="form-group">
            <label>Published Date</label>
            <input v-model="form.published_at" type="date" required />
          </div>

          <div class="form-group">
            <label>Notice Content</label>
            <textarea
              v-model="form.content"
              rows="5"
              placeholder="Write notice details here..."
              required
            ></textarea>
          </div>

          <button type="submit" class="submit-btn">🚀 Publish Notice</button>
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
  margin-bottom: 25px;
}
.add-btn {
  background: #3699ff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

/* Notice Card */
.notice-grid {
  display: grid;
  gap: 20px;
}
.notice-card {
  background: #1e1e2d;
  padding: 20px;
  border-radius: 12px;
  border-left: 5px solid #3699ff;
  border: 1px solid #2b2b40;
}
.notice-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 12px;
  color: #a1a5b7;
}
.badge {
  background: #2b2b40;
  padding: 4px 10px;
  border-radius: 6px;
  text-transform: uppercase;
  color: #3699ff;
  font-weight: bold;
}
h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}
p {
  color: #b5b5c3;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}
.modal-content {
  background: #1e1e2d;
  width: 500px;
  padding: 30px;
  border-radius: 15px;
  border: 1px solid #333;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
}
.close-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 30px;
  cursor: pointer;
}

.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #a1a5b7;
}
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  background: #151521;
  border: 1px solid #2b2b40;
  color: white;
  border-radius: 8px;
  outline: none;
}

.submit-btn {
  width: 100%;
  background: #3699ff;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
}
.text-center {
  text-align: center;
  color: #555;
  padding: 40px;
}
</style>
