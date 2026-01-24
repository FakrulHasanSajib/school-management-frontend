<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2' // ✅ সুন্দর মেসেজের জন্য

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
  blood_group: '', // ✅ নতুন
  image: null, // ✅ নতুন
})

// ১. ডাটা লোড
const fetchTeacherDetails = async () => {
  try {
    const teacherId = route.params.id
    const response = await axios.get(`http://127.0.0.1:8000/api/teachers/${teacherId}`)
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
    if (data.teacher_profile?.image) {
      imagePreview.value = `http://127.0.0.1:8000/storage/${data.teacher_profile.image}`
    }
  } catch (error) {
    Swal.fire('Error', 'তথ্য লোড করা যায়নি', 'error')
  }
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    teacher.value.image = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

// ২. আপডেট ফাংশন
const handleUpdate = async () => {
  isLoading.value = true
  const formData = new FormData()
  formData.append('_method', 'PUT') // ✅ লারাভেল PUT-এ ফাইল নিতে এটা লাগে

  for (const key in teacher.value) {
    if (teacher.value[key] !== null) formData.append(key, teacher.value[key])
  }

  try {
    await axios.post(`http://127.0.0.1:8000/api/teachers/${route.params.id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    // ✅ সুন্দর সাকসেস মেসেজ
    await Swal.fire({
      icon: 'success',
      title: 'সফল!',
      text: 'শিক্ষকের তথ্য আপডেট হয়েছে 🎉',
      timer: 2000,
      showConfirmButton: false,
    })
    router.push('/admin/teachers')
  } catch (error) {
    if (error.response?.status === 422) errors.value = error.response.data.errors
    else Swal.fire('ভুল হয়েছে', 'আপডেট করা সম্ভব হয়নি', 'error')
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchTeacherDetails)
</script>

<template>
  <div class="edit-container">
    <div class="header">
      <h2>✏️ শিক্ষক তথ্য পরিবর্তন</h2>
      <button @click="router.back()" class="back-btn">← ফিরে যান</button>
    </div>

    <div class="form-card">
      <form @submit.prevent="handleUpdate">
        <div class="grid-form">
          <div class="form-group">
            <label>নাম</label>
            <input v-model="teacher.name" type="text" />
          </div>
          <div class="form-group">
            <label>ইমেইল</label>
            <input v-model="teacher.email" type="email" />
          </div>
          <div class="form-group">
            <label>পদবী</label>
            <input v-model="teacher.designation" type="text" />
          </div>
          <div class="form-group">
            <label>ফোন নম্বর</label>
            <input v-model="teacher.phone" type="text" />
          </div>
          <div class="form-group">
            <label>রক্তের গ্রুপ</label>
            <select v-model="teacher.blood_group">
              <option value="">নির্বাচন করুন</option>
              <option
                v-for="bg in ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']"
                :key="bg"
                :value="bg"
              >
                {{ bg }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>যোগদানের তারিখ</label>
            <input v-model="teacher.joining_date" type="date" />
          </div>
        </div>

        <div class="image-section">
          <label>প্রোফাইল ছবি</label>
          <input type="file" @change="handleFileChange" />
          <img v-if="imagePreview" :src="imagePreview" class="preview-img" />
        </div>

        <button type="submit" class="update-btn" :disabled="isLoading">
          {{ isLoading ? 'সেভ হচ্ছে...' : '💾 পরিবর্তন সেভ করুন' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.edit-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
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
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}
.grid-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #475569;
}
.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}
.image-section {
  margin-top: 20px;
}
.preview-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-top: 10px;
  border: 2px solid #3b82f6;
}
.update-btn {
  width: 100%;
  background: #2563eb;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
  transition: 0.3s;
}
.update-btn:hover {
  background: #1d4ed8;
}
.back-btn {
  background: #64748b;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}
</style>
