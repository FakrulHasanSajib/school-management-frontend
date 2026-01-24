<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const teacher = ref(null)
const isLoading = ref(true)

// ইমেজ পাথ হ্যান্ডেল করার জন্য বেস ইউআরএল
const storageUrl = 'http://127.0.0.1:8000/storage/'

const fetchTeacherProfile = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`http://127.0.0.1:8000/api/teachers/${route.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    // ApiResponse এর কারণে data.data ব্যবহার করা হয়েছে
    teacher.value = response.data.data
    isLoading.value = false
  } catch (error) {
    console.error('প্রোফাইল লোড করতে সমস্যা:', error)
    isLoading.value = false
  }
}

onMounted(fetchTeacherProfile)
</script>

<template>
  <div class="profile-container">
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>প্রোফাইল লোড হচ্ছে...</p>
    </div>

    <div v-else-if="teacher" class="profile-card">
      <div class="card-header">
        <button @click="router.back()" class="back-btn">← ব্যাক</button>
        <h2>শিক্ষক প্রোফাইল</h2>
        <button @click="router.push(`/admin/teachers/edit/${teacher.id}`)" class="edit-btn">
          ✏️ এডিট
        </button>
      </div>

      <div class="profile-body">
        <div class="profile-left">
          <div class="avatar-container">
            <img
              v-if="teacher.teacher_profile?.image"
              :src="storageUrl + teacher.teacher_profile.image"
              class="avatar-img"
              alt="Teacher Image"
            />
            <div v-else class="avatar-large">
              {{ teacher.name.charAt(0) }}
            </div>
          </div>

          <h3 class="name">{{ teacher.name }}</h3>
          <p class="role-badge">{{ teacher.teacher_profile?.designation || 'শিক্ষক' }}</p>
          <p class="email">📧 {{ teacher.email }}</p>
        </div>

        <div class="profile-right">
          <div class="info-group">
            <label>মোবাইল নম্বর:</label>
            <p>{{ teacher.teacher_profile?.phone || 'N/A' }}</p>
          </div>

          <div class="info-group">
            <label>রক্তের গ্রুপ:</label>
            <p class="blood-text">{{ teacher.teacher_profile?.blood_group || 'N/A' }}</p>
          </div>

          <div class="info-group">
            <label>শিক্ষাগত যোগ্যতা:</label>
            <p>{{ teacher.teacher_profile?.qualification || 'N/A' }}</p>
          </div>

          <div class="info-group">
            <label>যোগদানের তারিখ:</label>
            <p>{{ teacher.teacher_profile?.joining_date || 'N/A' }}</p>
          </div>

          <div class="info-group">
            <label>স্ট্যাটাস:</label>
            <span class="status-active">Active</span>
          </div>

          <div class="info-group">
            <label>ইউজার আইডি:</label>
            <p>#{{ teacher.id }}</p>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <button @click="router.push(`/admin/teachers/id-card/${teacher.id}`)" class="id-btn">
          🆔 আইডি কার্ড জেনারেট করুন
        </button>
      </div>
    </div>

    <div v-else class="error-box">
      <p>দুঃখিত, শিক্ষকের তথ্য পাওয়া যায়নি!</p>
      <button @click="router.back()">ফিরে যান</button>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 850px;
  margin: 2rem auto;
  font-family: 'Segoe UI', sans-serif;
}
.profile-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #f1f5f9;
}
.card-header {
  background: #f8fafc;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}
.profile-body {
  display: flex;
  flex-wrap: wrap;
  padding: 3rem 2rem;
  gap: 3rem;
}

/* বাম পাশ - ছবি ও বেসিক তথ্য */
.profile-left {
  flex: 1;
  min-width: 250px;
  text-align: center;
  border-right: 1px solid #f1f5f9;
  padding-right: 2rem;
}
.avatar-container {
  width: 150px;
  height: 150px;
  margin: 0 auto 1.5rem;
}
.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e0e7ff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.avatar-large {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #6366f1, #4338ca);
  color: white;
  font-size: 60px;
  font-weight: bold;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.name {
  margin: 0;
  color: #1e293b;
  font-size: 1.8rem;
  font-weight: 700;
}
.role-badge {
  background: #e0e7ff;
  color: #4338ca;
  padding: 5px 15px;
  border-radius: 30px;
  font-size: 0.95rem;
  font-weight: 600;
  display: inline-block;
  margin: 0.8rem 0;
}
.email {
  color: #64748b;
  font-size: 0.95rem;
}

/* ডান পাশ - বিস্তারিত তথ্য */
.profile-right {
  flex: 1.5;
  min-width: 300px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}
.info-group label {
  display: block;
  color: #94a3b8;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
  font-weight: 600;
}
.info-group p {
  color: #334155;
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0;
}
.blood-text {
  color: #dc2626 !important; /* লাল রঙ ব্লাড গ্রুপের জন্য */
}
.status-active {
  color: #16a34a;
  background: #dcfce7;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.85rem;
  display: inline-block;
}

/* ফুটার সেকশন */
.card-footer {
  padding: 1.5rem 2rem;
  background: #f8fafc;
  text-align: center;
  border-top: 1px solid #e2e8f0;
}
.id-btn {
  background: #7e22ce;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
}
.id-btn:hover {
  background: #6b21a8;
  transform: translateY(-2px);
}

.back-btn,
.edit-btn {
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
}
.back-btn {
  background: #e2e8f0;
  color: #475569;
}
.edit-btn {
  background: #2563eb;
  color: white;
}
.edit-btn:hover {
  background: #1d4ed8;
}

/* লোডিং স্পিনার */
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .profile-right {
    grid-template-columns: 1fr;
  }
  .profile-left {
    border-right: none;
    border-bottom: 1px solid #f1f5f9;
    padding-right: 0;
    padding-bottom: 2rem;
  }
}
</style>
