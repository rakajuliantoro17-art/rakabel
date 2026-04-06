// normal.js
/**
 * Mode Normal: Jadwal standar harian sekolah
 * Mengatur sesi JP, istirahat, dan auto bell
 */

import ScheduleEngine from "../data/schedule.js";
import clock from "../scripts/clock.js";

const NormalMode = {
  init(appConfig, onSessionChange) {
    this.config = appConfig;
    this.onSessionChange = onSessionChange;

    // generate schedule normal
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

export default NormalMode;
