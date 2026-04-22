/**
 * ObjectiveTracker — persistenter Banner oben mittig.
 *
 * Zeigt dem Spieler jederzeit, was als Nächstes zu tun ist. Wichtigste
 * UX-Verbesserung: löst das "ich-wusste-nicht-wo-durch"-Problem.
 *
 * Verwendung:
 *   tracker.set('Sprich mit Mutter am Kirschbaum');
 *   tracker.set('→ Verlasse den Garten');
 *   tracker.done('Boxhandschuhe gefunden');  // kurzer Erfolgs-Flash
 *   tracker.clear();
 */
export class ObjectiveTracker {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'objective-tracker hidden';
    this.el.innerHTML = `
      <span class="obj-icon">◆</span>
      <span class="obj-text"></span>
    `;
    document.getElementById('ui-root').appendChild(this.el);
    this.textEl = this.el.querySelector('.obj-text');
  }

  set(text) {
    if (!text) { this.clear(); return; }
    this.textEl.textContent = text;
    this.el.classList.remove('hidden', 'done');
    this.el.classList.add('active');
  }

  /** Zeigt kurzen Erfolgs-Flash, wechselt dann zu nächstem Ziel oder clear. */
  done(text, nextText = null) {
    this.textEl.textContent = `✓ ${text}`;
    this.el.classList.remove('active');
    this.el.classList.add('done');
    setTimeout(() => {
      if (nextText) this.set(nextText);
      else this.clear();
    }, 2000);
  }

  clear() {
    this.el.classList.add('hidden');
    this.el.classList.remove('active', 'done');
  }
}
