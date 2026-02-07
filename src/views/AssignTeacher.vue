<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const classes = ref([])
const sections = ref([])
const teachers = ref([])

const form = ref({
  class_id: '',
  section_id: '',
  teacher_id: '',
})

// প্রাথমিক ডাটা লোড (ক্লাস এবং সব টিচার)
const fetchData = async () => {
  const token = localStorage.getItem('token')

  // ক্লাস আনা
  const clsRes = await axios.get('http://127.0.0.1:8000/api/academic/classes', {
    headers: { Authorization: `Bearer ${token}` },
  })
  classes.value = clsRes.data.data || clsRes.data

  // সব টিচার আনা
  const tchRes = await axios.get('http://127.0.0.1:8000/api/teachers', {
    headers: { Authorization: `Bearer ${token}` },
  })
  teachers.value = tchRes.data.data || tchRes.data
}

// ক্লাস পাল্টালে সেকশন লোড হবে
const fetchSections = async () => {
  if (!form.value.class_id) return
  const res = await axios.get(
    `http://127.0.0.1:8000/api/academic/classes/${form.value.class_id}/sections`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    },
  )
  sections.value = res.data.data || res.data
}

// অ্যাসাইন বাটন ক্লিক করলে
const assignTeacher = async () => {
  if (!form.value.section_id || !form.value.teacher_id) {
    Swal.fire('Warning', 'Please select Section and Teacher', 'warning')
    return
  }

  try {
    await axios.post(
      'http://127.0.0.1:8000/api/academic/assign-teacher',
      {
        section_id: form.value.section_id,
        teacher_id: form.value.teacher_id,
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      },
    )

    Swal.fire('Success', 'Class Teacher Assigned Successfully!', 'success')
  } catch (e) {
    console.error(e)
    Swal.fire('Error', 'Failed to assign teacher', 'error')
  }
}

onMounted(() => fetchData())
</script>

<template>
  <div class="assign-container">
    <div class="card">
      <h3>👨‍🏫 Assign Class Teacher</h3>

      <div class="form-group">
        <label>Select Class</label>
        <select v-model="form.class_id" @change="fetchSections">
          <option value="">Select Class</option>
          <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
        </select>
      </div>

      <div class="form-group">
        <label>Select Section</label>
        <select v-model="form.section_id">
          <option value="">Select Section</option>
          <option v-for="sec in sections" :key="sec.id" :value="sec.id">{{ sec.name }}</option>
        </select>
      </div>

      <div class="form-group">
        <label>Select Teacher</label>
        <select v-model="form.teacher_id">
          <option value="">Select Class Teacher</option>
          <option
            v-for="teacher in teachers"
            :key="teacher.id"
            :value="teacher.user_id || teacher.id"
          >
            {{ teacher.name || teacher.user?.name }}
          </option>
        </select>
      </div>

      <button @click="assignTeacher" class="btn-save">💾 Save Assignment</button>
    </div>
  </div>
</template>

<style scoped>
.assign-container {
  display: flex;
  justify-content: center;
  padding: 40px;
}
.card {
  background: #1e1e2d;
  padding: 30px;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}
h3 {
  text-align: center;
  color: #3699ff;
  margin-bottom: 25px;
}
.form-group {
  margin-bottom: 20px;
}
label {
  display: block;
  margin-bottom: 8px;
  color: #a1a5b7;
}
select {
  width: 100%;
  padding: 12px;
  background: #151521;
  border: 1px solid #333;
  color: white;
  border-radius: 8px;
  outline: none;
}
select:focus {
  border-color: #3699ff;
}
.btn-save {
  width: 100%;
  padding: 12px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  transition: 0.3s;
}
.btn-save:hover {
  background: #059669;
}
</style>
