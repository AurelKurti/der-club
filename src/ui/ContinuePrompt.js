/**
 * ContinuePrompt — forciert Click-zum-Fortfahren.
 *
 * Nach Mini-Game oder anderem interaktiven Event, bei dem Pointer-Lock
 * verloren wurde. Der User MUSS klicken — der Click ist ein valides
 * User-Gesture, das der Browser für requestPointerLock akzeptiert.
 *
 * Benutzt als `await game.continuePrompt.wait()`.
 */
export class ContinuePrompt {
  constructor(player) {
    this.player = player;

    this.el = document.createElement('div');
    this.el.className = 'continue-prompt hidden';
    this.el.innerHTML = `
      <div class="continue-box">
        <div class="continue-hint">Mini-Spiel beendet</div>
        <button class="continue-btn">Weiterspielen</button>
        <div class="continue-sub">(klicke um fortzufahren)</div>
      </div>
    `;
    document.getElementById('ui-root').appendChild(this.el);

    this.btn = this.el.querySelector('.continue-btn');
  }

  /**
   * Zeigt den Prompt und wartet bis User klickt.
   * Beim Click wird sofort (in der Click-Gesture) Pointer-Lock angefordert.
   */
  wait(hintText = 'Mini-Spiel beendet') {
    this.el.querySelector('.continue-hint').textContent = hintText;
    this.el.classList.remove('hidden');

    return new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        this.btn.removeEventListener('click', onClick);
        document.removeEventListener('keydown', onKey);
        // Lock SYNCHRON in der User-Gesture — hier ist es 100% zuverlässig
        try { this.player?.lock?.(); } catch { /* ignore */ }
        this.el.classList.add('hidden');
        resolve();
      };
      const onClick = finish;
      const onKey = (e) => {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          finish();
        }
      };
      this.btn.addEventListener('click', onClick);
      document.addEventListener('keydown', onKey);
    });
  }

  isVisible() {
    return !this.el.classList.contains('hidden');
  }
}
