<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const BASE_URL = 'http://127.0.0.1:8000/api'
const token = localStorage.getItem('token')
const apiConfig = { headers: { Authorization: `Bearer ${token}` } }

const routines = ref({}) // Object হিসেবে নেওয়া হলো (কারণ গ্রুপিং হবে)
const isLoading = ref(false)
const errorMessage = ref('')
const sectionName = ref('')

// সময় ফরম্যাট সুন্দর করার ফাংশন (যেমন: 14:00 -> 02:00 PM)
const formatTime = (time) => {
  if (!time) return ''
  const [hour, minute] = time.split(':')
  const h = parseInt(hour)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const newHour = h % 12 || 12
  return `${newHour}:${minute} ${ampm}`
}

const fetchRoutine = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    // ১. আগে ইউজারের প্রোফাইল থেকে সেকশন আইডি নিব
    const profileRes = await axios.get(`${BASE_URL}/profile`, apiConfig)
    const user = profileRes.data.data

    // সেকশন চেক
    const profile = user.student_profile || user.studentProfile
    const sectionId = profile?.section_id

    if (!sectionId) {
      errorMessage.value = 'আপনার সেকশন খুঁজে পাওয়া যায়নি! অ্যাডমিনের সাথে যোগাযোগ করুন।'
      isLoading.value = false
      return
    }

    sectionName.value = profile.section?.name || ''

    // ২. সেই সেকশনের রুটিন আনা
    const routineRes = await axios.get(`${BASE_URL}/routines/section/${sectionId}`, apiConfig)

    // ডাটা যদি অ্যারে হয়, তবে সেটাকে আমরা ম্যানুয়ালি গ্রুপ করব (যদি ব্যাকএন্ড গ্রুপ না করে)
    const rawData = routineRes.data.data

    if (Array.isArray(rawData)) {
      // যদি ব্যাকএন্ড গ্রুপ না করে পাঠায়, আমরা এখানে গ্রুপ করব
      routines.value = rawData.reduce((groups, item) => {
        const day = item.day
        if (!groups[day]) groups[day] = []
        groups[day].push(item)
        return groups
      }, {})
    } else {
      // ব্যাকএন্ড গ্রুপ করে পাঠালে সরাসরি বসাব
      routines.value = rawData
    }
  } catch (error) {
    console.error(error)
    errorMessage.value = 'রুটিন লোড করতে সমস্যা হয়েছে।'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchRoutine()
})
</script>

<template>
  <div class="page-container">
    <div class="header-area">
      <h2 class="page-title">📅 Class Routine</h2>
      <span v-if="sectionName" class="badge">{{ sectionName }}</span>
    </div>

    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>রুটিন লোড হচ্ছে...</p>
    </div>

    <div v-else-if="errorMessage" class="error-box">⚠️ {{ errorMessage }}</div>

    <div v-else-if="Object.keys(routines).length > 0" class="routine-wrapper">
      <div v-for="(dayRoutines, day) in routines" :key="day" class="day-card">
        <div class="day-header">
          <h3>{{ day }}</h3>
          <span class="count">{{ dayRoutines.length }} Classes</span>
        </div>

        <div class="routine-list">
          <div v-for="routine in dayRoutines" :key="routine.id" class="routine-item">
            <div class="time-box">
              <span class="icon">⏰</span>
              <span class="time">
                {{ formatTime(routine.start_time) }} - {{ formatTime(routine.end_time) }}
              </span>
            </div>

            <div class="info-box">
              <h4 class="subject">{{ routine.subject?.name || 'Subject N/A' }}</h4>
              <div class="teacher">
                <span class="t-icon">👨‍🏫</span>
                {{ routine.teacher?.name || 'Teacher N/A' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>📭 এই সেকশনের জন্য কোনো রুটিন পাওয়া যায়নি।</p>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 20px;
  color: white;
  max-width: 1100px;
  margin: 0 auto;
}
.header-area {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  border-bottom: 1px solid #333;
  padding-bottom: 15px;
}
.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}
.badge {
  background: #3699ff;
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
}

/* লোডিং */
.loading {
  text-align: center;
  padding: 50px;
  color: #a1a5b7;
}
.spinner {
  border: 4px solid rgba(255, 255, 255, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #3699ff;
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

.error-box {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}
.empty-state {
  text-align: center;
  padding: 50px;
  background: #1e1e2d;
  border-radius: 15px;
  color: #a1a5b7;
  border: 1px solid #333;
}

/* রুটিন ডিজাইন */
.routine-wrapper {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.day-card {
  background: #1e1e2d;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #2b2b40;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
.day-header {
  background: #2b2b40;
  padding: 15px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
}
.day-header h3 {
  margin: 0;
  font-size: 18px;
  color: #fff;
  font-weight: 600;
}
.count {
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  color: #a1a5b7;
}

.routine-list {
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.routine-item {
  background: #151521;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #333;
  transition:
    transform 0.2s,
    border-color 0.2s;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.routine-item:hover {
  transform: translateY(-3px);
  border-color: #3699ff;
}

.time-box {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #3699ff;
  font-weight: bold;
  font-size: 14px;
  background: rgba(54, 153, 255, 0.1);
  padding: 8px;
  border-radius: 8px;
  width: fit-content;
}
.info-box {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.subject {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
}
.teacher {
  font-size: 14px;
  color: #a1a5b7;
  display: flex;
  align-items: center;
  gap: 6px;
}
.t-icon {
  font-size: 16px;
}
</style>
