<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const teacher = ref(null)
const isLoading = ref(true)

// School Info
const schoolName = 'SOFTWARE IT SCHOOL & COLLEGE'
const schoolLogo = 'https://cdn-icons-png.flaticon.com/512/2965/2965300.png'
const storageUrl = 'http://127.0.0.1:8000/storage/'

const fetchTeacher = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`http://127.0.0.1:8000/api/teachers/${route.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    teacher.value = response.data.data
  } catch (error) {
    alert('Data paoya jayni!')
  } finally {
    isLoading.value = false
  }
}

const printCard = () => {
  window.print()
}

onMounted(fetchTeacher)
</script>

<template>
  <div class="page-container">
    <div class="actions no-print">
      <button @click="router.back()" class="back-btn">⬅ Fire jan</button>
      <button @click="printCard" class="print-btn">🖨️ Print ID Card</button>
    </div>

    <div v-if="isLoading" class="loading">Loading...</div>

    <div v-else class="id-card-wrapper" id="print-area">
      <div class="id-card">
        <div class="card-header">
          <img :src="schoolLogo" class="logo" alt="Logo" />
          <div class="header-text">
            <h2>{{ schoolName }}</h2>
            <p>Teacher Identification Card</p>
          </div>
        </div>

        <div class="card-body">
          <div class="photo-box">
            <img
              :src="
                teacher.teacher_profile?.image
                  ? storageUrl + teacher.teacher_profile.image
                  : 'https://via.placeholder.com/150'
              "
              class="teacher-photo"
            />
          </div>

          <div class="name-section">
            <h3 class="teacher-name">{{ teacher.name }}</h3>
            <p class="designation">{{ teacher.teacher_profile?.designation }}</p>
          </div>

          <div class="info-list">
            <div class="info-item">
              <span>Teacher ID:</span>
              <strong>#TCH-{{ teacher.id }}</strong>
            </div>
            <div class="info-item">
              <span>Qualification:</span>
              <strong>{{ teacher.teacher_profile?.qualification }}</strong>
            </div>
            <div class="info-item">
              <span>Mobile:</span>
              <strong>{{ teacher.teacher_profile?.phone }}</strong>
            </div>
            <div class="info-item">
              <span>Blood Group:</span>
              <strong class="blood">{{ teacher.teacher_profile?.blood_group || 'N/A' }}</strong>
            </div>
            <div class="info-item">
              <span>Joined:</span>
              <strong>{{ teacher.teacher_profile?.joining_date }}</strong>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <div class="sign-box">
            <p>Authority Signature</p>
          </div>
        </div>

        <div class="accent-bar"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  background: #f8fafc;
  min-height: 100vh;
}
.actions {
  margin-bottom: 30px;
  display: flex;
  gap: 15px;
}
.back-btn {
  padding: 10px 20px;
  background: #64748b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.print-btn {
  padding: 10px 25px;
  background: #7e22ce;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(126, 34, 206, 0.2);
}

/* ID Card Design */
.id-card {
  width: 320px;
  height: 500px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  border: 1px solid #e2e8f0;
  font-family: 'Inter', sans-serif;
}

.card-header {
  background: #1e1e2d;
  color: white;
  padding: 20px 15px;
  text-align: center;
  border-bottom: 4px solid #7e22ce;
}
.logo {
  width: 40px;
  margin-bottom: 5px;
}
.header-text h2 {
  font-size: 13px;
  margin: 0;
  letter-spacing: 0.5px;
}
.header-text p {
  font-size: 10px;
  margin: 5px 0 0;
  opacity: 0.7;
  text-transform: uppercase;
}

.card-body {
  padding: 25px 20px;
  text-align: center;
}
.photo-box {
  margin-bottom: 15px;
}
.teacher-photo {
  width: 110px;
  height: 110px;
  border-radius: 12px;
  border: 3px solid #7e22ce;
  object-fit: cover;
}

.teacher-name {
  margin: 10px 0 2px;
  color: #1e293b;
  font-size: 18px;
  font-weight: 800;
}
.designation {
  color: #7e22ce;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 20px;
}

.info-list {
  text-align: left;
}
.info-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 6px 0;
  border-bottom: 1px solid #f1f5f9;
}
.info-item span {
  color: #64748b;
}
.info-item strong {
  color: #334155;
}
.blood {
  color: #ef4444 !important;
}

.card-footer {
  padding: 20px;
  margin-top: 10px;
  display: flex;
  justify-content: center;
}
.sign-box {
  border-top: 1px solid #cbd5e1;
  width: 120px;
  text-align: center;
  padding-top: 5px;
}
.sign-box p {
  font-size: 10px;
  color: #94a3b8;
  margin: 0;
}

.accent-bar {
  height: 8px;
  background: #7e22ce;
  width: 100%;
  position: absolute;
  bottom: 0;
}

@media print {
  .no-print {
    display: none !important;
  }
  body {
    background: white;
  }
  .id-card-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .id-card {
    box-shadow: none;
    border: 1px solid #eee;
  }
}
</style>
