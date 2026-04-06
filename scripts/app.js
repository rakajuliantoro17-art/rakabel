import ScheduleEngine from "../data/schedule.js";

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
 * TIME UTILS
 * =========================
 */
function getNow() {
  return new Date();
}

function toMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function getNowString() {
  return getNow().toTimeString().slice(0, 5);
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
 * CLOCK
 * =========================
 */
function updateClock() {
  const el = document.getElementById("clock");

  el.innerText = getNow().toLocaleTimeString("id-ID", {
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
  const nowStr = getNowString();
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

  const now = getNow();
  const end = toMinutes(App.currentSession.end);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const diff = (end - currentMinutes) * 60 - now.getSeconds();

  const min = Math.floor(diff / 60).toString().padStart(2, "0");
  const sec = (diff % 60).toString().padStart(2, "0");

  el.innerText = `${min}:${sec}`;
}

/**
 * =========================
 * PROGRESS BAR 📊
 * =========================
 */
function updateProgress() {
  const bar = document.getElementById("progressBar");

  if (!App.currentSession) {
    bar.style.width = "0%";
    return;
  }

  const now = getNow();
  const start = toMinutes(App.currentSession.start);
  const end = toMinutes(App.currentSession.end);

  const current = now.getHours() * 60 + now.getMinutes();

  const progress = ((current - start) / (end - start)) * 100;

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

  setInterval(loop, 1000);

  window.addEventListener("online", updateConnection);
  window.addEventListener("offline", updateConnection);
}

document.addEventListener("DOMContentLoaded", start);
