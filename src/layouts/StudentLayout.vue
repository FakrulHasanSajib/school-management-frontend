<script setup>
import { useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'

const router = useRouter()
const handleLogout = async () => {
  try {
    localStorage.removeItem('token')
    localStorage.removeItem('user_role')
    router.push('/')
    Swal.fire('Logged Out', 'You have been logged out.', 'success')
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <div class="student-layout">
    <aside class="sidebar">
      <div class="logo"><span class="icon">🎓</span> Student</div>

      <nav class="menu">
        <router-link to="/student/dashboard" class="nav-item">
          <span class="icon">🏠</span> Dashboard
        </router-link>
        <router-link to="/student/routine" class="nav-item">
          <span class="icon">📅</span> My Routine
        </router-link>
        <router-link to="/student/results" class="nav-item">
          <span class="icon">📊</span> My Result
        </router-link>
        <router-link to="/student/fees" class="nav-item">
          <span class="icon">💰</span> My Fees
        </router-link>
        <router-link to="/student/admit-card" class="nav-item">
          <span class="icon">🆔</span>
          <span class="label">Admit Card</span>
        </router-link>
        <router-link to="/student/change-password" class="nav-item">
          <span class="icon">🔒</span> Change Password
        </router-link>

        <button @click="handleLogout" class="nav-item logout">
          <span class="icon">↪️</span> Log out
        </button>
      </nav>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <div class="menu-btn">☰</div>
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
.sidebar {
  width: 260px;
  background-color: #1e1e2d;
  padding: 20px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #333;
}
.logo {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #a1a5b7;
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
}
.nav-item:hover,
.router-link-active {
  background-color: #2b2b40;
  color: white;
}
.logout {
  margin-top: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: #ef4444;
  width: 100%;
  text-align: left;
}
.logout:hover {
  background-color: #3f1818;
  color: #ff6b6b;
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
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
.page-content {
  padding: 30px;
  overflow-y: auto;
  height: calc(100vh - 60px);
}
</style>
