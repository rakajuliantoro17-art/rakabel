/**
 * SCHEDULE ENGINE v1.0
 * Scalable, Flexible, ML-Ready
 */

const ScheduleEngine = (() => {

  /**
   * =========================
   * DEFAULT CONFIG (GLOBAL)
   * =========================
   */
  const DEFAULT_CONFIG = {
    startTime: "07:00",
    jpDuration: 45,        // menit
    totalJP: 10,
    breaks: [
      { afterJP: 4, duration: 15, name: "Istirahat 1" },
      { afterJP: 6, duration: 0,  name: "Istirahat 2" } // 0 = auto skip
    ],
    mode: "normal"
  };

  /**
   * =========================
   * MODE PRESETS
   * =========================
   */
  const MODES = {
    normal: {
      jpDuration: 45
    },
    exam: {
      jpDuration: 60
    },
    hybrid: {
      jpDuration: 50
    },
    custom: {}
  };

  /**
   * =========================
   * UTILS
   * =========================
   */

  const toMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const toTimeString = (minutes) => {
    const h = Math.floor(minutes / 60).toString().padStart(2, "0");
    const m = (minutes % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  /**
   * =========================
   * MAIN GENERATOR
   * =========================
   */
  const generateSchedule = (config = {}) => {
    const finalConfig = {
      ...DEFAULT_CONFIG,
      ...MODES[config.mode || DEFAULT_CONFIG.mode],
      ...config
    };

    let currentTime = toMinutes(finalConfig.startTime);
    const schedule = [];
    let jpCounter = 1;

    for (let i = 1; i <= finalConfig.totalJP; i++) {
      
      const start = currentTime;
      const end = currentTime + finalConfig.jpDuration;

      schedule.push({
        type: "JP",
        jp: jpCounter,
        start: toTimeString(start),
        end: toTimeString(end),
        duration: finalConfig.jpDuration,
        meta: {
          mode: finalConfig.mode
        }
      });

      currentTime = end;
      jpCounter++;

      // cek apakah ada break setelah JP ini
      const breakItem = finalConfig.breaks.find(b => b.afterJP === i);

      if (breakItem && breakItem.duration > 0) {
        const breakStart = currentTime;
        const breakEnd = currentTime + breakItem.duration;

        schedule.push({
          type: "BREAK",
          name: breakItem.name,
          start: toTimeString(breakStart),
          end: toTimeString(breakEnd),
          duration: breakItem.duration,
          meta: {
            afterJP: i
          }
        });

        currentTime = breakEnd;
      }

      // 🔥 AUTO SKIP kalau duration = 0
    }

    return schedule;
  };

  /**
   * =========================
   * REAL-TIME DETECTOR
   * =========================
   */
  const getCurrentSession = (schedule, currentTimeStr) => {
    const now = toMinutes(currentTimeStr);

    return schedule.find(item => {
      const start = toMinutes(item.start);
      const end = toMinutes(item.end);
      return now >= start && now < end;
    }) || null;
  };

  /**
   * =========================
   * ML READY FEATURES
   * =========================
   */
  const extractFeatures = (schedule) => {
    return schedule.map(item => ({
      type: item.type,
      duration: item.duration,
      jp: item.jp || null,
      hourStart: parseInt(item.start.split(":")[0]),
      hourEnd: parseInt(item.end.split(":")[0])
    }));
  };

  /**
   * =========================
   * PUBLIC API
   * =========================
   */
  return {
    generateSchedule,
    getCurrentSession,
    extractFeatures,
    DEFAULT_CONFIG,
    MODES
  };

})();

export default ScheduleEngine;
