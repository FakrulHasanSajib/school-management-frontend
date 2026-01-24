<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const loading = ref(false)
const token = localStorage.getItem('token')

// ফর্ম ডাটা
const form = ref({
  school_name: '',
  school_address: '',
  phone: '',
  email: '',
  school_logo: null, // ফাইল অবজেক্ট
  principal_signature: null, // ফাইল অবজেক্ট
})

// প্রিভিউ এর জন্য
const logoPreview = ref(null)
const signPreview = ref(null)

const apiConfig = {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'multipart/form-data', // ফাইল আপলোডের জন্য জরুরি
  },
}

// ১. ডাটা লোড করা
const fetchSettings = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/general-settings', {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.data.data) {
      const data = res.data.data
      form.value.school_name = data.school_name
      form.value.school_address = data.school_address
      form.value.phone = data.phone
      form.value.email = data.email

      // সার্ভার থেকে আসা লোগো প্রিভিউতে সেট করা
      if (data.logo_url) logoPreview.value = data.logo_url
      if (data.signature_url) signPreview.value = data.signature_url
    }
  } catch (error) {
    console.error('Settings fetch error:', error)
  }
}

// ২. ফাইল হ্যান্ডেল করা (লোগো)
const handleLogoChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    form.value.school_logo = file
    logoPreview.value = URL.createObjectURL(file) // তাৎক্ষণিক প্রিভিউ
  }
}

// ৩. ফাইল হ্যান্ডেল করা (স্বাক্ষর)
const handleSignChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    form.value.principal_signature = file
    signPreview.value = URL.createObjectURL(file)
  }
}

// ৪. সেটিংস সেভ করা
const saveSettings = async () => {
  loading.value = true

  // FormData ব্যবহার করতে হবে কারণ ফাইল আছে
  const formData = new FormData()
  formData.append('school_name', form.value.school_name)
  formData.append('school_address', form.value.school_address || '')
  formData.append('phone', form.value.phone || '')
  formData.append('email', form.value.email || '')

  if (form.value.school_logo) {
    formData.append('school_logo', form.value.school_logo)
  }
  if (form.value.principal_signature) {
    formData.append('principal_signature', form.value.principal_signature)
  }

  try {
    await axios.post('http://127.0.0.1:8000/api/general-settings/update', formData, apiConfig)
    Swal.fire('সফল!', 'সেটিংস আপডেট হয়েছে।', 'success')
  } catch (error) {
    Swal.fire('ভুল হয়েছে', 'সেটিংস সেভ করা যায়নি।', 'error')
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchSettings)
</script>

<template>
  <div class="settings-container">
    <div class="card">
      <div class="card-header">
        <h2>⚙️ সাধারণ সেটিংস</h2>
        <p>স্কুলের নাম, লোগো এবং অন্যান্য তথ্য আপডেট করুন</p>
      </div>

      <div class="card-body">
        <form @submit.prevent="saveSettings" class="settings-form">
          <div class="form-grid">
            <div class="form-group">
              <label>স্কুলের নাম <span class="req">*</span></label>
              <input
                v-model="form.school_name"
                type="text"
                placeholder="Example School & College"
                required
              />
            </div>

            <div class="form-group">
              <label>ঠিকানা</label>
              <input v-model="form.school_address" type="text" placeholder="Address here..." />
            </div>

            <div class="form-group">
              <label>ফোন নাম্বার</label>
              <input v-model="form.phone" type="text" placeholder="Official Phone" />
            </div>

            <div class="form-group">
              <label>ইমেইল</label>
              <input v-model="form.email" type="email" placeholder="school@example.com" />
            </div>
          </div>

          <hr class="divider" />

          <div class="image-grid">
            <div class="image-box">
              <label>স্কুলের লোগো</label>
              <div class="preview-area">
                <img v-if="logoPreview" :src="logoPreview" alt="Logo Preview" />
                <div v-else class="placeholder">No Logo</div>
              </div>
              <input type="file" @change="handleLogoChange" accept="image/*" />
            </div>

            <div class="image-box">
              <label>অধ্যক্ষের স্বাক্ষর</label>
              <div class="preview-area">
                <img v-if="signPreview" :src="signPreview" alt="Sign Preview" class="sign-img" />
                <div v-else class="placeholder">No Signature</div>
              </div>
              <input type="file" @change="handleSignChange" accept="image/*" />
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-save" :disabled="loading">
              {{ loading ? 'সেভ হচ্ছে...' : '💾 সেভ করুন' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
.card-header {
  background: #1e293b;
  color: white;
  padding: 20px;
}
.card-header h2 {
  margin: 0;
  font-size: 22px;
}
.card-header p {
  margin: 5px 0 0;
  opacity: 0.8;
  font-size: 14px;
}
.card-body {
  padding: 30px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
label {
  font-weight: 600;
  color: #334155;
}
.req {
  color: red;
}
input {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 15px;
}
input:focus {
  outline: none;
  border-color: #3b82f6;
}

.divider {
  margin: 30px 0;
  border: 0;
  border-top: 1px solid #e2e8f0;
}

.image-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}
.image-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}
.preview-area {
  width: 150px;
  height: 150px;
  border: 2px dashed #cbd5e1;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  overflow: hidden;
  background: #f8fafc;
}
.preview-area img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.sign-img {
  object-fit: contain !important;
  padding: 10px;
}
.placeholder {
  color: #94a3b8;
  font-size: 14px;
}

.form-actions {
  margin-top: 30px;
  text-align: right;
}
.btn-save {
  background: #2563eb;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: 0.2s;
}
.btn-save:hover {
  background: #1d4ed8;
}
.btn-save:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}
</style>
