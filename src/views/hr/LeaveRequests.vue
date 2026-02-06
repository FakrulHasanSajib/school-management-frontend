<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const leaves = ref([])
const isLoading = ref(false)

const BASE_URL = 'http://127.0.0.1:8000/api'
const token = localStorage.getItem('token')
const config = { headers: { Authorization: `Bearer ${token}` } }

// ১. সব ছুটির আবেদন লোড করা
const fetchLeaves = async () => {
  isLoading.value = true
  try {
    // 🔴 আগে এখানে ভুল ছিল: /hr/leaves
    // ✅ সঠিক রাউট: /hr/leave
    const res = await axios.get(`${BASE_URL}/hr/leave`, config)
    leaves.value = res.data.data || res.data
  } catch (error) {
    console.error('Fetch error:', error)
    Swal.fire('Error', 'Failed to load leave requests', 'error')
  } finally {
    isLoading.value = false
  }
}

// ২. স্ট্যাটাস আপডেট করা (Approve/Reject)
const updateStatus = async (id, status) => {
  const actionText = status === 'Approved' ? 'Approve' : 'Reject'

  const confirm = await Swal.fire({
    title: `${actionText} Request?`,
    text: `Are you sure you want to ${actionText.toLowerCase()} this application?`,
    icon: status === 'Approved' ? 'question' : 'warning',
    showCancelButton: true,
    confirmButtonColor: status === 'Approved' ? '#10b981' : '#ef4444',
    confirmButtonText: `Yes, ${actionText} it!`,
  })

  if (confirm.isConfirmed) {
    try {
      await axios.patch(`${BASE_URL}/hr/leave/${id}/status`, { status }, config)

      Swal.fire('Updated!', `Leave request has been ${status.toLowerCase()}.`, 'success')
      fetchLeaves() // লিস্ট রিফ্রেশ
    } catch (error) {
      Swal.fire('Error', 'Failed to update status', 'error')
    }
  }
}

onMounted(() => {
  fetchLeaves()
})
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">📝 Leave Applications</h2>

    <div class="table-card">
      <div v-if="isLoading" class="loading">Loading requests...</div>

      <table v-else class="custom-table">
        <thead>
          <tr>
            <th>Applicant</th>
            <th>Type</th>
            <th>Duration</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="leave in leaves" :key="leave.id">
            <td>
              <strong>{{ leave.user?.name || 'Unknown' }}</strong>
              <small style="display: block; color: #aaa">ID: {{ leave.user_id }}</small>
            </td>
            <td>
              <span class="badge">{{ leave.type }}</span>
            </td>
            <td>
              {{ new Date(leave.start_date).toLocaleDateString() }}
              <br />to<br />
              {{ new Date(leave.end_date).toLocaleDateString() }}
            </td>
            <td class="reason-cell" :title="leave.reason">{{ leave.reason }}</td>
            <td>
              <span :class="['status-badge', leave.status.toLowerCase()]">
                {{ leave.status }}
              </span>
            </td>
            <td>
              <div v-if="leave.status === 'Pending'" class="action-buttons">
                <button
                  @click="updateStatus(leave.id, 'Approved')"
                  class="btn-approve"
                  title="Approve"
                >
                  ✅
                </button>
                <button
                  @click="updateStatus(leave.id, 'Rejected')"
                  class="btn-reject"
                  title="Reject"
                >
                  ❌
                </button>
              </div>
              <span v-else class="text-muted">Completed</span>
            </td>
          </tr>
          <tr v-if="leaves.length === 0">
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
  color: white;
  max-width: 1000px;
  margin: 0 auto;
}
.page-title {
  margin-bottom: 20px;
  font-size: 24px;
  border-bottom: 1px solid #444;
  padding-bottom: 10px;
}

/* Table Styles */
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
.custom-table th,
.custom-table td {
  padding: 15px;
  border-bottom: 1px solid #333;
}
.custom-table th {
  background: #2b2b40;
  color: #a1a5b7;
}

.reason-cell {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #ccc;
}
.loading,
.text-center {
  text-align: center;
  padding: 30px;
  color: #aaa;
}

/* Badges */
.badge {
  background: #4b5563;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.status-badge {
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 11px;
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

/* Buttons */
.action-buttons {
  display: flex;
  gap: 10px;
}
.btn-approve,
.btn-reject {
  border: none;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: 0.2s;
}
.btn-approve {
  background: #064e3b;
  color: #34d399;
}
.btn-approve:hover {
  background: #065f46;
  transform: scale(1.1);
}
.btn-reject {
  background: #7f1d1d;
  color: #f87171;
}
.btn-reject:hover {
  background: #991b1b;
  transform: scale(1.1);
}

.text-muted {
  color: #6b7280;
  font-size: 13px;
  font-style: italic;
}
</style>
