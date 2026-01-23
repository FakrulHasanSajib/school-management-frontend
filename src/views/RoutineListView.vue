<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()
const routines = ref([])
const isLoading = ref(false)

// ফিল্টার ভেরিয়েবল
const classes = ref([])
const sections = ref([])
const selectedClass = ref('')
const selectedSection = ref('')

// স্কুলের তথ্য
const schoolName = 'সফ্টওয়্যার আইটি স্কুল এন্ড কলেজ'
const schoolAddress = 'মিরপুর-১০, ঢাকা-১২১৬'
const schoolLogo = 'https://cdn-icons-png.flaticon.com/512/2965/2965300.png'

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  },
})

// প্রিন্টের সময় ক্লাসের নাম দেখানোর জন্য
const getSelectedClassName = computed(() => {
  const cls = classes.value.find((c) => c.id === selectedClass.value)
  return cls ? cls.name : 'সকল ক্লাস'
})

// প্রিন্টের সময় সেকশনের নাম দেখানোর জন্য
const getSelectedSectionName = computed(() => {
  const sec = sections.value.find((s) => s.id === selectedSection.value)
  return sec ? sec.name : 'সকল সেকশন'
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
    Toast.fire({ icon: 'error', title: 'ডাটা লোড হয়নি' })
  } finally {
    isLoading.value = false
  }
}

const deleteRoutine = async (id) => {
  const result = await Swal.fire({
    title: 'নিশ্চিত?',
    text: 'ডিলিট করলে ফেরত পাবেন না!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'হ্যাঁ',
    cancelButtonText: 'না',
  })
  if (result.isConfirmed) {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://127.0.0.1:8000/api/routines/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      routines.value = routines.value.filter((r) => r.id !== id)
      Toast.fire({ icon: 'success', title: 'ডিলিট হয়েছে!' })
    } catch (e) {
      Toast.fire({ icon: 'error', title: 'সমস্যা হয়েছে!' })
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
  <div class="main-wrapper">
    <div class="list-container" id="print-area">
      <div class="print-header">
        <div class="logo-area">
          <img :src="schoolLogo" alt="Logo" class="school-logo" />
        </div>
        <div class="school-info">
          <h1 class="school-name">{{ schoolName }}</h1>
          <p class="school-address">{{ schoolAddress }}</p>
          <div class="routine-meta">
            <span class="meta-badge">ক্লাস: {{ getSelectedClassName }}</span>
            <span class="meta-badge">সেকশন: {{ getSelectedSectionName }}</span>
            <span class="meta-badge">সাল: ২০২৬</span>
          </div>
        </div>
      </div>

      <div class="header-action no-print">
        <h2>📅 ক্লাস রুটিন তালিকা</h2>
        <div class="header-buttons">
          <button @click="printRoutine" class="print-btn">🖨️ প্রিন্ট / PDF</button>
          <button @click="router.push('/admin/routines/create')" class="add-btn">
            + নতুন রুটিন
          </button>
        </div>
      </div>

      <div class="filter-card no-print">
        <div class="filter-group">
          <label>ক্লাস:</label>
          <select v-model="selectedClass" @change="fetchRoutines">
            <option value="">সকল ক্লাস</option>
            <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>সেকশন:</label>
          <select v-model="selectedSection" @change="fetchRoutines">
            <option value="">সকল সেকশন</option>
            <option v-for="sec in sections" :key="sec.id" :value="sec.id">{{ sec.name }}</option>
          </select>
        </div>
        <button @click="fetchRoutines" class="refresh-btn">🔄 রিফ্রেশ</button>
      </div>

      <div v-if="isLoading" class="loading">লোড হচ্ছে...</div>

      <div v-else class="table-responsive">
        <table class="routine-table">
          <thead>
            <tr>
              <th>দিন</th>
              <th>সময়</th>
              <th>ক্লাস</th>
              <th>সেকশন</th>
              <th>বিষয়</th>
              <th>শিক্ষক</th>
              <th class="no-print">অ্যাকশন</th>
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
                <div class="teacher-info text-dark">{{ routine.teacher?.name || 'N/A' }}</div>
              </td>
              <td class="no-print" style="display: flex; gap: 5px">
                <button @click="router.push(`/admin/routines/edit/${routine.id}`)" class="edit-btn">
                  Edit
                </button>
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
  </div>
</template>

<style scoped>
.list-container {
  padding: 20px;
  font-family: 'Segoe UI', sans-serif;
  background: white;
  border-radius: 8px;
}
.header-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.header-buttons {
  display: flex;
  gap: 10px;
}
.filter-card {
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
  align-items: center;
  border: 1px solid #e2e8f0;
}
.routine-table {
  width: 100%;
  border-collapse: collapse;
}
.routine-table th,
.routine-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
}
.routine-table th {
  background: #f1f5f9;
  font-weight: 600;
}
.day-badge {
  background: #e0f2fe;
  color: #0369a1;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}
.add-btn {
  background: #2563eb;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}
.print-btn {
  background: #059669;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}
.refresh-btn {
  background: #64748b;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}
.edit-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
}
.delete-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

/* প্রিন্ট হেডার স্টাইল (শুরুতে লুকানো থাকবে) */
.print-header {
  display: none;
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #333;
  padding-bottom: 20px;
}
.school-logo {
  width: 80px;
  height: auto;
  margin-bottom: 10px;
}
.school-name {
  font-size: 24px;
  font-weight: bold;
  margin: 5px 0;
  color: #000;
}
.school-address {
  font-size: 14px;
  color: #555;
  margin-bottom: 15px;
}
.routine-meta {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 10px;
}
.meta-badge {
  border: 1px solid #000;
  padding: 5px 15px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
  background: #f0f0f0;
}
</style>

<style>
@media print {
  /* বডির সব কিছু লুকিয়ে ফেলা (সাইডবার সহ) */
  body * {
    visibility: hidden;
  }

  /* শুধু আমাদের প্রিন্ট এরিয়া দৃশ্যমান করা */
  #print-area,
  #print-area * {
    visibility: visible;
  }

  /* প্রিন্ট এরিয়াকে একদম উপরে বামে ফিক্স করা */
  #print-area {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 20px;
    background: white;
    z-index: 99999;
  }

  /* বাটন লুকানো */
  .no-print {
    display: none !important;
  }

  /* প্রিন্ট হেডার দেখানো */
  .print-header {
    display: block !important;
  }

  /* টেবিল বর্ডার সুন্দর করা */
  .routine-table th,
  .routine-table td {
    border: 1px solid #000 !important;
    color: #000 !important;
  }
  .day-badge {
    background: none !important;
    border: none !important;
    color: black !important;
    font-weight: bold;
  }
}
</style>
