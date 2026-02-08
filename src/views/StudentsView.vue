<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()
const students = ref([])
const classes = ref([])
const sections = ref([])
const isLoading = ref(true)

// সার্চ এবং ফিল্টার ভেরিয়েবল
const searchQuery = ref('')
const selectedClass = ref('')
const selectedSection = ref('')

// ১. স্টুডেন্ট লিস্ট লোড
const fetchStudents = async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('http://127.0.0.1:8000/api/students', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        search: searchQuery.value,
        class_id: selectedClass.value,
        section_id: selectedSection.value,
      },
    })
    students.value = response.data.data || response.data
  } catch (error) {
    console.error('Error fetching students:', error)
  } finally {
    isLoading.value = false
  }
}

// ২. ফিল্টার অপশন লোড
const fetchFilters = async () => {
  try {
    const token = localStorage.getItem('token')
    const config = { headers: { Authorization: `Bearer ${token}` } }

    const [classRes, sectionRes] = await Promise.all([
      axios.get('http://127.0.0.1:8000/api/academic/classes', config),
      axios.get('http://127.0.0.1:8000/api/academic/sections', config),
    ])

    classes.value = classRes.data.data
    sections.value = sectionRes.data.data
  } catch (error) {
    console.error('Error fetching filters:', error)
  }
}

// ৩. রিসেট ফিল্টার
const resetFilters = () => {
  searchQuery.value = ''
  selectedClass.value = ''
  selectedSection.value = ''
  fetchStudents()
}

// ৪. ডিলিট ফাংশন
const deleteStudent = async (id) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, delete it!',
  })

  if (result.isConfirmed) {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://127.0.0.1:8000/api/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      Swal.fire('Deleted!', 'Student has been deleted.', 'success')
      fetchStudents()
    } catch (error) {
      Swal.fire('Error', 'Failed to delete student.', 'error')
    }
  }
}

watch([searchQuery, selectedClass, selectedSection], () => {
  fetchStudents()
})

onMounted(() => {
  fetchStudents()
  fetchFilters()
})
</script>

<template>
  <div class="page-container">
    <div class="header-action">
      <div>
        <h2 class="page-title">👨‍🎓 Student List</h2>
        <p class="page-subtitle">Manage all students from here</p>
      </div>
      <button @click="router.push('/admin/students/create')" class="add-btn">
        <span class="icon">➕</span> Add New Student
      </button>
    </div>

    <div class="filter-card">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by Name or ID..."
          class="search-input"
        />
      </div>

      <div class="filters">
        <select v-model="selectedClass" class="filter-select">
          <option value="">All Classes</option>
          <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
        </select>

        <select v-model="selectedSection" class="filter-select">
          <option value="">All Sections</option>
          <option v-for="sec in sections" :key="sec.id" :value="sec.id">{{ sec.name }}</option>
        </select>

        <button @click="resetFilters" class="reset-btn" title="Reset Filters">🔄 Reset</button>
      </div>
    </div>

    <div class="table-card">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading student data...</p>
      </div>

      <div v-else class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>ID No</th>
              <th>Student Name</th>
              <th>Class Info</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in students" :key="student.id">
              <td class="id-col">#{{ student.admission_no }}</td>

              <td>
                <div class="user-info" @click="router.push(`/admin/students/view/${student.id}`)">
                  <div class="avatar-wrapper">
                    <img
                      v-if="student.image"
                      :src="student.image"
                      class="avatar-img"
                      alt="Student"
                    />
                    <div v-else class="avatar-placeholder">
                      {{ student.name?.charAt(0) || 'S' }}
                    </div>
                  </div>
                  <div class="info-text">
                    <span class="user-name">{{ student.name }}</span>
                    <small class="user-email">{{ student.email || 'No Email' }}</small>
                  </div>
                </div>
              </td>

              <td>
                <div class="class-badge">
                  <span class="cls">{{ student.class }}</span>
                  <span class="sec">{{ student.section }}</span>
                </div>
              </td>

              <td>{{ student.phone || 'N/A' }}</td>

              <td>
                <span class="status-badge active">Active</span>
              </td>

              <td>
                <div class="action-buttons">
                  <button
                    @click="router.push(`/admin/students/edit/${student.id}`)"
                    class="btn-icon edit"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    @click="router.push(`/admin/students/id-card/${student.id}`)"
                    class="btn-icon view"
                    title="ID Card"
                  >
                    🆔
                  </button>
                  <button @click="deleteStudent(student.id)" class="btn-icon delete" title="Delete">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!isLoading && students.length === 0">
              <td colspan="6" class="empty-state">
                <div class="empty-content">
                  <span class="empty-icon">📂</span>
                  <p>No students found matching your search.</p>
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
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(59, 130, 246, 0.4);
}

/* Filter Card */
.filter-card {
  background: #1e1e2d;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 25px;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
  border: 1px solid #2b2b40;
}

.search-box {
  flex: 1;
  position: relative;
  min-width: 250px;
}
.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #a1a5b7;
}
.search-input {
  width: 100%;
  padding: 12px 12px 12px 45px;
  background: #151521;
  border: 1px solid #2b2b40;
  border-radius: 8px;
  color: white;
  outline: none;
  font-size: 14px;
  transition: border-color 0.3s;
}
.search-input:focus {
  border-color: #3b82f6;
}

.filters {
  display: flex;
  gap: 12px;
}
.filter-select {
  padding: 12px 15px;
  background: #151521;
  border: 1px solid #2b2b40;
  border-radius: 8px;
  color: #a1a5b7;
  outline: none;
  cursor: pointer;
}
.reset-btn {
  padding: 12px 20px;
  background: #2b2b40;
  color: #a1a5b7;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s;
  font-weight: 500;
}
.reset-btn:hover {
  background: #323248;
  color: white;
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
.avatar-wrapper {
  position: relative;
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
.class-badge {
  display: inline-flex;
  align-items: center;
  background: #2b2b40;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #323248;
}
.cls {
  padding: 4px 10px;
  font-weight: bold;
  color: #e2e8f0;
}
.sec {
  background: #323248;
  padding: 4px 10px;
  color: #a1a5b7;
  font-size: 12px;
  border-left: 1px solid #2b2b40;
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

.id-col {
  font-family: 'Courier New', monospace;
  color: #a1a5b7;
  font-weight: bold;
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
.edit {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}
.edit:hover {
  background: #3b82f6;
  color: white;
}
.view {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}
.view:hover {
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
