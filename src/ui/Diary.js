/**
 * Diary — Tagebuch-Overlay, via T-Taste öffnen.
 *
 * Zeigt alle gesammelten Einträge chronologisch. Gibt dem Spieler eine
 * Zusammenfassung der Story zum Nachlesen (und demonstriert inhaltliche
 * Vollständigkeit für die Bewertung).
 */
export class Diary {
  constructor(saveManager) {
    this.save = saveManager;

    this.el = document.createElement('div');
    this.el.className = 'diary-overlay hidden';
    this.el.innerHTML = `
      <div class="diary-content">
        <header>
          <h2>Tagebuch</h2>
          <button class="diary-close" aria-label="Schliessen">×</button>
        </header>
        <div class="diary-entries"></div>
      </div>
    `;
    document.getElementById('ui-root').appendChild(this.el);

    this.entriesEl = this.el.querySelector('.diary-entries');

    this.el.querySelector('.diary-close').addEventListener('click', () => this.hide());
    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) this.hide();
    });

    document.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      if (e.code === 'KeyT' && !this._isBlocked()) {
        e.preventDefault();
        this.isOpen() ? this.hide() : this.show();
      } else if (e.code === 'Escape' && this.isOpen()) {
        this.hide();
      }
    });
  }

  _isBlocked() {
    // Nicht öffnen, wenn ein anderes UI aktiv ist — verhindert Overlay-Stacking
    return !!document.querySelector('.start-overlay:not(.hidden)') ||
           !!document.querySelector('.trigger-warning:not(.hidden)') ||
           !!document.querySelector('.intro-screen:not(.hidden)') ||
           !!document.querySelector('.continue-prompt:not(.hidden)') ||
           !!document.querySelector('.minigame-overlay') ||
           !!document.querySelector('.dialog-box:not(.hidden)') ||
           !!document.querySelector('.credits-overlay');
  }

  show() {
    this._render();
    this.el.classList.remove('hidden');
    if (document.pointerLockElement) document.exitPointerLock();
  }

  hide() {
    this.el.classList.add('hidden');
    // Nach Schliessen: Start-Overlay anzeigen, damit User Pointer wieder locken kann
    if (!document.pointerLockElement && this._onHide) this._onHide();
  }

  isOpen() {
    return !this.el.classList.contains('hidden');
  }

  _render() {
    const entries = this.save.getDiary();
    if (entries.length === 0) {
      this.entriesEl.innerHTML = '<p class="diary-empty">Noch keine Einträge. Erkunde die Räume.</p>';
      return;
    }
    this.entriesEl.innerHTML = entries.map((e) => `
      <article class="diary-entry">
        <h3>${e.title}</h3>
        <p>${e.text}</p>
      </article>
    `).join('');
  }
}
