<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

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
    const response = await axios.get('http://127.0.0.1:8000/api/students', {
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
    const classRes = await axios.get('http://127.0.0.1:8000/api/academic/classes')
    classes.value = classRes.data.data
    const sectionRes = await axios.get('http://127.0.0.1:8000/api/academic/sections')
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

// ৪. ওয়াচার
watch([searchQuery, selectedClass, selectedSection], () => {
  fetchStudents()
})

onMounted(() => {
  fetchStudents()
  fetchFilters()
})

// ৫. ডিলিট ফাংশন
const deleteStudent = async (id) => {
  if (!confirm('আপনি কি নিশ্চিত যে এই স্টুডেন্টকে ডিলিট করতে চান?')) return
  try {
    await axios.delete(`http://127.0.0.1:8000/api/students/${id}`)
    alert('স্টুডেন্ট ডিলিট করা হয়েছে!')
    fetchStudents() // রিফ্রেশ
  } catch (error) {
    alert('ডিলিট করা সম্ভব হয়নি!')
  }
}
</script>

<template>
  <div>
    <div class="header-action">
      <h2 class="page-title">👨‍🎓 সকল স্টুডেন্ট</h2>
      <button @click="router.push('/admin/students/create')" class="add-btn">
        + নতুন স্টুডেন্ট
      </button>
    </div>

    <div class="search-filter-container">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="নাম বা অ্যাডমিশন নং দিয়ে খুঁজুন..."
        class="search-input"
      />
      <div class="filters">
        <select v-model="selectedClass" class="filter-select">
          <option value="">সকল ক্লাস</option>
          <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
        </select>
        <select v-model="selectedSection" class="filter-select">
          <option value="">সকল সেকশন</option>
          <option v-for="sec in sections" :key="sec.id" :value="sec.id">{{ sec.name }}</option>
        </select>
        <button @click="resetFilters" class="reset-btn">Reset</button>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <p>ডাটা লোড হচ্ছে...</p>
    </div>

    <div v-else class="table-card">
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>অ্যাডমিশন নং</th>
              <th>নাম</th>
              <th>ফোন</th>
              <th>রক্তের গ্রুপ</th>
              <th>ক্লাস (সেকশন)</th>
              <th>অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in students" :key="student.id">
              <td style="font-weight: bold; color: #64748b">{{ student.admission_no }}</td>

              <td>
                <div
                  class="user-info"
                  @click="router.push(`/admin/students/view/${student.id}`)"
                  style="cursor: pointer; display: flex; align-items: center; gap: 10px"
                >
                  <img v-if="student.image" :src="student.image" class="avatar-img" alt="Img" />
                  <div v-else class="avatar">{{ student.name ? student.name.charAt(0) : 'S' }}</div>

                  <span class="user-name" style="color: #3b82f6; font-weight: bold">
                    {{ student.name }}
                  </span>
                </div>
              </td>

              <td>{{ student.phone || 'N/A' }}</td>

              <td>
                <span v-if="student.blood_group" class="blood-badge">{{
                  student.blood_group
                }}</span>
                <span v-else style="color: #94a3b8">-</span>
              </td>

              <td>
                <span class="badge"> {{ student.class }} ({{ student.section }}) </span>
              </td>

              <td>
                <div class="action-buttons">
                  <button
                    @click="router.push(`/admin/students/edit/${student.id}`)"
                    class="action-btn edit"
                  >
                    Edit
                  </button>
                  <button @click="deleteStudent(student.id)" class="action-btn delete">
                    Delete
                  </button>
                  <button
                    @click="router.push(`/admin/students/id-card/${student.id}`)"
                    class="action-btn id-card-btn"
                    title="Generate ID Card"
                  >
                    🆔 ID
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="students.length === 0">
              <td colspan="6" class="empty-state">কোনো স্টুডেন্ট পাওয়া যায়নি!</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* স্টাইল (হুবহু আগের মতোই) */
.search-filter-container {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  background: white;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid #f1f5f9;
  flex-wrap: wrap;
}
.search-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  min-width: 200px;
}
.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.filter-select {
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}
.reset-btn {
  padding: 10px 15px;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #64748b;
}
.header-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}
.add-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.table-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  overflow: hidden;
}
.table-responsive {
  overflow-x: auto;
}
.custom-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  min-width: 800px;
}
.custom-table th {
  background-color: #f8fafc;
  padding: 1rem;
  font-weight: 600;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}
.custom-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  vertical-align: middle;
}

/* Avatar Style */
.avatar {
  width: 36px;
  height: 36px;
  background-color: #eff6ff;
  color: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}
.avatar-img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
  flex-shrink: 0;
}

/* Badges */
.badge {
  background-color: #f0fdf4;
  color: #166534;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}
.blood-badge {
  background-color: #fee2e2;
  color: #ef4444;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 0.85rem;
}

/* Actions */
.action-buttons {
  display: flex;
  gap: 8px;
}
.action-btn {
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}
.edit {
  background-color: #eff6ff;
  color: #3b82f6;
}
.edit:hover {
  background-color: #dbeafe;
}
.delete {
  background-color: #fef2f2;
  color: #ef4444;
}
.delete:hover {
  background-color: #fee2e2;
}

.empty-state {
  text-align: center;
  padding: 3rem !important;
  color: #94a3b8;
}
.loading-state {
  text-align: center;
  padding: 40px;
  color: #64748b;
  font-size: 1.1rem;
}
</style>
