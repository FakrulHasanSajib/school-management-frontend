<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const leaves = ref([])
const form = ref({ type: 'Sick Leave', start_date: '', end_date: '', reason: '' })
const isLoading = ref(false)

const BASE_URL = 'http://127.0.0.1:8000/api'
const token = localStorage.getItem('token')
const config = { headers: { Authorization: `Bearer ${token}` } }

// ১. আমার ছুটির হিস্ট্রি
const fetchMyLeaves = async () => {
  try {
    const userRes = await axios.get(`${BASE_URL}/profile`, config)
    const myUserId = userRes.data.data ? userRes.data.data.id : userRes.data.id

    // সব লিভ এনে ফিল্টার করা হচ্ছে (যেহেতু ব্যাকএন্ডে getMyLeaves নেই)
    // দ্রষ্টব্য: এখানে আপনার HRController এর 'getLeaves' রাউট ব্যবহার করা হচ্ছে
    // যদি স্টুডেন্টের জন্য আলাদা রাউট না থাকে, তবে এভাবেই করতে হবে
    const res = await axios.get(`${BASE_URL}/hr/leave`, config) // রুট চেক করে নিবেন (সাধারণত GET /leaves বা /hr/leaves)

    // যদি এই রাউট না থাকে তবে আপনি বলবেন, আমি ঠিক করে দিব।
    // আপাতত ধরে নিচ্ছি আপনার api.php তে resource route আছে।
    const allLeaves = res.data.data || res.data
    leaves.value = allLeaves.filter((l) => l.user_id === myUserId)
  } catch (e) {
    // console.error(e) // API না থাকলে এরর খেতে পারে
  }
}

// ২. ছুটির আবেদন সাবমিট
const submitLeave = async () => {
  if (!form.value.start_date || !form.value.end_date || !form.value.reason) {
    Swal.fire('Error', 'Please fill all fields', 'error')
    return
  }

  try {
    await axios.post(`${BASE_URL}/hr/leave`, form.value, config)
    Swal.fire('Success', 'Leave application submitted!', 'success')
    form.value = { type: 'Sick Leave', start_date: '', end_date: '', reason: '' }
    fetchMyLeaves()
  } catch (e) {
    Swal.fire('Error', 'Failed to submit request', 'error')
  }
}

onMounted(fetchMyLeaves)
</script>

<template>
  <div class="page-container">
    <div class="grid-layout">
      <div class="card form-card">
        <h3>📝 Apply for Leave</h3>
        <div class="form-group">
          <label>Leave Type</label>
          <select v-model="form.type" class="input">
            <option>Sick Leave</option>
            <option>Casual Leave</option>
            <option>Emergency</option>
          </select>
        </div>
        <div class="row">
          <div class="form-group">
            <label>Start Date</label>
            <input v-model="form.start_date" type="date" class="input" />
          </div>
          <div class="form-group">
            <label>End Date</label>
            <input v-model="form.end_date" type="date" class="input" />
          </div>
        </div>
        <div class="form-group">
          <label>Reason</label>
          <textarea
            v-model="form.reason"
            rows="3"
            placeholder="Why do you need leave?"
            class="input"
          ></textarea>
        </div>
        <button @click="submitLeave" class="btn-submit">Submit Application</button>
      </div>

      <div class="card history-card">
        <h3>📂 Application History</h3>
        <div v-if="leaves.length === 0" class="empty-state">No applications found.</div>
        <div v-else class="list">
          <div v-for="leave in leaves" :key="leave.id" class="leave-item">
            <div class="leave-header">
              <span class="type">{{ leave.type }}</span>
              <span :class="['status', leave.status.toLowerCase()]">{{ leave.status }}</span>
            </div>
            <div class="dates">
              {{ new Date(leave.start_date).toLocaleDateString() }} -
              {{ new Date(leave.end_date).toLocaleDateString() }}
            </div>
            <p class="reason">{{ leave.reason }}</p>
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
  max-width: 1000px;
  margin: 0 auto;
}
.grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
@media (max-width: 768px) {
  .grid-layout {
    grid-template-columns: 1fr;
  }
}

.card {
  background: #1e1e2d;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #333;
}
h3 {
  margin-top: 0;
  border-bottom: 1px solid #444;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  font-size: 13px;
  color: #aaa;
  margin-bottom: 5px;
}
.input {
  width: 100%;
  padding: 10px;
  background: #2b2b40;
  border: 1px solid #444;
  color: white;
  border-radius: 6px;
}
.row {
  display: flex;
  gap: 10px;
}

.btn-submit {
  width: 100%;
  padding: 12px;
  background: #3699ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}

/* History List */
.leave-item {
  background: #2b2b40;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
}
.leave-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}
.type {
  font-weight: bold;
  color: #fff;
}
.dates {
  font-size: 12px;
  color: #aaa;
  margin-bottom: 5px;
}
.reason {
  font-size: 13px;
  color: #ccc;
  margin: 0;
}

/* Status Colors */
.status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  text-transform: uppercase;
  font-weight: bold;
}
.status.pending {
  background: #ff9800;
  color: #000;
}
.status.approved {
  background: #4caf50;
  color: #fff;
}
.status.rejected {
  background: #f44336;
  color: #fff;
}
.empty-state {
  text-align: center;
  color: #666;
  padding: 20px;
}
</style>
