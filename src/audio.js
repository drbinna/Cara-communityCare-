/**
 * Audio manager — microphone input + voice activity detection
 * Uses Web Speech API and Web Audio API AnalyserNode
 */

class AudioManager extends EventTarget {
  constructor() {
    super();
    this.stream = null;
    this.audioContext = null;
    this.analyser = null;
    this.isMuted = false;
    this._animFrame = null;
    this._dataArray = null;
  }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.stream);

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      source.connect(this.analyser);

      this._dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this._monitorVolume();

      this.dispatchEvent(new CustomEvent('started'));
      return true;
    } catch (err) {
      this.dispatchEvent(new CustomEvent('error', {
        detail: 'Microphone access was denied. Please allow microphone use to talk with Cara.'
      }));
      return false;
    }
  }

  stop() {
    if (this._animFrame) {
      cancelAnimationFrame(this._animFrame);
      this._animFrame = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
    this._dataArray = null;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.stream) {
      this.stream.getAudioTracks().forEach(t => { t.enabled = !this.isMuted; });
    }
    this.dispatchEvent(new CustomEvent('muteChanged', { detail: this.isMuted }));
    return this.isMuted;
  }

  /** Returns 0–1 normalized volume level */
  getVolume() {
    if (!this.analyser || !this._dataArray) return 0;
    this.analyser.getByteFrequencyData(this._dataArray);
    let sum = 0;
    for (let i = 0; i < this._dataArray.length; i++) {
      sum += this._dataArray[i];
    }
    return sum / (this._dataArray.length * 255);
  }

  _monitorVolume() {
    const check = () => {
      const vol = this.getVolume();
      const isSpeaking = vol > 0.08;
      this.dispatchEvent(new CustomEvent('volume', { detail: { volume: vol, isSpeaking } }));
      this._animFrame = requestAnimationFrame(check);
    };
    check();
  }
}

export const audioManager = new AudioManager();
