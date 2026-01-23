<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'
import Swal from 'sweetalert2' // ✅ SweetAlert2 ইম্পোর্ট

const router = useRouter()
const route = useRoute()
const isLoading = ref(false)
const errors = ref({})

// ড্রপডাউন ডাটা
const classes = ref([])
const sections = ref([])
const imagePreview = ref(null)

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
  phone: '',
  blood_group: '',
  image: null,
})

// ✅ টোস্ট কনফিগারেশন (সুন্দর মেসেজের জন্য)
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

// ১. একাডেমিক ডাটা লোড (ক্লাস)
const fetchAcademicData = async () => {
  try {
    const classRes = await axios.get('http://127.0.0.1:8000/api/academic/classes')
    classes.value = classRes.data.data
  } catch (error) {
    console.error('ক্লাস লোড সমস্যা:', error)
  }
}

// ২. ক্লাস চেঞ্জ হলে সেকশন লোড
const handleClassChange = async (classId) => {
  sections.value = []
  if (!classId) return
  try {
    const res = await axios.get(`http://127.0.0.1:8000/api/academic/classes/${classId}/sections`)
    sections.value = res.data.data
  } catch (error) {
    console.error('সেকশন লোড সমস্যা', error)
  }
}

// ৩. স্টুডেন্ট ডাটা লোড
const fetchStudentData = async () => {
  try {
    const studentId = route.params.id
    const response = await axios.get(`http://127.0.0.1:8000/api/students/${studentId}`)
    const student = response.data.data

    // ফর্ম ফিলাপ
    form.value = {
      name: student.name,
      email: student.email,
      admission_no: student.admission_no,
      roll_no: student.roll_no,
      class_id: student.class_id,
      section_id: student.section_id,
      gender: student.gender,
      dob: student.dob,
      address: student.address,
      phone: student.phone || '',
      blood_group: student.blood_group || '',
      image: null,
    }

    if (student.image) {
      imagePreview.value = student.image
    }

    if (student.class_id) {
      await handleClassChange(student.class_id)
    }
  } catch (error) {
    console.error(error)
    Toast.fire({ icon: 'error', title: 'স্টুডেন্টের তথ্য পাওয়া যায়নি!' }) // ✅ এরর মেসেজ
    router.push('/admin/students')
  }
}

// ৪. নতুন ছবি সিলেক্ট করলে প্রিভিউ চেঞ্জ
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    form.value.image = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

// ৫. আপডেট ফাংশন
const handleUpdate = async () => {
  isLoading.value = true
  errors.value = {}

  const studentId = route.params.id
  const formData = new FormData()

  // লারাভেলে ফাইল আপডেটের জন্য PUT মেথডকে এভাবে পাঠাতে হয়
  formData.append('_method', 'PUT')

  for (const key in form.value) {
    if (form.value[key] !== null && form.value[key] !== undefined) {
      formData.append(key, form.value[key])
    }
  }

  try {
    await axios.post(`http://127.0.0.1:8000/api/students/${studentId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    // ✅✅✅ সুইট অ্যালার্ট সাকসেস মেসেজ
    await Swal.fire({
      title: 'সফল!',
      text: 'স্টুডেন্টের তথ্য সফলভাবে আপডেট হয়েছে 🎉',
      icon: 'success',
      confirmButtonText: 'ঠিক আছে',
      confirmButtonColor: '#2563eb',
    })

    router.push('/admin/students')
  } catch (error) {
    console.error(error)
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors
      Toast.fire({ icon: 'warning', title: 'দয়া করে ফর্মটি ঠিকঠাক পূরণ করুন' }) // ✅ ওয়ার্নিং মেসেজ
    } else {
      Swal.fire({
        title: 'ভুল হয়েছে!',
        text: error.response?.data?.message || 'সার্ভার এরর',
        icon: 'error',
        confirmButtonText: 'চেষ্টা করুন',
      })
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchAcademicData()
  await fetchStudentData()
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
            <input v-model="form.admission_no" type="text" readonly />
          </div>

          <div class="form-group">
            <label>রোল নং</label>
            <input v-model="form.roll_no" type="text" :class="{ 'border-red': errors.roll_no }" />
          </div>

          <div class="form-group">
            <label>ক্লাস</label>
            <select v-model="form.class_id" @change="handleClassChange(form.class_id)">
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
              <option value="Female">মেয়ে</option>
            </select>
          </div>

          <div class="form-group">
            <label>জন্ম তারিখ</label>
            <input v-model="form.dob" type="date" />
          </div>

          <div class="form-group">
            <label>ফোন নম্বর</label>
            <input v-model="form.phone" type="text" placeholder="017xxxxxxxx" />
          </div>

          <div class="form-group">
            <label>রক্তের গ্রুপ</label>
            <select v-model="form.blood_group">
              <option value="">সিলেক্ট করুন</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
        </div>

        <div class="form-group full-width" style="margin-top: 15px">
          <label>ঠিকানা</label>
          <textarea v-model="form.address" rows="3"></textarea>
        </div>

        <div class="form-group full-width">
          <label>স্টুডেন্টের ছবি (পরিবর্তন করতে চাইলে আপলোড করুন)</label>
          <div class="upload-area">
            <input type="file" @change="handleFileChange" accept="image/*" class="file-input" />

            <div v-if="imagePreview" class="preview-box">
              <p>বর্তমান ছবি / প্রিভিউ:</p>
              <img :src="imagePreview" alt="Preview" class="preview-img" />
            </div>
          </div>
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
  box-sizing: border-box;
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
.back-btn {
  background: #64748b;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}
.border-red {
  border-color: red;
  background: #fff5f5;
}
.error-msg {
  color: red;
  font-size: 0.8rem;
}

/* প্রিভিউ স্টাইল */
.upload-area {
  border: 2px dashed #d1d5db;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}
.preview-box {
  margin-top: 15px;
}
.preview-img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 3px solid #e5e7eb;
}
</style>
