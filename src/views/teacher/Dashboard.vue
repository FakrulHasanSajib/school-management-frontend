<script setup>
import { ref, onMounted } from 'vue'

// ডামি ডাটা (ভবিষ্যতে API দিয়ে রিপ্লেস করা হবে)
const stats = ref([
  { title: 'Total Students', count: 120, icon: '🎓', color: '#3699ff' },
  { title: "Today's Classes", count: 4, icon: '📚', color: '#10b981' },
  { title: 'Pending Attendance', count: 1, icon: '⚠️', color: '#f59e0b' },
  { title: 'Upcoming Exams', count: 2, icon: '📝', color: '#8b5cf6' },
])

const todaysClasses = ref([
  { time: '09:00 AM', class: 'Class 10', subject: 'Mathematics', room: '101' },
  { time: '10:30 AM', class: 'Class 9', subject: 'Physics', room: 'Lab A' },
  { time: '01:00 PM', class: 'Class 8', subject: 'General Science', room: '205' },
])
</script>

<template>
  <div class="dashboard-container">
    <h2 class="page-title">Dashboard Overview</h2>

    <div class="stats-grid">
      <div
        v-for="(stat, index) in stats"
        :key="index"
        class="stat-card"
        :style="{ borderBottom: `4px solid ${stat.color}` }"
      >
        <div class="stat-icon" :style="{ background: stat.color + '20', color: stat.color }">
          {{ stat.icon }}
        </div>
        <div class="stat-info">
          <h3>{{ stat.count }}</h3>
          <p>{{ stat.title }}</p>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="action-section">
        <h3>🚀 Quick Actions</h3>
        <div class="action-buttons">
          <button class="action-btn attend">📅 Take Attendance</button>
          <button class="action-btn marks">📝 Enter Marks</button>
          <button class="action-btn notice">📢 Post Notice</button>
        </div>
      </div>

      <div class="routine-section">
        <h3>📅 Today's Schedule</h3>
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Room</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(cls, i) in todaysClasses" :key="i">
                <td>
                  <span class="time-badge">{{ cls.time }}</span>
                </td>
                <td>{{ cls.class }}</td>
                <td>{{ cls.subject }}</td>
                <td>{{ cls.room }}</td>
                <td><button class="btn-start">Start</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}
.page-title {
  margin-bottom: 25px;
  font-size: 1.5rem;
  color: white;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}
.stat-card {
  background: #1e1e2d;
  padding: 25px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}
.stat-card:hover {
  transform: translateY(-5px);
}
.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}
.stat-info h3 {
  font-size: 1.8rem;
  margin: 0;
  color: white;
}
.stat-info p {
  margin: 0;
  color: #a1a5b7;
  font-size: 0.9rem;
}

/* Dashboard Content Split */
.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 25px;
}

/* Quick Actions */
.action-section {
  background: #1e1e2d;
  padding: 25px;
  border-radius: 12px;
  height: fit-content;
}
.action-section h3,
.routine-section h3 {
  margin-bottom: 20px;
  color: white;
  font-size: 1.1rem;
  border-bottom: 1px solid #2b2b40;
  padding-bottom: 10px;
}
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.action-btn {
  padding: 12px;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  text-align: left;
  padding-left: 20px;
}
.action-btn:hover {
  filter: brightness(1.1);
  transform: translateX(5px);
}
.attend {
  background: linear-gradient(135deg, #3699ff, #0072ff);
}
.marks {
  background: linear-gradient(135deg, #10b981, #059669);
}
.notice {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

/* Routine Section */
.routine-section {
  background: #1e1e2d;
  padding: 25px;
  border-radius: 12px;
}
.table-container {
  overflow-x: auto;
}
.custom-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.custom-table th {
  padding: 12px;
  background: #2b2b40;
  color: #a1a5b7;
  font-weight: 600;
  font-size: 0.9rem;
}
.custom-table td {
  padding: 15px 12px;
  border-bottom: 1px solid #2b2b40;
  color: #e1e1e6;
}
.time-badge {
  background: #2b2b40;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #3699ff;
  font-weight: bold;
}
.btn-start {
  background: #2b2b40;
  color: #10b981;
  border: 1px solid #10b981;
  padding: 5px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: 0.2s;
}
.btn-start:hover {
  background: #10b981;
  color: white;
}

/* Mobile Responsive */
@media (max-width: 900px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}
</style>
