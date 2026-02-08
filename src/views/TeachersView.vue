<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const teachers = ref([])
const isLoading = ref(true)
const router = useRouter()

// ১. শিক্ষক তালিকা লোড করা
const fetchTeachers = async () => {
  try {
    isLoading.value = true
    const token = localStorage.getItem('token')
    const response = await axios.get('http://127.0.0.1:8000/api/teachers', {
      headers: { Authorization: `Bearer ${token}` },
    })
    teachers.value = response.data.data || response.data
  } catch (error) {
    if (error.response && error.response.status === 401) {
      Swal.fire({
        icon: 'warning',
        title: 'Session Expired',
        text: 'Please login again.',
        background: '#1e1e2d',
        color: '#fff',
      })
      router.push('/login')
    }
  } finally {
    isLoading.value = false
  }
}

// ২. সুইট অ্যালার্ট দিয়ে ডিলিট করা
const deleteTeacher = async (id) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    background: '#1e1e2d',
    color: '#fff',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, delete it!',
  })

  if (result.isConfirmed) {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://127.0.0.1:8000/api/teachers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      Swal.fire({
        title: 'Deleted!',
        text: 'Teacher has been deleted.',
        icon: 'success',
        background: '#1e1e2d',
        color: '#fff',
      })

      fetchTeachers()
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete teacher.',
        icon: 'error',
        background: '#1e1e2d',
        color: '#fff',
      })
    }
  }
}

onMounted(() => {
  fetchTeachers()
})
</script>

<template>
  <div class="page-container">
    <div class="header-action">
      <div>
        <h2 class="page-title">👨‍🏫 Teacher List</h2>
        <p class="page-subtitle">Manage all teachers from here</p>
      </div>
      <button @click="router.push('/admin/teachers/create')" class="add-btn">
        <span class="icon">➕</span> Add New Teacher
      </button>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading teachers...</p>
    </div>

    <div v-else-if="teachers.length === 0" class="empty-state">
      <div class="empty-content">
        <span class="empty-icon">📂</span>
        <p>No teachers found.</p>
      </div>
    </div>

    <div v-else class="table-card">
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Teacher</th>
              <th>Designation</th>
              <th>Phone</th>
              <th>Blood Group</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="teacher in teachers" :key="teacher.id">
              <td>
                <div class="user-info" @click="router.push(`/admin/teachers/view/${teacher.id}`)">
                  <div class="avatar-wrapper">
                    <img
                      v-if="teacher.teacher_profile?.image"
                      :src="
                        teacher.teacher_profile.image.startsWith('http')
                          ? teacher.teacher_profile.image
                          : `http://127.0.0.1:8000/storage/${teacher.teacher_profile.image}`
                      "
                      class="avatar-img"
                    />
                    <div v-else class="avatar-placeholder">{{ teacher.name.charAt(0) }}</div>
                  </div>
                  <div class="info-text">
                    <span class="user-name">{{ teacher.name }}</span>
                    <small class="user-email">{{ teacher.email }}</small>
                  </div>
                </div>
              </td>

              <td>
                <span class="designation-badge">
                  {{ teacher.teacher_profile?.designation || 'Teacher' }}
                </span>
              </td>

              <td>{{ teacher.teacher_profile?.phone || 'N/A' }}</td>

              <td>
                <span v-if="teacher.teacher_profile?.blood_group" class="blood-badge">
                  {{ teacher.teacher_profile.blood_group }}
                </span>
                <span v-else class="text-muted">-</span>
              </td>

              <td><span class="status-badge active">Active</span></td>

              <td>
                <div class="action-buttons">
                  <button
                    @click="router.push(`/admin/teachers/view/${teacher.id}`)"
                    class="btn-icon view"
                    title="View Profile"
                  >
                    👁️
                  </button>
                  <button
                    @click="router.push(`/admin/teachers/edit/${teacher.id}`)"
                    class="btn-icon edit"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    @click="router.push(`/admin/teachers/id-card/${teacher.id}`)"
                    class="btn-icon id-card"
                    title="ID Card"
                  >
                    🆔
                  </button>
                  <button @click="deleteTeacher(teacher.id)" class="btn-icon delete" title="Delete">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Page Layout */
.page-container {
  padding: 25px;
  color: #fff;
  max-width: 1200px;
  margin: 0 auto;
}
.header-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}
.page-title {
  font-size: 26px;
  font-weight: 700;
  margin: 0;
  color: white;
}
.page-subtitle {
  color: #a1a5b7;
  font-size: 14px;
  margin-top: 5px;
}

/* Add Button */
.add-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: 0.3s;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(59, 130, 246, 0.4);
}

/* Table Card */
.table-card {
  background: #1e1e2d;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #2b2b40;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
.custom-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.custom-table th {
  background: #151521;
  padding: 18px;
  color: #a1a5b7;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #2b2b40;
}
.custom-table td {
  padding: 16px 18px;
  border-bottom: 1px solid #2b2b40;
  color: #e2e8f0;
  vertical-align: middle;
  font-size: 14px;
}
.custom-table tr:last-child td {
  border-bottom: none;
}
.custom-table tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

/* User Info */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}
.avatar-img,
.avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: cover;
}
.avatar-placeholder {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
}
.info-text {
  display: flex;
  flex-direction: column;
}
.user-name {
  font-weight: 600;
  color: white;
  transition: 0.3s;
}
.user-info:hover .user-name {
  color: #3b82f6;
}
.user-email {
  color: #7e8299;
  font-size: 12px;
}

/* Badges */
.designation-badge {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}
.blood-badge {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 12px;
}
.status-badge {
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}
.status-badge.active {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}
.text-muted {
  color: #64748b;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
}
.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.3s;
  font-size: 14px;
}
.btn-icon:hover {
  transform: translateY(-2px);
}
.view {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}
.view:hover {
  background: #10b981;
  color: white;
}
.edit {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}
.edit:hover {
  background: #3b82f6;
  color: white;
}
.id-card {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}
.id-card:hover {
  background: #8b5cf6;
  color: white;
}
.delete {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
.delete:hover {
  background: #ef4444;
  color: white;
}

/* Loading & Empty State */
.loading-state,
.empty-state {
  text-align: center;
  padding: 50px;
  color: #a1a5b7;
}
.spinner {
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.empty-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 10px;
  opacity: 0.5;
}
</style>
