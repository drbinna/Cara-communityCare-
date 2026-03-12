/**
 * Retell Web Client — manages the voice call lifecycle
 *
 * Replaces the raw WebSocket manager with the official Retell Client SDK.
 * The SDK handles audio streaming, VAD, and agent communication internally.
 */

import { RetellWebClient } from 'retell-client-js-sdk';

const API_BASE = import.meta.env.VITE_API_BASE || '';

class RetellManager extends EventTarget {
  constructor() {
    super();
    this.client = new RetellWebClient();
    this._active = false;

    // ── SDK event bindings ──

    this.client.on('call_started', () => {
      this._active = true;
      this._dispatch('status', { status: 'connected' });
    });

    this.client.on('call_ended', () => {
      this._active = false;
      this._dispatch('status', { status: 'disconnected' });
      this._dispatch('message', { type: 'end' });
    });

    this.client.on('agent_start_talking', () => {
      this._dispatch('message', { type: 'speaker', sender: 'cara' });
    });

    this.client.on('agent_stop_talking', () => {
      this._dispatch('message', { type: 'speaker', sender: 'user' });
    });

    this.client.on('update', (update) => {
      // Retell sends transcript updates here
      if (update.transcript) {
        for (const entry of update.transcript) {
          this._dispatch('message', {
            type: 'transcript',
            sender: entry.role === 'agent' ? 'cara' : 'user',
            content: entry.content,
          });
        }
      }
    });

    this.client.on('error', (err) => {
      console.error('Retell client error:', err);
      this._dispatch('status', {
        status: 'error',
        message: 'Connection error. Please try again.',
      });
    });
  }

  /** Start a new Retell web call */
  async connect() {
    this._dispatch('status', { status: 'connecting' });

    try {
      // 1. Ask our backend to create a web call → access_token
      const res = await fetch(`${API_BASE}/api/create-web-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server returned ${res.status}`);
      }

      const { access_token } = await res.json();

      // 2. Start the Retell call with the access token
      await this.client.startCall({ accessToken: access_token });
    } catch (err) {
      console.error('connect() error:', err);
      this._dispatch('status', {
        status: 'error',
        message: err.message || 'Unable to start the call.',
      });
    }
  }

  /** End the current call */
  disconnect() {
    if (this._active) {
      this.client.stopCall();
    }
    this._active = false;
  }

  /** Toggle microphone mute via the SDK */
  toggleMute() {
    // The Retell SDK exposes mute/unmute on the client
    if (this.client.isMuted) {
      this.client.unmute();
    } else {
      this.client.mute();
    }
    return this.client.isMuted;
  }

  get isActive() {
    return this._active;
  }

  // ── Helpers ──

  _dispatch(name, detail) {
    this.dispatchEvent(new CustomEvent(name, { detail }));
  }
}

export const wsManager = new RetellManager();
