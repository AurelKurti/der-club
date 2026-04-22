import { BaseMiniGame } from './BaseMiniGame.js';

/**
 * Mini-Game 1 — Box-Rhythmus mit Pater Gerald
 *
 * 12 Schläge. Jeder Schlag kommt von links (A) oder rechts (D).
 * 0.4s vor dem Hit erscheint der Zielpunkt auf einer der zwei Pratzen.
 * Timing-Window: ±0.25s. Treffer/Miss wird gezählt, aber nie Game-Over.
 */
const TOTAL_HITS = 12;
const BPM = 68;
const BEAT_MS = (60 / BPM) * 1000;   // ~882 ms
const WARNING_MS = 400;               // Pre-hit Anzeige
const HIT_WINDOW_MS = 250;

export class BoxRhythm extends BaseMiniGame {
  constructor(ctx) {
    super(ctx);
    this.hits = 0;
    this.total = 0;
    this.beats = []; // [{ side: 'L'|'R', scheduledAt, resolved }]
    this._startTime = 0;
  }

  start() {
    this.setTitle('Pater Gerald — Box-Rhythmus');
    this.setHint('A = linke Pratze · D = rechte Pratze · im Rhythmus');

    this.bodyEl.innerHTML = `
      <div class="rhythm-scene">
        <div class="rhythm-score">0 / ${TOTAL_HITS}</div>
        <div class="rhythm-pratzen">
          <div class="rhythm-pratze left" data-side="L">
            <span class="pratze-key">A</span>
            <div class="pratze-marker"></div>
          </div>
          <div class="rhythm-pratze right" data-side="R">
            <span class="pratze-key">D</span>
            <div class="pratze-marker"></div>
          </div>
        </div>
        <div class="rhythm-feedback"></div>
      </div>
    `;

    this.scoreEl = this.bodyEl.querySelector('.rhythm-score');
    this.feedbackEl = this.bodyEl.querySelector('.rhythm-feedback');
    this.markerL = this.bodyEl.querySelector('.rhythm-pratze.left .pratze-marker');
    this.markerR = this.bodyEl.querySelector('.rhythm-pratze.right .pratze-marker');

    // Beats pseudo-random generieren (erster Beat nach 1s, dann alle BEAT_MS)
    this._startTime = performance.now() + 1500;
    const pattern = ['L', 'R', 'L', 'L', 'R', 'L', 'R', 'R', 'L', 'R', 'L', 'R'];
    for (let i = 0; i < TOTAL_HITS; i++) {
      this.beats.push({
        side: pattern[i],
        scheduledAt: this._startTime + i * BEAT_MS,
        resolved: false
      });
    }

    this.onKey((e) => {
      if (e.code === 'KeyA') this._tryHit('L');
      else if (e.code === 'KeyD') this._tryHit('R');
    });

    this._tickInterval = setInterval(() => this._tick(), 16);
  }

  cleanup() {
    this._ended = true;
    if (this._tickInterval) {
      clearInterval(this._tickInterval);
      this._tickInterval = null;
    }
  }

  _tick() {
    const now = performance.now();

    // Warning markers anzeigen
    for (const b of this.beats) {
      if (b.resolved) continue;
      const delta = b.scheduledAt - now;

      if (delta <= WARNING_MS && delta >= -HIT_WINDOW_MS) {
        const intensity = 1 - (delta / WARNING_MS);
        const marker = b.side === 'L' ? this.markerL : this.markerR;
        marker.style.opacity = Math.max(0, Math.min(1, intensity));
        marker.style.transform = `scale(${1 + intensity * 0.5})`;
      }
    }

    // Markers blenden wenn alle Beats gepast
    const anyActive = this.beats.some((b) =>
      !b.resolved && Math.abs(b.scheduledAt - now) < WARNING_MS
    );
    if (!anyActive) {
      this.markerL.style.opacity = 0;
      this.markerR.style.opacity = 0;
    }

    // Verpasste Beats
    for (const b of this.beats) {
      if (b.resolved) continue;
      if (now - b.scheduledAt > HIT_WINDOW_MS) {
        b.resolved = true;
        this.total++;
        this._updateScore();
        this._showFeedback('— verpasst', 'miss');
      }
    }

    // Alle durch?
    if (this.beats.every((b) => b.resolved)) {
      clearInterval(this._tickInterval);
      setTimeout(() => this._finish(), 800);
    }
  }

  _tryHit(side) {
    const now = performance.now();
    // Finde nächsten Beat der side mit gültigem Timing
    const candidate = this.beats.find((b) =>
      !b.resolved && b.side === side && Math.abs(b.scheduledAt - now) < HIT_WINDOW_MS
    );
    if (!candidate) {
      this._showFeedback('×', 'wrong');
      return;
    }
    candidate.resolved = true;
    this.hits++;
    this.total++;
    this._showFeedback('✓', 'good');
    this._updateScore();
  }

  _updateScore() {
    this.scoreEl.textContent = `${this.hits} / ${TOTAL_HITS}`;
  }

  _showFeedback(text, cls) {
    this.feedbackEl.textContent = text;
    this.feedbackEl.className = `rhythm-feedback ${cls}`;
    setTimeout(() => {
      this.feedbackEl.textContent = '';
      this.feedbackEl.className = 'rhythm-feedback';
    }, 300);
  }

  _finish() {
    if (this._ended) return;
    clearInterval(this._tickInterval);
    const ratio = this.hits / TOTAL_HITS;
    const summary = ratio >= 0.66
      ? 'Pater Gerald nickt: «You\'re getting better, son.» («Du wirst besser, mein Sohn.»)'
      : 'Pater Gerald: «Your left is too low.» («Deine Linke ist zu tief.»)';

    if (!this.bodyEl) return;
    this.bodyEl.innerHTML = `
      <div class="rhythm-summary">
        <h3>${this.hits} / ${TOTAL_HITS} Treffer</h3>
        <p>${summary}</p>
        <button class="minigame-continue">Weiter</button>
      </div>
    `;
    this.bodyEl.querySelector('.minigame-continue').addEventListener('click', () => {
      this._requestLock();   // Lock in Click-Gesture
      this.end('won');
    });
  }
}
