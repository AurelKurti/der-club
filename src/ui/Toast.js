/**
 * Toast — dezente Pop-up-Nachricht für "Neuer Tagebuch-Eintrag" etc.
 * Auto-hide nach 4 Sekunden.
 */
export class Toast {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'toast hidden';
    document.getElementById('ui-root').appendChild(this.el);
    this._timer = null;
  }

  show(text, durationMs = 4000) {
    this.el.textContent = text;
    this.el.classList.remove('hidden');
    if (this._timer) clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      this.el.classList.add('hidden');
      this._timer = null;
    }, durationMs);
  }

  hide() {
    this.el.classList.add('hidden');
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
  }
}
