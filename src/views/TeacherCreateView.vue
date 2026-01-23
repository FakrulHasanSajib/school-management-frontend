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
    // TeacherController@store এ ডাটা পাঠানো
    await axios.post('http://127.0.0.1:8000/api/teachers', form.value)
    alert('শিক্ষক সফলভাবে যোগ করা হয়েছে! 🎉')
    router.push('/admin/teachers')
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors
    } else {
      alert('সার্ভার এরর!')
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="card">
    <h3>➕ নতুন শিক্ষক যোগ করুন</h3>
    <form @submit.prevent="handleSubmit">
      <div class="grid">
        <div class="form-group">
          <label>নাম</label>
          <input v-model="form.name" type="text" placeholder="শিক্ষকের নাম" />
          <span v-if="errors.name" class="error">{{ errors.name[0] }}</span>
        </div>
        <div class="form-group">
          <label>ইমেইল</label>
          <input v-model="form.email" type="email" placeholder="email@school.com" />
          <span v-if="errors.email" class="error">{{ errors.email[0] }}</span>
        </div>
        <div class="form-group">
          <label>পদবী (Designation)</label>
          <input v-model="form.designation" type="text" placeholder="যেমন: Senior Teacher" />
          <span v-if="errors.designation" class="error">{{ errors.designation[0] }}</span>
        </div>
        <div class="form-group">
          <label>যোগ্যতা (Qualification)</label>
          <input v-model="form.qualification" type="text" placeholder="যেমন: M.Sc in Math" />
          <span v-if="errors.qualification" class="error">{{ errors.qualification[0] }}</span>
        </div>
        <div class="form-group">
          <label>ফোন নম্বর</label>
          <input v-model="form.phone" type="text" placeholder="017XXXXXXXX" />
          <span v-if="errors.phone" class="error">{{ errors.phone[0] }}</span>
        </div>
        <div class="form-group">
          <label>যোগদানের তারিখ</label>
          <input v-model="form.joining_date" type="date" />
          <span v-if="errors.joining_date" class="error">{{ errors.joining_date[0] }}</span>
        </div>
      </div>
      <button type="submit" :disabled="isLoading" class="submit-btn">
        {{ isLoading ? 'সেভ হচ্ছে...' : 'সেভ করুন' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.error {
  color: red;
  font-size: 0.8rem;
}
.submit-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
