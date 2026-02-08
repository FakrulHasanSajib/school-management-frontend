<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()
const routines = ref([])
const isLoading = ref(true)

// ফিল্টার ভেরিয়েবল
const classes = ref([])
const sections = ref([])
const selectedClass = ref('')
const selectedSection = ref('')

// স্কুলের তথ্য (প্রিন্টের জন্য)
const schoolName = 'Software IT School & College'
const schoolAddress = 'Mirpur-10, Dhaka-1216'
const schoolLogo = 'https://cdn-icons-png.flaticon.com/512/2965/2965300.png'

// প্রিন্টের সময় ক্লাসের নাম দেখানোর জন্য
const getSelectedClassName = computed(() => {
  const cls = classes.value.find((c) => c.id === selectedClass.value)
  return cls ? cls.name : 'All Classes'
})

// প্রিন্টের সময় সেকশনের নাম দেখানোর জন্য
const getSelectedSectionName = computed(() => {
  const sec = sections.value.find((s) => s.id === selectedSection.value)
  return sec ? sec.name : 'All Sections'
})

// ডাটা লোড
const fetchFilters = async () => {
  try {
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }
    const [classRes, sectionRes] = await Promise.all([
      axios.get('http://127.0.0.1:8000/api/academic/classes', { headers }),
      axios.get('http://127.0.0.1:8000/api/academic/sections', { headers }),
    ])
    classes.value = classRes.data.data
    sections.value = sectionRes.data.data
  } catch (error) {
    console.error('Filter error', error)
  }
}

const fetchRoutines = async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('token')
    const params = {}
    if (selectedClass.value) params.class_id = selectedClass.value
    if (selectedSection.value) params.section_id = selectedSection.value

    const response = await axios.get('http://127.0.0.1:8000/api/routines', {
      headers: { Authorization: `Bearer ${token}` },
      params: params,
    })
    routines.value = response.data.data
  } catch (error) {
    console.error('Error:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to load routines',
      background: '#1e1e2d',
      color: '#fff',
    })
  } finally {
    isLoading.value = false
  }
}

