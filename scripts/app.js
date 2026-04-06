const gearBtn = document.getElementById("gearBtn");
const adminPanel = document.getElementById("adminPanel");

gearBtn.addEventListener("click", () => {
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
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 18px;
  padding: 10px;
}
.card {
  position: relative;
  overflow: hidden;

  padding: 20px;
  border-radius: 22px;

  background: rgba(255,255,255,0.08);

  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  border: 1px solid rgba(255,255,255,0.10);

  box-shadow:
    0 8px 24px rgba(0,0,0,0.12),
    inset 0 1px 0 rgba(255,255,255,0.06);

  transition: all 0.25s ease;
}
.card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;

  background: linear-gradient(
    135deg,
    rgba(255,255,255,0.12),
    rgba(255,255,255,0.02)
  );

  pointer-events: none;
}
.card:hover {
  transform: translateY(-4px) scale(1.015);
}
