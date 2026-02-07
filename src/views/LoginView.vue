<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Swal from 'sweetalert2' // সুন্দর এলার্টের জন্য (অপশনাল)

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const router = useRouter()
const authStore = useAuthStore()

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    // ১. লগইন অ্যাকশন কল করা
    await authStore.login(email.value, password.value)

    // ২. রোল চেক করা
    const role = localStorage.getItem('user_role') || authStore.user?.role

    console.log('User Role Found:', role) // কনসোলে চেক করার জন্য

    // ৩. ✅ রোল অনুযায়ী সঠিক রিডাইরেক্ট (লজিক ফিক্সড)
    if (role === 'student') {
      router.push('/student/dashboard')
    } else if (role === 'teacher') {
      router.push('/teacher/dashboard') // 👈 টিচার এখন এখানে যাবে
    } else if (role === 'admin') {
      router.push('/admin/dashboard')
    } else {
      // যদি রোল না মেলে
      errorMessage.value = 'Unknown User Role'
    }
  } catch (error) {
    console.error(error)
    if (error.response && error.response.data) {
      errorMessage.value = error.response.data.message
    } else {
      errorMessage.value = 'Network Error or Invalid Credentials'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-wrapper">
    <div class="circle circle-top-left"></div>
    <div class="circle circle-bottom-right"></div>
    <div class="circle circle-card-overlap"></div>

    <div class="content-container">
      <div class="illustration-side">
        <img
          src="https://cdni.iconscout.com/illustration/premium/thumb/web-development-2974925-2477356.png"
          alt="3D Illustration"
          class="hero-img"
        />
      </div>

      <div class="form-side">
        <div class="glass-card">
          <div class="header-group">
            <h1 class="login-title">Login</h1>
            <div class="title-bar"></div>
            <p class="welcome-text">Welcome! We are happy to see you here!</p>
          </div>

          <form @submit.prevent="handleLogin">
            <div class="input-group">
              <label>Email / Username</label>
              <input
                type="text"
                v-model="email"
                placeholder="Enter your email"
                class="glass-input"
              />
            </div>

            <div class="input-group">
              <label>Password</label>
              <input
                type="password"
                v-model="password"
                placeholder="Enter your password"
                class="glass-input"
              />
            </div>

            <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

            <div class="actions">
              <a href="#" class="forgot-link">Forgot Password?</a>
            </div>

            <button type="submit" class="login-btn">
              <span v-if="isLoading">LOGGING IN...</span>
              <span v-else>LOGIN</span>
            </button>
          </form>

          <div class="footer-text">
            New to School? <a href="#" class="register-link">Register</a> Here
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;600&family=Poppins:wght@300;400;500&display=swap');

/* Main Background matching the image's dark teal/slate */
.login-wrapper {
  min-height: 100vh;
  background-color: #172a33; /* Dark Petrol Blue */
  background: radial-gradient(circle at 50% 50%, #1f3540 0%, #122026 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  font-family: 'Poppins', sans-serif;
}

/* Background Circles (Design Elements) */
.circle {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  pointer-events: none;
}

.circle-top-left {
  width: 400px;
  height: 400px;
  top: -100px;
  left: -100px;
}

.circle-bottom-right {
  width: 600px;
  height: 600px;
  bottom: -200px;
  right: -100px;
  border-color: rgba(255, 255, 255, 0.05);
}

.circle-card-overlap {
  width: 300px;
  height: 300px;
  top: 10%;
  right: 25%;
  border: 1px solid rgba(255, 255, 255, 0.03);
}

/* Container for Layout */
.content-container {
  display: flex;
  width: 100%;
  max-width: 1200px;
  padding: 20px;
  align-items: center;
  z-index: 10;
}

.illustration-side {
  flex: 1.2;
  display: flex;
  justify-content: center;
  /* Image on left */
}

.hero-img {
  max-width: 90%;
  height: auto;
  /* Drop shadow for 3D effect */
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.4));
}

.form-side {
  flex: 0.8;
  display: flex;
  justify-content: center;
}

/* THE GLASS CARD */
.glass-card {
  background: rgba(255, 255, 255, 0.06); /* Very sheer white */
  backdrop-filter: blur(20px); /* Heavy blur like the image */
  -webkit-backdrop-filter: blur(20px);
  padding: 40px;
  border-radius: 24px;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
}

/* Typography */
.login-title {
  font-family: 'Oxanium', sans-serif; /* Techy font similar to image */
  font-size: 2rem;
  font-weight: 500;
  margin: 0;
  letter-spacing: 1px;
}

.title-bar {
  width: 50px;
  height: 2px;
  background: #ffffff;
  margin-top: 5px;
  margin-bottom: 15px;
}

.welcome-text {
  font-size: 0.9rem;
  color: #aebbc4; /* Muted text color */
  font-weight: 300;
  margin-bottom: 2rem;
}

/* Form Fields */
.input-group {
  margin-bottom: 1.2rem;
}

label {
  display: block;
  font-size: 0.85rem;
  color: #cdd5da;
  margin-bottom: 0.5rem;
}

.glass-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.2); /* Dark transparent bg */
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 12px 15px;
  color: white;
  font-size: 0.9rem;
  outline: none;
  box-sizing: border-box;
  transition: 0.3s;
}

.glass-input::placeholder {
  color: #6b7a85;
}

.glass-input:focus {
  background: rgba(0, 0, 0, 0.3);
  border-color: #94e0d1; /* Mint focus border */
}

/* Actions */
.actions {
  text-align: right;
  margin-bottom: 1.5rem;
}

.forgot-link {
  color: #aebbc4;
  font-size: 0.8rem;
  text-decoration: none;
}

.forgot-link:hover {
  color: #fff;
}

/* Button */
.login-btn {
  width: 100%;
  background-color: #94e0d1; /* The specific Mint Green color */
  color: #1a262f; /* Dark text for contrast */
  border: none;
  border-radius: 8px;
  padding: 14px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.login-btn:hover {
  transform: translateY(-2px);
  background-color: #83dac9;
}

/* Footer */
.footer-text {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.85rem;
  color: #aebbc4;
}

.register-link {
  color: #fff;
  font-weight: 600;
  text-decoration: none;
}

.error-msg {
  color: #ff6b6b;
  font-size: 0.8rem;
  text-align: center;
  margin-bottom: 10px;
}

/* Responsive */
@media (max-width: 900px) {
  .content-container {
    flex-direction: column;
  }
  .illustration-side {
    display: none; /* Mobile e shudhu form dekhabe */
  }
  .form-side {
    width: 100%;
  }
}
</style>