const deleteRoutine = async (id) => {
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
      await axios.delete(`http://127.0.0.1:8000/api/routines/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      routines.value = routines.value.filter((r) => r.id !== id)
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Routine has been deleted.',
        background: '#1e1e2d',
        color: '#fff',
      })
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete routine.',
        background: '#1e1e2d',
        color: '#fff',
      })
    }
  }
}

const printRoutine = () => {
  window.print()
}

onMounted(async () => {
  await fetchFilters()
  await fetchRoutines()
})
</script>

<template>
  <div class="page-container">
    <div class="print-header">
      <img :src="schoolLogo" alt="Logo" class="print-logo" />
      <div class="print-info">
        <h1>{{ schoolName }}</h1>
        <p>{{ schoolAddress }}</p>
        <div class="print-meta">
          <span>Class: {{ getSelectedClassName }}</span>
          <span>Section: {{ getSelectedSectionName }}</span>
          <span>Year: 2026</span>
        </div>
      </div>
    </div>

    <div class="header-action no-print">
      <div>
        <h2 class="page-title">📅 Class Routine</h2>
        <p class="page-subtitle">Manage class schedules & timings</p>
      </div>
      <div class="header-buttons">
        <button @click="printRoutine" class="btn print-btn">🖨️ Print / PDF</button>
        <button @click="router.push('/admin/routines/create')" class="btn add-btn">
          ➕ New Routine
        </button>
      </div>
    </div>

    <div class="filter-card no-print">
      <div class="filter-group">
        <label>Filter by Class:</label>
        <select v-model="selectedClass" @change="fetchRoutines">
          <option value="">All Classes</option>
          <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Filter by Section:</label>
        <select v-model="selectedSection" @change="fetchRoutines">
          <option value="">All Sections</option>
          <option v-for="sec in sections" :key="sec.id" :value="sec.id">{{ sec.name }}</option>
        </select>
      </div>
      <button @click="fetchRoutines" class="btn refresh-btn">🔄 Refresh</button>
    </div>

    <div v-if="isLoading" class="loading-state no-print">
      <div class="spinner"></div>
      <p>Loading routines...</p>
    </div>

    <div v-else-if="routines.length === 0" class="empty-state no-print">
      <div class="empty-content">
        <span class="empty-icon">📂</span>
        <p>No routines found.</p>
      </div>
    </div>

    <div v-else class="table-card">
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Time</th>
              <th>Class</th>
              <th>Section</th>
              <th>Subject</th>
              <th>Teacher</th>
              <th class="no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="routine in routines" :key="routine.id">
              <td>
                <span class="day-badge">{{ routine.day }}</span>
              </td>
              <td class="time-col">{{ routine.start_time }} - {{ routine.end_time }}</td>
              <td>{{ routine.school_class?.name || 'N/A' }}</td>
              <td>{{ routine.section?.name || 'N/A' }}</td>
              <td>{{ routine.subject?.name || 'N/A' }}</td>
              <td>{{ routine.teacher?.name || 'N/A' }}</td>

              <td class="no-print">
                <div class="action-buttons">
                  <button
                    @click="router.push(`/admin/routines/edit/${routine.id}`)"
                    class="btn-icon edit"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button @click="deleteRoutine(routine.id)" class="btn-icon delete" title="Delete">
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

/* Buttons */
.header-buttons {
  display: flex;
  gap: 10px;
}
.btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: 0.3s;
}
.add-btn {
  background: #3b82f6;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
.add-btn:hover {
  transform: translateY(-2px);
}
.print-btn {
  background: #10b981;
  color: white;
}
.print-btn:hover {
  background: #059669;
}
.refresh-btn {
  background: #2b2b40;
  color: #a1a5b7;
  padding: 10px 15px;
}
.refresh-btn:hover {
  background: #323248;
  color: white;
}

/* Filter Card */
.filter-card {
  background: #1e1e2d;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 25px;
  display: flex;
  gap: 20px;
  align-items: flex-end;
  border: 1px solid #2b2b40;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.filter-group label {
  color: #a1a5b7;
  font-size: 13px;
  font-weight: 600;
}
.filter-group select {
  padding: 10px 15px;
  background: #151521;
  border: 1px solid #2b2b40;
  border-radius: 8px;
  color: white;
  outline: none;
  min-width: 200px;
  cursor: pointer;
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

/* Badges & Styles */
.day-badge {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.time-col {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #a1a5b7;
}

/* Actions */
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
.edit {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}
.edit:hover {
  background: #3b82f6;
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

/* Loading & Empty */
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
  to {
    transform: rotate(360deg);
  }
}
.empty-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 10px;
  opacity: 0.5;
}

/* Print Styles */
.print-header {
  display: none;
}

@media print {
  body * {
    visibility: hidden;
  }
  .page-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 0;
    background: white;
    color: black;
  }
  .table-card,
  .table-card * {
    visibility: visible;
  }
  .table-card {
    position: absolute;
    top: 180px;
    left: 0;
    width: 100%;
    box-shadow: none;
    border: none;
  }
  .print-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    visibility: visible;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    padding: 20px;
    border-bottom: 2px solid #333;
  }
  .print-header * {
    visibility: visible;
  }
  .print-logo {
    width: 60px;
    margin-bottom: 10px;
  }
  .print-info {
    text-align: center;
    color: black;
  }
  .print-info h1 {
    font-size: 24px;
    margin: 0;
  }
  .print-meta {
    margin-top: 10px;
    font-weight: bold;
    display: flex;
    gap: 15px;
    font-size: 14px;
  }

  .no-print {
    display: none !important;
  }

  /* Table Print Reset */
  .custom-table th {
    background: #eee !important;
    color: black !important;
    border: 1px solid #000 !important;
  }
  .custom-table td {
    color: black !important;
    border: 1px solid #000 !important;
  }
  .day-badge {
    background: none !important;
    color: black !important;
    border: 1px solid #000;
  }
  .time-col {
    color: black !important;
  }
}
</style>
