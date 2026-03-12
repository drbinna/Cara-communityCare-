/**
 * Cara Voice Receptionist — Main Application
 * State machine: idle → active → postCall
 *
 * Audio is fully managed by the Retell Web Client SDK.
 */

import './style.css';
import { wsManager } from './websocket.js';
import { addMessage, clearTranscript } from './transcript.js';
import { startTimer, stopTimer, getElapsed, resetTimer } from './timer.js';
import { initOrb, destroyOrb, setOrbAmplitude, setOrbSpeaker } from './waveform.js';

// ── DOM References ──
const stateIdle     = document.getElementById('stateIdle');
const stateActive   = document.getElementById('stateActive');
const statePostCall = document.getElementById('statePostCall');
const errorOverlay  = document.getElementById('errorOverlay');
const btnCall       = document.getElementById('btnCall');
const btnEndCall    = document.getElementById('btnEndCall');
const btnMute       = document.getElementById('btnMute');
const btnCallAgain  = document.getElementById('btnCallAgain');
const btnRetry      = document.getElementById('btnRetry');
const btnVolume     = document.getElementById('btnVolume');
const statusDot     = document.getElementById('statusDot');
const statusText    = document.getElementById('statusText');
const speakerLabel  = document.getElementById('speakerLabel');
const callSummary   = document.getElementById('callSummary');
const errorMessage  = document.getElementById('errorMessage');

// ── State ──
let currentState = 'idle'; // 'idle' | 'active' | 'postCall'
let agentSpeaking = false;

// ── State Transitions ──
function setState(newState) {
  currentState = newState;
  stateIdle.classList.toggle('hidden', newState !== 'idle');
  stateActive.classList.toggle('hidden', newState !== 'active');
  statePostCall.classList.toggle('hidden', newState !== 'postCall');
}

// ── Call Flow ──
async function startCall() {
  // Reset
  clearTranscript();
  resetTimer();
  hideError();

  // Switch to active state
  setState('active');
  initOrb();
  setOrbSpeaker('idle');
  speakerLabel.textContent = 'Connecting…';
  speakerLabel.removeAttribute('data-speaker');

  // Connect via Retell SDK (handles mic permission + audio internally)
  wsManager.connect();
  startTimer();
}

function endCall() {
  const elapsed = getElapsed();

  // Cleanup
  wsManager.disconnect();
  stopTimer();
  destroyOrb();

  // Show post-call
  callSummary.textContent = `Call duration: ${elapsed}`;
  setState('postCall');
}

// ── Speaker Indicator ──
function setSpeaker(who) {
  agentSpeaking = who === 'cara';
  speakerLabel.textContent = who === 'cara' ? 'Cara is speaking' : 'Listening…';
  speakerLabel.setAttribute('data-speaker', who);
  setOrbSpeaker(who);
}

// ── Error Handling ──
function showError(msg) {
  errorMessage.textContent = msg;
  errorOverlay.classList.remove('hidden');
}

function hideError() {
  errorOverlay.classList.add('hidden');
}

// ── Event Bindings ──
btnCall.addEventListener('click', startCall);

btnEndCall.addEventListener('click', endCall);

btnCallAgain.addEventListener('click', () => {
  setState('idle');
});

btnMute.addEventListener('click', () => {
  const muted = wsManager.toggleMute();
  btnMute.setAttribute('aria-pressed', muted.toString());
  btnMute.querySelector('.ctrl-btn__label').textContent = muted ? 'Unmute' : 'Mute';
});

btnVolume.addEventListener('click', () => {
  const pressed = btnVolume.getAttribute('aria-pressed') === 'true';
  btnVolume.setAttribute('aria-pressed', (!pressed).toString());
});

btnRetry.addEventListener('click', () => {
  hideError();
  if (currentState === 'active') {
    wsManager.connect();
  } else {
    startCall();
  }
});

// ── WebSocket Events ──
wsManager.addEventListener('status', (e) => {
  const { status, message } = e.detail;

  switch (status) {
    case 'connecting':
      statusDot.className = 'status-dot status-dot--connecting';
      statusText.textContent = 'Connecting…';
      break;
    case 'connected':
      statusDot.className = 'status-dot status-dot--online';
      statusText.textContent = 'Connected';
      setSpeaker('cara');
      break;
    case 'reconnecting':
      statusDot.className = 'status-dot status-dot--connecting';
      statusText.textContent = `Reconnecting… (${message})`;
      break;
    case 'disconnected':
      statusDot.className = 'status-dot status-dot--offline';
      statusText.textContent = 'Offline';
      break;
    case 'error':
      statusDot.className = 'status-dot status-dot--error';
      statusText.textContent = 'Error';
      if (currentState === 'active') {
        showError(message || 'Connection lost. Please try again.');
      }
      break;
  }
});

wsManager.addEventListener('message', (e) => {
  const data = e.detail;

  // ── Transcript updates from Retell SDK ──
  if (data.type === 'transcript') {
    const sender = data.sender || 'cara';
    const text = data.content || '';
    if (text) {
      // Clear previous transcript and re-render full history
      clearTranscript();
      addMessage(sender, text);
    }
  }

  // ── Speaker indicator updates ──
  if (data.type === 'speaker') {
    setSpeaker(data.sender);
    setOrbAmplitude(data.sender === 'cara' ? 0.7 : 0.3);
  }

  // ── Call ended ──
  if (data.type === 'end') {
    endCall();
  }
});

// ── Keyboard Shortcuts ──
document.addEventListener('keydown', (e) => {
  if (currentState === 'active') {
    if (e.key === 'm' || e.key === 'M') {
      btnMute.click();
    }
    if (e.key === 'Escape') {
      btnEndCall.click();
    }
  }
  if (currentState === 'idle' && (e.key === 'Enter' || e.key === ' ')) {
    if (document.activeElement === btnCall) return; // avoid double-fire
    btnCall.click();
  }
});

// ── Init ──
setState('idle');
