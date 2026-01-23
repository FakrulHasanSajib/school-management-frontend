<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(false)

// ১. এরর স্টোর করার জন্য ভেরিয়েবল
const errors = ref({})

// ২. ডাটাবেস থেকে আসার জন্য ক্লাস এবং সেকশন ভেরিয়েবল
const classes = ref([])
const filteredSections = ref([]) // ✅ এটি সেকশন ফিল্টার করার জন্য ব্যবহার হবে

const form = ref({
  name: '',
  email: '',
  password: 'password',
  admission_no: '',
  roll_no: '',
  class_id: '',
  section_id: '',
  gender: 'Male',
  dob: '',
  address: '',
})

/**
 * ৩. ডাটাবেস থেকে সব ক্লাস লোড করা
 */
const fetchAcademicData = async () => {
  try {
    // AcademicController@indexClass থেকে ক্লাস আনা
    const classResponse = await axios.get('http://127.0.0.1:8000/api/academic/classes')
    classes.value = classResponse.data.data
  } catch (error) {
    console.error('একাডেমিক ডাটা লোড করতে সমস্যা হয়েছে:', error)
  }
}

/**
 * ৪. ক্লাস পরিবর্তনের সাথে সাথে সেকশন ফিল্টার করা
 */
const handleClassChange = async () => {
  form.value.section_id = '' // আগের সেকশন ক্লিয়ার
  filteredSections.value = []

  if (!form.value.class_id) return

  try {
    // নির্দিষ্ট ক্লাসের সেকশনগুলো নিয়ে আসা
    const res = await axios.get(
      `http://127.0.0.1:8000/api/academic/classes/${form.value.class_id}/sections`,
    )
    filteredSections.value = res.data.data
  } catch (error) {
    console.error('সেকশন লোড হতে সমস্যা হয়েছে', error)
  }

  // ক্লাস পরিবর্তনের পর রোল নম্বর আপডেট করা
  fetchNextNumbers()
}

/**
 * ৫. অটো নম্বর জেনারেট করা (Admission No & Roll No)
 */
const fetchNextNumbers = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/students/next-numbers', {
      params: {
        class_id: form.value.class_id,
        section_id: form.value.section_id,
      },
    })

    const result = response.data.data //

    if (result) {
      form.value.admission_no = result.next_admission_no
      // ক্লাস ও সেকশন সিলেক্ট থাকলেই শুধু রোল নম্বর বসবে
      form.value.roll_no = result.next_roll_no || ''
    }
  } catch (error) {
    console.error('নম্বর জেনারেট করা যায়নি:', error)
  }
}

/**
 * ৬. স্টুডেন্ট ভর্তি সাবমিট করা
 */
const handleSubmit = async () => {
  isLoading.value = true
  errors.value = {}

  try {
    await axios.post('http://127.0.0.1:8000/api/students/admit', form.value)
    alert('স্টুডেন্ট সফলভাবে ভর্তি হয়েছে! 🎉')
    router.push('/admin/students')
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors
    } else {
      alert('সার্ভার এরর: ' + (error.response?.data?.message || 'ভর্তি করা সম্ভব হয়নি'))
    }
  } finally {
    isLoading.value = false
  }
}

// ৭. পেজ লোড হলে সব ডাটা ইনিশিয়ালাইজ করা
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
              placeholder="পুরো নাম লিখুন"
              :class="{ 'border-red': errors.name }"
            />
            <span v-if="errors.name" class="error-msg">{{ errors.name[0] }}</span>
          </div>

          <div class="form-group">
            <label>ইমেইল এড্রেস</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="student@school.com"
              :class="{ 'border-red': errors.email }"
            />
            <span v-if="errors.email" class="error-msg">{{ errors.email[0] }}</span>
          </div>

          <div class="form-group">
            <label>পাসওয়ার্ড</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="গোপন পাসওয়ার্ড"
              :class="{ 'border-red': errors.password }"
            />
            <span v-if="errors.password" class="error-msg">{{ errors.password[0] }}</span>
          </div>

          <div class="form-group">
            <label>অ্যাডমিশন নং (অটো জেনারেটেড)</label>
            <input
              v-model="form.admission_no"
              type="text"
              placeholder="অটো নম্বর আসছে..."
              readonly
            />
          </div>

          <div class="form-group">
            <label>ক্লাস নির্বাচন করুন</label>
            <select
              v-model="form.class_id"
              :class="{ 'border-red': errors.class_id }"
              @change="handleClassChange"
            >
              <option value="" disabled>সিলেক্ট করুন</option>
              <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
            </select>
            <span v-if="errors.class_id" class="error-msg">{{ errors.class_id[0] }}</span>
          </div>

          <div class="form-group">
            <label>সেকশন নির্বাচন করুন</label>
            <select
              v-model="form.section_id"
              @change="fetchNextNumbers"
              :class="{ 'border-red': errors.section_id }"
            >
              <option value="" disabled>সেকশন সিলেক্ট করুন</option>
              <option v-for="sec in filteredSections" :key="sec.id" :value="sec.id">
                {{ sec.name }}
              </option>
            </select>
            <span v-if="errors.section_id" class="error-msg">{{ errors.section_id[0] }}</span>
          </div>

          <div class="form-group">
            <label>রোল নং (সেকশন অনুযায়ী অটো)</label>
            <input v-model="form.roll_no" type="text" placeholder="রোল নম্বর" readonly />
            <span v-if="errors.roll_no" class="error-msg">{{ errors.roll_no[0] }}</span>
          </div>

          <div class="form-group">
            <label>লিঙ্গ (Gender)</label>
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
        </div>

        <div class="form-group full-width">
          <label>ঠিকানা</label>
          <textarea
            v-model="form.address"
            rows="3"
            placeholder="বর্তমান ঠিকানা লিখুন..."
            :class="{ 'border-red': errors.address }"
          ></textarea>
          <span v-if="errors.address" class="error-msg">{{ errors.address[0] }}</span>
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
</style>
