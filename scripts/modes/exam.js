// exam.js
/**
 * Mode Exam: Jadwal ujian sekolah
 * Mengatur sesi JP khusus ujian, biasanya tanpa istirahat panjang
 */

import ScheduleEngine from "../data/schedule.js";
import clock from "../scripts/clock.js";

const ExamMode = {
  init(appConfig, onSessionChange) {
    this.config = { ...appConfig };

    // Contoh modifikasi untuk ujian: semua istirahat dihilangkan atau dipersingkat
    this.config.breaks = this.config.breaks.map(b => ({ ...b, duration: 0 }));

    this.onSessionChange = onSessionChange;

    // generate schedule exam
    this.schedule = ScheduleEngine.generateSchedule(this.config);

    // bind clock listener
    clock.onTick(() => this.tick());
  },

  tick() {
    const nowStr = clock.currentTime.toTimeString().slice(0, 5);
    const currentSession = ScheduleEngine.getCurrentSession(this.schedule, nowStr);

    // trigger session change jika berbeda
    if (!this.lastSession || (currentSession && this.lastSession.start !== currentSession.start)) {
      this.lastSession = currentSession;
      if (this.onSessionChange) this.onSessionChange(currentSession);
    }
  },

  getCurrentSession() {
    return this.lastSession || null;
  },

  getSchedule() {
    return this.schedule;
  }
};

export default ExamMode;
