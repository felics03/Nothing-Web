// timer.js - dual-wheel duration picker and focused countdown view

const defaultMinutes = 25;
const maxMinutes = 60;
const wheelItemHeight = 56;
let selectedMinutes = defaultMinutes;
let selectedSeconds = 0;
let totalSeconds = selectedMinutes * 60 + selectedSeconds;
let remaining = totalSeconds;
let intervalId = null;
let completed = false;

const display = document.getElementById("timer-display");
const ring = document.getElementById("timer-ring");
const statusText = document.getElementById("timer-status-text");
const setupScreen = document.getElementById("timer-setup");
const runningScreen = document.getElementById("timer-running");
const startBtn = document.getElementById("start-btn");
const cancelBtn = document.getElementById("cancel-btn");
const pauseBtn = document.getElementById("pause-btn");
const minutesWheel = document.getElementById("minutes-wheel");
const secondsWheel = document.getElementById("seconds-wheel");

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function makeWheelOptions(wheel, count, selectedIndex, unit) {
  for (let value = 0; value < count; value += 1) {
    const option = document.createElement("div");
    option.className = "timer-wheel-option";
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", String(value === selectedIndex));
    option.setAttribute("aria-label", `${value} ${unit}`);
    option.dataset.value = String(value);
    option.dataset.unit = unit;
    option.textContent = String(value).padStart(2, "0");
    wheel.append(option);
  }
  wheel.scrollTop = selectedIndex * wheelItemHeight;
}

makeWheelOptions(minutesWheel, maxMinutes + 1, selectedMinutes, "minutes");
makeWheelOptions(secondsWheel, 60, selectedSeconds, "seconds");

function updatePickerSelection(wheel, value) {
  wheel.querySelectorAll(".timer-wheel-option").forEach((option) => {
    option.setAttribute("aria-selected", String(Number(option.dataset.value) === value));
  });
}

function updateDuration() {
  selectedMinutes = Math.min(maxMinutes, selectedMinutes);
  if (selectedMinutes === maxMinutes) {
    selectedSeconds = 0;
    secondsWheel.scrollTop = 0;
    updatePickerSelection(secondsWheel, selectedSeconds);
  }

  totalSeconds = selectedMinutes * 60 + selectedSeconds;
  remaining = totalSeconds;
  display.textContent = formatTime(remaining);
  startBtn.disabled = totalSeconds === 0;
}

function setWheelValue(wheel, value, maxValue, unit) {
  const boundedValue = Math.min(maxValue, Math.max(0, value));
  wheel.scrollTo({ top: boundedValue * wheelItemHeight, behavior: "smooth" });
  updatePickerSelection(wheel, boundedValue);

  if (wheel === minutesWheel) selectedMinutes = boundedValue;
  else selectedSeconds = boundedValue;
  updateDuration();
  wheel.setAttribute("aria-label", `${boundedValue} ${unit}`);
}

function connectWheel(wheel, maxValue, unit) {
  wheel.addEventListener("scroll", () => {
    if (intervalId !== null) return;

    const value = Math.min(maxValue, Math.max(0, Math.round(wheel.scrollTop / wheelItemHeight)));
    if (wheel === minutesWheel && value !== selectedMinutes) selectedMinutes = value;
    if (wheel === secondsWheel && value !== selectedSeconds) selectedSeconds = value;
    updatePickerSelection(wheel, value);
    updateDuration();
    wheel.setAttribute("aria-label", `${value} ${unit}`);
  });

  wheel.addEventListener("keydown", (event) => {
    let nextValue = Number(wheel.querySelector('[aria-selected="true"]')?.dataset.value || 0);
    if (event.key === "ArrowUp") nextValue -= 1;
    else if (event.key === "ArrowDown") nextValue += 1;
    else if (event.key === "PageUp") nextValue -= 10;
    else if (event.key === "PageDown") nextValue += 10;
    else if (event.key === "Home") nextValue = 0;
    else if (event.key === "End") nextValue = maxValue;
    else return;

    event.preventDefault();
    setWheelValue(wheel, nextValue, maxValue, unit);
  });
}

connectWheel(minutesWheel, maxMinutes, "minutes");
connectWheel(secondsWheel, 59, "seconds");
updateDuration();

function finishTimer() {
  clearInterval(intervalId);
  intervalId = null;
  completed = true;
  ring.style.setProperty("--progress", "100%");
  statusText.textContent = "Complete";
  pauseBtn.textContent = "Done";
  trackEvent("timer_complete", "timer");
}

function tick() {
  remaining = Math.max(0, remaining - 1);
  display.textContent = formatTime(remaining);
  const elapsedProgress = ((totalSeconds - remaining) / totalSeconds) * 100;
  ring.style.setProperty("--progress", `${elapsedProgress}%`);
  if (remaining === 0) finishTimer();
}

startBtn.addEventListener("click", () => {
  if (totalSeconds === 0) return;
  remaining = totalSeconds;
  completed = false;
  ring.style.setProperty("--progress", "0%");
  display.textContent = formatTime(remaining);
  statusText.textContent = "Focus time";
  pauseBtn.textContent = "Pause";
  setupScreen.hidden = true;
  runningScreen.hidden = false;
  intervalId = setInterval(tick, 1000);
  trackEvent("timer_start", "timer");
});

pauseBtn.addEventListener("click", () => {
  if (completed) {
    runningScreen.hidden = true;
    setupScreen.hidden = false;
    return;
  }

  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
    pauseBtn.textContent = "Resume";
    statusText.textContent = "Paused";
  } else {
    intervalId = setInterval(tick, 1000);
    pauseBtn.textContent = "Pause";
    statusText.textContent = "Focus time";
  }
});

cancelBtn.addEventListener("click", () => {
  clearInterval(intervalId);
  intervalId = null;
  completed = false;
  remaining = totalSeconds;
  display.textContent = formatTime(remaining);
  runningScreen.hidden = true;
  setupScreen.hidden = false;
});
