<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2' // সুন্দর এলার্টের জন্য

const router = useRouter()
const isLoading = ref(false)
const errors = ref({})

// ডাটাবেস থেকে আসার জন্য ক্লাস এবং সেকশন ভেরিয়েবল
const classes = ref([])
const filteredSections = ref([])

// ছবির প্রিভিউ দেখার জন্য ভেরিয়েবল
const imagePreview = ref(null)

const form = ref({
  name: '',
  email: '',
  // password ফিল্ড বাদ দেওয়া হয়েছে (অটোমেটিক 12345678 সেট হবে)
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

// একাডেমিক ডাটা লোড
const fetchAcademicData = async () => {
  try {
    const classResponse = await axios.get('http://127.0.0.1:8000/api/academic/classes')
    classes.value = classResponse.data.data
  } catch (error) {
    console.error('একাডেমিক ডাটা সমস্যা:', error)
  }
}

// ক্লাস চেঞ্জ হ্যান্ডলার
const handleClassChange = async () => {
  form.value.section_id = ''
  filteredSections.value = []
  if (!form.value.class_id) return

  try {
    const res = await axios.get(
      `http://127.0.0.1:8000/api/academic/classes/${form.value.class_id}/sections`,
    )
    filteredSections.value = res.data.data
  } catch (error) {
    console.error('সেকশন লোড সমস্যা', error)
  }
  fetchNextNumbers()
}

// অটো নম্বর জেনারেট
const fetchNextNumbers = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/students/next-numbers', {
      params: { class_id: form.value.class_id, section_id: form.value.section_id },
    })
    const result = response.data.data
    if (result) {
      form.value.admission_no = result.next_admission_no
      form.value.roll_no = result.next_roll_no || ''
    }
  } catch (error) {
    console.error('নম্বর জেনারেট সমস্যা:', error)
  }
}

// ফাইল হ্যান্ডলিং এবং প্রিভিউ জেনারেট
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    form.value.image = file
    imagePreview.value = URL.createObjectURL(file)
  } else {
    form.value.image = null
    imagePreview.value = null
  }
}

// সাবমিট ফাংশন
const handleSubmit = async () => {
  isLoading.value = true
  errors.value = {}

  // FormData তৈরি
  const formData = new FormData()

  for (const key in form.value) {
    if (form.value[key] !== null && form.value[key] !== undefined && form.value[key] !== '') {
      formData.append(key, form.value[key])
    }
  }

  try {
    await axios.post('http://127.0.0.1:8000/api/students/admit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    // সুইট এলার্ট মেসেজ
    await Swal.fire({
      title: 'সফল!',
      text: 'স্টুডেন্ট সফলভাবে ভর্তি হয়েছে! ডিফল্ট পাসওয়ার্ড: 12345678',
      icon: 'success',
      confirmButtonText: 'ঠিক আছে',
    })

    router.push('/admin/students')
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors
    } else {
      Swal.fire({
        title: 'এরর!',
        text: error.response?.data?.message || 'সার্ভার এরর',
        icon: 'error',
      })
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchAcademicData()
  fetchNextNumbers()
})
</script>

<template>
  <div class="form-container">
    <div class="header">
      <h2>🎓 নতুন স্টুডেন্ট ভর্তি</h2>
      <button @click="router.back()" class="back-btn">⬅ ফিরে যান</button>
    </div>

    <div class="card">
      <form @submit.prevent="handleSubmit">
        <div class="grid-container">
          <div class="form-group">
            <label>স্টুডেন্টের নাম</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="পুরো নাম"
              :class="{ 'border-red': errors.name }"
            />
            <span v-if="errors.name" class="error-msg">{{ errors.name[0] }}</span>
          </div>

          <div class="form-group">
            <label>ইমেইল এড্রেস</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="email@school.com"
              :class="{ 'border-red': errors.email }"
            />
            <span v-if="errors.email" class="error-msg">{{ errors.email[0] }}</span>
          </div>

          <div class="form-group">
            <label>অ্যাডমিশন নং</label>
            <input v-model="form.admission_no" type="text" readonly />
          </div>

          <div class="form-group">
            <label>ক্লাস</label>
            <select
              v-model="form.class_id"
              @change="handleClassChange"
              :class="{ 'border-red': errors.class_id }"
            >
              <option value="" disabled>সিলেক্ট করুন</option>
              <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
            </select>
            <span v-if="errors.class_id" class="error-msg">{{ errors.class_id[0] }}</span>
          </div>

          <div class="form-group">
            <label>সেকশন</label>
            <select
              v-model="form.section_id"
              @change="fetchNextNumbers"
              :class="{ 'border-red': errors.section_id }"
            >
              <option value="" disabled>সিলেক্ট করুন</option>
              <option v-for="sec in filteredSections" :key="sec.id" :value="sec.id">
                {{ sec.name }}
              </option>
            </select>
            <span v-if="errors.section_id" class="error-msg">{{ errors.section_id[0] }}</span>
          </div>

          <div class="form-group">
            <label>রোল নং</label>
            <input v-model="form.roll_no" type="text" readonly />
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
            <input v-model="form.dob" type="date" :class="{ 'border-red': errors.dob }" />
            <span v-if="errors.dob" class="error-msg">{{ errors.dob[0] }}</span>
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

        <div class="form-group full-width">
          <label>ঠিকানা</label>
          <textarea
            v-model="form.address"
            rows="3"
            placeholder="বর্তমান ঠিকানা..."
            :class="{ 'border-red': errors.address }"
          ></textarea>
          <span v-if="errors.address" class="error-msg">{{ errors.address[0] }}</span>
        </div>

        <div class="form-group full-width">
          <label>স্টুডেন্টের ছবি</label>
          <div class="upload-area">
            <input type="file" @change="handleFileChange" accept="image/*" class="file-input" />
            <div v-if="imagePreview" class="preview-box">
              <p>প্রিভিউ:</p>
              <img :src="imagePreview" alt="Student Preview" class="preview-img" />
            </div>
          </div>
          <span v-if="errors.image" class="error-msg">{{ errors.image[0] }}</span>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="isLoading" class="submit-btn">
            {{ isLoading ? 'সেভ হচ্ছে...' : '✅ স্টুডেন্ট ভর্তি করুন' }}
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
  align-items: center;
  margin-bottom: 1.5rem;
}
.card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}
.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.full-width {
  grid-column: span 2;
  margin-top: 1rem;
}
label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}
input,
select,
textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  width: 100%;
  box-sizing: border-box;
}
.error-msg {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: -2px;
}
.border-red {
  border-color: #ef4444 !important;
  background-color: #fef2f2;
}
.submit-btn {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
.submit-btn:disabled {
  background: #94a3b8;
}
.back-btn {
  background: #64748b;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}
.upload-area {
  border: 2px dashed #d1d5db;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}
.file-input {
  border: none;
  padding: 10px;
}
.preview-box {
  margin-top: 15px;
}
.preview-box p {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 5px;
}
.preview-img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 3px solid #e5e7eb;
}
</style>
