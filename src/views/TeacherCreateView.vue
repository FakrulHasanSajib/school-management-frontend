<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2' // ✅ SweetAlert ইমপোর্ট

const router = useRouter()
const isLoading = ref(false)
const errors = ref({})
const imagePreview = ref(null)

const form = ref({
  name: '',
  email: '',
  password: '12345678',
  designation: '',
  qualification: '',
  phone: '',
  joining_date: '',
  blood_group: '',
  image: null,
  address: '',
})

// ১. ছবি সিলেক্ট ও প্রিভিউ লজিক
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    form.value.image = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

// ২. ফর্ম সাবমিট লজিক
const handleSubmit = async () => {
  isLoading.value = true
  errors.value = {}

  // টোকেন চেক
  const token = localStorage.getItem('token')
  if (!token) {
    Swal.fire({
      icon: 'warning',
      title: 'সেশন শেষ',
      text: 'আপনার সেশন শেষ হয়ে গেছে। দয়া করে আবার লগইন করুন।',
      confirmButtonColor: '#f59e0b',
    })
    router.push('/login')
    return
  }

  // ৩. FormData তৈরি
  const formData = new FormData()
  formData.append('name', form.value.name)
  formData.append('email', form.value.email)
  formData.append('password', form.value.password)
  formData.append('designation', form.value.designation)
  formData.append('qualification', form.value.qualification)
  formData.append('phone', form.value.phone)
  formData.append('joining_date', form.value.joining_date)
  formData.append('blood_group', form.value.blood_group || '')
  formData.append('role', 'teacher')

  if (form.value.image) {
    formData.append('image', form.value.image)
  }

  try {
    // ৪. API কল
    await axios.post('http://127.0.0.1:8000/api/teachers', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    })

    // ✅ ৫. SweetAlert Success Message
    Swal.fire({
      icon: 'success',
      title: 'সফল!',
      text: 'শিক্ষক সফলভাবে যোগ করা হয়েছে! 🎉',
      confirmButtonText: 'ঠিক আছে',
      confirmButtonColor: '#10b981',
      timer: 2000, // ২ সেকেন্ড পর অটো বন্ধ হবে
    }).then(() => {
      router.push('/admin/teachers')
    })
  } catch (error) {
    console.error('Error:', error.response)

    if (error.response) {
      if (error.response.status === 422) {
        // ✅ ভ্যালিডেশন এরর এলার্ট
        errors.value = error.response.data.errors
        Swal.fire({
          icon: 'error',
          title: 'যাচাইকরণ ব্যর্থ!',
          text: 'দয়া করে ফর্মের লাল দাগ দেওয়া ফিল্ডগুলো চেক করুন।',
          confirmButtonColor: '#ef4444',
        })
      } else if (error.response.status === 401) {
        // ✅ অথেন্টিকেশন এরর এলার্ট
        Swal.fire({
          icon: 'error',
          title: 'অননুমোদিত',
          text: 'আপনার লগইন সেশন শেষ। আবার লগইন করুন।',
          confirmButtonColor: '#ef4444',
        })
        router.push('/login')
      } else {
        // ✅ সার্ভার এরর এলার্ট
        Swal.fire({
          icon: 'error',
          title: 'সার্ভার এরর!',
          text: 'দুঃখিত, সার্ভারে কোনো সমস্যা হয়েছে।',
          confirmButtonColor: '#ef4444',
        })
      }
    } else {
      // ✅ নেটওয়ার্ক এরর এলার্ট
      Swal.fire({
        icon: 'error',
        title: 'নেটওয়ার্ক সমস্যা!',
        text: 'সার্ভারের সাথে সংযোগ স্থাপন করা যাচ্ছে না।',
        confirmButtonColor: '#ef4444',
      })
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="form-wrapper">
    <div class="glass-card">
      <div class="card-header">
        <h3>➕ নতুন শিক্ষক যোগ করুন</h3>
        <p class="subtitle">নিচের ফর্মে শিক্ষকের সঠিক তথ্য প্রদান করুন</p>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-grid">
          <div class="form-group">
            <label>নাম <span class="required">*</span></label>
            <div class="input-box">
              <span class="icon">👤</span>
              <input
                v-model="form.name"
                type="text"
                placeholder="শিক্ষকের নাম লিখুন"
                :class="{ 'has-error': errors.name }"
              />
            </div>
            <span v-if="errors.name" class="error-msg">{{ errors.name[0] }}</span>
          </div>

          <div class="form-group">
            <label>ইমেইল <span class="required">*</span></label>
            <div class="input-box">
              <span class="icon">📧</span>
              <input
                v-model="form.email"
                type="email"
                placeholder="email@school.com"
                :class="{ 'has-error': errors.email }"
              />
            </div>
            <span v-if="errors.email" class="error-msg">{{ errors.email[0] }}</span>
          </div>

          <div class="form-group">
            <label>পদবী (Designation) <span class="required">*</span></label>
            <div class="input-box">
              <span class="icon">🎓</span>
              <input
                v-model="form.designation"
                type="text"
                placeholder="যেমন: Senior Teacher"
                :class="{ 'has-error': errors.designation }"
              />
            </div>
            <span v-if="errors.designation" class="error-msg">{{ errors.designation[0] }}</span>
          </div>

          <div class="form-group">
            <label>শিক্ষাগত যোগ্যতা</label>
            <div class="input-box">
              <span class="icon">📜</span>
              <input
                v-model="form.qualification"
                type="text"
                placeholder="যেমন: M.Sc in Math"
                :class="{ 'has-error': errors.qualification }"
              />
            </div>
            <span v-if="errors.qualification" class="error-msg">{{ errors.qualification[0] }}</span>
          </div>

          <div class="form-group">
            <label>ফোন নম্বর</label>
            <div class="input-box">
              <span class="icon">📞</span>
              <input
                v-model="form.phone"
                type="text"
                placeholder="017XXXXXXXX"
                :class="{ 'has-error': errors.phone }"
              />
            </div>
          </div>

          <div class="form-group">
            <label>রক্তের গ্রুপ</label>
            <div class="input-box">
              <span class="icon">🩸</span>
              <select v-model="form.blood_group" class="input-select">
                <option value="">নির্বাচন করুন</option>
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

          <div class="form-group">
            <label>যোগদানের তারিখ <span class="required">*</span></label>
            <div class="input-box">
              <span class="icon">📅</span>
              <input
                v-model="form.joining_date"
                type="date"
                :class="{ 'has-error': errors.joining_date }"
              />
            </div>
            <span v-if="errors.joining_date" class="error-msg">{{ errors.joining_date[0] }}</span>
          </div>

          <div class="form-group">
            <label>শিক্ষকের ছবি</label>
            <div class="file-upload-box">
              <input type="file" @change="handleFileChange" accept="image/*" class="file-input" />
              <div v-if="imagePreview" class="preview-box">
                <img :src="imagePreview" class="preview-img" alt="Preview" />
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="router.back()">বাতিল</button>
          <button type="submit" :disabled="isLoading" class="submit-btn">
            <span v-if="isLoading" class="spinner"></span>
            {{ isLoading ? 'সেভ হচ্ছে...' : 'তথ্য সেভ করুন' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Main Wrapper */
.form-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px;
}

/* Glass/Dark Card Style */
.glass-card {
  background: #2e2e2e;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 900px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: white;
}

/* Header */
.card-header {
  margin-bottom: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 15px;
}
.card-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 5px 0;
  color: #fff;
}
.subtitle {
  color: #a0a0a0;
  font-size: 0.9rem;
  margin: 0;
}

/* Form Grid Layout */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
}

/* Inputs Styling */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #d1d5db;
}
.required {
  color: #f87171;
}

