<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()
const isSidebarOpen = ref(true) // সাইডবার টগল করার জন্য ভেরিয়েবল

// সাইডবার টগল ফাংশন
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// লগআউট ফাংশন
const handleLogout = async () => {
  try {
    localStorage.removeItem('token')
    localStorage.removeItem('user_role')

    await Swal.fire({
      icon: 'success',
      title: 'Logged Out',
      text: 'See you soon!',
      timer: 1500,
      showConfirmButton: false,
    })

    router.push('/')
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <div class="student-layout">
    <aside :class="['sidebar', { closed: !isSidebarOpen }]">
      <div class="logo">
        <span class="icon">🎓</span>
        <span v-if="isSidebarOpen">Student Portal</span>
      </div>

      <nav class="menu">
        <router-link to="/student/dashboard" class="nav-item">
          <span class="icon">🏠</span>
          <span v-if="isSidebarOpen">Dashboard</span>
        </router-link>

        <router-link to="/student/routine" class="nav-item">
          <span class="icon">📅</span>
          <span v-if="isSidebarOpen">My Routine</span>
        </router-link>

        <router-link to="/student/results" class="nav-item">
          <span class="icon">📊</span>
          <span v-if="isSidebarOpen">My Result</span>
        </router-link>

        <router-link to="/student/fees" class="nav-item">
          <span class="icon">💰</span>
          <span v-if="isSidebarOpen">My Fees</span>
        </router-link>

        <router-link to="/student/admit-card" class="nav-item">
          <span class="icon">🆔</span>
          <span v-if="isSidebarOpen">Admit Card</span>
        </router-link>

        <router-link to="/student/notices" class="nav-item">
          <span class="icon">📢</span>
          <span v-if="isSidebarOpen">Notice Board</span>
        </router-link>

        <router-link to="/student/library" class="nav-item">
          <span class="icon">📚</span>
          <span v-if="isSidebarOpen">Library</span>
        </router-link>

        <router-link to="/student/leave" class="nav-item">
          <span class="icon">📝</span>
          <span v-if="isSidebarOpen">Leave Request</span>
        </router-link>

        <router-link to="/student/change-password" class="nav-item">
          <span class="icon">🔒</span>
          <span v-if="isSidebarOpen">Change Password</span>
        </router-link>

        <button @click="handleLogout" class="nav-item logout">
          <span class="icon">↪️</span>
          <span v-if="isSidebarOpen">Log out</span>
        </button>
      </nav>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <button class="menu-btn" @click="toggleSidebar">☰</button>
        <div class="user-info">👋 Hello, Student!</div>
      </header>

      <div class="page-content">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Layout Styles */
.student-layout {
  display: flex;
  min-height: 100vh;
  background-color: #0f172a;
  color: white;
  font-family: 'Poppins', sans-serif;
}

/* Sidebar Styles */
.sidebar {
  width: 260px;
  background-color: #1e1e2d;
  padding: 20px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #333;
  transition: width 0.3s ease;
}

.sidebar.closed {
  width: 80px; /* কলাপসড অবস্থায় উইডথ */
  padding: 20px 10px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #a1a5b7;
  white-space: nowrap;
  overflow: hidden;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  border-radius: 10px;
  color: #a1a5b7;
  text-decoration: none;
  transition: 0.3s;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  border: none;
  background: none;
  width: 100%;
  cursor: pointer;
}

/* Active Link Logic */
.nav-item:hover,
.router-link-active {
  background-color: #2b2b40;
  color: white;
  border-left: 4px solid #3699ff; /* একটিভ বুঝানোর জন্য বর্ডার */
}

.icon {
  font-size: 18px;
  min-width: 25px;
  text-align: center;
}

.logout {
  margin-top: auto;
  color: #ef4444;
}

.logout:hover {
  background-color: #3f1818;
  color: #ff6b6b;
  border-left: none;
}

/* Main Content Styles */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* যাতে কনটেন্ট উপচে না পড়ে */
}

.top-bar {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  border-bottom: 1px solid #333;
  background-color: #0f172a;
}

.menu-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

.page-content {
  padding: 30px;
  overflow-y: auto;
  height: calc(100vh - 60px);
}
</style>
