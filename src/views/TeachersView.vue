<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const teachers = ref([])
const isLoading = ref(true)
const router = useRouter()

const fetchTeachers = async () => {
  try {
    isLoading.value = true
    // লোকাল স্টোরেজ থেকে টোকেনটি নিন
    const token = localStorage.getItem('token')

    const response = await axios.get('http://127.0.0.1:8000/api/teachers', {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ টোকেন পাঠানো হচ্ছে
      },
    })

    teachers.value = response.data.data || response.data
    isLoading.value = false
  } catch (error) {
    if (error.response && error.response.status === 401) {
      alert('আপনার সেশন শেষ হয়ে গেছে, দয়া করে আবার লগইন করুন।')
      router.push('/login')
    }
    isLoading.value = false
  }
}

// ডিলিট করার ফাংশন (প্রাথমিক সেটআপ)
const deleteTeacher = async (id) => {
  if (confirm('আপনি কি নিশ্চিতভাবে এই শিক্ষককে ডিলিট করতে চান?')) {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/teachers/${id}`)
      fetchTeachers() // লিস্ট রিফ্রেশ করা
    } catch (error) {
      alert('ডিলিট করা সম্ভব হয়নি!')
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
      <p>শিক্ষকদের তথ্য লোড হচ্ছে...</p>
    </div>

    <div v-else-if="teachers.length === 0" class="loading-state">
      <p>কোনো শিক্ষক পাওয়া যায়নি।</p>
    </div>

    <div v-else class="table-card">
      <table class="custom-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>নাম</th>
            <th>ইমেইল</th>
            <th>পদবী (Designation)</th>
            <th>অ্যাকশন</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="teacher in teachers" :key="teacher.id">
            <td>#{{ teacher.id }}</td>
            <td>
              <div class="user-info">
                <div class="avatar" style="background: #f3e8ff; color: #9333ea">
                  {{ teacher.name.charAt(0) }}
                </div>
                <span class="user-name">{{ teacher.name }}</span>
              </div>
            </td>
            <td>{{ teacher.email }}</td>
            <td>
              <span class="badge" style="background: #fff1f2; color: #be123c">
                {{ teacher.teacher_profile?.designation || 'N/A' }}
              </span>
            </td>
            <td>
              <button
                @click="router.push(`/admin/teachers/view/${teacher.id}`)"
                class="action-btn view"
              >
                👁️ View
              </button>
              <button
                @click="router.push(`/admin/teachers/edit/${teacher.id}`)"
                class="action-btn edit"
              >
                ✏️ Edit
              </button>
              <button @click="deleteTeacher(teacher.id)" class="action-btn delete">
                🗑️ Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.header-action {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}
.page-title {
  margin: 0;
  color: #1e293b;
}
.add-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
}
.table-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
.custom-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.custom-table th {
  background: #f8fafc;
  padding: 1rem;
  color: #64748b;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
}
.custom-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
.badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}
.action-btn {
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 5px;
}
.edit {
  background: #eff6ff;
  color: #3b82f6;
}
.delete {
  background: #fef2f2;
  color: #ef4444;
}
.loading-state {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
}
</style>
