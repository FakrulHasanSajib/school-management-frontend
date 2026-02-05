<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const leaves = ref([])
const loading = ref(false)

// ১. ছুটির রিকোয়েস্টগুলো লোড করা
const fetchLeaves = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get('http://127.0.0.1:8000/api/hr/leaves', {
      headers: { Authorization: `Bearer ${token}` },
    })
    // ব্যাকএন্ড থেকে আসা ডাটা সেট করা
    leaves.value = res.data.data || []
  } catch (error) {
    console.error('Fetch error:', error)
  } finally {
    loading.value = false
  }
}

// ২. ছুটির স্ট্যাটাস আপডেট করা (Approve/Reject)
const updateStatus = async (id, status) => {
  try {
    const token = localStorage.getItem('token')
    // API Route: /hr/leave/{id}/status
    await axios.patch(
      `http://127.0.0.1:8000/api/hr/leave/${id}/status`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
    Swal.fire('Success', `Leave request has been ${status}`, 'success')
    fetchLeaves() // লিস্ট রিফ্রেশ করা
  } catch (error) {
    Swal.fire('Error', 'Failed to update leave status', 'error')
  }
}

onMounted(() => {
  fetchLeaves()
})
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">📅 Leave Requests Management</h2>

    <div class="table-card">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Applicant Name</th>
            <th>Leave Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="text-center">Loading data...</td>
          </tr>

          <tr v-for="l in leaves" :key="l.id">
            <td>
              <div class="user-info">
                <strong>{{ l.user?.name || 'Unknown User' }}</strong>
                <small>{{ l.user?.email || '' }}</small>
              </div>
            </td>
            <td>
              <span class="type-badge">{{ l.type }}</span>
            </td>
            <td>{{ l.start_date }}</td>
            <td>{{ l.end_date }}</td>
            <td>
              <span :class="['badge', l.status.toLowerCase()]">{{ l.status }}</span>
            </td>
            <td>
              <div v-if="l.status === 'Pending'" class="action-buttons">
                <button @click="updateStatus(l.id, 'Approved')" class="btn-approve" title="Approve">
                  ✔
                </button>
                <button @click="updateStatus(l.id, 'Rejected')" class="btn-reject" title="Reject">
                  ✖
                </button>
              </div>
              <span v-else class="status-done">Processed</span>
            </td>
          </tr>

          <tr v-if="!loading && leaves.length === 0">
            <td colspan="6" class="text-center">No leave requests found.</td>
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
  max-width: 1100px;
  margin: 0 auto;
}
.page-title {
  margin-bottom: 25px;
  font-size: 24px;
  border-bottom: 1px solid #333;
  padding-bottom: 15px;
}

/* Table Card Styles */
.table-card {
  background: #1e1e2d;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #2b2b40;
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
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
}
.custom-table td {
  padding: 15px;
  border-bottom: 1px solid #2b2b40;
  vertical-align: middle;
}

/* User Info */
.user-info {
  display: flex;
  flex-direction: column;
}
.user-info small {
  color: #6c7293;
  font-size: 11px;
}

/* Badges */
.type-badge {
  background: #2f2f45;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.badge {
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
}
.badge.pending {
  background: rgba(255, 184, 34, 0.1);
  color: #ffb822;
}
.badge.approved {
  background: rgba(28, 209, 107, 0.1);
  color: #1cd16b;
}
.badge.rejected {
  background: rgba(246, 78, 96, 0.1);
  color: #f64e60;
}

/* Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
}
.btn-approve,
.btn-reject {
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.3s;
}
.btn-approve {
  background: #1cd16b;
  color: white;
}
.btn-reject {
  background: #f64e60;
  color: white;
}
.btn-approve:hover,
.btn-reject:hover {
  opacity: 0.8;
  transform: translateY(-2px);
}

.status-done {
  color: #6c7293;
  font-size: 12px;
  font-style: italic;
}
.text-center {
  text-align: center;
  color: #6c7293;
  padding: 30px !important;
}
</style>
