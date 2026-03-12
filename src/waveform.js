/**
 * Animated orb on <canvas> — visual indicator for speaking/listening/idle
 * Draws concentric pulsing rings around the center avatar
 */

let canvas = null;
let ctx = null;
let animFrame = null;
let phase = 0;
let targetAmplitude = 0;
let currentAmplitude = 0;
let speakerMode = 'idle'; // 'idle' | 'cara' | 'user'

const RING_COUNT = 5;
const BASE_RADIUS = 56;
const MAX_RING_RADIUS = 120;

export function initOrb() {
  canvas = document.getElementById('orbCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  draw();
}

export function destroyOrb() {
  if (animFrame) {
    cancelAnimationFrame(animFrame);
    animFrame = null;
  }
  window.removeEventListener('resize', resizeCanvas);
}

export function setOrbAmplitude(value) {
  targetAmplitude = Math.min(1, Math.max(0, value));
}

export function setOrbSpeaker(mode) {
  speakerMode = mode; // 'idle' | 'cara' | 'user'
}

function resizeCanvas() {
  if (!canvas) return;
  const rect = canvas.parentElement.getBoundingClientRect();
  const size = Math.min(rect.width, rect.height);
  canvas.width = size * window.devicePixelRatio;
  canvas.height = size * window.devicePixelRatio;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}

function draw() {
  if (!ctx || !canvas) return;

  const w = canvas.width / window.devicePixelRatio;
  const h = canvas.height / window.devicePixelRatio;
  const cx = w / 2;
  const cy = h / 2;

  ctx.clearRect(0, 0, w, h);

  // Smooth amplitude
  currentAmplitude += (targetAmplitude - currentAmplitude) * 0.08;
  phase += 0.015;

  // Colors by mode
  let baseColor;
  if (speakerMode === 'cara') {
    baseColor = [0, 120, 180];    // teal
  } else if (speakerMode === 'user') {
    baseColor = [0, 168, 120];    // green
  } else {
    baseColor = [0, 120, 180];    // teal default
  }

  // Draw rings outward
  for (let i = RING_COUNT - 1; i >= 0; i--) {
    const t = i / RING_COUNT;
    const radiusBase = BASE_RADIUS + (MAX_RING_RADIUS - BASE_RADIUS) * t;

    // Wave displacement
    const wave = Math.sin(phase * 2 + i * 0.8) * 4 * (currentAmplitude + 0.15);
    const pulseScale = speakerMode === 'idle'
      ? 1 + Math.sin(phase + i * 0.5) * 0.03
      : 1 + currentAmplitude * 0.15 * Math.sin(phase * 3 + i * 0.7);

    const radius = (radiusBase + wave) * pulseScale;
    const alpha = (0.08 + currentAmplitude * 0.12) * (1 - t * 0.6);

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${alpha})`;
    ctx.lineWidth = 2 - t * 0.8;
    ctx.stroke();
  }

  // Inner glow
  const glowAlpha = 0.06 + currentAmplitude * 0.1;
  const gradient = ctx.createRadialGradient(cx, cy, BASE_RADIUS * 0.5, cx, cy, BASE_RADIUS * 1.4);
  gradient.addColorStop(0, `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${glowAlpha})`);
  gradient.addColorStop(1, `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, 0)`);
  ctx.beginPath();
  ctx.arc(cx, cy, BASE_RADIUS * 1.4, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  animFrame = requestAnimationFrame(draw);
}
