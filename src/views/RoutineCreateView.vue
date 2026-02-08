<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()
const isLoading = ref(false)

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

    const [classRes, teacherRes] = await Promise.all([
      axios.get('http://127.0.0.1:8000/api/academic/classes', config),
      axios.get('http://127.0.0.1:8000/api/teachers', config),
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

  sections.value = []
  subjects.value = []
  form.value.section_id = ''
  form.value.subject_id = ''

  try {
    const token = localStorage.getItem('token')
    const classId = form.value.class_id
    const config = { headers: { Authorization: `Bearer ${token}` } }

    const [resSection, resSubject] = await Promise.all([
      axios.get(`http://127.0.0.1:8000/api/academic/classes/${classId}/sections`, config),
      axios.get(`http://127.0.0.1:8000/api/academic/classes/${classId}/subjects`, config),
    ])

    sections.value = resSection.data.data || resSection.data
    subjects.value = resSubject.data.data || resSubject.data
  } catch (error) {
    console.error('Failed to load dependent data', error)
  }
}

// ৩. ফর্ম সাবমিট (রুটিন তৈরি)
const submitRoutine = async () => {
  isLoading.value = true

  try {
    const token = localStorage.getItem('token')
    await axios.post('http://127.0.0.1:8000/api/routines', form.value, {
      headers: { Authorization: `Bearer ${token}` },
    })

    await Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Routine created successfully! 📅',
      background: '#1e1e2d',
      color: '#fff',
      confirmButtonColor: '#3b82f6',
      timer: 2000,
    })

    // router.push('/routines') // লিস্ট পেজে রিডাইরেক্ট (যদি থাকে)

    // অথবা ফর্ম রিসেট
    form.value.subject_id = ''
    form.value.teacher_id = ''
    form.value.start_time = ''
    form.value.end_time = ''
  } catch (error) {
    let msg = 'Failed to create routine.'
    if (error.response && error.response.data) {
      msg = error.response.data.message || msg
    }

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
</script>

<template>
  <div class="page-wrapper">
    <div class="glass-card">
      <div class="card-header">
        <div class="header-content">
          <h3>📅 Add Class Routine</h3>
          <p>Schedule a new class routine for students.</p>
        </div>
        <button @click="router.back()" class="back-btn">⬅ Back</button>
      </div>

      <form @submit.prevent="submitRoutine">
        <div class="form-grid">
          <div class="form-group">
            <label>Select Class <span class="required">*</span></label>
            <div class="input-wrapper">
              <span class="icon">🏫</span>
              <select v-model="form.class_id" @change="handleClassChange" required>
                <option value="" disabled>Choose Class</option>
                <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Select Section <span class="required">*</span></label>
            <div class="input-wrapper">
              <span class="icon">🔖</span>
              <select v-model="form.section_id" required :disabled="!sections.length">
                <option value="" disabled>Choose Section</option>
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
              <select v-model="form.subject_id" required :disabled="!subjects.length">
                <option value="" disabled>Choose Subject</option>
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
                <option value="" disabled>Choose Teacher</option>
                <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                  {{ teacher.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group full-width">
            <label>Select Day <span class="required">*</span></label>
            <div class="input-wrapper">
              <span class="icon">📆</span>
              <select v-model="form.day" required>
                <option value="Sunday">Sunday</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
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
          <button type="submit" :disabled="isLoading" class="submit-btn">
            <span v-if="isLoading" class="spinner"></span>
            {{ isLoading ? 'Saving...' : '💾 Save Routine' }}
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
  max-width: 800px;
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
  color: #565674;
  z-index: 2;
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
  justify-content: flex-end;
  margin-top: 30px;
  border-top: 1px solid #2b2b40;
  padding-top: 20px;
}
.submit-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  padding: 14px 40px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
  transition: 0.3s;
}
.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}
.submit-btn:disabled {
  background: #2b2b40;
  cursor: not-allowed;
  box-shadow: none;
}

/* Spinner */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .form-actions {
    grid-column: span 1;
  }
}
</style>
