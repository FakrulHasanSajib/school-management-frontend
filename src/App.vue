<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
/* গ্লোবাল স্টাইল রিসেট */
body {
  margin: 0;
  padding: 0;
  font-family: 'Poppins', sans-serif; /* ফন্ট স্টাইল এক রাখার জন্য */
  background-color: #172a33; /* লগইন পেজের ব্যাকগ্রাউন্ড কালার বা ডিফল্ট কালার */
  width: 100%;
  min-height: 100vh;
}

#app {
  width: 100%;
  margin: 0;
  padding: 0;
}
</style>
