<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const teacher = ref(null)
const isLoading = ref(true)

const fetchTeacherProfile = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`http://127.0.0.1:8000/api/teachers/${route.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = response.data.data
    teacher.value = {
      id: data.id,
      name: data.name,
      email: data.email,
      designation: data.teacher_profile?.designation || 'Teacher',
      qualification: data.teacher_profile?.qualification || 'N/A',
      phone: data.teacher_profile?.phone || 'N/A',
      joining_date: data.teacher_profile?.joining_date || 'N/A',
      blood_group: data.teacher_profile?.blood_group || 'N/A',
      image: data.teacher_profile?.image
        ? data.teacher_profile.image.startsWith('http')
          ? data.teacher_profile.image
          : `http://127.0.0.1:8000/storage/${data.teacher_profile.image}`
        : null,
    }
  } catch (error) {
    console.error('Profile load error:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchTeacherProfile)
</script>

<template>
  <div class="page-container">
    <div class="header-action">
      <div>
        <h2 class="page-title">👤 Teacher Profile</h2>
        <p class="page-subtitle">View detailed information about the teacher</p>
      </div>
      <button @click="router.back()" class="back-btn">
        <span class="icon">⬅</span> Back to List
      </button>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading profile...</p>
    </div>

    <div v-else-if="teacher" class="profile-card">
      <div class="profile-header">
        <div class="image-wrapper">
          <img v-if="teacher.image" :src="teacher.image" class="profile-img" alt="Teacher Photo" />
          <div v-else class="avatar-placeholder">{{ teacher.name.charAt(0) }}</div>
        </div>

        <div class="user-meta">
          <h3 class="user-name">{{ teacher.name }}</h3>
          <p class="designation">{{ teacher.designation }}</p>
          <div class="status-badge">Active Teacher</div>
        </div>

        <div class="header-actions">
          <button @click="router.push(`/admin/teachers/edit/${teacher.id}`)" class="edit-btn">
            ✏️ Edit Profile
          </button>
          <button @click="router.push(`/admin/teachers/id-card/${teacher.id}`)" class="id-btn">
            🆔 ID Card
          </button>
        </div>
      </div>

      <div class="divider"></div>

      <div class="details-section">
        <h4 class="section-title">📝 Personal Information</h4>
        <div class="grid-container">
          <div class="detail-item">
            <label>Email Address</label>
            <span>{{ teacher.email }}</span>
          </div>

          <div class="detail-item">
            <label>Phone Number</label>
            <span>{{ teacher.phone }}</span>
          </div>

          <div class="detail-item">
            <label>Qualification</label>
            <span>{{ teacher.qualification }}</span>
          </div>

          <div class="detail-item">
            <label>Blood Group</label>
            <span class="blood-badge">{{ teacher.blood_group }}</span>
          </div>

          <div class="detail-item">
            <label>Joining Date</label>
            <span>{{ teacher.joining_date }}</span>
          </div>

          <div class="detail-item">
            <label>Teacher ID</label>
            <span class="highlight">#TCH-{{ teacher.id }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="error-state">
      <p>⚠️ Teacher information not found!</p>
    </div>
  </div>
</template>

<style scoped>
/* Page Layout */
.page-container {
  padding: 25px;
  color: #fff;
  max-width: 900px;
  margin: 0 auto;
}
.header-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* Back Button */
.back-btn {
  background: #2b2b40;
  color: #a1a5b7;
  border: 1px solid #323248;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.3s;
}
.back-btn:hover {
  background: #323248;
  color: white;
}

/* Profile Card */
.profile-card {
  background: #1e1e2d;
  border-radius: 12px;
  border: 1px solid #2b2b40;
  overflow: hidden;
}

/* Header Section */
.profile-header {
  display: flex;
  align-items: center;
  gap: 25px;
  padding: 30px;
  background: #151521;
}
.image-wrapper {
  position: relative;
}
.profile-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #7c3aed;
}
.avatar-placeholder {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: bold;
  border: 3px solid #2b2b40;
}
.user-meta {
  flex: 1;
}
.user-name {
  font-size: 24px;
  margin: 0;
  color: white;
  font-weight: 700;
}
.designation {
  color: #a1a5b7;
  margin: 5px 0 10px;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.status-badge {
  display: inline-block;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

/* Header Actions */
.header-actions {
  display: flex;
  gap: 10px;
}
.edit-btn,
.id-btn {
  padding: 10px 15px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: 0.3s;
}
.edit-btn {
  background: #3b82f6;
  color: white;
}
.edit-btn:hover {
  background: #2563eb;
}
.id-btn {
  background: #7c3aed;
  color: white;
}
.id-btn:hover {
  background: #6d28d9;
}

.divider {
  height: 1px;
  background: #2b2b40;
  width: 100%;
}

/* Details Section */
.details-section {
  padding: 30px;
}
.section-title {
  font-size: 16px;
  color: #3b82f6;
  margin-bottom: 20px;
  font-weight: 700;
  border-bottom: 1px solid #2b2b40;
  padding-bottom: 10px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
}
.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-item label {
  font-size: 12px;
  color: #a1a5b7;
  font-weight: 600;
  text-transform: uppercase;
}
.detail-item span {
  font-size: 15px;
  color: #e2e8f0;
  font-weight: 500;
}

/* Badges */
.highlight {
  font-weight: 700;
  color: white;
  font-family: 'Courier New', monospace;
  font-size: 16px;
}
.blood-badge {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: bold;
  width: fit-content;
}

/* Loading */
.loading-state,
.error-state {
  text-align: center;
  padding: 50px;
  color: #a1a5b7;
}
.spinner {
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
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

/* Responsive */
@media (max-width: 600px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  .grid-container {
    grid-template-columns: 1fr;
  }
  .header-actions {
    justify-content: center;
  }
}
</style>
