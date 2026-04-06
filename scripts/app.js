// app.js
import ScheduleEngine from "../data/schedule.js";
import clock from "./clock.js"; // pastikan path sesuai

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
}

/**
 * =========================
 * COUNTDOWN ⏳
 * =========================
 */
function updateCountdown() {
  const el = document.getElementById("countdown");

  if (!App.currentSession) {
    el.innerText = "--:--";
    return;
  }

  const now = clock.currentTime;
  const end = App.currentSession.end.split(":").map(Number);
  const endMinutes = end[0] * 60 + end[1];

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const diff = (endMinutes - currentMinutes) * 60 - now.getSeconds();

  const min = Math.floor(diff / 60).toString().padStart(2, "0");
  const sec = (diff % 60).toString().padStart(2, "0");

  el.innerText = `${min}:${sec}`;
}

/**
 * =========================
 * PROGRESS BAR 📊
 */
function updateProgress() {
  const bar = document.getElementById("progressBar");

  if (!App.currentSession) {
    bar.style.width = "0%";
    return;
  }

  const now = clock.currentTime;
  const start = App.currentSession.start.split(":").map(Number);
  const end = App.currentSession.end.split(":").map(Number);

  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const progress = ((currentMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
  bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
}

/**
 * =========================
 * UI RENDER
 */
function renderSchedule() {
  const container = document.getElementById("scheduleContainer");

  container.innerHTML = App.schedule
    .map((item) => {
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
}

/**
 * =========================
 * LOGGING (LOCAL)
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
 */
function initAdminPanel() {
  const gear = document.getElementById("gearBtn");
  const panel = document.getElementById("adminPanel");

  gear.addEventListener("click", () => {
    panel.classList.toggle("open");
  });

  document.getElementById("toggleBell").onclick = () => {
    App.isBellEnabled = !App.isBellEnabled;
  };
}

/**
 * =========================
 * ONLINE / OFFLINE
 */
function updateConnection() {
  const el = document.getElementById("status");

  el.innerText = navigator.onLine ? "Online" : "Offline";
  el.classList.toggle("offline", !navigator.onLine);
}

/**
 * =========================
 * INIT
 */
function start() {
  loadConfig();
  initSchedule();
  initAdminPanel();
  updateConnection();

  // Clock realtime listener
  clock.onTick(() => {
    updateSession();
    renderCurrent();
    renderSchedule();
    updateCountdown();
    updateProgress();
    updateClock();
  });

  clock.start(); // mulai realtime clock

  window.addEventListener("online", updateConnection);
  window.addEventListener("offline", updateConnection);
}

document.addEventListener("DOMContentLoaded", start);
import NormalMode from "./modes/normal.js";

// Inisialisasi mode normal
NormalMode.init(App.config, (session) => {
  App.currentSession = session;
  if (session) playBell();
  renderCurrent();
  renderSchedule();
  updateCountdown();
  updateProgress();
});
import ExamMode from "./modes/exam.js";

// Contoh inisialisasi mode ujian
ExamMode.init(App.config, (session) => {
  App.currentSession = session;
  if (session) playBell();
  renderCurrent();
  renderSchedule();
  updateCountdown();
  updateProgress();
});
import HybridMode from "./modes/hybrid.js";

// Contoh sesi tambahan (ekstrakurikuler / bel siang)
const extraSessions = [
  { start: "15:00", end: "16:00", name: "Ekstrakurikuler", type: "EXTRA" },
];

// Inisialisasi hybrid mode
HybridMode.init(App.config, extraSessions, (session) => {
  App.currentSession = session;
  if (session) playBell();
  renderCurrent();
  renderSchedule();
  updateCountdown();
  updateProgress();
});
import CustomMode from "./modes/custom.js";

// Contoh jadwal custom hari ini
const todayCustomSchedule = [
  { start: "07:00", end: "07:45", name: "JP 1", type: "JP", jp: 1 },
  { start: "07:45", end: "08:30", name: "JP 2", type: "JP", jp: 2 },
  { start: "08:30", end: "08:45", name: "Istirahat Pagi", type: "BREAK" },
  { start: "08:45", end: "09:30", name: "JP 3", type: "JP", jp: 3 },
  { start: "09:30", end: "10:15", name: "JP 4", type: "JP", jp: 4 },
  { start: "10:15", end: "11:00", name: "Ekstra Kreatif", type: "EXTRA" },
];

// Inisialisasi custom mode
CustomMode.init(todayCustomSchedule, (session) => {
  App.currentSession = session;
  if (session) playBell();
  renderCurrent();
  renderSchedule();
  updateCountdown();
  updateProgress();
});
import ModeHelper from "./modes/helper.js";

// Pilih mode normal
ModeHelper.switchMode("normal", { config: App.config });

// Pilih mode exam
// ModeHelper.switchMode("exam", { config: App.config });

// Pilih mode hybrid dengan sesi tambahan
// ModeHelper.switchMode("hybrid", { config: App.config, extraSessions: [{ start: "15:00", end: "16:00", name: "Ekstrakurikuler", type: "EXTRA" }] });

// Pilih mode custom
// ModeHelper.switchMode("custom", { customSchedule: todayCustomSchedule });
import TimeUtils from "./time.js";

// Hitung sisa detik untuk countdown
const diffSeconds = TimeUtils.secondsUntil(App.currentSession.end, clock.currentTime);

// Update countdown UI
document.getElementById("countdown").innerText = TimeUtils.formatCountdown(diffSeconds);

// Konversi "HH:MM" ke menit total
const jpStart = TimeUtils.toMinutes("07:00");

// Konversi menit total ke string
const timeStr = TimeUtils.fromMinutes(435); // "07:15"
