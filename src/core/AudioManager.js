/**
 * AudioManager — prozedurale SFX via Web Audio API.
 *
 * Generiert alle Sounds im Browser — keine externen Asset-Dateien.
 * Vorteile: Null Ladezeit, funktioniert offline, kein Lizenz-Stress.
 *
 * Sound-Typen:
 *  - Footsteps (wood/stone/grass/carpet) — kurzer Rauschburst mit Filter
 *  - UI-Click — kurzer Sinus-Bleep
 *  - Door — Noise + Filter-Sweep (Creak)
 *  - Pickup — aufsteigender Ton
 *  - Ambient (wind/drone/hall) — Low-Pass gefiltertes Noise, endlos
 *  - Heartbeat — für Mini-Game 3 Tension
 */
export class AudioManager {
  constructor() {
    this._ctx = null;
    this._masterGain = null;
    this._ambientSource = null;
    this._ambientGain = null;
    this.volume = 0.5;
    this._unlocked = false;

    // Web Audio braucht User-Geste zum Starten
    const unlock = () => {
      if (this._unlocked) return;
      this._init();
      this._unlocked = true;
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
    };
    document.addEventListener('click', unlock);
    document.addEventListener('keydown', unlock);
  }

  _init() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    this._ctx = new AudioCtx();
    // Chrome/Safari: Context startet manchmal "suspended" — explizit resumen
    if (this._ctx.state === 'suspended') {
      this._ctx.resume().catch(() => { /* ignore — Audio ist optional */ });
    }
    this._masterGain = this._ctx.createGain();
    this._masterGain.gain.value = this.volume;
    this._masterGain.connect(this._ctx.destination);
  }

  setVolume(v) {
    this.volume = v;
    if (this._masterGain) this._masterGain.gain.value = v;
  }

  // ==== Footstep (4 Materialien) ====
  footstep(material = 'stone') {
    if (!this._ctx) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;

    // Noise-Burst
    const bufferSize = Math.floor(ctx.sampleRate * 0.12);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    // Material-spezifisches Profil
    const profiles = {
      wood:    { type: 'bandpass', freq: 180, Q: 2.0, vol: 0.22 },
      stone:   { type: 'bandpass', freq: 900, Q: 1.2, vol: 0.18 },
      grass:   { type: 'lowpass',  freq: 500, Q: 0.7, vol: 0.12 },
      carpet:  { type: 'lowpass',  freq: 240, Q: 0.8, vol: 0.10 }
    };
    const p = profiles[material] || profiles.stone;
    filter.type = p.type;
    filter.frequency.value = p.freq;
    filter.Q.value = p.Q;

    gain.gain.setValueAtTime(p.vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this._masterGain);
    src.start(now);
    src.stop(now + 0.2);
  }

  // ==== UI-Click ====
  uiClick() {
    if (!this._ctx) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 1200;
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(this._masterGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // ==== Pickup (aufsteigend) ====
  pickup() {
    if (!this._ctx) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.2);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this._masterGain);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  // ==== Door Creak ====
  door() {
    if (!this._ctx) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 0.8);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3 * Math.exp(-i / bufferSize);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 8;
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(600, now + 0.6);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this._masterGain);
    src.start(now);
  }

  // ==== Herzschlag (für Tension-Momente) ====
  heartbeat() {
    if (!this._ctx) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;

    const thump = (time, vol = 0.3) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(80, time);
      osc.frequency.exponentialRampToValueAtTime(40, time + 0.15);
      osc.type = 'sine';
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
      osc.connect(gain);
      gain.connect(this._masterGain);
      osc.start(time);
      osc.stop(time + 0.25);
    };
    thump(now);
    thump(now + 0.25, 0.2);
  }

  // ==== Ambient Drone (endlos, per Raum) ====
  startAmbient(profile = 'default') {
    if (!this._ctx) return;
    this.stopAmbient();
    const ctx = this._ctx;

    // 4-Sek-Noise-Buffer, loopbar
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let lastValue = 0;
      for (let i = 0; i < bufferSize; i++) {
        // Braun-Rauschen (tiefer gefiltert, wärmer als weiß)
        const white = Math.random() * 2 - 1;
        lastValue = (lastValue + white * 0.02) / 1.02;
        data[i] = lastValue * 3.5;
      }
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';

    const gain = ctx.createGain();

    const profiles = {
      forest:    { freq: 600,  Q: 0.6, vol: 0.12 },  // Raum 1
      basement:  { freq: 200,  Q: 0.7, vol: 0.18 },  // Raum 2
      office:    { freq: 500,  Q: 0.5, vol: 0.08 },  // Raum 3
      street:    { freq: 300,  Q: 0.4, vol: 0.10 },  // Raum 4
      manor:     { freq: 250,  Q: 0.8, vol: 0.15 },  // Raum 5
      hall:      { freq: 800,  Q: 0.5, vol: 0.14 },  // Raum 6
      backroom:  { freq: 180,  Q: 1.0, vol: 0.20 },  // Raum 7
      lake:      { freq: 900,  Q: 0.4, vol: 0.08 },  // Raum 8
      default:   { freq: 400,  Q: 0.5, vol: 0.10 }
    };
    const p = profiles[profile] || profiles.default;
    filter.frequency.value = p.freq;
    filter.Q.value = p.Q;
    gain.gain.value = 0;

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this._masterGain);
    src.start();

    // Fade-In über 2 Sekunden
    const now = ctx.currentTime;
    gain.gain.linearRampToValueAtTime(p.vol, now + 2);

    this._ambientSource = src;
    this._ambientGain = gain;
  }

  stopAmbient() {
    if (!this._ambientSource || !this._ctx) return;
    const now = this._ctx.currentTime;
    this._ambientGain.gain.linearRampToValueAtTime(0, now + 0.8);
    const src = this._ambientSource;
    setTimeout(() => { try { src.stop(); } catch { /* ignore */ } }, 1000);
    this._ambientSource = null;
    this._ambientGain = null;
  }
}
