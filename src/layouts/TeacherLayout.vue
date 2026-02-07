<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const teacherName = ref('Teacher')

onMounted(() => {
  // লোকাল স্টোরেজ থেকে টিচারের নাম নেওয়া
  const userData = localStorage.getItem('user_data')
  if (userData) {
    const user = JSON.parse(userData)
    teacherName.value = user.name
  }
})

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user_role')
  localStorage.removeItem('user_data')
  router.push('/login')
}
</script>

<template>
  <div class="app-container">
    <aside class="sidebar">
      <div class="brand">
        <h3>👨‍🏫 Teacher Portal</h3>
      </div>

      <nav class="nav-menu">
        <router-link to="/teacher/dashboard" class="nav-item" active-class="active">
          <span>🏠</span> Dashboard
        </router-link>

        <router-link to="/teacher/attendance" class="nav-item" active-class="active">
          <span>📅</span> Take Attendance
        </router-link>

        <router-link to="/teacher/marks" class="nav-item" active-class="active">
          <span>📝</span> Marks Entry
        </router-link>

        <router-link to="/teacher/routine" class="nav-item" active-class="active">
          <span>⏰</span> Class Routine
        </router-link>

        <router-link to="/teacher/students" class="nav-item" active-class="active">
          <span>🎓</span> My Students
        </router-link>

        <button @click="logout" class="nav-item logout"><span>🚪</span> Logout</button>
      </nav>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <div class="user-info">
          <span class="greeting"
            >Welcome, <strong>{{ teacherName }}</strong> 👋</span
          >
          <div class="avatar">{{ teacherName.charAt(0) }}</div>
        </div>
      </header>

      <div class="content-view">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Layout Structure */
.app-container {
  display: flex;
  height: 100vh;
  background: #151521;
  color: white;
  font-family: 'Poppins', sans-serif;
}

/* Sidebar */
.sidebar {
  width: 260px;
  background: #1e1e2d;
  padding: 20px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #2b2b40;
}
.brand h3 {
  margin-bottom: 40px;
  color: #3699ff;
  text-align: center;
  font-size: 1.4rem;
  letter-spacing: 1px;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-radius: 12px;
  color: #a1a5b7;
  text-decoration: none;
  transition: 0.3s;
  font-size: 0.95rem;
  background: transparent;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
}
.nav-item:hover {
  background: #2b2b40;
  color: white;
  transform: translateX(5px);
}
.nav-item.active {
  background: #3699ff;
  color: white;
  box-shadow: 0 4px 12px rgba(54, 153, 255, 0.3);
}

.logout {
  margin-top: auto;
  color: #f87171;
}
.logout:hover {
  background: #3f1818;
  color: #ef4444;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #151521;
}

/* Top Bar */
.top-bar {
  height: 70px;
  background: #1e1e2d;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 30px;
  border-bottom: 1px solid #2b2b40;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}
.greeting {
  color: #a1a5b7;
  font-size: 0.95rem;
}
.greeting strong {
  color: white;
}
.avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3699ff, #0072ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 1.2rem;
}

/* Content View */
.content-view {
  padding: 30px;
  overflow-y: auto;
  height: calc(100vh - 70px);
}

/* Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
