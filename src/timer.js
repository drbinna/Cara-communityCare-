/**
 * Call duration timer
 */

let startTime = null;
let interval = null;
let timerEl = null;

export function startTimer() {
  timerEl = document.getElementById('callTimer');
  startTime = Date.now();
  update();
  interval = setInterval(update, 1000);
}

export function stopTimer() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}

export function getElapsed() {
  if (!startTime) return '00:00';
  return format(Date.now() - startTime);
}

export function resetTimer() {
  stopTimer();
  startTime = null;
  if (timerEl) {
    timerEl.innerHTML = '<span class="timer__dot"></span>00:00';
  }
}

function update() {
  if (!timerEl || !startTime) return;
  const elapsed = format(Date.now() - startTime);
  timerEl.innerHTML = `<span class="timer__dot"></span>${elapsed}`;
}

function format(ms) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60).toString().padStart(2, '0');
  const sec = (totalSec % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}
