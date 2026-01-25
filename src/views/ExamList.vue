<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const exams = ref([])
const name = ref('')
const startDate = ref('')
const loading = ref(false)
const token = localStorage.getItem('token')

const apiConfig = { headers: { Authorization: `Bearer ${token}` } }

// ১. সব পরীক্ষার লিস্ট আনা
const fetchExams = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/exams', apiConfig)
    exams.value = res.data.data || res.data // আপনার API রেসপন্স স্ট্রাকচার অনুযায়ী
  } catch (error) {
    console.error(error)
  }
}

// ২. নতুন পরীক্ষা তৈরি করা
const createExam = async () => {
  if (!name.value || !startDate.value) return Swal.fire('Error', 'নাম এবং তারিখ দিন', 'warning')

  loading.value = true
  try {
    await axios.post(
      'http://127.0.0.1:8000/api/exams',
      {
        name: name.value,
        start_date: startDate.value,
      },
      apiConfig,
    )

    Swal.fire('Success', 'পরীক্ষা তৈরি হয়েছে!', 'success')
    name.value = ''
    startDate.value = ''
    fetchExams() // লিস্ট রিফ্রেশ
  } catch (error) {
    Swal.fire('Error', 'সেভ করা যায়নি', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(fetchExams)
</script>

<template>
  <div class="p-4">
    <div class="card">
      <h3>📝 পরীক্ষার তালিকা ও সেটআপ</h3>

      <div class="form-row">
        <input v-model="name" type="text" placeholder="পরীক্ষার নাম (উদাঃ Final Exam 2026)" />
        <input v-model="startDate" type="date" />
        <button @click="createExam" :disabled="loading" class="btn-save">
          {{ loading ? 'সেভ হচ্ছে...' : '+ নতুন এক্সাম' }}
        </button>
      </div>

      <table class="table mt-4">
        <thead>
          <tr>
            <th>ID</th>
            <th>পরীক্ষার নাম</th>
            <th>শুরুর তারিখ</th>
            <th>স্ট্যাটাস</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="exam in exams" :key="exam.id">
            <td>{{ exam.id }}</td>
            <td class="font-bold">{{ exam.name }}</td>
            <td>{{ exam.start_date }}</td>
            <td><span class="badge">Active</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
.form-row {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  flex: 1;
}
.btn-save {
  background: #2563eb;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}
.table th,
.table td {
  border: 1px solid #eee;
  padding: 10px;
  text-align: left;
}
.badge {
  background: #dcfce7;
  color: #166534;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 12px;
}
</style>
