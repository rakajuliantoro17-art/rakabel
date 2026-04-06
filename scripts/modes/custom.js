// custom.js
/**
 * Mode Custom: Jadwal fleksibel / bisa diubah sesuai kebutuhan
 * Cocok untuk hari khusus, ekstrakurikuler, atau sesi guru
 */

import clock from "../scripts/clock.js";
import ScheduleEngine from "../data/schedule.js";

const CustomMode = {
  init(customSchedule = [], onSessionChange) {
    this.schedule = customSchedule; // jadwal khusus sudah diberikan
    this.onSessionChange = onSessionChange;

    // bind clock listener
    clock.onTick(() => this.tick());
  },

  tick() {
    const nowStr = clock.currentTime.toTimeString().slice(0, 5);
    const currentSession = this.getCurrentSessionByTime(nowStr);

    // trigger session change jika berbeda
    if (!this.lastSession || (currentSession && this.lastSession.start !== currentSession.start)) {
      this.lastSession = currentSession;
      if (this.onSessionChange) this.onSessionChange(currentSession);
    }
  },

  getCurrentSessionByTime(timeStr) {
    return this.schedule.find(
      (s) => s.start <= timeStr && s.end > timeStr
    ) || null;
  },

  getCurrentSession() {
    return this.lastSession || null;
  },

  getSchedule() {
    return this.schedule;
  }
};

export default CustomMode;
