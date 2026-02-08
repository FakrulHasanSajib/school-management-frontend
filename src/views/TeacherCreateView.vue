<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()
const isLoading = ref(false)
const errors = ref({})
const imagePreview = ref(null)

const form = ref({
  name: '',
  email: '',
  password: '12345678', // Default Password
  designation: '',
  qualification: '',
  phone: '',
  joining_date: '',
  blood_group: '',
  image: null,
  address: '',
})

// ১. ছবি প্রিভিউ এবং হ্যান্ডলিং
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    form.value.image = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

// ২. সাবমিট ফাংশন
const handleSubmit = async () => {
  isLoading.value = true
  errors.value = {}

  const token = localStorage.getItem('token')
  if (!token) {
    Swal.fire({
      icon: 'warning',
      title: 'Session Expired',
      text: 'Please login again.',
      background: '#1e1e2d',
      color: '#fff',
    })
    router.push('/login')
    return
  }

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
    await axios.post('http://127.0.0.1:8000/api/teachers', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    })

    await Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Teacher added successfully! 🎉',
      background: '#1e1e2d',
      color: '#fff',
      confirmButtonColor: '#3b82f6',
      timer: 2000,
    })

    router.push('/teachers') // লিস্ট পেজে রিডাইরেক্ট
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please check the form for errors.',
        background: '#1e1e2d',
        color: '#fff',
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Something went wrong.',
        background: '#1e1e2d',
        color: '#fff',
      })
    }
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
          <h3>➕ Add New Teacher</h3>
          <p>Fill in the details to register a new teacher.</p>
        </div>
        <button @click="router.back()" class="back-btn">⬅ Back</button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-grid">
          <div class="form-group">
            <label>Full Name <span class="required">*</span></label>
            <div class="input-wrapper">
              <span class="icon">👤</span>
              <input
                v-model="form.name"
                type="text"
                placeholder="Enter full name"
                :class="{ 'error-border': errors.name }"
              />
            </div>
            <span v-if="errors.name" class="error-msg">{{ errors.name[0] }}</span>
          </div>

          <div class="form-group">
            <label>Email Address <span class="required">*</span></label>
            <div class="input-wrapper">
              <span class="icon">📧</span>
              <input
                v-model="form.email"
                type="email"
                placeholder="teacher@school.com"
                :class="{ 'error-border': errors.email }"
              />
            </div>
            <span v-if="errors.email" class="error-msg">{{ errors.email[0] }}</span>
          </div>

          <div class="form-group">
            <label>Designation <span class="required">*</span></label>
            <div class="input-wrapper">
              <span class="icon">🎓</span>
              <input
                v-model="form.designation"
                type="text"
                placeholder="e.g. Senior Teacher"
                :class="{ 'error-border': errors.designation }"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Qualification</label>
            <div class="input-wrapper">
              <span class="icon">📜</span>
              <input v-model="form.qualification" type="text" placeholder="e.g. M.Sc in Math" />
            </div>
          </div>

          <div class="form-group">
            <label>Phone Number</label>
            <div class="input-wrapper">
              <span class="icon">📞</span>
              <input v-model="form.phone" type="text" placeholder="017XXXXXXXX" />
            </div>
          </div>

          <div class="form-group">
            <label>Blood Group</label>
            <div class="input-wrapper">
              <span class="icon">🩸</span>
              <select v-model="form.blood_group">
                <option value="">Select Group</option>
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
            <label>Joining Date <span class="required">*</span></label>
            <div class="input-wrapper">
              <span class="icon">📅</span>
              <input
                v-model="form.joining_date"
                type="date"
                :class="{ 'error-border': errors.joining_date }"
              />
            </div>
          </div>

          <div class="form-group upload-group">
            <label>Teacher Photo</label>
            <div class="upload-box">
              <input
                type="file"
                @change="handleFileChange"
                accept="image/*"
                id="file"
                class="file-input"
              />
              <label for="file" class="upload-label">
                <span v-if="!imagePreview">📷 Upload Photo</span>
                <img v-else :src="imagePreview" class="preview-img" />
              </label>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="isLoading" class="submit-btn">
            <span v-if="isLoading" class="spinner"></span>
            {{ isLoading ? 'Saving...' : '💾 Save Teacher' }}
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
  max-width: 900px;
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
}
input:focus,
select:focus {
  border-color: #3b82f6;
  background: #1a1a27;
}
.error-border {
  border-color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.1);
}
.error-msg {
  color: #ef4444;
  font-size: 12px;
  margin-top: 2px;
}

/* Upload Box */
.upload-group {
  grid-column: span 2;
}
.upload-box {
  width: 120px;
  height: 120px;
  border: 2px dashed #2b2b40;
  border-radius: 12px;
  background: #151521;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: 0.3s;
}
.upload-box:hover {
  border-color: #3b82f6;
}
.file-input {
  display: none;
}
.upload-label {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #a1a5b7;
  font-size: 12px;
  cursor: pointer;
}
.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  .upload-group,
  .form-actions {
    grid-column: span 1;
  }
}
</style>
