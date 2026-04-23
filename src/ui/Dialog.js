/**
 * Dialog — Text-Overlay für Story-Zitate & Charakter-Stimmen.
 *
 * API:
 *   dialog.show([{ speaker: 'Alex', text: '...' }, ...]).then(() => ...)
 *
 * Spieler klickt "Weiter" oder drückt Leertaste für nächste Zeile.
 * Promise resolved wenn alle Zeilen durch sind.
 */
export class Dialog {
  constructor(audio = null, player = null) {
    this.audio = audio;
    this.player = player;
    this.el = document.createElement('div');
    this.el.className = 'dialog-box hidden';
    this.el.innerHTML = `
      <div class="dialog-content">
        <div class="dialog-speaker"></div>
        <div class="dialog-text"></div>
        <button class="dialog-next">Weiter ›</button>
      </div>
    `;
    document.getElementById('ui-root').appendChild(this.el);

    this.speakerEl = this.el.querySelector('.dialog-speaker');
    this.textEl = this.el.querySelector('.dialog-text');
    this.nextBtn = this.el.querySelector('.dialog-next');

    this._lines = [];
    this._index = 0;
    this._resolve = null;
    this.onClose = null; // optional callback for post-close UX

    this.nextBtn.addEventListener('click', (e) => { e.stopPropagation(); this._advance(); });
    document.addEventListener('keydown', (e) => {
      if (this.el.classList.contains('hidden')) return;
      if (e.repeat) return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        this._advance();
      }
    });
  }

  /**
   * @param {Array<{speaker?: string, text: string}>|string} lines
   * @returns {Promise<void>}
   */
  show(lines) {
    if (typeof lines === 'string') lines = [{ text: lines }];
    // Overlay-Stacking-Schutz: Dialog NIEMALS über ContinuePrompt oder
    // Mini-Game-Overlay legen. (Edge-Case-Audit C2/C3)
    if (document.querySelector('.continue-prompt:not(.hidden)') ||
        document.querySelector('.minigame-overlay:not(.hidden)')) {
      console.warn('[Dialog] show() blocked — Continue-Prompt oder Mini-Game aktiv');
      return Promise.resolve();
    }
    // Double-invoke-Schutz: altes Dialog sauber abschliessen (altes Promise
    // resolved, damit keine Caller hängen bleiben). Neuer Dialog startet frisch.
    if (this._resolve) {
      console.warn('[Dialog] show() called while previous dialog still active — resolving old');
      const prev = this._resolve;
      this._resolve = null;
      prev();
    }
    this._lines = lines;
    this._index = 0;
    this.el.classList.remove('hidden');
    this._render();
    return new Promise((resolve) => { this._resolve = resolve; });
  }

  _render() {
    const line = this._lines[this._index];
    this.speakerEl.textContent = line.speaker || '';
    this.speakerEl.style.display = line.speaker ? 'block' : 'none';
    this.textEl.textContent = line.text;
    this.nextBtn.textContent = this._index < this._lines.length - 1
      ? 'Weiter ›'
      : 'Schliessen';
  }

  _advance() {
    const isLast = this._index >= this._lines.length - 1;

    // WICHTIG: requestPointerLock ALLERERSTE Sync-Aktion im Gesture-Handler
    // — vor audio.uiClick(), vor DOM-Manipulation — damit Browser den Lock
    // nicht als "Activation consumed" verwirft.
    if (isLast && this.player && !this.player.isLocked()) {
      try { this.player.lock(); } catch { /* ignore */ }
    }

    this.audio?.uiClick();
    this._index++;
    if (this._index >= this._lines.length) {
      this.hide();
      const resolve = this._resolve;
      this._resolve = null;
      if (resolve) resolve();
      // Fallback: falls Lock nicht klappte, greift onClose → resumeIfIdle → StartOverlay
      queueMicrotask(() => this.onClose?.());
    } else {
      this._render();
    }
  }

  hide() {
    this.el.classList.add('hidden');
  }

  isOpen() {
    return !this.el.classList.contains('hidden');
  }
}
