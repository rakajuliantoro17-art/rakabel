// helper.js
/**
 * Helper Mode Switcher
 * Bisa pilih mode: Normal / Exam / Hybrid / Custom
 */

import NormalMode from "./normal.js";
import ExamMode from "./exam.js";
import HybridMode from "./hybrid.js";
import CustomMode from "./custom.js";
import { App, playBell, renderCurrent, renderSchedule, updateCountdown, updateProgress } from "../app.js";

const ModeHelper = {
  currentMode: null,

  /**
   * Switch mode
   * @param {string} modeName - "normal" | "exam" | "hybrid" | "custom"
   * @param {object} options - config / extraSessions / customSchedule
   */
  switchMode(modeName, options = {}) {
    switch (modeName.toLowerCase()) {
      case "normal":
        this.currentMode = NormalMode;
        NormalMode.init(options.config || App.config, this.onSessionChange);
        break;

      case "exam":
        this.currentMode = ExamMode;
        ExamMode.init(options.config || App.config, this.onSessionChange);
        break;

      case "hybrid":
        this.currentMode = HybridMode;
        HybridMode.init(
          options.config || App.config,
          options.extraSessions || [],
          this.onSessionChange
        );
        break;

      case "custom":
        this.currentMode = CustomMode;
        CustomMode.init(options.customSchedule || [], this.onSessionChange);
        break;

      default:
        console.warn("Mode tidak dikenali:", modeName);
    }
  },

  /**
   * Callback tiap pergantian session
   */
  onSessionChange(session) {
    App.currentSession = session;
    if (session) playBell();
    renderCurrent();
    renderSchedule();
    updateCountdown();
    updateProgress();
  },

  /**
   * Dapatkan schedule dari mode aktif
   */
  getSchedule() {
    return this.currentMode ? this.currentMode.getSchedule() : [];
  },

  /**
   * Dapatkan session aktif dari mode aktif
   */
  getCurrentSession() {
    return this.currentMode ? this.currentMode.getCurrentSession() : null;
  }
};

export default ModeHelper;
