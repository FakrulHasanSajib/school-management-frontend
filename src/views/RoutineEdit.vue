<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const routineId = route.params.id

// ড্রপডাউন লিস্টের ডাটা
const classes = ref([])
const sections = ref([])
const subjects = ref([])
const teachers = ref([])

// ফর্ম ডাটা
const form = ref({
  class_id: '',
  section_id: '',
  subject_id: '',
  teacher_id: '',
  day: 'Sunday',
  start_time: '',
  end_time: '',
})

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// ✅ API থেকে সব লিস্ট আনা
const fetchDependencies = async () => {
  try {
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    const [classRes, sectionRes, teacherRes] = await Promise.all([
      axios.get('http://127.0.0.1:8000/api/academic/classes', { headers }),
      axios.get('http://127.0.0.1:8000/api/academic/sections', { headers }),
      axios.get('http://127.0.0.1:8000/api/teachers', { headers }),
    ])

    classes.value = classRes.data.data
    sections.value = sectionRes.data.data
    teachers.value = teacherRes.data.data
  } catch (error) {
    console.error('Dependency Fetch Error:', error)
  }
}

// ✅ ক্লাস সিলেক্ট করলে সাবজেক্ট লোড হবে
const fetchSubjects = async (classId) => {
  if (!classId) return
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(
      `http://127.0.0.1:8000/api/academic/classes/${classId}/subjects`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
    subjects.value = response.data.data
  } catch (error) {
    console.error('Subject Fetch Error:', error)
  }
}

// ✅ এডিট করার জন্য পুরনো রুটিন ডাটা আনা (FIXED TIME FORMAT)
const fetchRoutineData = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`http://127.0.0.1:8000/api/routines/${routineId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = response.data.data

    // ফর্মে ডাটা সেট করা
    form.value = {
      class_id: data.class_id,
      section_id: data.section_id,
      subject_id: data.subject_id,
      teacher_id: data.teacher_id,
      day: data.day,
      // ⚠️ FIX: ডাটাবেস থেকে আসা সময়ের সেকেন্ড (example: 09:30:00) কেটে ফেলা হচ্ছে (09:30)
      start_time: data.start_time ? data.start_time.substring(0, 5) : '',
      end_time: data.end_time ? data.end_time.substring(0, 5) : '',
    }

    if (data.class_id) {
      await fetchSubjects(data.class_id)
    }
  } catch (error) {
    Swal.fire('Error!', 'রুটিন ডাটা পাওয়া যায়নি', 'error')
    router.push('/admin/routines')
  }
}

// ✅ আপডেট ফাংশন
const updateRoutine = async () => {
  try {
    const token = localStorage.getItem('token')
    await axios.put(`http://127.0.0.1:8000/api/routines/${routineId}`, form.value, {
      headers: { Authorization: `Bearer ${token}` },
    })

    // সফল হলে মেসেজ
    Swal.fire({
      icon: 'success',
      title: 'সফল!',
      text: 'রুটিন আপডেট করা হয়েছে',
      timer: 1500,
      showConfirmButton: false,
    })

    router.push('/admin/routines')
  } catch (error) {
    // ভ্যালিডেশন এরর বা অন্য কোনো এরর হ্যান্ডলিং
    const msg = error.response?.data?.message || 'আপডেট করা সম্ভব হয়নি'
    Swal.fire('Error!', msg, 'error')
  }
}

onMounted(async () => {
  await fetchDependencies()
  await fetchRoutineData()
})
</script>

<template>
  <div class="edit-container">
    <div class="card">
      <h2>✏️ রুটিন এডিট করুন</h2>

      <form @submit.prevent="updateRoutine" class="form-grid">
        <div class="form-group">
          <label>দিন (Day)</label>
          <select v-model="form.day" required>
            <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>ক্লাস</label>
          <select v-model="form.class_id" @change="fetchSubjects(form.class_id)" required>
            <option value="" disabled>ক্লাস নির্বাচন করুন</option>
            <option v-for="cls in classes" :key="cls.id" :value="cls.id">
              {{ cls.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>সেকশন</label>
          <select v-model="form.section_id" required>
            <option value="" disabled>সেকশন নির্বাচন করুন</option>
            <option v-for="sec in sections" :key="sec.id" :value="sec.id">
              {{ sec.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>বিষয়</label>
          <select v-model="form.subject_id" required>
            <option value="" disabled>বিষয় নির্বাচন করুন</option>
            <option v-for="sub in subjects" :key="sub.id" :value="sub.id">
              {{ sub.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>শিক্ষক</label>
          <select v-model="form.teacher_id" required>
            <option value="" disabled>শিক্ষক নির্বাচন করুন</option>
            <option v-for="t in teachers" :key="t.id" :value="t.id">
              {{ t.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>শুরুর সময়</label>
          <input type="time" v-model="form.start_time" required />
        </div>

        <div class="form-group">
          <label>শেষের সময়</label>
          <input type="time" v-model="form.end_time" required />
        </div>

        <div class="btn-group">
          <button type="button" @click="router.push('/admin/routines')" class="cancel-btn">
            বাতিল
          </button>
          <button type="submit" class="submit-btn">আপডেট করুন</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.edit-container {
  display: flex;
  justify-content: center;
  padding: 40px;
  background: #f1f5f9;
  min-height: 80vh;
}
.card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
}
h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #1e293b;
}

.form-grid {
  display: grid;
  gap: 15px;
}
.form-group {
  display: flex;
  flex-direction: column;
}
label {
  margin-bottom: 5px;
  font-weight: 600;
  color: #475569;
}
select,
input {
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 1rem;
}
select:focus,
input:focus {
  outline: none;
  border-color: #2563eb;
  ring: 2px;
}

.btn-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
.submit-btn {
  flex: 1;
  background: #2563eb;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}
.cancel-btn {
  flex: 1;
  background: #64748b;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}
.submit-btn:hover {
  background: #1d4ed8;
}
.cancel-btn:hover {
  background: #475569;
}
</style>
