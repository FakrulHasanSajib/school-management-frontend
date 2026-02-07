<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const routineData = ref({})
const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const fetchRoutine = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/teacher/my-routine', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    routineData.value = res.data.data
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => fetchRoutine())
</script>

<template>
  <div class="routine-container">
    <div class="card">
      <h2>📅 My Class Routine</h2>
      <div class="routine-grid">
        <div v-for="day in days" :key="day" class="day-card" v-if="routineData[day]">
          <h3 class="day-title">{{ day }}</h3>
          <div v-for="item in routineData[day]" :key="item.id" class="class-item">
            <div class="time">{{ item.start_time }} - {{ item.end_time }}</div>
            <div class="details">
              <strong>{{ item.school_class?.name }} ({{ item.section?.name }})</strong>
              <p>{{ item.subject?.name }}</p>
            </div>
          </div>
        </div>
        <div v-if="Object.keys(routineData).length === 0" class="no-data">
          <p>No routine found assigned to you.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.routine-container {
  max-width: 1000px;
  margin: 0 auto;
  color: white;
}
.card {
  background: #1e1e2d;
  padding: 25px;
  border-radius: 12px;
}
.routine-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}
.day-card {
  background: #2b2b40;
  border-radius: 8px;
  overflow: hidden;
}
.day-title {
  background: #3699ff;
  color: white;
  padding: 10px;
  margin: 0;
  text-align: center;
  font-size: 1rem;
}
.class-item {
  padding: 15px;
  border-bottom: 1px solid #383850;
  display: flex;
  gap: 15px;
  align-items: center;
}
.class-item:last-child {
  border-bottom: none;
}
.time {
  background: #151521;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #f59e0b;
  font-weight: bold;
  white-space: nowrap;
}
.details p {
  margin: 2px 0 0;
  color: #a1a5b7;
  font-size: 0.9rem;
}
.no-data {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>
