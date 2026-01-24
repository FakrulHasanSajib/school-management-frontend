<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const reportData = ref([])
const loading = ref(true)
const errorMsg = ref('')

// ১. স্কুল ইনফো এখন রিয়েক্টিভ (ডাটাবেস থেকে আসবে)
const schoolInfo = ref({
  name: 'লোড হচ্ছে...',
  address: '',
  logo: '',
  signature: '',
})

// URL থেকে ফিল্টার ডাটা নেওয়া
const filters = {
  class_id: route.query.class_id,
  section_id: route.query.section_id,
  month: route.query.month,
  year: route.query.year,
}

const apiConfig = {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
}

// ২. ডাটা লোডিং ফাংশন (সেটিংস + রিপোর্ট একসাথে)
const loadData = async () => {
  try {
    // প্যারালাল রিকোয়েস্ট: একই সময়ে দুটো API কল হবে (দ্রুত গতির জন্য)
    const [settingsRes, reportRes] = await Promise.all([
      axios.get('http://127.0.0.1:8000/api/general-settings', apiConfig),
      axios.get('http://127.0.0.1:8000/api/attendance/report', {
        ...apiConfig,
        params: filters,
      }),
    ])

    // ক. সেটিংস ডাটা সেট করা
    if (settingsRes.data.data) {
      const s = settingsRes.data.data
      schoolInfo.value = {
        name: s.school_name,
        address: s.school_address,
        logo: s.logo_url, // ব্যাকএন্ডের Accessor থেকে URL আসবে
        signature: s.signature_url,
      }
    }

    // খ. রিপোর্ট ডাটা সেট করা
    reportData.value = reportRes.data.data

    // গ. সব ডাটা আসার পর অটোমেটিক প্রিন্ট ডায়ালগ ওপেন
    setTimeout(() => {
      window.print()
    }, 1500) // ১.৫ সেকেন্ড অপেক্ষা যাতে লোগো লোড হতে পারে
  } catch (error) {
    console.error(error)
    errorMsg.value = 'রিপোর্ট বা সেটিংস লোড করা যায়নি।'
  } finally {
    loading.value = false
  }
}

const getMonthName = (m) => {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  return months[m - 1]
}

const calculatePercent = (item) => {
  const total = item.present_count + item.absent_count + item.late_count
  return total === 0 ? 0 : ((item.present_count / total) * 100).toFixed(1)
}

onMounted(loadData)
</script>

<template>
  <div class="print-page">
    <div v-if="loading" class="loading no-print">রিপোর্ট তৈরি হচ্ছে... অপেক্ষা করুন...</div>
    <div v-else-if="errorMsg" class="loading error no-print">{{ errorMsg }}</div>

    <div v-else class="sheet">
      <div class="header">
        <img v-if="schoolInfo.logo" :src="schoolInfo.logo" alt="Logo" class="logo" />

        <div class="school-details">
          <h1>{{ schoolInfo.name }}</h1>
          <p>{{ schoolInfo.address }}</p>
          <h3>মাসিক হাজিরা রিপোর্ট - {{ getMonthName(filters.month) }}, {{ filters.year }}</h3>
        </div>
      </div>

      <table class="report-table">
        <thead>
          <tr>
            <th>রোল</th>
            <th class="text-left">নাম</th>
            <th>মোট ক্লাস</th>
            <th>উপস্থিত (P)</th>
            <th>অনুপস্থিত (A)</th>
            <th>শতকরা (%)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in reportData" :key="item.id">
            <td>{{ item.roll_no }}</td>
            <td class="text-left">{{ item.name }}</td>
            <td>{{ item.present_count + item.absent_count + item.late_count }}</td>
            <td>{{ item.present_count }}</td>
            <td>{{ item.absent_count }}</td>
            <td>{{ calculatePercent(item) }}%</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <div class="sign-box">
          <div class="line"></div>
          <p>শ্রেণি শিক্ষকের স্বাক্ষর</p>
        </div>

        <div class="sign-box">
          <div v-if="schoolInfo.signature" class="signature-img-container">
            <img :src="schoolInfo.signature" alt="Principal Sign" class="sign-img" />
          </div>
          <div v-else class="line"></div>

          <p>অধ্যক্ষের স্বাক্ষর</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* গ্লোবাল ফিক্স */
.print-page {
  background: #e2e8f0;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.sheet {
  background: white;
  width: 210mm;
  min-height: 297mm;
  padding: 15mm;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  color: black;
}

/* হেডার ডিজাইন */
.header {
  text-align: center;
  border-bottom: 2px solid #333;
  padding-bottom: 10px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}
.logo {
  height: 70px; /* লোগো সাইজ একটু বড় করা হয়েছে */
  width: auto;
  object-fit: contain;
}
.school-details h1 {
  margin: 0;
  font-size: 26px;
  text-transform: uppercase;
  color: black;
}
.school-details p {
  margin: 5px 0;
  font-size: 14px;
  color: #555;
}
.school-details h3 {
  margin: 10px 0 0;
  font-size: 18px;
  text-decoration: underline;
  color: black;
}

/* টেবিল ডিজাইন */
.report-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
}
.report-table th,
.report-table td {
  border: 1px solid black;
  padding: 8px;
  text-align: center;
  font-size: 14px;
  color: black;
}
.report-table th {
  background-color: #f3f3f3;
  font-weight: bold;
}
.text-left {
  text-align: left;
  padding-left: 10px;
}

/* ফুটার ডিজাইন */
.footer {
  display: flex;
  justify-content: space-between;
  margin-top: 60px; /* গ্যাপ বাড়ানো হয়েছে */
  padding-top: 20px;
}
.sign-box {
  text-align: center;
  width: 200px;
  position: relative;
}
.line {
  border-top: 1px solid black;
  margin-bottom: 5px;
  width: 100%;
}
.sign-img {
  height: 40px;
  width: auto;
  display: block;
  margin: 0 auto;
  margin-bottom: -10px;
} /* স্বাক্ষরের পজিশন ফিক্স */
.signature-img-container {
  border-bottom: 1px solid black;
  padding-bottom: 5px;
  margin-bottom: 5px;
  display: inline-block;
  width: 100%;
}

.loading {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-top: 50px;
  text-align: center;
}
.error {
  color: red;
}

/* 🖨️ প্রিন্ট স্পেসিফিক স্টাইল */
@media print {
  .print-page {
    background: white;
    padding: 0;
    height: auto;
    display: block;
  }
  .sheet {
    box-shadow: none;
    width: 100%;
    margin: 0;
    padding: 0;
  }
  .no-print {
    display: none !important;
  }
  @page {
    margin: 10mm;
    size: A4;
  }

  /* প্রিন্টে সব টেক্সট কালো নিশ্চিত করা */
  * {
    color: black !important;
    -webkit-print-color-adjust: exact;
  }
}
</style>
