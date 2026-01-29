<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const exams = ref([])
const classes = ref([])

// ফর্মের ডাটা (Controller এর ডিমান্ড অনুযায়ী ৫টি ফিল্ড)
const name = ref('')
const selectedClass = ref('') // class_id
const session = ref(new Date().getFullYear()) // ডিফল্ট বর্তমান বছর (নাম্বার)
const startDate = ref('')
const endDate = ref('')

const loading = ref(false)
const token = localStorage.getItem('token')

const apiConfig = { headers: { Authorization: `Bearer ${token}` } }

// ১. ক্লাসের লিস্ট আনা
const fetchClasses = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/academic/classes', apiConfig)
    classes.value = res.data.data || res.data
  } catch (error) {
    console.error('Error fetching classes:', error)
  }
}

// ২. সব পরীক্ষার লিস্ট আনা
const fetchExams = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/exams', apiConfig)
    exams.value = res.data.data || res.data
  } catch (error) {
    console.error('Fetch Error:', error)
    if (error.response && error.response.status === 405) {
      Swal.fire('Error', 'Back-end e GET route nei! api.php check korun.', 'error')
    }
  }
}

// ৩. নতুন পরীক্ষা তৈরি করা
const createExam = async () => {
  // ভ্যালিডেশন
  if (!name.value || !selectedClass.value || !startDate.value || !endDate.value || !session.value) {
    return Swal.fire(
      'Warning',
      'সবগুলো ফিল্ড পূরণ করা বাধ্যতামূলক (নাম, ক্লাস, সেশন, তারিখ)',
      'warning',
    )
  }

  loading.value = true
  try {
    await axios.post(
      'http://127.0.0.1:8000/api/exams',
      {
        name: name.value,
        class_id: selectedClass.value,

        // ✅ ফিক্স: সেশনকে স্ট্রিংয়ে কনভার্ট করা হলো (String Convert Fix)
        session: String(session.value),

        start_date: startDate.value,
        end_date: endDate.value,
      },
      apiConfig,
    )

    Swal.fire('Success', 'পরীক্ষা সফলভাবে তৈরি হয়েছে!', 'success')

    // ফর্ম রিসেট
    name.value = ''
    startDate.value = ''
    endDate.value = ''
    fetchExams() // লিস্ট আপডেট
  } catch (error) {
    if (error.response && error.response.status === 422) {
      // Validation Error
      const errorMsg = Object.values(error.response.data.errors).flat().join('<br>')
      Swal.fire({ icon: 'error', title: 'Validation Error', html: errorMsg })
    } else {
      Swal.fire('Error', 'সেভ করা যায়নি।', 'error')
      console.error(error)
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchClasses()
  fetchExams()
})
</script>

<template>
  <div class="p-4">
    <div class="card">
      <h3>📝 পরীক্ষার তালিকা ও সেটআপ</h3>

      <div class="form-grid">
        <div class="form-group">
          <label>পরীক্ষার নাম</label>
          <input v-model="name" type="text" placeholder="উদাঃ Final Exam" />
        </div>

        <div class="form-group">
          <label>ক্লাস সিলেক্ট করুন</label>
          <select v-model="selectedClass">
            <option value="">ক্লাস বেছে নিন</option>
            <option v-for="cls in classes" :key="cls.id" :value="cls.id">
              {{ cls.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>সেশন (বছর)</label>
          <input v-model="session" type="text" placeholder="2026" />
        </div>

        <div class="form-group">
          <label>শুরুর তারিখ</label>
          <input v-model="startDate" type="date" />
        </div>

        <div class="form-group">
          <label>শেষের তারিখ</label>
          <input v-model="endDate" type="date" />
        </div>

        <div class="form-group btn-container">
          <button @click="createExam" :disabled="loading" class="btn-save">
            {{ loading ? 'সেভ হচ্ছে...' : '+ সেভ করুন' }}
          </button>
        </div>
      </div>

      <table class="table mt-4">
        <thead>
          <tr>
            <th>ID</th>
            <th>পরীক্ষার নাম</th>
            <th>ক্লাস ID</th>
            <th>তারিখ</th>
            <th>স্ট্যাটাস</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="exam in exams" :key="exam.id">
            <td>{{ exam.id }}</td>
            <td class="font-bold">{{ exam.name }}</td>
            <td>{{ exam.class_id }}</td>
            <td>{{ exam.start_date }} - {{ exam.end_date }}</td>
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
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
  align-items: end;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
label {
  font-size: 14px;
  font-weight: bold;
  color: #555;
}
input,
select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  width: 100%;
}
.btn-container {
  justify-content: flex-end;
}
.btn-save {
  background: #2563eb;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  height: 42px;
  margin-top: auto;
}
.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 30px;
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
