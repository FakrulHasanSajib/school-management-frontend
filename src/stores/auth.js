import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null, // ব্রাউজারে টোকেন থাকলে লোড করবে
  }),

  actions: {
    async login(email, password) {
      try {
        // ব্যাকএন্ড API তে রিকোয়েস্ট পাঠানো
        const response = await axios.post('http://127.0.0.1:8000/api/login', {
          email: email,
          password: password,
        })

        if (response.data.status) {
          // সফল হলে টোকেন এবং ইউজার ডাটা স্টোরে রাখা
          this.token = response.data.token
          this.user = response.data.user

          // ব্রাউজারের মেমোরিতে টোকেন সেভ করা (যাতে রিলোড দিলেও লগইন থাকে)
          localStorage.setItem('token', this.token)

          return true // সফল সংকেত
        }
      } catch (error) {
        throw error // এরর হলে সেটা লগইন পেজে পাঠিয়ে দেওয়া
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
    },
  },
})
