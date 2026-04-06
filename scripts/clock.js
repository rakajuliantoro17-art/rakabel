// clock.js
class Clock {
  constructor() {
    this.listeners = [];
    this.currentTime = new Date();
    this.tickInterval = null;
  }

  // Mulai jam realtime
  start() {
    this.updateTime();
    this.tickInterval = setInterval(() => {
      this.updateTime();
    }, 1000); // update tiap detik
  }

  // Hentikan jam
  stop() {
    clearInterval(this.tickInterval);
  }

  // Update waktu sekarang dan trigger listener
  updateTime() {
    this.currentTime = new Date();
    this.notifyListeners();
  }

  // Fungsi listener untuk app.js
  onTick(callback) {
    if (typeof callback === "function") {
      this.listeners.push(callback);
    }
  }

  // Panggil semua listener
  notifyListeners() {
    this.listeners.forEach((cb) => cb(this.currentTime));
  }

  // Sinkron dengan server / optional NTP
  async syncServerTime(fetchTimeFunc) {
    try {
      const serverTime = await fetchTimeFunc(); // harus return Date object
      if (serverTime instanceof Date) {
        this.currentTime = serverTime;
        this.notifyListeners();
      }
    } catch (err) {
      console.error("Sync server time failed:", err);
    }
  }
}

// Export instance supaya singleton
const clock = new Clock();
export default clock;
