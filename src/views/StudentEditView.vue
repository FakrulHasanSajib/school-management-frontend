<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()
const route = useRoute()
const isLoading = ref(false)
const errors = ref({})

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

// ১. একাডেমিক ডাটা লোড
const fetchAcademicData = async () => {
  try {
    const token = localStorage.getItem('token')
    const classRes = await axios.get('http://127.0.0.1:8000/api/academic/classes', {
      headers: { Authorization: `Bearer ${token}` },
    })
    classes.value = classRes.data.data
  } catch (error) {
    console.error('Class fetch error:', error)
  }
}

// ২. ক্লাস চেঞ্জ হলে সেকশন লোড
const handleClassChange = async (classId) => {
  sections.value = []
  if (!classId) return
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get(`http://127.0.0.1:8000/api/academic/classes/${classId}/sections`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    sections.value = res.data.data
  } catch (error) {
    console.error('Section fetch error', error)
  }
}

// ৩. স্টুডেন্ট ডাটা লোড
const fetchStudentData = async () => {
  try {
    const token = localStorage.getItem('token')
    const studentId = route.params.id
    const response = await axios.get(`http://127.0.0.1:8000/api/students/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const student = response.data.data

    form.value = { ...student, image: null } // ইমেজ ফিল্ড খালি রাখা যাতে নতুন আপলোড করা যায়

    if (student.image) {
      imagePreview.value = student.image
    }

    if (student.class_id) {
      await handleClassChange(student.class_id)
      form.value.section_id = student.section_id // সেকশন সিলেক্ট করা
    }
  } catch (error) {
    console.error(error)
    Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load student data' })
    router.push('/admin/students')
  }
}

// ৪. ফাইল হ্যান্ডলিং
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
  formData.append('_method', 'PUT') // লারাভেল PUT রিকোয়েস্টের জন্য

  for (const key in form.value) {
    if (form.value[key] !== null && form.value[key] !== undefined) {
      formData.append(key, form.value[key])
    }
  }

  try {
    const token = localStorage.getItem('token')
    await axios.post(`http://127.0.0.1:8000/api/students/${studentId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    })

    await Swal.fire({
      title: 'Success!',
      text: 'Student information updated successfully 🎉',
      icon: 'success',
      background: '#1e1e2d',
      color: '#fff',
    })

    router.push('/students')
  } catch (error) {
    if (error.response && error.response.status === 422) {
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
        title: 'Error!',
        text: error.response?.data?.message || 'Server Error',
        icon: 'error',
        background: '#1e1e2d',
        color: '#fff',
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
  <div class="page-container">
    <div class="header-action">
      <div>
        <h2 class="page-title">✏️ Edit Student Profile</h2>
        <p class="page-subtitle">Update student information</p>
      </div>
      <button @click="router.back()" class="back-btn"><span class="icon">⬅</span> Back</button>
    </div>

    <div class="form-card">
      <form @submit.prevent="handleUpdate">
        <div class="section-title">📝 Basic Information</div>
        <div class="grid-container">
          <div class="form-group">
            <label>Full Name</label>
            <input v-model="form.name" type="text" :class="{ 'border-red': errors.name }" />
            <span v-if="errors.name" class="error-msg">{{ errors.name[0] }}</span>
          </div>

          <div class="form-group">
            <label>Email Address</label>
            <input v-model="form.email" type="email" :class="{ 'border-red': errors.email }" />
            <span v-if="errors.email" class="error-msg">{{ errors.email[0] }}</span>
          </div>

          <div class="form-group">
            <label>Phone Number</label>
            <input v-model="form.phone" type="text" placeholder="017xxxxxxxx" />
          </div>

          <div class="form-group">
            <label>Date of Birth</label>
            <input v-model="form.dob" type="date" />
          </div>

          <div class="form-group">
            <label>Gender</label>
            <select v-model="form.gender">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div class="form-group">
            <label>Blood Group</label>
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

        <div class="section-title mt-4">🏫 Academic Details</div>
        <div class="grid-container">
          <div class="form-group">
            <label>Admission No (Read Only)</label>
            <input v-model="form.admission_no" type="text" readonly class="readonly-input" />
          </div>

          <div class="form-group">
            <label>Class</label>
            <select v-model="form.class_id" @change="handleClassChange(form.class_id)">
              <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Section</label>
            <select v-model="form.section_id">
              <option v-for="sec in sections" :key="sec.id" :value="sec.id">{{ sec.name }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Roll No</label>
            <input v-model="form.roll_no" type="text" :class="{ 'border-red': errors.roll_no }" />
          </div>
        </div>

        <div class="section-title mt-4">📍 Address & Photo</div>
        <div class="full-width">
          <label>Address</label>
          <textarea v-model="form.address" rows="3"></textarea>
        </div>

        <div class="upload-section">
          <label>Update Photo</label>
          <div class="upload-box">
            <input
              type="file"
              @change="handleFileChange"
              accept="image/*"
              id="file-upload"
              class="hidden-input"
            />
            <label for="file-upload" class="upload-label">
              <span v-if="!imagePreview" class="upload-icon">📷 Click to Upload</span>
              <img v-else :src="imagePreview" class="preview-img" />
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="isLoading" class="submit-btn">
            {{ isLoading ? 'Updating...' : '💾 Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Page Layout */
.page-container {
  padding: 25px;
  color: #fff;
  max-width: 900px;
  margin: 0 auto;
}
.header-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}
.page-title {
  font-size: 26px;
  font-weight: 700;
  margin: 0;
  color: white;
}
.page-subtitle {
  color: #a1a5b7;
  font-size: 14px;
  margin-top: 5px;
}

/* Back Button */
.back-btn {
  background: #2b2b40;
  color: #a1a5b7;
  border: 1px solid #323248;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.3s;
}
.back-btn:hover {
  background: #323248;
  color: white;
}

/* Form Card */
.form-card {
  background: #1e1e2d;
  padding: 30px;
  border-radius: 12px;
  border: 1px solid #2b2b40;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #3b82f6;
  border-bottom: 1px solid #2b2b40;
  padding-bottom: 10px;
  margin-bottom: 20px;
}
.mt-4 {
  margin-top: 25px;
}

/* Grid & Inputs */
.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.full-width {
  width: 100%;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 13px;
  font-weight: 600;
  color: #a1a5b7;
}
input,
select,
textarea {
  padding: 12px;
  background: #151521;
  border: 1px solid #2b2b40;
  border-radius: 8px;
  color: white;
  outline: none;
  font-size: 14px;
  transition: 0.3s;
}
input:focus,
select:focus,
textarea:focus {
  border-color: #3b82f6;
}
.readonly-input {
  background: #2b2b40;
  color: #7e8299;
  cursor: not-allowed;
}
.border-red {
  border-color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.1);
}
.error-msg {
  color: #ef4444;
  font-size: 12px;
  margin-top: 2px;
}

/* Upload Section */
.upload-section {
  margin-top: 15px;
}
.upload-box {
  width: 120px;
  height: 120px;
  border: 2px dashed #2b2b40;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background: #151521;
  transition: 0.3s;
  overflow: hidden;
}
.upload-box:hover {
  border-color: #3b82f6;
}
.hidden-input {
  display: none;
}
.upload-label {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.upload-icon {
  font-size: 12px;
  color: #a1a5b7;
  text-align: center;
}
.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Submit Button */
.form-actions {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
}
.submit-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 15px;
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
</style>
