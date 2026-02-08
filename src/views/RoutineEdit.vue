<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const routineId = route.params.id
const isLoading = ref(true)

// ড্রপডাউন লিস্ট
const classes = ref([])
const sections = ref([])
const subjects = ref([])
const teachers = ref([])

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

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

// ১. ক্লাস এবং টিচার লিস্ট লোড করা
const fetchInitialData = async () => {
  try {
    const token = localStorage.getItem('token')
    const config = { headers: { Authorization: `Bearer ${token}` } }

    const [classRes, teacherRes] = await Promise.all([
      axios.get('http://127.0.0.1:8000/api/academic/classes', config),
      axios.get('http://127.0.0.1:8000/api/teachers', config),
    ])

    classes.value = classRes.data.data || classRes.data
    teachers.value = teacherRes.data.data || teacherRes.data
  } catch (error) {
    console.error('Initial data error:', error)
  }
}

// ২. নির্দিষ্ট ক্লাসের সেকশন ও সাবজেক্ট লোড করা
const fetchDependencies = async (classId) => {
  if (!classId) return
  try {
    const token = localStorage.getItem('token')
    const config = { headers: { Authorization: `Bearer ${token}` } }

    const [secRes, subRes] = await Promise.all([
      axios.get(`http://127.0.0.1:8000/api/academic/classes/${classId}/sections`, config),
      axios.get(`http://127.0.0.1:8000/api/academic/classes/${classId}/subjects`, config),
    ])

    sections.value = secRes.data.data || secRes.data
    subjects.value = subRes.data.data || subRes.data
  } catch (error) {
    console.error('Dependency fetch error:', error)
  }
}

// ৩. ক্লাস পরিবর্তন হ্যান্ডলার
const handleClassChange = async () => {
  form.value.section_id = ''
  form.value.subject_id = ''
  sections.value = []
  subjects.value = []

  if (form.value.class_id) {
    await fetchDependencies(form.value.class_id)
  }
}

// ৪. রুটিন ডাটা লোড করা এবং সেট করা
const fetchRoutineData = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`http://127.0.0.1:8000/api/routines/${routineId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = response.data.data

    // আগে ডিপেন্ডেন্সি লোড করতে হবে
    if (data.class_id) {
      await fetchDependencies(data.class_id)
    }

    // তারপর ফর্ম ফিলাপ
    form.value = {
      class_id: data.class_id,
      section_id: data.section_id,
      subject_id: data.subject_id,
      teacher_id: data.teacher_id,
      day: data.day,
      start_time: data.start_time ? data.start_time.substring(0, 5) : '',
      end_time: data.end_time ? data.end_time.substring(0, 5) : '',
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Routine not found!',
      background: '#1e1e2d',
      color: '#fff',
    })
    router.push('/admin/routines') // অথবা '/admin/routines'
  } finally {
    isLoading.value = false
  }
}

// ৫. আপডেট ফাংশন
const updateRoutine = async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('token')
    await axios.put(`http://127.0.0.1:8000/api/routines/${routineId}`, form.value, {
      headers: { Authorization: `Bearer ${token}` },
    })

    await Swal.fire({
      icon: 'success',
      title: 'Updated!',
      text: 'Routine updated successfully.',
      background: '#1e1e2d',
      color: '#fff',
      confirmButtonColor: '#3b82f6',
      timer: 1500,
    })

    router.push('/admin/routines') // অথবা '/admin/routines'
  } catch (error) {
    const msg = error.response?.data?.message || 'Failed to update routine.'
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: msg,
      background: '#1e1e2d',
      color: '#fff',
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchInitialData()
  await fetchRoutineData()
})
</script>

