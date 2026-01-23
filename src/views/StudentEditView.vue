<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute() // URL থেকে ID নেওয়ার জন্য
const isLoading = ref(false)
const errors = ref({})

// ফর্ম ডাটা
const form = ref({
  name: '',
  email: '',
  admission_no: '',
  roll_no: '',
  class_id: '',
  section_id: '',
  gender: 'Male',
  dob: '',
  address: '',
})

// ডামি ক্লাস ও সেকশন (API থাকলে সেখান থেকে আনা উচিত)
const classes = ref([
  { id: 1, name: 'Class Ten' },
  { id: 2, name: 'Class Nine' },
])
const sections = ref([
  { id: 1, name: 'Section A' },
  { id: 2, name: 'Section B' },
])

// ১. পেজ লোড হলে ডাটা নিয়ে আসা
const fetchStudentData = async () => {
  try {
    const studentId = route.params.id
    const response = await axios.get(`http://127.0.0.1:8000/api/students/${studentId}`)
    const student = response.data.data

    // ফর্ম ফিলাপ করা
    form.value = {
      name: student.name,
      email: student.email,
      admission_no: student.admission_no,
      roll_no: student.roll_no,
      class_id: student.class_id, // Resource থেকে আসছে
      section_id: student.section_id, // Resource থেকে আসছে
      gender: student.gender,
      dob: student.dob,
      address: student.address,
    }
  } catch (error) {
    console.error(error)
    alert('স্টুডেন্টের তথ্য পাওয়া যায়নি!')
    router.push('/admin/students')
  }
}

// ২. আপডেট ফাংশন
const handleUpdate = async () => {
  isLoading.value = true
  errors.value = {}

  try {
    const studentId = route.params.id
    // PUT রিকোয়েস্ট পাঠানো
    await axios.put(`http://127.0.0.1:8000/api/students/${studentId}`, form.value)

    alert('তথ্য সফলভাবে আপডেট হয়েছে! 🎉')
    router.push('/admin/students')
  } catch (error) {
    console.error(error)
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors
    } else {
      alert('আপডেট করা সম্ভব হয়নি!')
    }
  } finally {
    isLoading.value = false
  }
}

// পেজ লোড হলে কল হবে
onMounted(() => {
  fetchStudentData()
})
</script>

<template>
  <div class="form-container">
    <div class="header">
      <h2>✏️ তথ্য পরিবর্তন (Edit Student)</h2>
      <button @click="router.back()" class="back-btn">⬅ ফিরে যান</button>
    </div>

    <div class="card">
      <form @submit.prevent="handleUpdate">
        <div class="grid-container">
          <div class="form-group">
            <label>নাম</label>
            <input v-model="form.name" type="text" :class="{ 'border-red': errors.name }" />
            <span v-if="errors.name" class="error-msg">{{ errors.name[0] }}</span>
          </div>

          <div class="form-group">
            <label>ইমেইল</label>
            <input v-model="form.email" type="email" :class="{ 'border-red': errors.email }" />
            <span v-if="errors.email" class="error-msg">{{ errors.email[0] }}</span>
          </div>

          <div class="form-group">
            <label>অ্যাডমিশন নং</label>
            <input
              v-model="form.admission_no"
              type="text"
              :class="{ 'border-red': errors.admission_no }"
            />
          </div>

          <div class="form-group">
            <label>রোল নং</label>
            <input v-model="form.roll_no" type="text" :class="{ 'border-red': errors.roll_no }" />
          </div>

          <div class="form-group">
            <label>ক্লাস</label>
            <select v-model="form.class_id">
              <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>সেকশন</label>
            <select v-model="form.section_id">
              <option v-for="sec in sections" :key="sec.id" :value="sec.id">{{ sec.name }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>লিঙ্গ</label>
            <select v-model="form.gender">
              <option value="Male">ছেলে</option>
              <option value="Female">মেয়ে</option>
            </select>
          </div>

          <div class="form-group">
            <label>জন্ম তারিখ</label>
            <input v-model="form.dob" type="date" />
          </div>
        </div>

        <div class="form-group full-width" style="margin-top: 15px">
          <label>ঠিকানা</label>
          <textarea v-model="form.address" rows="3"></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="isLoading" class="submit-btn">
            {{ isLoading ? 'আপডেট হচ্ছে...' : '💾 পরিবর্তন সেভ করুন' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Create Page এর স্টাইলগুলোই এখানে ব্যবহার হবে */
.form-container {
  max-width: 900px;
  margin: 0 auto;
}
.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}
.card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}
.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
input,
select,
textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 100%;
}
.full-width {
  grid-column: span 2;
}
.submit-btn {
  background: #2563eb;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  float: right;
  font-weight: bold;
}
.border-red {
  border-color: red;
  background: #fff5f5;
}
.error-msg {
  color: red;
  font-size: 0.8rem;
}
</style>
