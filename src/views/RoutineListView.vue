<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const routines = ref([])
const isLoading = ref(true)

const fetchRoutines = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('http://127.0.0.1:8000/api/routines', {
      headers: { Authorization: `Bearer ${token}` },
    })
    routines.value = response.data.data
  } catch (error) {
    console.error('Error fetching routines:', error)
  } finally {
    isLoading.value = false
  }
}

const deleteRoutine = async (id) => {
  if (!confirm('আপনি কি নিশ্চিত যে এই রুটিনটি ডিলিট করতে চান?')) return
  try {
    const token = localStorage.getItem('token')
    await axios.delete(`http://127.0.0.1:8000/api/routines/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    routines.value = routines.value.filter((r) => r.id !== id)
    alert('রুটিন সফলভাবে ডিলিট হয়েছে!')
  } catch (error) {
    console.error('Delete failed:', error)
    alert('ডিলিট করা সম্ভব হয়নি।')
  }
}

onMounted(fetchRoutines)
</script>

<template>
  <div class="list-container">
    <div class="header-action">
      <h2>📅 ক্লাস রুটিন তালিকা</h2>
      <button @click="router.push('/admin/routines/create')" class="add-btn">
        + নতুন রুটিন যোগ করুন
      </button>
    </div>

    <div v-if="isLoading" class="loading">লোড হচ্ছে...</div>

    <div v-else class="table-responsive">
      <table class="routine-table">
        <thead>
          <tr>
            <th>দিন (Day)</th>
            <th>সময়</th>
            <th>ক্লাস</th>
            <th>সেকশন</th>
            <th>বিষয়</th>
            <th>শিক্ষক</th>
            <th>অ্যাকশন</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="routine in routines" :key="routine.id">
            <td>
              <span class="day-badge">{{ routine.day }}</span>
            </td>

            <td class="text-dark">{{ routine.start_time }} - {{ routine.end_time }}</td>

            <td class="text-dark">{{ routine.school_class?.name || 'N/A' }}</td>

            <td class="text-dark">{{ routine.section?.name || 'N/A' }}</td>

            <td class="text-dark">{{ routine.subject?.name || 'N/A' }}</td>

            <td>
              <div class="teacher-info text-dark">
                {{ routine.teacher?.name || 'N/A' }}
              </div>
            </td>

            <td>
              <button @click="deleteRoutine(routine.id)" class="delete-btn">Delete</button>
            </td>
          </tr>

          <tr v-if="routines.length === 0">
            <td colspan="7" class="text-center">কোনো রুটিন পাওয়া যায়নি</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* ✅ লেখার রং কালো করার জন্য এই অংশটুকু যোগ করা হয়েছে */
.text-dark {
  color: #334155 !important; /* গাঢ় ধূসর রং */
  font-weight: 500;
}

.list-container {
  padding: 20px;
}
.header-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.add-btn {
  background: #2563eb;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.table-responsive {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

/* টেবিলের স্টাইল */
.routine-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff; /* ব্যাকগ্রাউন্ড সাদা */
}

.routine-table th,
.routine-table td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  color: #1e293b; /* ✅ ডিফল্ট টেক্সট কালার কালো */
}

.routine-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #475569;
}

.day-badge {
  background: #e0f2fe;
  color: #0369a1;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}
.delete-btn {
  background: #fee2e2;
  color: #ef4444;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}
.text-center {
  text-align: center;
  color: #94a3b8;
  padding: 20px;
}
.loading {
  text-align: center;
  padding: 20px;
  color: #64748b;
}
</style>