<template>
  <div class="page-wrapper">
    <div class="glass-card">
      <div class="card-header">
        <div class="header-content">
          <h3>✏️ Edit Routine</h3>
          <p>Update class schedule details.</p>
        </div>
        <button @click="router.back()" class="back-btn">⬅ Back</button>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading data...</p>
      </div>

      <form v-else @submit.prevent="updateRoutine">
        <div class="form-grid">
          <div class="form-group full-width">
            <label>Day <span class="required">*</span></label>
            <div class="input-wrapper">
              <span class="icon">📆</span>
              <select v-model="form.day" required>
                <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Class <span class="required">*</span></label>
            <div class="input-wrapper">
              <span class="icon">🏫</span>
              <select v-model="form.class_id" @change="handleClassChange" required>
                <option value="" disabled>Select Class</option>
                <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Section <span class="required">*</span></label>
            <div class="input-wrapper">
              <span class="icon">🔖</span>
              <select v-model="form.section_id" required>
                <option value="" disabled>Select Section</option>
                <option v-for="sec in sections" :key="sec.id" :value="sec.id">
                  {{ sec.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Subject <span class="required">*</span></label>
            <div class="input-wrapper">
              <span class="icon">📖</span>
              <select v-model="form.subject_id" required>
                <option value="" disabled>Select Subject</option>
                <option v-for="sub in subjects" :key="sub.id" :value="sub.id">
                  {{ sub.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Teacher <span class="required">*</span></label>
            <div class="input-wrapper">
              <span class="icon">👨‍🏫</span>
              <select v-model="form.teacher_id" required>
                <option value="" disabled>Select Teacher</option>
                <option v-for="t in teachers" :key="t.id" :value="t.id">{{ t.name }}</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Start Time <span class="required">*</span></label>
            <div class="input-wrapper">
              <span class="icon">⏰</span>
              <input type="time" v-model="form.start_time" required />
            </div>
          </div>

          <div class="form-group">
            <label>End Time <span class="required">*</span></label>
            <div class="input-wrapper">
              <span class="icon">⏳</span>
              <input type="time" v-model="form.end_time" required />
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="router.back()" class="cancel-btn">Cancel</button>
          <button type="submit" :disabled="isLoading" class="submit-btn">
            {{ isLoading ? 'Updating...' : '💾 Update Routine' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Page Layout */
.page-wrapper {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  background: #151521;
  min-height: 100vh;
}

/* Glass Card */
.glass-card {
  background: #1e1e2d;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 700px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid #2b2b40;
  color: white;
}

/* Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #2b2b40;
  padding-bottom: 20px;
  margin-bottom: 30px;
}
.header-content h3 {
  font-size: 24px;
  margin: 0;
  color: white;
  font-weight: 700;
}
.header-content p {
  color: #a1a5b7;
  font-size: 14px;
  margin: 5px 0 0;
}
.back-btn {
  background: #2b2b40;
  color: #a1a5b7;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s;
}
.back-btn:hover {
  background: #323248;
  color: white;
}

/* Grid Layout */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.full-width {
  grid-column: span 2;
}

/* Inputs */
label {
  font-size: 13px;
  font-weight: 600;
  color: #a1a5b7;
}
.required {
  color: #ef4444;
}

.input-wrapper {
  position: relative;
}
.icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  margin-top: 1px;
}
input,
select {
  width: 100%;
  background: #151521;
  border: 1px solid #2b2b40;
  padding: 14px 15px 14px 45px;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  outline: none;
  transition: 0.3s;
  appearance: none;
}
input:focus,
select:focus {
  border-color: #3b82f6;
  background: #1a1a27;
}
input[type='time']::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

/* Buttons */
.form-actions {
  grid-column: span 2;
  display: flex;
  gap: 15px;
  margin-top: 30px;
  border-top: 1px solid #2b2b40;
  padding-top: 20px;
}
.submit-btn {
  flex: 2;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  font-size: 15px;
  transition: 0.3s;
}
.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}
.cancel-btn {
  flex: 1;
  background: #2b2b40;
  color: #a1a5b7;
  border: none;
  padding: 14px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.3s;
}
.cancel-btn:hover {
  background: #323248;
  color: white;
}

/* Loading */
.loading-state {
  text-align: center;
  padding: 50px;
  color: #a1a5b7;
}
.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
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

/* Responsive */
@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .full-width {
    grid-column: span 1;
  }
}
</style>
