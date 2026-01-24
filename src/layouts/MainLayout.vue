<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter, RouterLink, RouterView } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="smart-dashboard">
    <div class="top-accent-bar"></div>

    <div class="layout-container">
      <aside class="sidebar">
        <div class="brand-section">
          <h2 class="brand-text">School<br /><span class="brand-sub">PRO ADMIN</span></h2>
        </div>

        <nav class="nav-menu">
          <RouterLink to="/admin/dashboard" class="nav-item" active-class="active">
            <span class="icon">📊</span> Dashboard
          </RouterLink>

          <RouterLink to="/admin/students" class="nav-item" active-class="active">
            <span class="icon">👨‍🎓</span> Student List
          </RouterLink>

          <RouterLink to="/admin/teachers" class="nav-item" active-class="active">
            <span class="icon">👨‍🏫</span> Teacher List
          </RouterLink>
          <RouterLink to="/admin/academic/subjects" class="nav-item" active-class="active">
            <span class="icon">📚</span> Add Subject
          </RouterLink>
          <RouterLink to="/admin/routines" class="nav-item" active-class="active">
            <span class="icon">📅</span> Class Routine
          </RouterLink>
          <router-link to="/admin/attendance/take" class="nav-item">
            <span class="icon">📝</span>
            <span class="text">Student Attendance</span>
          </router-link>
          <router-link to="/admin/attendance/report" class="nav-item">
            <span class="icon">📊</span> Attendance Report
          </router-link>

          <RouterLink to="/admin/settings" class="nav-item" active-class="active">
            <span class="icon">⚙️</span> GeneralSettings
          </RouterLink>
        </nav>

        <div class="sidebar-footer">
          <button @click="handleLogout" class="logout-btn">↪ Log out</button>
        </div>
      </aside>

      <main class="main-content">
        <header class="top-header">
          <div class="header-left">
            <h3>Hello, {{ authStore.user?.name || 'Admin' }}! 👋</h3>
          </div>

          <div class="header-right">
            <div class="search-box">
              <input type="text" placeholder="Search anything..." />
              <span class="search-icon">🔍</span>
            </div>

            <button class="notif-btn">🔔</button>

            <div class="profile-pill">
              <div class="avatar-circle">
                {{ authStore.user?.name?.charAt(0) || 'A' }}
              </div>
              <span>{{ authStore.user?.name || 'Admin' }} ▾</span>
            </div>
          </div>
        </header>

        <div class="content-scroll-area">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* --- Global Theme Variables --- */
:root {
  --bg-dark: #383838;
  --sidebar-dark: #212121;
  --purple-accent: #9b51e0;
  --text-white: #ffffff;
}

.smart-dashboard {
  min-height: 100vh;
  background-color: #383838;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  color: white;
  display: flex;
  flex-direction: column;
}

/* Top Gradient Bar */
.top-accent-bar {
  height: 8px;
  background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
  width: 100%;
  flex-shrink: 0;
}

.layout-container {
  display: flex;
  flex: 1;
  height: calc(100vh - 8px);
}

/* Sidebar Styles */
.sidebar {
  width: 260px;
  background-color: #212121;
  display: flex;
  flex-direction: column;
  padding: 25px 0;
  color: #fff;
  flex-shrink: 0;
}

.brand-section {
  padding: 0 30px;
  margin-bottom: 50px;
}

.brand-text {
  font-weight: 800;
  font-size: 1.6rem;
  line-height: 1.1;
  letter-spacing: 0.5px;
  margin: 0;
  color: white;
}

.brand-sub {
  font-size: 0.75rem;
  background: linear-gradient(90deg, #6a11cb, #9b51e0);
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 600;
  margin-top: 5px;
  display: inline-block;
  letter-spacing: 1px;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.nav-item {
  padding: 16px 30px;
  color: #a0a0a0;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s;
  border-left: 4px solid transparent;
}

.nav-item:hover {
  color: white;
  background: rgba(255, 255, 255, 0.05);
}

/* Active State */
.active {
  background: linear-gradient(90deg, rgba(155, 81, 224, 0.15) 0%, transparent 100%);
  color: white;
  border-left: 4px solid #9b51e0;
}

.sidebar-footer {
  margin-top: auto;
  padding: 30px;
}

.logout-btn {
  background: transparent;
  border: none;
  color: #a0a0a0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
  font-weight: 500;
  transition: 0.3s;
}

.logout-btn:hover {
  color: #ff6b6b;
}

/* Main Content Area */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #2e2e2e;
  border-top-left-radius: 30px;
  margin-top: -1px;
  overflow: hidden;
  position: relative;
}

/* Header */
.top-header {
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h3 {
  margin: 0;
  font-weight: 700;
  font-size: 1.5rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* Search Box */
.search-box {
  background: white;
  border-radius: 50px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  width: 280px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.search-box input {
  border: none;
  outline: none;
  width: 100%;
  color: #333;
  font-size: 0.9rem;
}

.search-icon {
  color: #666;
  font-size: 0.9rem;
}

.notif-btn {
  background: white;
  border: none;
  border-radius: 50%;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: 0.2s;
}

.notif-btn:hover {
  transform: scale(1.05);
}

/* Profile Pill */
.profile-pill {
  background: white;
  border-radius: 50px;
  padding: 5px 20px 5px 5px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #333;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.9rem;
}

.avatar-circle {
  width: 34px;
  height: 34px;
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}

/* Scroll Area */
.content-scroll-area {
  padding: 10px 40px 40px 40px;
  overflow-y: auto;
  height: 100%;
}

/* Responsive */
@media (max-width: 1024px) {
  .sidebar {
    width: 80px;
    padding: 20px 0;
    align-items: center;
  }
  .brand-text,
  .nav-item span:not(.icon),
  .logout-btn {
    display: none;
  }
  .brand-section {
    padding: 0;
    margin-bottom: 20px;
  }
  .nav-item {
    padding: 15px;
    justify-content: center;
  }
  .active {
    border-left: none;
    border-bottom: 4px solid #9b51e0;
  }
  .main-content {
    border-radius: 0;
  }
}
</style>
