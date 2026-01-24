<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2' // ✅ সুন্দর মেসেজের জন্য

const teachers = ref([])
const isLoading = ref(true)
const router = useRouter()

// ১. শিক্ষক তালিকা লোড করা
const fetchTeachers = async () => {
  try {
    isLoading.value = true
    const token = localStorage.getItem('token')

    const response = await axios.get('http://127.0.0.1:8000/api/teachers', {
      headers: { Authorization: `Bearer ${token}` },
    })

    teachers.value = response.data.data || response.data
  } catch (error) {
    if (error.response && error.response.status === 401) {
      Swal.fire('সেশন শেষ!', 'দয়া করে আবার লগইন করুন।', 'warning')
      router.push('/login')
    }
  } finally {
    isLoading.value = false
  }
}

// ২. সুইট অ্যালার্ট দিয়ে ডিলিট করা
const deleteTeacher = async (id) => {
  const result = await Swal.fire({
    title: 'আপনি কি নিশ্চিত?',
    text: 'এটি ডিলিট করলে আর ফেরত পাওয়া যাবে না!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'হ্যাঁ, ডিলিট করুন!',
    cancelButtonText: 'বাতিল',
  })

  if (result.isConfirmed) {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://127.0.0.1:8000/api/teachers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      Swal.fire('ডিলিট হয়েছে!', 'শিক্ষকের তথ্য মুছে ফেলা হয়েছে।', 'success')
      fetchTeachers()
    } catch (error) {
      Swal.fire('ভুল হয়েছে!', 'ডিলিট করা সম্ভব হয়নি।', 'error')
    }
  }
}

onMounted(() => {
  fetchTeachers()
})
</script>

<template>
  <div>
    <div class="header-action">
      <h2 class="page-title">👨‍🏫 সকল শিক্ষক</h2>
      <button @click="router.push('/admin/teachers/create')" class="add-btn">+ নতুন শিক্ষক</button>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>শিক্ষকদের তথ্য লোড হচ্ছে...</p>
    </div>

    <div v-else-if="teachers.length === 0" class="loading-state">
      <p>কোনো শিক্ষক পাওয়া যায়নি।</p>
    </div>

    <div v-else class="table-card">
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>ছবি</th>
              <th>নাম ও ইমেইল</th>
              <th>ফোন</th>
              <th>রক্তের গ্রুপ</th>
              <th>পদবী</th>
              <th>অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="teacher in teachers" :key="teacher.id">
              <td>
                <div class="avatar-container">
                  <img
                    v-if="teacher.teacher_profile?.image"
                    :src="`http://127.0.0.1:8000/storage/${teacher.teacher_profile.image}`"
                    class="avatar-img"
                  />
                  <div v-else class="avatar-init" style="background: #f3e8ff; color: #9333ea">
                    {{ teacher.name.charAt(0) }}
                  </div>
                </div>
              </td>

              <td>
                <div class="user-meta">
                  <span class="user-name">{{ teacher.name }}</span>
                  <span class="user-email">{{ teacher.email }}</span>
                </div>
              </td>

              <td>{{ teacher.teacher_profile?.phone || 'N/A' }}</td>

              <td>
                <span v-if="teacher.teacher_profile?.blood_group" class="blood-badge">
                  {{ teacher.teacher_profile.blood_group }}
                </span>
                <span v-else>-</span>
              </td>

              <td>
                <span class="designation-badge">
                  {{ teacher.teacher_profile?.designation || 'N/A' }}
                </span>
              </td>

              <td>
                <div class="action-flex">
                  <button
                    @click="router.push(`/admin/teachers/view/${teacher.id}`)"
                    class="action-btn view"
                    title="প্রোফাইল"
                  >
                    👁️
                  </button>
                  <button
                    @click="router.push(`/admin/teachers/edit/${teacher.id}`)"
                    class="action-btn edit"
                    title="এডিট"
                  >
                    ✏️
                  </button>
                  <button
                    @click="router.push(`/admin/teachers/id-card/${teacher.id}`)"
                    class="action-btn id-card"
                    title="আইডি কার্ড"
                  >
                    🆔
                  </button>
                  <button
                    @click="deleteTeacher(teacher.id)"
                    class="action-btn delete"
                    title="ডিলিট"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* সাধারণ লেআউট */
.header-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.page-title {
  margin: 0;
  color: #1e293b;
  font-weight: 700;
}
.add-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

/* টেবিল কার্ড */
.table-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid #f1f5f9;
}
.table-responsive {
  overflow-x: auto;
}
.custom-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.custom-table th {
  background: #f8fafc;
  padding: 1.2rem 1rem;
  color: #64748b;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
}
.custom-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  vertical-align: middle;
}

/* প্রোফাইল ছবি */
.avatar-container {
  width: 45px;
  height: 45px;
}
.avatar-img {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
}
.avatar-init {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}

/* টেক্সট মেটা */
.user-meta {
  display: flex;
  flex-direction: column;
}
.user-name {
  font-weight: 600;
  color: #1e293b;
}
.user-email {
  font-size: 0.85rem;
  color: #64748b;
}

/* ব্যাজসমূহ */
.designation-badge {
  background: #fff1f2;
  color: #be123c;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}
.blood-badge {
  background: #fee2e2;
  color: #ef4444;
  padding: 2px 10px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 0.85rem;
}

/* অ্যাকশন বাটন */
.action-flex {
  display: flex;
  gap: 8px;
}
.action-btn {
  border: none;
  width: 35px;
  height: 35px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}
.view {
  background: #f0f9ff;
  color: #0369a1;
}
.edit {
  background: #f0fdf4;
  color: #166534;
}
.id-card {
  background: #f5f3ff;
  color: #7e22ce;
}
.delete {
  background: #fef2f2;
  color: #dc2626;
}
.action-btn:hover {
  transform: translateY(-2px);
  opacity: 0.8;
}

/* লোডিং */
.loading-state {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}
.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
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
