<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const BASE_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000/api'
    : '/api'
const token = localStorage.getItem('token')
const apiConfig = { headers: { Authorization: `Bearer ${token}` } }

const exams = ref([])
const classes = ref([])
const sections = ref([])
const results = ref([]) // সব স্টুডেন্টের রেজাল্ট লিস্ট
const subjectHeaders = ref([]) // টেবিলের হেডারে সাবজেক্ট দেখানোর জন্য

const filter = ref({ exam_id: '', class_id: '', section_id: '' })
const loading = ref(false)

// ১. ডাটা লোড
const loadInitialData = async () => {
  try {
    const [examRes, classRes] = await Promise.all([
      axios.get(`${BASE_URL}/exams`, apiConfig),
      axios.get(`${BASE_URL}/academic/classes`, apiConfig),
    ])
    exams.value = examRes.data.data || examRes.data
    classes.value = classRes.data.data
  } catch (error) {
    console.error(error)
  }
}

const handleClassChange = async () => {
  sections.value = []
  if (!filter.value.class_id) return
  const res = await axios.get(
    `${BASE_URL}/academic/classes/${filter.value.class_id}/sections`,
    apiConfig,
  )
  sections.value = res.data.data
}

// ২. ট্যাবুলেশন শিট আনা
const getTabulation = async () => {
  if (!filter.value.exam_id || !filter.value.section_id) {
    return Swal.fire('Warning', 'পরীক্ষা এবং সেকশন সিলেক্ট করুন', 'warning')
  }

  loading.value = true
  results.value = []
  subjectHeaders.value = []

  try {
    const res = await axios.get(
      `${BASE_URL}/results/tabulation/exam/${filter.value.exam_id}/section/${filter.value.section_id}`,
      apiConfig,
    )

    if (res.data.status) {
      results.value = res.data.data

      // ডাইনামিক সাবজেক্ট হেডার তৈরি করা (প্রথম স্টুডেন্ট থেকে সাবজেক্ট লিস্ট নেওয়া)
      if (results.value.length > 0) {
        subjectHeaders.value = results.value[0].subjects.map((s) => s.subject)
      }

      Swal.fire('Success', 'রেজাল্ট শিট তৈরি হয়েছে!', 'success')
    } else {
      Swal.fire('Info', res.data.message, 'info')
    }
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'রেজাল্ট আনা যায়নি', 'error')
  } finally {
    loading.value = false
  }
}

const printSheet = () => {
  window.print()
}

onMounted(loadInitialData)
</script>

<template>
  <div class="p-4">
    <div class="card no-print mb-4">
      <h3>📋 ট্যাবুলেশন শিট (ক্লাস রেজাল্ট)</h3>
      <div class="filters">
        <select v-model="filter.exam_id">
          <option value="">পরীক্ষা</option>
          <option v-for="e in exams" :key="e.id" :value="e.id">{{ e.name }}</option>
        </select>
        <select v-model="filter.class_id" @change="handleClassChange">
          <option value="">ক্লাস</option>
          <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <select v-model="filter.section_id">
          <option value="">সেকশন</option>
          <option v-for="s in sections" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
        <button @click="getTabulation" class="btn-search">View Sheet</button>
      </div>
    </div>

    <div v-if="results.length > 0" class="card sheet-card">
      <div class="text-center mb-3">
        <h2>ABC School Results</h2>
        <h4>Tabulation Sheet</h4>
      </div>

      <div class="table-responsive">
        <table class="tab-table">
          <thead>
            <tr>
              <th>Roll</th>
              <th>Name</th>
              <th v-for="(sub, i) in subjectHeaders" :key="i">{{ sub }}</th>
              <th>Total</th>
              <th>GPA</th>
              <th>Grade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in results" :key="student.student_id">
              <td>{{ student.roll }}</td>
              <td class="text-left">{{ student.name }}</td>

              <td v-for="(sub, i) in student.subjects" :key="i">
                {{ sub.marks }} <br />
                <small>({{ sub.grade }})</small>
              </td>

              <td
                v-if="student.subjects.length < subjectHeaders.length"
                :colspan="subjectHeaders.length - student.subjects.length"
              >
                Abs
              </td>

              <td>
                <strong>{{ student.total_marks }}</strong>
              </td>
              <td>
                <strong>{{ student.gpa }}</strong>
              </td>
              <td>
                <span class="badge" :class="student.status === 'PASS' ? 'bg-green' : 'bg-red'">{{
                  student.grade
                }}</span>
              </td>
              <td :class="student.status === 'PASS' ? 'text-pass' : 'text-fail'">
                {{ student.status }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <button @click="printSheet" class="btn-print no-print">🖨️ Print Sheet</button>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: white !important;
  padding: 20px;
  border-radius: 10px;
  color: #333 !important;
}
.filters {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}
select,
button {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
  background: #fff !important;
  color: #000 !important;
}
.btn-search {
  background: #2563eb !important;
  color: white !important;
  border: none;
}
.btn-print {
  background: #333 !important;
  color: white !important;
  border: none;
  margin-top: 15px;
  padding: 10px 20px;
  border-radius: 5px;
}

/* টেবিল স্টাইল */
.tab-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  font-size: 14px;
  background: #fff !important;
}
.tab-table th,
.tab-table td {
  border: 1px solid #000 !important;
  padding: 8px;
  text-align: center;
  color: #000 !important;
}
.tab-table th {
  background: #f0f0f0 !important;
  font-weight: bold;
}
.text-left {
  text-align: left !important;
}

/* স্ট্যাটাস কালার */
.bg-green {
  background: #dcfce7;
  color: #166534;
  padding: 2px 6px;
  border-radius: 4px;
}
.bg-red {
  background: #fee2e2;
  color: #991b1b;
  padding: 2px 6px;
  border-radius: 4px;
}
.text-pass {
  color: green !important;
  font-weight: bold;
}
.text-fail {
  color: red !important;
  font-weight: bold;
}

/* প্রিন্ট ফিক্স */
@media print {
  body * {
    visibility: hidden;
  }
  .sheet-card,
  .sheet-card * {
    visibility: visible;
  }
  .sheet-card {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    padding: 10px;
    border: none;
    box-shadow: none;
  }
  .no-print,
  .filters {
    display: none !important;
  }
}
</style>
