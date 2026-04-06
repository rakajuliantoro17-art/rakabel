// app.js (MERGE LENGKAP ADVANCED)
import ScheduleEngine from "../data/schedule.js";
import clock from "./clock.js"; // realtime clock
import TimeUtils from "./time.js";
import NormalMode from "./modes/normal.js";
import ExamMode from "./modes/exam.js";
import HybridMode from "./modes/hybrid.js";
import CustomMode from "./modes/custom.js";
import ModeHelper from "./modes/helper.js";

/**
 * =========================
 * GLOBAL STATE
 * =========================
 */
const App = {
  schedule: [],
  currentSession: null,
  config: null,
  isBellEnabled: true,
  lastBellKey: null
};

/**
 * =========================
 * CONFIG LOADER (OFFLINE FIRST)
 * =========================
 */
const loadConfig = () => {
  const saved = localStorage.getItem("schedule_config");
  if (saved) {
    App.config = JSON.parse(saved);
  } else {
    App.config = {
      mode: "custom",
      startTime: "07:00",
      jpDuration: 45,
      totalJP: 10,
      breaks: [
        { afterJP: 4, duration: 15, name: "Istirahat 1" },
        { afterJP: 6, duration: 0, name: "Istirahat 2" }
      ]
    };
    localStorage.setItem("schedule_config", JSON.stringify(App.config));
  }
};

/**
 * =========================
 * INIT SCHEDULE
 * =========================
 */
const initSchedule = () => {
  App.schedule = ScheduleEngine.generateSchedule(App.config);
};

/**
 * =========================
 * AUDIO BELL 🔔
 * =========================
 */
const bell = new Audio("/assets/sounds/bell.mp3");
const playBell = () => {
  if (!App.isBellEnabled) return;
  bell.currentTime = 0;
  bell.play().catch(() => {});
};

/**
 * =========================
 * CLOCK UI
 * =========================
 */
const updateClock = () => {
  const el = document.getElementById("clock");
  el.innerText = clock.currentTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
};

/**
 * =========================
 * CURRENT SESSION UI
 * =========================
 */
const renderCurrent = () => {
  const el = document.getElementById("currentSession");

  if (!App.currentSession) {
    el.innerHTML = `<div class="glass-main">Belum mulai</div>`;
    return;
  }

  const s = App.currentSession;
  el.innerHTML = `
    <div class="glass-main">
      <div class="big">
        ${s.type === "JP" ? `JP ${s.jp}` : s.name}
      </div>
      <div class="time">${s.start} - ${s.end}</div>
      <div id="countdown" class="countdown"></div>
      <div class="progress">
        <div id="progressBar"></div>
      </div>
    </div>
  `;
};

/**
 * =========================
 * SCHEDULE UI
 * =========================
 */
const renderSchedule = () => {
  const container = document.getElementById("scheduleContainer");

  container.innerHTML = App.schedule
    .map(item => {
      const active =
        App.currentSession &&
        item.start === App.currentSession.start;

      return `
      <div class="glass-card ${active ? "active" : ""}">
        <div class="title">
          ${item.type === "JP" ? `JP ${item.jp}` : item.name}
        </div>
        <div class="time">${item.start} - ${item.end}</div>
      </div>
      `;
    })
    .join("");
};

/**
 * =========================
 * SESSION DETECTION
 * =========================
 */
const updateSession = () => {
  const nowStr = clock.currentTime.toTimeString().slice(0, 5);
  const session = ScheduleEngine.getCurrentSession(App.schedule, nowStr);

  if (session) {
    const key = session.start + session.end;

    if (App.lastBellKey !== key) {
      playBell();
      logEvent("BELL", session);
      App.lastBellKey = key;
    }
  }

  App.currentSession = session;
};

/**
 * =========================
 * COUNTDOWN ⏳ (pakai TimeUtils)
 * =========================
 */
const updateCountdown = () => {
  const el = document.getElementById("countdown");

  if (!App.currentSession) {
    el.innerText = "--:--";
    return;
  }

  const secondsLeft = TimeUtils.secondsUntil(App.currentSession.end, clock.currentTime);
  el.innerText = TimeUtils.formatCountdown(secondsLeft);
};

/**
 * =========================
 * PROGRESS BAR 📊
 * =========================
 */
