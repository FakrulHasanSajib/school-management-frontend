<script setup>
import { ref } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'

const router = useRouter()
const BASE_URL = 'http://127.0.0.1:8000/api'
const token = localStorage.getItem('token')
const apiConfig = { headers: { Authorization: `Bearer ${token}` } }

const form = ref({
  new_password: '',
  new_password_confirmation: '',
})
const isLoading = ref(false)

const handleChangePassword = async () => {
  if (form.value.new_password !== form.value.new_password_confirmation) {
    return Swal.fire('Error', 'Passwords do not match', 'error')
  }

  isLoading.value = true
  try {
    await axios.post(`${BASE_URL}/change-password`, form.value, apiConfig)

    Swal.fire('Success', 'Password updated successfully!', 'success')
    router.push('/student/dashboard')
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'Failed to update', 'error')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="password-container">
    <div class="card">
      <h2 class="mb-4">🔒 Change Password</h2>
      <form @submit.prevent="handleChangePassword">
        <div class="form-group">
          <label>New Password</label>
          <input
            type="password"
            v-model="form.new_password"
            required
            minlength="6"
            placeholder="Enter new password"
          />
        </div>

        <div class="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            v-model="form.new_password_confirmation"
            required
            minlength="6"
            placeholder="Confirm new password"
          />
        </div>

        <div class="actions">
          <button type="button" @click="$router.back()" class="btn-cancel">Cancel</button>
          <button type="submit" class="btn-save" :disabled="isLoading">
            {{ isLoading ? 'Updating...' : 'Update Password' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.password-container {
  display: flex;
  justify-content: center;
  padding-top: 50px;
}
.card {
  background: #1e1e2d;
  padding: 30px;
  border-radius: 15px;
  width: 100%;
  max-width: 500px;
  color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  border: 1px solid #333;
}
.form-group {
  margin-bottom: 20px;
}
label {
  display: block;
  margin-bottom: 8px;
  color: #a1a5b7;
}
input {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #333;
  background: #151521;
  color: white;
  outline: none;
  box-sizing: border-box;
}
input:focus {
  border-color: #3699ff;
}
.actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
.btn-save {
  flex: 1;
  background: #3699ff;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}
.btn-cancel {
  flex: 1;
  background: #333;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>
