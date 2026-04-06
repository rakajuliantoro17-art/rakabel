// app.js
import ScheduleEngine from "../data/schedule.js";
import clock from "./clock.js";
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
 * CONFIG (OFFLINE FIRST)
 * =========================
 */
function loadConfig() {
  const saved = localStorage.getItem("schedule_config");

  App.config = saved
    ? JSON.parse(saved)
    : {
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

/**
 * =========================
 * INIT SCHEDULE
 * =========================
 */
function initSchedule() {
  App.schedule = ScheduleEngine.generateSchedule(App.config);
}

/**
 * =========================
 * AUDIO 🔔
 * =========================
 */
const bell = new Audio("/assets/sounds/bell.mp3");

function playBell() {
  if (!App.isBellEnabled) return;
  bell.currentTime = 0;
  bell.play().catch(() => {});
}

/**
 * =========================
 * CLOCK UI
 * =========================
 */
function updateClock() {
  const el = document.getElementById("clock");
  el.innerText = clock.currentTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

/**
 * =========================
 * SESSION DETECTION
 * =========================
 */
function updateSession() {
  const nowStr = TimeUtils.formatHHMM(clock.currentTime);
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
}

/**
 * =========================
 * COUNTDOWN ⏳ (Advanced)
 * =========================
 */
function updateCountdown() {
  const el = document.getElementById("countdown");

  if (!App.currentSession) {
    el.innerText = "--:--";
    return;
  }

  const secondsLeft = TimeUtils.secondsUntil(App.currentSession.end, clock.currentTime);
  el.innerText = TimeUtils.formatCountdown(secondsLeft);
}

/**
 * =========================
 * PROGRESS BAR 📊 (Advanced)
 * =========================
 */
function updateProgress() {
  const bar = document.getElementById("progressBar");

  if (!App.currentSession) {
    bar.style.width = "0%";
    return;
  }

  const nowMinutes = clock.currentTime.getHours() * 60 + clock.currentTime.getMinutes();
  const startMinutes = TimeUtils.toMinutes(App.currentSession.start);
  const endMinutes = TimeUtils.toMinutes(App.currentSession.end);

  const progress = ((nowMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
  bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
}

/**
 * =========================
 * UI RENDER
 * =========================
 */
function renderSchedule() {
  const container = document.getElementById("scheduleContainer");

  container.innerHTML = App.schedule
    .map((item) => {
      const active = App.currentSession && item.start === App.currentSession.start;
      return `
        <div class="glass-card ${active ? "active" : ""}">
          <div class="title">${item.type === "JP" ? `JP ${item.jp}` : item.name}</div>
          <div class="time">${item.start} - ${item.end}</div>
        </div>
      `;
    })
    .join("");
}

function renderCurrent() {
  const el = document.getElementById("currentSession");

  if (!App.currentSession) {
    el.innerHTML = `<div class="glass-main">Belum mulai</div>`;
    return;
  }

  const s = App.currentSession;

  el.innerHTML = `
    <div class="glass-main">
      <div class="big">${s.type === "JP" ? `JP ${s.jp}` : s.name}</div>
      <div class="time">${s.start} - ${s.end}</div>
      <div id="countdown" class="countdown"></div>
      <div class="progress">
        <div id="progressBar"></div>
      </div>
    </div>
  `;
}

/**
 * =========================
 * LOGGING (LOCAL)
 * =========================
 */
function logEvent(type, session) {
  const logs = JSON.parse(localStorage.getItem("logs") || "[]");

  logs.push({
    time: new Date().toISOString(),
    type,
    session
  });

  localStorage.setItem("logs", JSON.stringify(logs));
}

/**
 * =========================
 * ADMIN PANEL ⚙️
 * =========================
 */
function initAdminPanel() {
  const gear = document.getElementById("gearBtn");
  const panel = document.getElementById("adminPanel");

  gear.addEventListener("click", () => panel.classList.toggle("open"));
  document.getElementById("toggleBell").onclick = () => (App.isBellEnabled = !App.isBellEnabled);
}

/**
 * =========================
 * ONLINE / OFFLINE
 * =========================
 */
function updateConnection() {
  const el = document.getElementById("status");
  el.innerText = navigator.onLine ? "Online" : "Offline";
  el.classList.toggle("offline", !navigator.onLine);
}

/**
 * =========================
 * MAIN LOOP
 * =========================
 */
function loop() {
  updateClock();
  updateSession();
  renderCurrent();
  renderSchedule();
  updateCountdown();
  updateProgress();
}

/**
 * =========================
 * INIT
 * =========================
 */
function start() {
  loadConfig();
  initSchedule();
  initAdminPanel();
  updateConnection();

  // Clock realtime listener
  clock.onTick(loop);
  clock.start(); // mulai realtime clock

  window.addEventListener("online", updateConnection);
  window.addEventListener("offline", updateConnection);

  // Default mode normal
  ModeHelper.switchMode("normal", { config: App.config });
}

document.addEventListener("DOMContentLoaded", start);

// ===== Export App state untuk mode/helper
export { App, playBell, renderCurrent, renderSchedule, updateCountdown, updateProgress };
