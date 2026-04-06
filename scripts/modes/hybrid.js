// hybrid.js
/**
 * Mode Hybrid: Kombinasi Normal + Custom / Exam
 * Bisa mix jadwal normal dan sesi khusus tambahan
 */

import ScheduleEngine from "../data/schedule.js";
import clock from "../scripts/clock.js";

const HybridMode = {
  init(appConfig, extraSessions = [], onSessionChange) {
    this.config = { ...appConfig };
    this.extraSessions = extraSessions; // sesi tambahan opsional
    this.onSessionChange = onSessionChange;

    // generate schedule normal
    const normalSchedule = ScheduleEngine.generateSchedule(this.config);

    // gabungkan normal + extraSessions
    this.schedule = [...normalSchedule, ...this.extraSessions];

    // sort by start time
    this.schedule.sort((a, b) => {
      const [ah, am] = a.start.split(":").map(Number);
      const [bh, bm] = b.start.split(":").map(Number);
      return ah * 60 + am - (bh * 60 + bm);
    });

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

export default HybridMode;
