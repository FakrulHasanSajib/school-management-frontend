<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(false)
const errorMessage = ref('')

// ড্রপডাউন ডাটা রাখার জন্য
const classes = ref([])
const sections = ref([])
const subjects = ref([])
const teachers = ref([])

// ফর্মের ডাটা
const form = ref({
  class_id: '',
  section_id: '',
  subject_id: '',
  teacher_id: '',
  day: 'Sunday',
  start_time: '',
  end_time: '',
})

// ১. পেজ লোড হলে ক্লাস এবং টিচার লিস্ট আনবে
onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    const config = { headers: { Authorization: `Bearer ${token}` } }

    // ক্লাস এবং টিচার একসাথে নিয়ে আসা (Promise.all ব্যবহার করে দ্রুত হবে)
    const [classRes, teacherRes] = await Promise.all([
      axios.get('http://127.0.0.1:8000/api/academic/classes', config), // আপনার ক্লাস রাউট
      axios.get('http://127.0.0.1:8000/api/teachers', config), // আপনার টিচার রাউট
    ])

    classes.value = classRes.data.data || classRes.data
    teachers.value = teacherRes.data.data || teacherRes.data
  } catch (error) {
    console.error('Initial data loading failed', error)
  }
})

// ২. ক্লাস পরিবর্তন হলে সেকশন এবং সাবজেক্ট লোড হবে
const handleClassChange = async () => {
  if (!form.value.class_id) return

  // আগের সেকশন/সাবজেক্ট খালি করে দিন
  sections.value = []
  subjects.value = []
  form.value.section_id = ''
  form.value.subject_id = ''

  try {
    const token = localStorage.getItem('token')
    const classId = form.value.class_id

    // সেকশন এবং সাবজেক্ট আনুন
    const resSection = await axios.get(
      `http://127.0.0.1:8000/api/academic/classes/${classId}/sections`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
    const resSubject = await axios.get(
      `http://127.0.0.1:8000/api/academic/classes/${classId}/subjects`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )

    sections.value = resSection.data.data || resSection.data
    subjects.value = resSubject.data.data || resSubject.data
  } catch (error) {
    console.error('Failed to load dependent data', error)
  }
}

// ৩. ফর্ম সাবমিট (রুটিন তৈরি)
const submitRoutine = async () => {
  errorMessage.value = ''
  isLoading.value = true

  try {
    const token = localStorage.getItem('token')
    await axios.post('http://127.0.0.1:8000/api/routines', form.value, {
      headers: { Authorization: `Bearer ${token}` },
    })

    alert('রুটিন সফলভাবে তৈরি হয়েছে!')
    // চাইলে ফর্ম রিসেট করতে পারেন বা লিস্ট পেজে পাঠাতে পারেন
    // router.push('/admin/routines')
  } catch (error) {
    // ব্যাকএন্ড থেকে আসা কনফ্লিক্ট এরর দেখানো (RoutineService এ যে Exception মেসেজ দিয়েছেন)
    if (error.response && error.response.data) {
      errorMessage.value = error.response.data.message || 'রুটিন সেভ করা যায়নি!'
    } else {
      errorMessage.value = 'সার্ভার এরর!'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="form-container">
    <div class="card">
      <h2>📅 নতুন ক্লাস রুটিন তৈরি করুন</h2>

      <div v-if="errorMessage" class="error-alert">⚠️ {{ errorMessage }}</div>

      <form @submit.prevent="submitRoutine">
        <div class="grid-row">
          <div class="form-group">
            <label>ক্লাস নাম</label>
            <select v-model="form.class_id" @change="handleClassChange" required>
              <option value="" disabled>ক্লাস সিলেক্ট করুন</option>
              <option v-for="cls in classes" :key="cls.id" :value="cls.id">
                {{ cls.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>সেকশন</label>
            <select v-model="form.section_id" required :disabled="!sections.length">
              <option value="" disabled>আগে ক্লাস সিলেক্ট করুন</option>
              <option v-for="sec in sections" :key="sec.id" :value="sec.id">
                {{ sec.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="grid-row">
          <div class="form-group">
            <label>বিষয় (Subject)</label>
            <select v-model="form.subject_id" required :disabled="!subjects.length">
              <option value="" disabled>বিষয় সিলেক্ট করুন</option>
              <option v-for="sub in subjects" :key="sub.id" :value="sub.id">
                {{ sub.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>শিক্ষক</label>
            <select v-model="form.teacher_id" required>
              <option value="" disabled>শিক্ষক সিলেক্ট করুন</option>
              <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                {{ teacher.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="grid-row">
          <div class="form-group">
            <label>বার (Day)</label>
            <select v-model="form.day" required>
              <option value="Sunday">রবিবার (Sunday)</option>
              <option value="Monday">সোমবার (Monday)</option>
              <option value="Tuesday">মঙ্গলবার (Tuesday)</option>
              <option value="Wednesday">বুধবার (Wednesday)</option>
              <option value="Thursday">বৃহস্পতিবার (Thursday)</option>
            </select>
          </div>

          <div class="form-group">
            <label>শুরুর সময়</label>
            <input type="time" v-model="form.start_time" required />
          </div>
          <div class="form-group">
            <label>শেষ সময়</label>
            <input type="time" v-model="form.end_time" required />
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? 'সেভ হচ্ছে...' : 'রুটিন সেভ করুন' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 800px;
  margin: 2rem auto;
}
.card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}
.grid-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 15px;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group label {
  margin-bottom: 5px;
  font-weight: 600;
  color: #374151;
}
.form-group select,
.form-group input {
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
}
.submit-btn {
  width: 100%;
  background: #2563eb;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  cursor: pointer;
  margin-top: 10px;
}
.submit-btn:hover {
  background: #1d4ed8;
}
.submit-btn:disabled {
  background: #93c5fd;
}
.error-alert {
  background: #fee2e2;
  color: #b91c1c;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 15px;
  border: 1px solid #fecaca;
}

@media (max-width: 600px) {
  .grid-row {
    grid-template-columns: 1fr;
  }
}
</style>
