/**
 * Transcript panel — renders timestamped messages
 */

const messagesEl = () => document.getElementById('transcriptMessages');
const panelEl = () => document.getElementById('transcriptPanel');

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function addMessage(sender, text) {
  const container = messagesEl();
  if (!container) return;

  const isAgent = sender === 'cara';
  const msg = document.createElement('div');
  msg.className = `transcript__msg transcript__msg--${isAgent ? 'agent' : 'user'}`;

  msg.innerHTML = `
    <div class="transcript__meta">
      <span>${isAgent ? 'Cara' : 'You'}</span>
      <span>${formatTime(new Date())}</span>
    </div>
    <div class="transcript__bubble">${escapeHtml(text)}</div>
  `;

  container.appendChild(msg);
  scrollToBottom();
}

export function clearTranscript() {
  const container = messagesEl();
  if (container) container.innerHTML = '';
}

function scrollToBottom() {
  const panel = panelEl();
  if (panel) {
    requestAnimationFrame(() => {
      panel.scrollTop = panel.scrollHeight;
    });
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
