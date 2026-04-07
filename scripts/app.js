const gearBtn = document.getElementById("gearBtn");
const adminPanel = document.getElementById("adminPanel");

gearBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  adminPanel.classList.toggle("show");
});

document.addEventListener("click", (e) => {
  if (
    !adminPanel.contains(e.target) &&
    !gearBtn.contains(e.target)
  ) {
    adminPanel.classList.remove("show");
  }
});
import clock from "./clock.js";

// ==========================
// GLOBAL STATE
// ==========================
const App = {
  schedule: [],
  currentSession: null,
  lastBellKey: null,
  isBellEnabled: true
};

// ==========================
// ELEMENT
// ==========================
const clockEl = document.getElementById("clock");
const scheduleEl = document.getElementById("scheduleContainer");
const currentEl = document.getElementById("currentSession");
const modeIndicator = document.getElementById("mode-indicator");

// ==========================
// SAMPLE SCHEDULE (NORMAL)
// ==========================
function generateSchedule() {
  let startHour = 7;
  let startMinute = 0;

  const result = [];

  for (let i = 1; i <= 8; i++) {
    const start = formatTime(startHour, startMinute);

    startMinute += 45;
    if (startMinute >= 60) {
      startHour++;
      startMinute -= 60;
    }

    const end = formatTime(startHour, startMinute);

    result.push({
      name: "JP " + i,
      start,
      end
    });
  }

  return result;
}

// ==========================
// UTIL
// ==========================
function formatTime(h, m) {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function getNowHHMM() {
  const now = new Date();
  return formatTime(now.getHours(), now.getMinutes());
}

// ==========================
// RENDER SCHEDULE
// ==========================
function renderSchedule() {
  scheduleEl.innerHTML = App.schedule.map(s => {
    const active =
      App.currentSession &&
      s.start === App.currentSession.start;

    return `
      <div class="card ${active ? "active" : ""}">
        <h3>${s.name}</h3>
        <p>${s.start} - ${s.end}</p>
      </div>
    `;
  }).join("");
}

// ==========================
// CURRENT SESSION DETECTION
// ==========================
function updateSession() {
  const now = getNowHHMM();

  const session = App.schedule.find(s => {
    return now >= s.start && now < s.end;
  });

  if (session) {
    const key = session.start + session.end;

    if (App.lastBellKey !== key) {
      playBell();
      App.lastBellKey = key;
    }
  }

  App.currentSession = session;
}

// ==========================
// RENDER CURRENT
// ==========================
function renderCurrent() {
  if (!App.currentSession) {
    currentEl.innerHTML = "Belum mulai";
    return;
  }

  const s = App.currentSession;

  currentEl.innerHTML = `
    <div class="card active">
      <h2>${s.name}</h2>
      <p>${s.start} - ${s.end}</p>
    </div>
  `;
}

// ==========================
// CLOCK UI
// ==========================
function updateClockUI() {
  clockEl.innerText = clock.currentTime.toLocaleTimeString("id-ID");
}

// ==========================
// BELL 🔔
// ==========================
const bell = new Audio("assets/sounds/bell.mp3");

function playBell() {
  if (!App.isBellEnabled) return;

  bell.currentTime = 0;
  bell.play().catch(() => {});
}

// ==========================
// MAIN LOOP
// ==========================
function loop() {
  updateClockUI();
  updateSession();
  renderCurrent();
  renderSchedule();
}

// ==========================
// INIT
// ==========================
function start() {
  App.schedule = generateSchedule();

  clock.onTick(loop);
  clock.start();
}

document.addEventListener("DOMContentLoaded", start);
