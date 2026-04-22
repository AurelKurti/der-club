/**
 * Start-Overlay — Pointer-Lock-Gate.
 *
 * Zwei Modi:
 *  - "start"   (initial): grosse Titel, volle Controls-Hilfe
 *  - "resume"  (mid-game): kompakter Continue-Prompt nach ESC / Mini-Game-Ende
 *
 * Pointer Lock MUSS vom User via Click ausgelöst werden (Browser-Security).
 */
export function createStartOverlay(onStart) {
  const el = document.createElement('div');
  el.className = 'start-overlay';
  el.innerHTML = `
    <div class="start-content" data-mode="start">
      <h1>Der Club</h1>
      <p class="subtitle">Eine interaktive Zusammenfassung nach dem Roman von Takis Würger</p>
      <div class="controls-hint">
        <strong>Steuerung:</strong><br>
        <kbd>W A S D</kbd> bewegen &nbsp;·&nbsp;
        <kbd>Maus</kbd> umschauen &nbsp;·&nbsp;
        <kbd>E</kbd> interagieren<br>
        <kbd>Space</kbd> / <kbd>Enter</kbd> Dialog weiter &nbsp;·&nbsp;
        <kbd>T</kbd> Tagebuch &nbsp;·&nbsp;
        <kbd>Shift</kbd> rennen &nbsp;·&nbsp;
        <kbd>ESC</kbd> pausieren
      </div>
      <button class="start-btn">Klicke zum Starten</button>
    </div>
  `;
  document.getElementById('ui-root').appendChild(el);

  const content = el.querySelector('.start-content');
  const titleEl = el.querySelector('h1');
  const subtitleEl = el.querySelector('.subtitle');
  const controlsEl = el.querySelector('.controls-hint');
  const btn = el.querySelector('.start-btn');

  btn.addEventListener('click', () => {
    el.classList.add('hidden');
    onStart();
  });

  const setMode = (mode) => {
    content.setAttribute('data-mode', mode);
    if (mode === 'resume') {
      titleEl.textContent = 'Pause';
      subtitleEl.textContent = 'Klicke um weiterzuspielen.';
      controlsEl.style.display = 'none';
      btn.textContent = 'Weiterspielen';
    } else {
      titleEl.textContent = 'Der Club';
      subtitleEl.textContent = 'Eine interaktive Zusammenfassung nach dem Roman von Takis Würger';
      controlsEl.style.display = '';
      btn.textContent = 'Klicke zum Starten';
    }
  };

  return {
    show: (mode = 'start') => {
      setMode(mode);
      el.classList.remove('hidden');
    },
    hide: () => el.classList.add('hidden'),
    remove: () => el.remove()
  };
}
