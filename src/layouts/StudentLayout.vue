<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isSidebarOpen = ref(true)

// ✅ লেআউট লোড হওয়ার সাথে সাথে বডি ক্লিন করা (Zombie Overlay Fix)
const cleanupBody = () => {
  // ১. বডি থেকে SweetAlert এর ক্লাস সরানো
  document.body.classList.remove('swal2-shown', 'swal2-height-auto', 'swal2-iosfix')
  document.body.style = '' // বডির স্টাইল রিসেট

  // ২. যদি কোনো পপ-আপ কন্টেইনার থেকে যায়, তা রিমুভ করা
  const zombies = document.querySelectorAll('.swal2-container, .swal2-overlay')
  zombies.forEach((el) => el.remove())
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user_role')
  cleanupBody() // লগআউটের সময়ও ক্লিন করবে
  router.push('/')
}

onMounted(() => {
  cleanupBody() // ✅ পেজ রিফ্রেশ বা রাউট চেঞ্জ হলে ক্লিন করবে
})
</script>

<template>
  <div class="layout-container">
    <aside :class="['sidebar', { closed: !isSidebarOpen }]">
      <div class="logo">
        <h2>🎓 Student</h2>
      </div>

      <nav class="menu">
        <router-link to="/student/dashboard" class="nav-item">
          <span class="icon">🏠</span> <span>Dashboard</span>
        </router-link>

        <router-link to="/student/routine" class="nav-item">
          <span class="icon">📅</span> <span>My Routine</span>
        </router-link>

        <router-link to="/student/results" class="nav-item">
          <span class="icon">📊</span> <span>My Result</span>
        </router-link>

        <router-link to="/student/fees" class="nav-item">
          <span class="icon">💰</span> <span>My Fees</span>
        </router-link>

        <router-link to="/student/change-password" class="nav-item">
          <span class="icon">🔒</span> <span>Change Password</span>
        </router-link>

        <button @click="logout" class="nav-item logout">
          <span class="icon">↪</span> <span>Log out</span>
        </button>
      </nav>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <button @click="isSidebarOpen = !isSidebarOpen" class="toggle-btn">☰</button>
        <div class="user-info">
          <span>👋 Hello, Student!</span>
        </div>
      </header>

      <div class="page-view">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Layout Styles */
.layout-container {
  display: flex;
  height: 100vh;
  background: #151521;
  color: white;
  position: relative;
  z-index: 1; /* Layout Base Z-Index */
}

.sidebar {
  width: 260px;
  background: #1e1e2d;
  padding: 20px;
  transition: 0.3s;
  display: flex;
  flex-direction: column;
  z-index: 100; /* Sidebar উপরে থাকবে */
}

.sidebar.closed {
  width: 80px;
}

.sidebar.closed .logo h2,
.sidebar.closed .nav-item span:last-child {
  display: none;
}

.logo h2 {
  color: #fff;
  margin-bottom: 30px;
  text-align: center;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 15px;
  color: #a6a6cc;
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 5px;
  transition: 0.3s;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  font-size: 16px;
}

.nav-item:hover,
.nav-item.router-link-active {
  background: #2b2b40;
  color: #fff;
}

.logout {
  color: #ff4757;
  margin-top: auto;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 50;
}

.top-bar {
  height: 60px;
  background: #1e1e2d;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 50;
}

.toggle-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

.page-view {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #151521;
  position: relative;
  z-index: 10;
}
</style>

<style>
/* এটি Layout ফাইল থেকে পুরো অ্যাপের বডি কন্ট্রোল করবে।
   যদি কোনো SweetAlert বা Overlay থেকে যায়, এটা সেটাকে হাইড করে দেবে।
*/

body,
html {
  height: 100% !important;
  width: 100% !important;
  overflow-x: hidden !important;
  overflow-y: auto !important; /* স্ক্রল সচল করা */
}

/* Zombie Overlay রিমুভ করা */
.swal2-container,
.swal2-overlay,
.swal2-backdrop-show {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
  z-index: -1 !important;
}

/* বডি লক হয়ে থাকলে আনলক করা */
body.swal2-shown {
  overflow: auto !important;
  padding-right: 0 !important;
}
</style>
