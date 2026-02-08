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

  // স্ক্রল করে উপরে নিয়ে যাওয়া
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ৪. ডিলিট অ্যাকশন
const deleteExam = async (id) => {
  const confirm = await Swal.fire({
    title: 'নিশ্চিত?',
    text: 'এটি মুছে ফেলা হবে!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'হ্যাঁ, মুছুন',
    background: '#1e1e2d', // ডার্ক থিম এলার্ট
    color: '#fff',
  })

  if (confirm.isConfirmed) {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/exams/${id}`, apiConfig)
      Swal.fire({
        title: 'Deleted!',
        text: 'মুছে ফেলা হয়েছে।',
        icon: 'success',
        background: '#1e1e2d',
        color: '#fff',
      })
      fetchExams()
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'মুছে ফেলা যায়নি।',
        icon: 'error',
        background: '#1e1e2d',
        color: '#fff',
      })
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
  <div class="page-container">
    <div class="header-action">
      <h2 class="page-title">📝 Exam Management</h2>
      <p class="page-subtitle">Create and manage exams easily</p>
    </div>

    <div class="glass-card form-card">
      <div class="card-header">
        <h3>{{ isEditing ? '✏️ পরীক্ষা আপডেট করুন' : '➕ নতুন পরীক্ষা তৈরি করুন' }}</h3>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label>পরীক্ষার নাম</label>
          <div class="input-wrapper">
            <span class="icon">📝</span>
            <input v-model="name" type="text" placeholder="উদাঃ Final Exam" />
          </div>
        </div>

        <div class="form-group">
          <label>ক্লাস</label>
          <div class="input-wrapper">
            <span class="icon">🏫</span>
            <select v-model="selectedClass">
              <option value="">ক্লাস বেছে নিন</option>
              <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>সেশন</label>
          <div class="input-wrapper">
            <span class="icon">📅</span>
            <input v-model="session" type="text" />
          </div>
        </div>

        <div class="form-group">
          <label>শুরুর তারিখ</label>
          <div class="input-wrapper">
            <span class="icon">🚀</span>
            <input v-model="startDate" type="date" />
          </div>
        </div>

        <div class="form-group">
          <label>শেষের তারিখ</label>
          <div class="input-wrapper">
            <span class="icon">🏁</span>
            <input v-model="endDate" type="date" />
          </div>
        </div>

        <div class="form-actions">
          <button v-if="isEditing" @click="resetForm" class="btn btn-cancel">বাতিল</button>
          <button @click="saveExam" :disabled="loading" class="btn btn-save">
            {{ loading ? 'অপেক্ষা করুন...' : isEditing ? 'আপডেট করুন' : 'সেভ করুন' }}
          </button>
        </div>
      </div>
    </div>

    <div class="glass-card table-card mt-4">
      <div class="card-header">
        <h3>📋 পরীক্ষার তালিকা</h3>
      </div>

      <div class="table-responsive">
        <table class="custom-table">
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
              <td class="id-col">#{{ exam.id }}</td>
              <td class="font-bold text-white">{{ exam.name }}</td>
              <td>
                <span class="badge">{{ exam.class_id }}</span>
              </td>
              <td>{{ exam.start_date }}</td>
              <td>
                <div class="action-buttons">
                  <button @click="editExam(exam)" class="btn-icon edit" title="Edit">✏️</button>
                  <button @click="deleteExam(exam.id)" class="btn-icon delete" title="Delete">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="exams.length === 0">
              <td colspan="5" class="empty-state">
                <span class="empty-icon">📂</span> কোনো ডাটা পাওয়া যায়নি
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Page Layout */
.page-container {
  padding: 25px;
  color: #fff;
  max-width: 1000px;
  margin: 0 auto;
}
.header-action {
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

/* Glass Card */
.glass-card {
  background: #1e1e2d;
  border-radius: 12px;
  padding: 25px;
  border: 1px solid #2b2b40;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}
.mt-4 {
  margin-top: 30px;
}
.card-header h3 {
  margin: 0 0 20px 0;
  color: #3b82f6;
  font-size: 18px;
  border-bottom: 1px solid #2b2b40;
  padding-bottom: 10px;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  align-items: end;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
label {
  font-size: 13px;
  font-weight: 600;
  color: #a1a5b7;
}

/* Inputs */
.input-wrapper {
  position: relative;
}
.icon {
  position: absolute;
  left: 12px;
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
  padding: 12px 12px 12px 40px;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  outline: none;
  transition: 0.3s;
}
input:focus,
select:focus {
  border-color: #3b82f6;
}
input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

/* Buttons */
.form-actions {
  display: flex;
  gap: 10px;
  grid-column: span 1;
  justify-content: flex-end;
}
@media (min-width: 600px) {
  .form-actions {
    grid-column: span 2;
  }
}
@media (min-width: 900px) {
  .form-actions {
    grid-column: span 3;
  }
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
  width: 100%;
}
.btn-save {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}
.btn-save:hover {
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}
.btn-cancel {
  background: #2b2b40;
  color: #a1a5b7;
}
.btn-cancel:hover {
  background: #323248;
  color: white;
}

/* Table */
.table-responsive {
  overflow-x: auto;
}
.custom-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.custom-table th {
  background: #151521;
  padding: 15px;
  color: #a1a5b7;
  font-weight: 600;
  font-size: 13px;
  border-bottom: 1px solid #2b2b40;
  text-transform: uppercase;
}
.custom-table td {
  padding: 15px;
  border-bottom: 1px solid #2b2b40;
  color: #e2e8f0;
  vertical-align: middle;
}
.custom-table tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

.text-white {
  color: white;
}
.id-col {
  font-family: 'Courier New', monospace;
  color: #a1a5b7;
}
.badge {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}
.empty-state {
  text-align: center;
  color: #64748b;
  padding: 30px;
}
.empty-icon {
  font-size: 24px;
  vertical-align: middle;
  margin-right: 10px;
}

/* Action Icons */
.action-buttons {
  display: flex;
  gap: 8px;
}
.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.3s;
}
.edit {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}
.edit:hover {
  background: #f59e0b;
  color: white;
}
.delete {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}
.delete:hover {
  background: #ef4444;
  color: white;
}
</style>
