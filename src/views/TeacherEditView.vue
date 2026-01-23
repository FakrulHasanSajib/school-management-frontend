<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const isLoading = ref(false)

// ফর্মের ডাটা রাখার জন্য ভেরিয়েবল
const teacher = ref({
  name: '',
  email: '',
  designation: '',
  qualification: '',
  phone: '',
  joining_date: '',
})

// ১. পেজ লোড হলে টিচারের পুরনো তথ্য নিয়ে আসা
const fetchTeacherDetails = async () => {
  const teacherId = route.params.id
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`http://127.0.0.1:8000/api/teachers/${teacherId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    // ⚠️ আগে ছিল: const data = response.data
    // ✅ এখন হবে: const data = response.data.data (কারণ ApiResponse ডাটা র‍্যাপ করে পাঠায়)
    const data = response.data.data

    // কনসোলে চেক করুন ডাটা ঠিকমতো আসছে কি না
    console.log('Teacher Data:', data)

    teacher.value = {
      name: data.name,
      email: data.email,
      // সেফটি চেকসহ ভ্যালু বসানো
      designation: data.teacher_profile?.designation || '',
      qualification: data.teacher_profile?.qualification || '',
      phone: data.teacher_profile?.phone || '',
      joining_date: data.teacher_profile?.joining_date || '',
    }
  } catch (error) {
    console.error('Error loading teacher:', error)
    alert('শিক্ষকের তথ্য লোড করা যায়নি!')
  }
}

// ২. আপডেট বাটন চাপলে ডাটা সেভ করা
const handleUpdate = async () => {
  const teacherId = route.params.id
  try {
    isLoading.value = true
    const token = localStorage.getItem('token')

    await axios.put(`http://127.0.0.1:8000/api/teachers/${teacherId}`, teacher.value, {
      headers: { Authorization: `Bearer ${token}` },
    })

    alert('সফলভাবে আপডেট হয়েছে!')
    router.push('/admin/teachers') // লিস্ট পেজে ফেরত যাওয়া
  } catch (error) {
    console.error('Update Error:', error)
    alert('আপডেট করা সম্ভব হয়নি!')
  } finally {
    isLoading.value = false
  }
}

// পেজ মাউন্ট হলে ফাংশন কল হবে
onMounted(() => {
  fetchTeacherDetails()
})
</script>

<template>
  <div class="edit-container">
    <div class="header">
      <h2>✏️ শিক্ষক এডিট করুন</h2>
      <button @click="router.back()" class="back-btn">← ফিরে যান</button>
    </div>

    <div class="form-card">
      <form @submit.prevent="handleUpdate">
        <div class="form-group">
          <label>শিক্ষকের নাম</label>
          <input v-model="teacher.name" type="text" required />
        </div>

        <div class="form-group">
          <label>ইমেইল</label>
          <input v-model="teacher.email" type="email" required />
        </div>

        <div class="form-group">
          <label>পদবী (Designation)</label>
          <input v-model="teacher.designation" type="text" required />
        </div>

        <div class="form-group">
          <label>শিক্ষাগত যোগ্যতা</label>
          <input v-model="teacher.qualification" type="text" required />
        </div>

        <div class="form-group">
          <label>ফোন নম্বর</label>
          <input v-model="teacher.phone" type="text" required />
        </div>

        <div class="form-group">
          <label>জয়েনিং ডেট</label>
          <input v-model="teacher.joining_date" type="date" required />
        </div>

        <button type="submit" class="update-btn" :disabled="isLoading">
          {{ isLoading ? 'আপডেট হচ্ছে...' : 'তথ্য আপডেট করুন' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.edit-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.form-card {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}
.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}
.update-btn {
  width: 100%;
  background: #2563eb;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}
.update-btn:disabled {
  background: #93c5fd;
}
.back-btn {
  background: #64748b;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
}
</style>
