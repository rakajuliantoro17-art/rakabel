// Basic App
const scheduleContainer = document.getElementById("scheduleContainer");
const currentSessionEl = document.getElementById("currentSession");
const modeIndicator = document.getElementById("mode-indicator");
const statusEl = document.getElementById("status");

let mode = "normal";
let isBellEnabled = true;

// Example Schedule
let schedule = [
  {name: "JP 1", start: "07:00", end: "07:45"},
  {name: "JP 2", start: "07:50", end: "08:35"},
  {name: "JP 3", start: "08:40", end: "09:25"},
];

// Clock & Status
function updateClock(){
  const now = new Date();
  document.getElementById("clock").innerText = now.toLocaleTimeString();
  statusEl.innerText = navigator.onLine ? "Online" : "Offline";
}

// Render Schedule
function renderSchedule(){
  scheduleContainer.innerHTML = schedule.map(s => `
    <div class="card">${s.name}<br>${s.start} - ${s.end}</div>
  `).join("");
}

// Admin Panel
document.getElementById("gearBtn").onclick = () => {
  const panel = document.getElementById("adminPanel");
  panel.style.display = panel.style.display === "block" ? "none" : "block";
};

document.getElementById("applyMode").onclick = () => {
  mode = document.getElementById("modeSelect").value;
  modeIndicator.className = "mode-" + mode;
  modeIndicator.innerText = "MODE: " + mode.toUpperCase();
};

document.getElementById("toggleBell").onclick = () => {
  isBellEnabled = !isBellEnabled;
  alert("Bell " + (isBellEnabled ? "Enabled" : "Disabled"));
};

// Init
updateClock();
renderSchedule();
setInterval(updateClock, 1000);
