import { BaseMiniGame } from './BaseMiniGame.js';

/**
 * Mini-Game 3 — Pitt Club Hinterraum: Beweise sammeln + Lucia retten.
 *
 * Zwei Phasen:
 *  1. 3 Beweise sammeln (Klick in HTML-Overlay auf Slots)
 *  2. Hold E 3 Sekunden, um Lucia wegzutragen
 *
 * Bewusst OHNE explizite Darstellung. Lucia nie als Gesicht/Körper gezeigt —
 * nur als goldener Umriss. Andere Schmetterlinge als regungslose Schatten.
 */

const CLUES = [
  {
    id: 'flasche',
    label: 'Plastikfläschchen',
    icon: '◌',
    description: 'K.-o.-Tropfen. Joshs Fingerabdrücke müssen darauf sein.'
  },
  {
    id: 'schmetterling',
    label: 'Glaskasten',
    icon: '✦',
    description: 'Ornithoptera goliath. Derselbe Schmetterling wie auf meiner Fliege. Wie auf dem Brief an Charlotte.'
  },
  {
    id: 'glas',
    label: 'Champagnerglas',
    icon: '◇',
    description: 'Lippenstift am Rand. Halbleer. Sie wurde hereingelegt.'
  }
];

const HOLD_MS = 3000;

export class EvidenceHunt extends BaseMiniGame {
  constructor(ctx) {
    super(ctx);
    this.collected = new Set();
    this.phase = 'clues';
    this.holdStart = null;
    this._holdRAF = null;
  }

  start() {
    this.setTitle('Das Hinterzimmer');
    this.setHint('Klicke die Beweise an, bevor du handelst.');

    this._renderCluesPhase();

    this.onKey((e) => {
      if (this.phase !== 'rescue') return;
      if (e.repeat) return;
      if (e.code === 'KeyE' && this.holdStart === null) {
        this.holdStart = performance.now();
        this._tickHold();
      }
    });
    this.onKeyUp((e) => {
      if (e.code === 'KeyE') {
        this.holdStart = null;
        if (this._holdRAF) cancelAnimationFrame(this._holdRAF);
        this._holdRAF = null;
        if (this.phase === 'rescue') this._updateHoldBar(0);
      }
    });
  }

  cleanup() {
    if (this._holdRAF) {
      cancelAnimationFrame(this._holdRAF);
      this._holdRAF = null;
    }
  }

  _renderCluesPhase() {
    this.bodyEl.innerHTML = `
      <div class="hunt-scene">
        <div class="hunt-hint">
          <p><em>Der Billardtisch steht in der Mitte. Die anderen Männer stehen
          regungslos an den Wänden. Auf dem Sofa liegt etwas. Im Kasten leuchtet etwas.</em></p>
          <p class="tiny">Sammle alle drei Beweise — dann kannst du handeln.</p>
        </div>
        <div class="hunt-slots">
          ${CLUES.map((c) => `
            <button class="hunt-slot" data-id="${c.id}">
              <div class="hunt-icon">${c.icon}</div>
              <div class="hunt-label">${c.label}</div>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    this.bodyEl.querySelectorAll('.hunt-slot').forEach((btn) => {
      btn.addEventListener('click', () => this._collectClue(btn.dataset.id));
    });
  }

  async _collectClue(id) {
    if (this.collected.has(id)) return;
    this.collected.add(id);

    const clue = CLUES.find((c) => c.id === id);
    const slot = this.bodyEl.querySelector(`.hunt-slot[data-id="${id}"]`);
    slot.classList.add('collected');

    // Kurzer Dialog pro Beweis
    await this.ctx.dialog.show([
      { text: clue.description }
    ]);

    if (this.collected.size === CLUES.length) {
      this._enterRescuePhase();
    }
  }

  async _enterRescuePhase() {
    // phase NICHT vor dem Dialog umstellen — sonst startet E-Hold
    // während des Dialogs (Race-Condition)
    await this.ctx.dialog.show([
      { text: 'Der Schmetterling im Glaskasten. Das Siegel auf Charlottes Brief.' },
      { text: 'Ornithoptera goliath. Es war immer dasselbe Zeichen.' },
      { text: 'Ich spüre Billys Kastanie in meiner Tasche.' }
    ]);

    this.setHint('Halte E, um das Mädchen fortzutragen.');
    if (!this.bodyEl) return;
    this.bodyEl.innerHTML = `
      <div class="hunt-rescue">
        <p class="rescue-quote">«Halt mich. Halt mich.»</p>
        <p class="rescue-prompt">Halte <kbd>E</kbd> gedrückt, um sie fortzutragen.</p>
        <div class="hold-bar"><div class="hold-fill"></div></div>
      </div>
    `;
    this.holdFill = this.bodyEl.querySelector('.hold-fill');
    this.phase = 'rescue';
  }

  _tickHold() {
    if (this.holdStart === null) return;
    const elapsed = performance.now() - this.holdStart;
    const ratio = Math.min(1, elapsed / HOLD_MS);
    this._updateHoldBar(ratio);
    if (ratio >= 1) {
      this._finish();
    } else {
      this._holdRAF = requestAnimationFrame(() => this._tickHold());
    }
  }

  _updateHoldBar(ratio) {
    if (this.holdFill) this.holdFill.style.width = `${ratio * 100}%`;
  }

  async _finish() {
    this.phase = 'done';
    this.bodyEl.innerHTML = `
      <div class="hunt-finish">
        <p><em>Ich hebe sie hoch. Ich trage sie aus dem Raum.</em></p>
        <p><em>Es gab kein Grau. Ich hatte mich entschieden.</em></p>
        <button class="minigame-continue">Weiter</button>
      </div>
    `;
    this.bodyEl.querySelector('.minigame-continue').addEventListener('click', () => {
      this.end('won');
    });
  }
}
