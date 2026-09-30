// CatShu countdown
const target = new Date("2026-10-07T12:00:00Z").getTime();

function updateCountdown() {
  const diff = Math.max(0, target - Date.now());

  const values = {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000)
  };

  Object.entries(values).forEach(([key, value]) => {
    const el = document.querySelector(`[data-count="${key}"]`);
    if (el) {
      el.textContent = String(value).padStart(2, "0");
    }
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);
