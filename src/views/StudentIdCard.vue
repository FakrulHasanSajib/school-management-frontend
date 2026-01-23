<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const student = ref(null)
const isLoading = ref(true)

// স্কুলের তথ্য (ফিক্সড বা ডাইনামিক হতে পারে)
const schoolName = 'সফ্টওয়্যার আইটি স্কুল এন্ড কলেজ'
const schoolAddress = 'মিরপুর-১০, ঢাকা-১২১৬'
const schoolLogo = 'https://cdn-icons-png.flaticon.com/512/2965/2965300.png' // ডেমো লোগো
const principalSign =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Signature_sample.svg/1200px-Signature_sample.svg.png' // ডেমো স্বাক্ষর

const fetchStudent = async () => {
  try {
    const id = route.params.id
    const response = await axios.get(`http://127.0.0.1:8000/api/students/${id}`)
    student.value = response.data.data
  } catch (error) {
    alert('ডাটা পাওয়া যায়নি!')
  } finally {
    isLoading.value = false
  }
}

const printCard = () => {
  window.print()
}

onMounted(() => {
  fetchStudent()
})
</script>

<template>
  <div class="page-container">
    <div class="actions no-print">
      <button @click="router.back()" class="back-btn">⬅ ফিরে যান</button>
      <button @click="printCard" class="print-btn">🖨️ প্রিন্ট করুন</button>
    </div>

    <div v-if="isLoading" class="loading">লোড হচ্ছে...</div>

    <div v-else class="id-card-container" id="print-area">
      <div class="id-card">
        <div class="card-header">
          <img :src="schoolLogo" class="logo" alt="Logo" />
          <div class="school-text">
            <h2>{{ schoolName }}</h2>
            <p>{{ schoolAddress }}</p>
          </div>
        </div>

        <div class="card-body">
          <div class="photo-area">
            <img
              :src="student.image || 'https://via.placeholder.com/150'"
              class="student-photo"
              alt="Student"
            />
          </div>

          <div class="info-area">
            <h3 class="name">{{ student.name }}</h3>
            <p class="designation">স্টুডেন্ট</p>

            <table class="info-table">
              <tr>
                <td>আইডি নং:</td>
                <td>
                  <strong>{{ student.admission_no }}</strong>
                </td>
              </tr>
              <tr>
                <td>ক্লাস:</td>
                <td>{{ student.class }}</td>
              </tr>
              <tr>
                <td>সেকশন:</td>
                <td>{{ student.section }}</td>
              </tr>
              <tr>
                <td>রোল:</td>
                <td>{{ student.roll_no }}</td>
              </tr>
              <tr>
                <td>রক্তের গ্রুপ:</td>
                <td class="blood">{{ student.blood_group || 'N/A' }}</td>
              </tr>
              <tr>
                <td>মোবাইল:</td>
                <td>{{ student.phone || 'N/A' }}</td>
              </tr>
            </table>
          </div>
        </div>

        <div class="card-footer">
          <div class="barcode">||||||||||||||||||||||</div>
          <div class="signature">
            <img :src="principalSign" alt="Sign" />
            <p>অধ্যক্ষের স্বাক্ষর</p>
          </div>
        </div>

        <div class="bottom-bar"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #f1f5f9;
  min-height: 100vh;
}
.actions {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}
.back-btn {
  padding: 10px 20px;
  background: #64748b;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.print-btn {
  padding: 10px 20px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

/* আইডি কার্ড সাইজ এবং স্টাইল */
.id-card {
  width: 350px; /* স্ট্যান্ডার্ড সাইজ */
  height: 520px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  border: 1px solid #e2e8f0;
  font-family: 'Segoe UI', sans-serif;
}

.card-header {
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  color: white;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 80px;
}
.logo {
  width: 45px;
  height: 45px;
  background: white;
  border-radius: 50%;
  padding: 2px;
}
.school-text h2 {
  font-size: 14px;
  margin: 0;
  font-weight: bold;
  text-transform: uppercase;
}
.school-text p {
  font-size: 10px;
  margin: 2px 0 0;
  opacity: 0.9;
}

.card-body {
  padding: 20px;
  text-align: center;
}
.photo-area {
  margin-bottom: 15px;
}
.student-photo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid #3b82f6;
  object-fit: cover;
  padding: 2px;
  background: white;
}

.name {
  margin: 5px 0;
  color: #1e293b;
  font-size: 18px;
  font-weight: bold;
}
.designation {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 15px;
}

.info-table {
  width: 100%;
  font-size: 13px;
  text-align: left;
  margin-top: 10px;
}
.info-table td {
  padding: 4px 0;
  border-bottom: 1px dashed #e2e8f0;
}
.info-table td:first-child {
  color: #64748b;
  font-weight: 600;
  width: 40%;
}
.info-table td:last-child {
  color: #334155;
  font-weight: 600;
  text-align: right;
}
.blood {
  color: #ef4444 !important;
  font-weight: bold;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: end;
  padding: 15px 20px;
  margin-top: 10px;
}
.barcode {
  font-family: 'Courier New', monospace;
  letter-spacing: -2px;
  color: #94a3b8;
  font-size: 10px;
}
.signature {
  text-align: center;
}
.signature img {
  height: 30px;
  margin-bottom: 2px;
}
.signature p {
  font-size: 10px;
  color: #64748b;
  border-top: 1px solid #cbd5e1;
  padding-top: 2px;
  width: 80px;
  margin: 0 auto;
}

.bottom-bar {
  height: 10px;
  background: #1e3a8a;
  width: 100%;
  position: absolute;
  bottom: 0;
}
</style>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  #print-area,
  #print-area * {
    visibility: visible;
  }
  #print-area {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: white;
  }
  .id-card {
    border: 1px solid #ddd; /* প্রিন্টে হালকা বর্ডার */
    box-shadow: none;
  }
  .no-print {
    display: none !important;
  }
}
</style>