.input-box {
  position: relative;
  display: flex;
  align-items: center;
}

.icon {
  position: absolute;
  left: 15px;
  font-size: 1.1rem;
  color: #a0a0a0;
  z-index: 10;
}

input,
select.input-select {
  width: 100%;
  background: #1f1f1f;
  border: 1px solid #444;
  padding: 12px 15px 12px 45px;
  border-radius: 50px;
  color: white;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.3s ease;
  appearance: none;
}

input::placeholder {
  color: #666;
}

input:focus,
select:focus {
  border-color: #9b51e0;
  box-shadow: 0 0 0 3px rgba(155, 81, 224, 0.2);
  background: #252525;
}

.has-error {
  border-color: #ef4444;
}
.error-msg {
  color: #ef4444;
  font-size: 0.8rem;
  margin-left: 10px;
}

/* File Input & Preview */
.file-upload-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.file-input {
  padding: 10px;
  background: #1f1f1f;
  border-radius: 10px;
  border: 1px dashed #555;
  cursor: pointer;
}
.preview-box {
  width: 100px;
  height: 100px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #9b51e0;
}
.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Date Input Fix */
input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

/* Buttons */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  grid-column: span 2;
}

.cancel-btn {
  background: transparent;
  border: 1px solid #555;
  color: #a0a0a0;
  padding: 10px 25px;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.3s;
}
.cancel-btn:hover {
  background: #333;
  color: white;
  border-color: #777;
}

.submit-btn {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border: none;
  padding: 12px 35px;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(37, 117, 252, 0.4);
}

.submit-btn:disabled {
  background: #555;
  cursor: not-allowed;
  transform: none;
}

/* Loading Spinner */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top-color: transparent;
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
    flex-direction: column-reverse;
  }
  .submit-btn,
  .cancel-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
