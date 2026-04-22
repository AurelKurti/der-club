/**
 * BaseMiniGame — Abstrakte Basis für alle Mini-Spiele.
 *
 * Lifecycle:
 *   1. ctx.game.startMiniGame(new MyMiniGame(ctx)) — von Raum/Interactable getriggert
 *   2. start() erstellt HTML-Overlay + fängt Input
 *   3. update(delta) pro Frame (via Game-Loop weitergereicht)
 *   4. end(result) — 'won' | 'skipped' | 'failed'
 *   5. dispose() entfernt Overlay, resolviert Promise
 */
export class BaseMiniGame {
  constructor(ctx) {
    this.ctx = ctx;
    this.overlay = null;
    this._resolve = null;
  }

  run() {
    return new Promise((resolve) => {
      this._resolve = resolve;
      this._createOverlay();
      this.start();
    });
  }

  _createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'minigame-overlay';
    this.overlay.innerHTML = `
      <div class="minigame-top-bar">
        <span class="minigame-title"></span>
        <button class="minigame-skip">Mini-Spiel überspringen →</button>
      </div>
      <div class="minigame-body"></div>
      <div class="minigame-hint"></div>
    `;
    document.getElementById('ui-root').appendChild(this.overlay);

    this.titleEl = this.overlay.querySelector('.minigame-title');
    this.bodyEl = this.overlay.querySelector('.minigame-body');
    this.hintEl = this.overlay.querySelector('.minigame-hint');
    this.skipBtn = this.overlay.querySelector('.minigame-skip');

    this.skipBtn.addEventListener('click', () => this.end('skipped'));
  }

  setTitle(t)  { this.titleEl.textContent = t; }
  setHint(t)   { this.hintEl.textContent = t; }

  /** Override: Setup + Listeners. */
  start() { throw new Error('start() not implemented'); }

  /** Override (optional): Pro Frame. */
  update(_delta) {}

  end(result = 'won') {
    this.cleanup?.();  // Subklassen-Hook
    this._dispose();
    if (this._resolve) { this._resolve(result); this._resolve = null; }
  }

  _dispose() {
    if (this._onKeyDown) document.removeEventListener('keydown', this._onKeyDown);
    if (this._onKeyUp) document.removeEventListener('keyup', this._onKeyUp);
    this.overlay?.remove();
  }

  /** Subklassen können überschreiben für zusätzliches Cleanup (Intervals, Timeouts). */
  cleanup() {}

  // Helper für Subklassen
  onKey(handler) {
    this._onKeyDown = handler;
    document.addEventListener('keydown', handler);
  }
  onKeyUp(handler) {
    this._onKeyUp = handler;
    document.addEventListener('keyup', handler);
  }
}
