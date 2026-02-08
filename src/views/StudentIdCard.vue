<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const student = ref(null)
const isLoading = ref(true)

// স্কুলের তথ্য (এগুলো পরে Settings API থেকে আনা যাবে)
const schoolInfo = {
  name: 'Software IT School & College',
  address: 'Mirpur-10, Dhaka-1216, Bangladesh',
  logo: 'https://cdn-icons-png.flaticon.com/512/2965/2965300.png',
  principalSign:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Signature_sample.svg/1200px-Signature_sample.svg.png',
}

const fetchStudent = async () => {
  try {
    const token = localStorage.getItem('token')
    const id = route.params.id
    const response = await axios.get(`http://127.0.0.1:8000/api/students/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    student.value = response.data.data
  } catch (error) {
    console.error('Error:', error)
    alert('Student data not found!')
    router.back()
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
      <button @click="router.back()" class="btn back-btn">⬅ Back to List</button>
      <button @click="printCard" class="btn print-btn">🖨️ Print ID Card</button>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Generating ID Card...</p>
    </div>

    <div v-else class="card-wrapper" id="print-area">
      <div class="id-card">
        <div class="header-shape"></div>

        <div class="school-header">
          <img :src="schoolInfo.logo" class="logo" alt="Logo" />
          <div class="school-details">
            <h2>{{ schoolInfo.name }}</h2>
            <p>{{ schoolInfo.address }}</p>
          </div>
        </div>

        <div class="photo-section">
          <div class="photo-frame">
            <img
              :src="student.image || 'https://via.placeholder.com/150'"
              class="student-img"
              alt="Student"
            />
          </div>
          <h3 class="student-name">{{ student.name }}</h3>
          <span class="designation">Student</span>
        </div>

        <div class="details-box">
          <div class="info-row">
            <span class="label">ID No :</span>
            <span class="value highlight">{{ student.admission_no }}</span>
          </div>
          <div class="info-row">
            <span class="label">Class :</span>
            <span class="value">{{ student.class }} ({{ student.section }})</span>
          </div>
          <div class="info-row">
            <span class="label">Roll No :</span>
            <span class="value">{{ student.roll_no }}</span>
          </div>
          <div class="info-row">
            <span class="label">Blood Group :</span>
            <span class="value blood">{{ student.blood_group || 'N/A' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Phone :</span>
            <span class="value">{{ student.phone || 'N/A' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Valid Till :</span>
            <span class="value">Dec 2026</span>
          </div>
        </div>

        <div class="card-footer">
          <div class="signature-box">
            <img :src="schoolInfo.principalSign" alt="Sign" class="sign-img" />
            <p>Principal's Signature</p>
          </div>
          <div class="barcode">|| ||| || ||| || ||| ||</div>
        </div>

        <div class="bottom-shape"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Page Layout */
.page-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #151521;
  min-height: 100vh;
  color: white;
}

/* Buttons */
.actions {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
}
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
}
.back-btn {
  background: #2b2b40;
  color: #a1a5b7;
}
.back-btn:hover {
  background: #323248;
  color: white;
}
.print-btn {
  background: #3b82f6;
  color: white;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}
.print-btn:hover {
  transform: translateY(-2px);
}

/* ID Card Styles */
.card-wrapper {
  background: white;
  padding: 20px;
  border-radius: 15px;
}
.id-card {
  width: 320px;
  height: 500px;
  background: white;
  border-radius: 15px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  font-family: 'Segoe UI', sans-serif;
  color: #1e293b;
  display: flex;
  flex-direction: column;
}

/* Shapes */
.header-shape {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 120px;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  clip-path: polygon(0 0, 100% 0, 100% 70%, 0 100%);
  z-index: 1;
}
.bottom-shape {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 15px;
  background: #1e3a8a;
}

/* Header */
.school-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  color: white;
}
.logo {
  width: 45px;
  height: 45px;
  background: white;
  border-radius: 50%;
  padding: 2px;
}
.school-details h2 {
  margin: 0;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.school-details p {
  margin: 2px 0 0;
  font-size: 9px;
  opacity: 0.8;
}

/* Photo Section */
.photo-section {
  position: relative;
  z-index: 2;
  text-align: center;
  margin-top: 10px;
}
.photo-frame {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: white;
  padding: 4px;
  display: inline-block;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.student-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid #3b82f6;
}
.student-name {
  margin: 10px 0 2px;
  font-size: 18px;
  color: #1e293b;
  font-weight: 700;
}
.designation {
  background: #e0f2fe;
  color: #0284c7;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

/* Details Table */
.details-box {
  padding: 15px 25px;
  margin-top: 10px;
}
.info-row {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px dashed #e2e8f0;
  padding: 6px 0;
  font-size: 13px;
}
.info-row:last-child {
  border-bottom: none;
}
.label {
  color: #64748b;
  font-weight: 600;
}
.value {
  color: #334155;
  font-weight: 700;
}
.highlight {
  color: #2563eb;
}
.blood {
  color: #dc2626;
}

/* Footer */
.card-footer {
  margin-top: auto;
  padding: 10px 20px 25px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.signature-box {
  text-align: center;
}
.sign-img {
  height: 35px;
  width: auto;
  margin-bottom: -5px;
}
.signature-box p {
  margin: 0;
  font-size: 10px;
  color: #64748b;
  border-top: 1px solid #94a3b8;
  padding-top: 2px;
  width: 100px;
}
.barcode {
  font-family: 'Courier New', monospace;
  font-size: 10px;
  color: #94a3b8;
  letter-spacing: -1px;
  margin-bottom: 5px;
}

/* Print Media Query */
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
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    padding: 0;
    background: none;
    box-shadow: none;
  }
  .no-print {
    display: none !important;
  }
  .page-container {
    background: white;
  }
}

/* Loading */
.loading-state {
  text-align: center;
  color: #a1a5b7;
  margin-top: 50px;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
