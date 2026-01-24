<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(false)
const errors = ref({})

const form = ref({
  name: '',
  email: '',
  password: 'password123',
  designation: '',
  qualification: '',
  phone: '',
  joining_date: '',
})

const handleSubmit = async () => {
  isLoading.value = true
  errors.value = {}
  try {
    await axios.post('http://127.0.0.1:8000/api/teachers', form.value)
    alert('শিক্ষক সফলভাবে যোগ করা হয়েছে! 🎉')
    router.push('/admin/teachers')
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors
    } else {
      alert('সার্ভার এরর! দয়া করে পরে আবার চেষ্টা করুন।')
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
            <label>পদবী (Designation)</label>
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
            <span v-if="errors.phone" class="error-msg">{{ errors.phone[0] }}</span>
          </div>
          <div class="form-group">
            <label>রক্তের গ্রুপ</label>
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

          <div class="form-group">
            <label>শিক্ষকের ছবি</label>
            <input type="file" @change="handleFileChange" accept="image/*" />
            <div v-if="imagePreview" class="preview-box">
              <img :src="imagePreview" class="preview-img" />
            </div>
          </div>

          <div class="form-group">
            <label>যোগদানের তারিখ</label>
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
  background: #2e2e2e; /* Dark Card Background */
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
  grid-template-columns: 1fr 1fr; /* 2 Column Layout */
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

input {
  width: 100%;
  background: #1f1f1f; /* Darker Input Background */
  border: 1px solid #444;
  padding: 12px 15px 12px 45px; /* Padding left for icon */
  border-radius: 50px; /* Pill Shape */
  color: white;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.3s ease;
}

input::placeholder {
  color: #666;
}

input:focus {
  border-color: #9b51e0; /* Purple Focus */
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

/* Date Input Fix */
input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(1); /* Make calendar icon white */
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
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
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
    grid-template-columns: 1fr; /* Single column on mobile */
  }
  .glass-card {
    padding: 20px;
  }
  .form-actions {
    flex-direction: column-reverse;
  }
  .submit-btn,
  .cancel-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
