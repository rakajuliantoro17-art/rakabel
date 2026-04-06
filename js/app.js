import ScheduleEngine from "../data/schedule.js";

/**
 * =========================
 * APP STATE
 * =========================
 */
const App = {
  schedule: [],
  currentSession: null,
  config: null,
  isBellEnabled: true,
  lastBell: null
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
 * TIME UTILS
 * =========================
 */
const getNowTimeString = () => {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
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
 * UI RENDER (GLASS iOS STYLE)
 * =========================
 */
const renderSchedule = () => {
  const container = document.getElementById("scheduleContainer");

  container.innerHTML = App.schedule.map(item => {
    const isActive =
      App.currentSession &&
      item.start === App.currentSession.start &&
      item.end === App.currentSession.end;

    return `
      <div class="glass-card ${isActive ? "active" : ""}">
        <div class="title">
          ${item.type === "JP" ? `JP ${item.jp}` : item.name}
        </div>
        <div class="time">${item.start} - ${item.end}</div>
      </div>
    `;
  }).join("");
};

/**
 * =========================
 * UPDATE CURRENT SESSION
 * =========================
 */
const updateSession = () => {
  const now = getNowTimeString();

  const session = ScheduleEngine.getCurrentSession(App.schedule, now);

  // 🔥 Trigger bell saat pindah sesi
  if (session && (!App.currentSession || session.start !== App.currentSession.start)) {
    if (App.lastBell !== session.start) {
      playBell();
      App.lastBell = session.start;

      logEvent("BELL", session);
    }
  }

  App.currentSession = session;

  updateCurrentUI();
};

/**
 * =========================
 * CURRENT SESSION UI
 * =========================
 */
const updateCurrentUI = () => {
  const el = document.getElementById("currentSession");

  if (!App.currentSession) {
    el.innerHTML = `<div class="glass-main">Belum mulai</div>`;
    return;
  }

  const item = App.currentSession;

  el.innerHTML = `
    <div class="glass-main">
      <div class="big">
        ${item.type === "JP" ? `JP ${item.jp}` : item.name}
      </div>
      <div class="time">${item.start} - ${item.end}</div>
    </div>
  `;
};

/**
 * =========================
 * CLOCK UI
 * =========================
 */
const updateClock = () => {
  const el = document.getElementById("clock");
  const now = new Date();

  el.innerText = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
};

/**
 * =========================
 * LOGGING (LOCAL FIRST)
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
 * ADMIN PANEL (FLOATING ⚙️)
 * =========================
 */
const initAdminPanel = () => {
  const btn = document.getElementById("gearBtn");
  const panel = document.getElementById("adminPanel");

  btn.addEventListener("click", () => {
    panel.classList.toggle("open");
  });

  // toggle bell
  document.getElementById("toggleBell").addEventListener("click", () => {
    App.isBellEnabled = !App.isBellEnabled;
  });
};

/**
 * =========================
 * OFFLINE MODE INDICATOR
 * =========================
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
 * =========================
 */
const startApp = () => {
  loadConfig();
  initSchedule();
  renderSchedule();
  initAdminPanel();

  updateConnectionStatus();

  setInterval(() => {
    updateClock();
    updateSession();
  }, 1000);

  window.addEventListener("online", updateConnectionStatus);
  window.addEventListener("offline", updateConnectionStatus);
};

/**
 * =========================
 * INIT
 * =========================
 */
document.addEventListener("DOMContentLoaded", startApp);
