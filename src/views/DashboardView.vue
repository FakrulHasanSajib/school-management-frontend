<template>
  <div>
    <div class="stats-grid">
      <div class="card">
        <div class="card-icon blue-bg">👨‍🎓</div>
        <div>
          <h4>মোট স্টুডেন্ট</h4>
          <p class="number">১,২০০</p>
        </div>
      </div>

      <div class="card">
        <div class="card-icon green-bg">👨‍🏫</div>
        <div>
          <h4>মোট টিচার</h4>
          <p class="number">৪৫</p>
        </div>
      </div>

      <div class="card">
        <div class="card-icon purple-bg">৳</div>
        <div>
          <h4>এই মাসের আয়</h4>
          <p class="number">৫০,০০০ ৳</p>
        </div>
      </div>
    </div>

    <div class="recent-section">
      <h3>সাম্প্রতিক অ্যাক্টিভিটি</h3>
      <p class="no-data">সিস্টেমে কোনো নতুন আপডেট নেই...</p>
    </div>
  </div>
</template>

<style scoped>
/* গ্রিড লেআউট */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* কার্ড ডিজাইন (ডার্ক থিম অনুযায়ী অ্যাডজাস্ট করা) */
.card {
  background: #212121; /* সাদা রঙের বদলে ডার্ক কালার */
  padding: 1.5rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.card:hover {
  transform: translateY(-3px);
  background: #2a2a2a; /* হোভার করলে একটু লাইট হবে */
}

/* আইকন বক্স */
.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
}

/* আইকনের ব্যাকগ্রাউন্ড (ডার্ক মোডে হালকা কালার) */
.blue-bg {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}
.green-bg {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}
.purple-bg {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
}

/* টেক্সট স্টাইল */
.card h4 {
  margin: 0;
  font-size: 0.9rem;
  color: #a0a0a0; /* হালকা গ্রে টেক্সট */
  font-weight: 600;
}

.card .number {
  margin: 5px 0 0;
  font-size: 1.6rem;
  font-weight: 700;
  color: #ffffff; /* সাদা টেক্সট */
}

/* রিসেন্ট অ্যাক্টিভিটি */
.recent-section {
  background: #212121;
  padding: 1.5rem;
  border-radius: 16px;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.recent-section h3 {
  margin-top: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.no-data {
  color: #a0a0a0;
  margin-top: 10px;
}
</style>
