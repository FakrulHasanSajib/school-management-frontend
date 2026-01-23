<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const classes = ref([])
const isLoading = ref(false)

// ফর্ম ডাটা
const form = ref({
  class_id: '',
  name: '', // Subject Name
  code: '', // Subject Code (Optional)
  type: 'Theory', // Theory or Practical
})

// ১. পেজ লোড হলে ক্লাস লিস্ট নিয়ে আসা
onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('http://127.0.0.1:8000/api/academic/classes', {
      headers: { Authorization: `Bearer ${token}` },
    })
    classes.value = response.data.data || response.data
  } catch (error) {
    console.error('ক্লাস লোড হয়নি:', error)
  }
})

// ২. সাবজেক্ট সেভ করা
const submitSubject = async () => {
  if (!form.value.class_id) {
    alert('দয়া করে ক্লাস সিলেক্ট করুন!')
    return
  }

  isLoading.value = true
  try {
    const token = localStorage.getItem('token')

    await axios.post('http://127.0.0.1:8000/api/academic/subjects', form.value, {
      headers: { Authorization: `Bearer ${token}` },
    })

    alert('সাবজেক্ট সফলভাবে যুক্ত হয়েছে! ✅')

    // ফর্ম রিসেট
    form.value.name = ''
    form.value.code = ''
  } catch (error) {
    console.error(error)
    alert('সাবজেক্ট সেভ করা যায়নি!')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="form-container">
    <div class="card">
      <h2>📚 নতুন বিষয় (Subject) যুক্ত করুন</h2>

      <form @submit.prevent="submitSubject">
        <div class="form-group">
          <label>কোন ক্লাসের বিষয়?</label>
          <select v-model="form.class_id" required>
            <option value="" disabled>ক্লাস নির্বাচন করুন</option>
            <option v-for="cls in classes" :key="cls.id" :value="cls.id">
              {{ cls.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>বিষয়ের নাম (Subject Name)</label>
          <input v-model="form.name" type="text" placeholder="উদাহরণ: Mathematics" required />
        </div>

        <div class="grid-row">
          <div class="form-group">
            <label>বিষয় কোড (Code)</label>
            <input v-model="form.code" type="text" placeholder="১০১" />
          </div>

          <div class="form-group">
            <label>ধরণ (Type)</label>
            <select v-model="form.type">
              <option value="Theory">থিওরি (Theory)</option>
              <option value="Practical">ব্যবহারিক (Practical)</option>
            </select>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? 'সেভ হচ্ছে...' : 'সাবজেক্ট সেভ করুন' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 2rem auto;
}
.card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}
h2 {
  color: #1e293b;
  margin-bottom: 1.5rem;
  text-align: center;
}
.form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}
.form-group label {
  margin-bottom: 5px;
  font-weight: 600;
  color: #475569;
}
.form-group input,
.form-group select {
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 1rem;
}
.grid-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}
.submit-btn {
  width: 100%;
  background: #0f172a;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.3s;
}
.submit-btn:hover {
  background: #334155;
}
.submit-btn:disabled {
  background: #94a3b8;
}
</style>
