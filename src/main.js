import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios'

const app = createApp(App)

// 1. পিনিয়া স্টোর আগে সেটআপ করা
const pinia = createPinia()
app.use(pinia)

// 2. টোকেন চেক করা এবং Axios এ সেট করা
const token = localStorage.getItem('token')
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

app.use(router)
app.mount('#app')