const updateProgress = () => {
  const bar = document.getElementById("progressBar");

  if (!App.currentSession) {
    bar.style.width = "0%";
    return;
  }

  const now = clock.currentTime;
  const startMinutes = TimeUtils.toMinutes(App.currentSession.start);
  const endMinutes = TimeUtils.toMinutes(App.currentSession.end);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const progress = ((currentMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
  bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
};

/**
 * =========================
 * LOGGING
 * =========================
 */
const logEvent = (type, session) => {
  const logs = JSON.parse(localStorage.getItem("logs") || "[]");
  logs.push({
    time: new Date().toISOString(),
    type,
    session
  });
  localStorage.setItem("logs", JSON.stringify(logs));
};

/**
 * =========================
 * ADMIN PANEL ⚙️
 */
const initAdminPanel = () => {
  const btn = document.getElementById("gearBtn");
  const panel = document.getElementById("adminPanel");

  btn.addEventListener("click", () => panel.classList.toggle("open"));
  document.getElementById("toggleBell").addEventListener("click", () => {
    App.isBellEnabled = !App.isBellEnabled;
  });
};

/**
 * =========================
 * OFFLINE STATUS
 */
const updateConnectionStatus = () => {
  const el = document.getElementById("status");
  if (navigator.onLine) {
    el.innerText = "Online";
    el.classList.remove("offline");
  } else {
    el.innerText = "Offline";
    el.classList.add("offline");
  }
};

/**
 * =========================
 * MAIN LOOP
 */
const loop = () => {
  updateClock();
  updateSession();
  renderCurrent();
  renderSchedule();
  updateCountdown();
  updateProgress();
};

/**
 * =========================
 * START APP
 */
const startApp = () => {
  loadConfig();
  initSchedule();
  initAdminPanel();
  updateConnectionStatus();

  // realtime loop via clock.js
  clock.onTick(loop);
  clock.start();

  window.addEventListener("online", updateConnectionStatus);
  window.addEventListener("offline", updateConnectionStatus);

  // ======== INIT MODES ========
  NormalMode.init(App.config, (session) => {
    App.currentSession = session;
    if (session) playBell();
    renderCurrent();
    renderSchedule();
    updateCountdown();
    updateProgress();
  });

  ExamMode.init(App.config, (session) => {
    App.currentSession = session;
    if (session) playBell();
    renderCurrent();
    renderSchedule();
    updateCountdown();
    updateProgress();
  });

  const extraSessions = [
    { start: "15:00", end: "16:00", name: "Ekstrakurikuler", type: "EXTRA" }
  ];
  HybridMode.init(App.config, extraSessions, (session) => {
    App.currentSession = session;
    if (session) playBell();
    renderCurrent();
    renderSchedule();
    updateCountdown();
    updateProgress();
  });

  const todayCustomSchedule = [
    { start: "07:00", end: "07:45", name: "JP 1", type: "JP", jp: 1 },
    { start: "07:45", end: "08:30", name: "JP 2", type: "JP", jp: 2 },
    { start: "08:30", end: "08:45", name: "Istirahat Pagi", type: "BREAK" },
    { start: "08:45", end: "09:30", name: "JP 3", type: "JP", jp: 3 },
    { start: "09:30", end: "10:15", name: "JP 4", type: "JP", jp: 4 },
    { start: "10:15", end: "11:00", name: "Ekstra Kreatif", type: "EXTRA" }
  ];
  CustomMode.init(todayCustomSchedule, (session) => {
    App.currentSession = session;
    if (session) playBell();
    renderCurrent();
    renderSchedule();
    updateCountdown();
    updateProgress();
  });
};

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", startApp);
import normalSchedule from "../config/normal.json";
import examSchedule from "../config/exam.json";
import hybridSchedule from "../config/hybrid.json";
ModeHelper.switchMode("normal", { customSchedule: normalSchedule });
ModeHelper.switchMode("exam", { customSchedule: examSchedule });
ModeHelper.switchMode("hybrid", { customSchedule: hybridSchedule });
import defaultConfig from "./config/default.js";
import { todayCustomSchedule } from "./config/customSchedule.js";
import { examSchedule } from "./config/examSchedule.js";
import { hybridExtraSessions } from "./config/hybridExtra.js";
