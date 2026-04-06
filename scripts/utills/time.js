// time.js
/**
 * Utility Waktu untuk Aplikasi Bel Sekolah
 * Fungsi: konversi, format, countdown, perhitungan menit
 */

const TimeUtils = {
  /**
   * Konversi "HH:MM" menjadi menit total
   * @param {string} timeStr
   * @returns {number} menit
   */
  toMinutes(timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  },

  /**
   * Konversi menit total menjadi string "HH:MM"
   * @param {number} totalMinutes
   * @returns {string}
   */
  fromMinutes(totalMinutes) {
    const h = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
    const m = (totalMinutes % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  },

  /**
   * Format Date object menjadi string "HH:MM"
   * @param {Date} date
   * @returns {string}
   */
  formatHHMM(date) {
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  },

  /**
   * Hitung sisa detik sampai endTime dari sekarang
   * @param {string} endTime "HH:MM"
   * @param {Date} now Date object saat ini
   * @returns {number} sisa detik
   */
  secondsUntil(endTime, now = new Date()) {
    const endMinutes = this.toMinutes(endTime);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const diff = (endMinutes - currentMinutes) * 60 - now.getSeconds();
    return Math.max(0, diff);
  },

  /**
   * Konversi sisa detik menjadi "MM:SS"
   * @param {number} seconds
   * @returns {string}
   */
  formatCountdown(seconds) {
    const min = Math.floor(seconds / 60).toString().padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  }
};

export default TimeUtils;
