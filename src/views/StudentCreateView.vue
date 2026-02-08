<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()
const isLoading = ref(false)
const errors = ref({})

const classes = ref([])
const filteredSections = ref([])
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
    const classResponse = await axios.get('http://127.0.0.1:8000/api/academic/classes', {
      headers: { Authorization: `Bearer ${token}` },
    })
    classes.value = classResponse.data.data
  } catch (error) {
    console.error('Academic data error:', error)
  }
}

// ২. ক্লাস চেঞ্জ হ্যান্ডলার
const handleClassChange = async () => {
  form.value.section_id = ''
  filteredSections.value = []
  if (!form.value.class_id) return

  try {
    const token = localStorage.getItem('token')
    const res = await axios.get(
      `http://127.0.0.1:8000/api/academic/classes/${form.value.class_id}/sections`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    filteredSections.value = res.data.data
  } catch (error) {
    console.error('Section load error', error)
  }
  fetchNextNumbers()
}

// ৩. অটো নম্বর জেনারেট
const fetchNextNumbers = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('http://127.0.0.1:8000/api/students/next-numbers', {
      headers: { Authorization: `Bearer ${token}` },
      params: { class_id: form.value.class_id, section_id: form.value.section_id },
    })
    const result = response.data.data
    if (result) {
      form.value.admission_no = result.next_admission_no
      form.value.roll_no = result.next_roll_no || ''
    }
  } catch (error) {
    console.error('Number generation error:', error)
  }
}

// ৪. ফাইল হ্যান্ডলিং
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

// ৫. সাবমিট ফাংশন
const handleSubmit = async () => {
  isLoading.value = true
  errors.value = {}

  const formData = new FormData()
  for (const key in form.value) {
    if (form.value[key] !== null && form.value[key] !== undefined && form.value[key] !== '') {
      formData.append(key, form.value[key])
    }
  }

  try {
    const token = localStorage.getItem('token')
    await axios.post('http://127.0.0.1:8000/api/students/admit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    })

    await Swal.fire({
      title: 'Success!',
      text: 'Student admitted successfully! Default Password: 12345678',
      icon: 'success',
      background: '#1e1e2d',
      color: '#fff',
    })

    router.push('/students')
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors
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

onMounted(() => {
  fetchAcademicData()
  fetchNextNumbers()
})
</script>

<template>
  <div class="page-container">
    <div class="header-action">
      <div>
        <h2 class="page-title">🎓 Student Admission</h2>
        <p class="page-subtitle">Fill in the details to admit a new student</p>
      </div>
      <button @click="router.back()" class="back-btn">
        <span class="icon">⬅</span> Back to List
      </button>
    </div>

    <div class="form-card">
      <form @submit.prevent="handleSubmit">
        <div class="section-title">📝 Basic Information</div>
        <div class="grid-container">
          <div class="form-group">
            <label>Full Name <span class="required">*</span></label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Enter student's full name"
              :class="{ 'border-red': errors.name }"
            />
            <span v-if="errors.name" class="error-msg">{{ errors.name[0] }}</span>
          </div>

          <div class="form-group">
            <label>Email Address <span class="required">*</span></label>
            <input
              v-model="form.email"
              type="email"
              placeholder="student@school.com"
              :class="{ 'border-red': errors.email }"
            />
            <span v-if="errors.email" class="error-msg">{{ errors.email[0] }}</span>
          </div>

          <div class="form-group">
            <label>Phone Number</label>
            <input v-model="form.phone" type="text" placeholder="017xxxxxxxx" />
          </div>

          <div class="form-group">
            <label>Date of Birth</label>
            <input v-model="form.dob" type="date" :class="{ 'border-red': errors.dob }" />
            <span v-if="errors.dob" class="error-msg">{{ errors.dob[0] }}</span>
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
            <label>Admission No (Auto)</label>
            <input v-model="form.admission_no" type="text" readonly class="readonly-input" />
          </div>

          <div class="form-group">
            <label>Class <span class="required">*</span></label>
            <select
              v-model="form.class_id"
              @change="handleClassChange"
              :class="{ 'border-red': errors.class_id }"
            >
              <option value="" disabled>Select Class</option>
              <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
            </select>
            <span v-if="errors.class_id" class="error-msg">{{ errors.class_id[0] }}</span>
          </div>

          <div class="form-group">
            <label>Section <span class="required">*</span></label>
            <select
              v-model="form.section_id"
              @change="fetchNextNumbers"
              :class="{ 'border-red': errors.section_id }"
            >
              <option value="" disabled>Select Section</option>
              <option v-for="sec in filteredSections" :key="sec.id" :value="sec.id">
                {{ sec.name }}
              </option>
            </select>
            <span v-if="errors.section_id" class="error-msg">{{ errors.section_id[0] }}</span>
          </div>

          <div class="form-group">
            <label>Roll No (Auto)</label>
            <input v-model="form.roll_no" type="text" readonly class="readonly-input" />
          </div>
        </div>

        <div class="section-title mt-4">📍 Address & Photo</div>
        <div class="full-width">
          <label>Address</label>
          <textarea
            v-model="form.address"
            rows="3"
            placeholder="Present Address..."
            :class="{ 'border-red': errors.address }"
          ></textarea>
          <span v-if="errors.address" class="error-msg">{{ errors.address[0] }}</span>
        </div>

        <div class="upload-section">
          <label>Student Photo</label>
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
          <span v-if="errors.image" class="error-msg">{{ errors.image[0] }}</span>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="isLoading" class="submit-btn">
            {{ isLoading ? 'Processing...' : '✅ Admit Student' }}
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
.required {
  color: #ef4444;
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
