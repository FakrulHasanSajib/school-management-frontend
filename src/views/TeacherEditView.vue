<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const isLoading = ref(false)
const errors = ref({})
const imagePreview = ref(null)

const teacher = ref({
  name: '',
  email: '',
  designation: '',
  qualification: '',
  phone: '',
  joining_date: '',
  blood_group: '',
  image: null,
})

// ১. ডাটা লোড
const fetchTeacherDetails = async () => {
  try {
    const token = localStorage.getItem('token')
    const teacherId = route.params.id
    const response = await axios.get(`http://127.0.0.1:8000/api/teachers/${teacherId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = response.data.data

    teacher.value = {
      name: data.name,
      email: data.email,
      designation: data.teacher_profile?.designation || '',
      qualification: data.teacher_profile?.qualification || '',
      phone: data.teacher_profile?.phone || '',
      joining_date: data.teacher_profile?.joining_date || '',
      blood_group: data.teacher_profile?.blood_group || '',
    }

    // ইমেজ থাকলে প্রিভিউ সেট করা
    if (data.teacher_profile?.image) {
      // যদি ফুল পাথ না থাকে তবে বেস ইউআরএল যোগ করতে হবে
      const baseUrl = 'http://127.0.0.1:8000/storage/'
      imagePreview.value = data.teacher_profile.image.startsWith('http')
        ? data.teacher_profile.image
        : baseUrl + data.teacher_profile.image
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to load teacher data',
      background: '#1e1e2d',
      color: '#fff',
    })
    router.back()
  }
}

// ২. ফাইল হ্যান্ডলিং
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    teacher.value.image = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

// ৩. আপডেট ফাংশন
const handleUpdate = async () => {
  isLoading.value = true
  errors.value = {}

  const formData = new FormData()
  formData.append('_method', 'PUT') // লারাভেলের জন্য PUT মেথড

  for (const key in teacher.value) {
    if (teacher.value[key] !== null && teacher.value[key] !== undefined) {
      formData.append(key, teacher.value[key])
    }
  }

  try {
    const token = localStorage.getItem('token')
    await axios.post(`http://127.0.0.1:8000/api/teachers/${route.params.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    })

    await Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Teacher information updated successfully 🎉',
      background: '#1e1e2d',
      color: '#fff',
      confirmButtonColor: '#3b82f6',
      timer: 2000,
    })

    router.push('/teachers')
  } catch (error) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please check the form for errors',
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

onMounted(fetchTeacherDetails)
</script>

<template>
  <div class="page-wrapper">
    <div class="glass-card">
      <div class="card-header">
        <div class="header-content">
          <h3>✏️ Edit Teacher Profile</h3>
          <p>Update teacher information details.</p>
        </div>
        <button @click="router.back()" class="back-btn">⬅ Back</button>
      </div>

      <form @submit.prevent="handleUpdate">
        <div class="form-grid">
          <div class="form-group">
            <label>Full Name</label>
            <div class="input-wrapper">
              <span class="icon">👤</span>
              <input v-model="teacher.name" type="text" :class="{ 'error-border': errors.name }" />
            </div>
            <span v-if="errors.name" class="error-msg">{{ errors.name[0] }}</span>
          </div>

          <div class="form-group">
            <label>Email Address</label>
            <div class="input-wrapper">
              <span class="icon">📧</span>
              <input
                v-model="teacher.email"
                type="email"
                :class="{ 'error-border': errors.email }"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Designation</label>
            <div class="input-wrapper">
              <span class="icon">🎓</span>
              <input v-model="teacher.designation" type="text" />
            </div>
          </div>

          <div class="form-group">
            <label>Qualification</label>
            <div class="input-wrapper">
              <span class="icon">📜</span>
              <input v-model="teacher.qualification" type="text" />
            </div>
          </div>

          <div class="form-group">
            <label>Phone Number</label>
            <div class="input-wrapper">
              <span class="icon">📞</span>
              <input v-model="teacher.phone" type="text" />
            </div>
          </div>

          <div class="form-group">
            <label>Blood Group</label>
            <div class="input-wrapper">
              <span class="icon">🩸</span>
              <select v-model="teacher.blood_group">
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
            <label>Joining Date</label>
            <div class="input-wrapper">
              <span class="icon">📅</span>
              <input v-model="teacher.joining_date" type="date" />
            </div>
          </div>

          <div class="form-group upload-group">
            <label>Profile Photo</label>
            <div class="upload-box">
              <input
                type="file"
                @change="handleFileChange"
                accept="image/*"
                id="file"
                class="file-input"
              />
              <label for="file" class="upload-label">
                <span v-if="!imagePreview">📷 Change Photo</span>
                <img v-else :src="imagePreview" class="preview-img" />
              </label>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="isLoading" class="submit-btn">
            <span v-if="isLoading" class="spinner"></span>
            {{ isLoading ? 'Updating...' : '💾 Save Changes' }}
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
  margin-top: 5px;
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
