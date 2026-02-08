<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()
const classes = ref([])
const isLoading = ref(false)
const errors = ref({}) // ভ্যালিডেশন এরর রাখার জন্য

const form = ref({
  class_id: '',
  name: '', // Subject Name
  code: '', // Subject Code
  type: 'Theory', // Theory or Practical
})

// ১. পেজ লোড হলে ক্লাস লিস্ট নিয়ে আসা
onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('http://127.0.0.1:8000/api/academic/classes', {
      headers: { Authorization: `Bearer ${token}` },
    })
    classes.value = response.data.data || response.data
  } catch (error) {
    console.error('Class load error:', error)
  }
})

// ২. সাবজেক্ট সেভ করা
const submitSubject = async () => {
  isLoading.value = true
  errors.value = {} // এরর রিসেট

  if (!form.value.class_id) {
    Swal.fire({
      icon: 'warning',
      title: 'Warning',
      text: 'Please select a class!',
      background: '#1e1e2d',
      color: '#fff',
    })
    isLoading.value = false
    return
  }

  try {
    const token = localStorage.getItem('token')
    await axios.post('http://127.0.0.1:8000/api/academic/subjects', form.value, {
      headers: { Authorization: `Bearer ${token}` },
    })

    // সাকসেস মেসেজ
    await Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Subject added successfully! 📚',
      background: '#1e1e2d',
      color: '#fff',
      confirmButtonColor: '#3b82f6',
      timer: 2000,
    })

    // ফর্ম রিসেট
    form.value = {
      class_id: '',
      name: '',
      code: '',
      type: 'Theory',
    }

    // চাইলে লিস্ট পেজে পাঠাতে পারো
    // router.push('/academic/subjects')
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please check the form inputs.',
        background: '#1e1e2d',
        color: '#fff',
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save subject.',
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
          <h3>📚 Add New Subject</h3>
          <p>Create a new subject for a specific class.</p>
        </div>
        <button @click="router.back()" class="back-btn">⬅ Back</button>
      </div>

      <form @submit.prevent="submitSubject">
        <div class="form-grid">
          <div class="form-group full-width">
            <label>Select Class <span class="required">*</span></label>
            <div class="input-wrapper">
              <span class="icon">🏫</span>
              <select v-model="form.class_id" :class="{ 'error-border': errors.class_id }">
                <option value="" disabled>Choose a Class</option>
                <option v-for="cls in classes" :key="cls.id" :value="cls.id">
                  {{ cls.name }}
                </option>
              </select>
            </div>
            <span v-if="errors.class_id" class="error-msg">{{ errors.class_id[0] }}</span>
          </div>

          <div class="form-group full-width">
            <label>Subject Name <span class="required">*</span></label>
            <div class="input-wrapper">
              <span class="icon">📖</span>
              <input
                v-model="form.name"
                type="text"
                placeholder="e.g. Mathematics"
                :class="{ 'error-border': errors.name }"
              />
            </div>
            <span v-if="errors.name" class="error-msg">{{ errors.name[0] }}</span>
          </div>

          <div class="form-group">
            <label>Subject Code</label>
            <div class="input-wrapper">
              <span class="icon">🔢</span>
              <input v-model="form.code" type="text" placeholder="e.g. 101" />
            </div>
          </div>

          <div class="form-group">
            <label>Subject Type</label>
            <div class="input-wrapper">
              <span class="icon">⚙️</span>
              <select v-model="form.type">
                <option value="Theory">Theory</option>
                <option value="Practical">Practical</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="isLoading" class="submit-btn">
            <span v-if="isLoading" class="spinner"></span>
            {{ isLoading ? 'Saving...' : '💾 Save Subject' }}
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
  max-width: 600px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid #2b2b40;
  color: white;
  height: fit-content;
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
.error-border {
  border-color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.1);
}
.error-msg {
  color: #ef4444;
  font-size: 12px;
  margin-top: 2px;
}

/* Submit Button */
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
  width: 100%;
  justify-content: center;
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
@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .full-width {
    grid-column: span 1;
  }
}
</style>
