<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const exams = ref([])
const classes = ref([])

// ফর্মের ডাটা
const name = ref('')
const selectedClass = ref('')
const session = ref(new Date().getFullYear())
const startDate = ref('')
const endDate = ref('')

// এডিট মোড হ্যান্ডেল করার জন্য ভেরিয়েবল
const isEditing = ref(false)
const editingId = ref(null)

const loading = ref(false)
const token = localStorage.getItem('token')
const apiConfig = { headers: { Authorization: `Bearer ${token}` } }

// ১. ডাটা আনা
const fetchClasses = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/academic/classes', apiConfig)
    classes.value = res.data.data || res.data
  } catch (error) {
    console.error(error)
  }
}

const fetchExams = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/exams', apiConfig)
    exams.value = res.data.data || res.data
  } catch (error) {
    console.error(error)
  }
}

// ২. সেভ অথবা আপডেট করা
const saveExam = async () => {
  if (!name.value || !startDate.value) {
    return Swal.fire('Warning', 'নাম এবং তারিখ দেওয়া বাধ্যতামূলক', 'warning')
  }

  loading.value = true
  const payload = {
    name: name.value,
    class_id: selectedClass.value,
    session: String(session.value),
    start_date: startDate.value,
    end_date: endDate.value,
  }

  try {
    if (isEditing.value) {
      // আপডেট (PUT)
      await axios.put(`http://127.0.0.1:8000/api/exams/${editingId.value}`, payload, apiConfig)
      Swal.fire('Updated!', 'পরীক্ষা আপডেট হয়েছে।', 'success')
    } else {
      // নতুন তৈরি (POST)
      await axios.post('http://127.0.0.1:8000/api/exams', payload, apiConfig)
      Swal.fire('Saved!', 'নতুন পরীক্ষা তৈরি হয়েছে।', 'success')
    }

    resetForm()
    fetchExams()
  } catch (error) {
    Swal.fire('Error', 'কাজটি সম্পন্ন করা যায়নি।', 'error')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// ৩. এডিট বাটন অ্যাকশন
const editExam = (exam) => {
  name.value = exam.name
  selectedClass.value = exam.class_id
  session.value = exam.session
  startDate.value = exam.start_date
  endDate.value = exam.end_date

  isEditing.value = true
  editingId.value = exam.id
}

// ৪. ডিলিট অ্যাকশন
const deleteExam = async (id) => {
  const confirm = await Swal.fire({
    title: 'নিশ্চিত?',
    text: 'এটি মুছে ফেলা হবে!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'হ্যাঁ, মুছুন',
  })

  if (confirm.isConfirmed) {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/exams/${id}`, apiConfig)
      Swal.fire('Deleted!', 'মুছে ফেলা হয়েছে।', 'success')
      fetchExams()
    } catch (error) {
      Swal.fire('Error', 'মুছে ফেলা যায়নি।', 'error')
    }
  }
}

// ৫. রিসেট
const resetForm = () => {
  name.value = ''
  selectedClass.value = ''
  startDate.value = ''
  endDate.value = ''
  session.value = new Date().getFullYear()
  isEditing.value = false
  editingId.value = null
}

onMounted(() => {
  fetchClasses()
  fetchExams()
})
</script>

<template>
  <div class="p-4">
    <div class="card form-card">
      <h3 style="color: #333">
        {{ isEditing ? '✏️ পরীক্ষা আপডেট করুন' : '📝 নতুন পরীক্ষা তৈরি করুন' }}
      </h3>

      <div class="form-grid">
        <div class="form-group">
          <label>পরীক্ষার নাম</label>
          <input v-model="name" type="text" placeholder="উদাঃ Final Exam" />
        </div>

        <div class="form-group">
          <label>ক্লাস</label>
          <select v-model="selectedClass">
            <option value="">ক্লাস বেছে নিন</option>
            <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>সেশন</label>
          <input v-model="session" type="text" />
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
          <button v-if="isEditing" @click="resetForm" class="btn-cancel">বাতিল</button>
          <button @click="saveExam" :disabled="loading" class="btn-save">
            {{ loading ? 'অপেক্ষা করুন...' : isEditing ? 'আপডেট করুন' : '+ সেভ করুন' }}
          </button>
        </div>
      </div>
    </div>

    <div class="card table-card mt-4">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>নাম</th>
            <th>ক্লাস ID</th>
            <th>তারিখ</th>
            <th>অ্যাকশন</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="exam in exams" :key="exam.id">
            <td>{{ exam.id }}</td>
            <td class="font-bold">{{ exam.name }}</td>
            <td>{{ exam.class_id }}</td>
            <td>{{ exam.start_date }}</td>
            <td>
              <button @click="editExam(exam)" class="btn-edit">Edit</button>
              <button @click="deleteExam(exam.id)" class="btn-delete">Delete</button>
            </td>
          </tr>
          <tr v-if="exams.length === 0">
            <td colspan="5" style="text-align: center">কোনো ডাটা পাওয়া যায়নি</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* কার্ড স্টাইল */
.card {
  background: white !important; /* ব্যাকগ্রাউন্ড সাদা হতে বাধ্য */
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
  align-items: end;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

/* লেবেল কালো করা হয়েছে */
label {
  color: #333 !important;
  font-weight: bold;
  font-size: 14px;
}

/* ইনপুট ফিল্ড ফিক্স */
input,
select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  width: 100%;
  background-color: #ffffff !important; /* ব্যাকগ্রাউন্ড সাদা */
  color: #000000 !important; /* টেক্সট কালো */
}

.btn-container {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* বাটন স্টাইল */
.btn-save {
  background: #2563eb;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.btn-cancel {
  background: #64748b;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.btn-edit {
  background: #f59e0b;
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
}
.btn-delete {
  background: #ef4444;
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* টেবিল স্টাইল - টেক্সট কালো করা হয়েছে */
.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0;
  background-color: white !important;
}

.table th,
.table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
  text-align: left;
  color: #000000 !important; /* 🔥 টেক্সট কালো হবেই */
}

.table th {
  background-color: #f8fafc !important;
  font-weight: 600;
  color: #334155 !important;
}

.table tbody tr {
  background-color: #ffffff !important;
}

.table tbody tr:hover {
  background-color: #f1f5f9 !important;
}
</style>
