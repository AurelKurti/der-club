/**
 * Start-Overlay — "Klicke zum Spielen"
 *
 * Pointer Lock MUSS vom User via Click oder Key ausgelöst werden
 * (Browser-Security). Deshalb brauchen wir ein Overlay, das den Klick abfängt.
 */
export function createStartOverlay(onStart) {
  const el = document.createElement('div');
  el.className = 'start-overlay';
  el.innerHTML = `
    <div class="start-content">
      <h1>Der Club</h1>
      <p class="subtitle">Eine interaktive Zusammenfassung nach dem Roman von Takis Würger</p>
      <div class="controls-hint">
        <strong>Steuerung:</strong>
        <kbd>W A S D</kbd> bewegen &nbsp;·&nbsp;
        <kbd>Maus</kbd> umschauen &nbsp;·&nbsp;
        <kbd>E</kbd> interagieren &nbsp;·&nbsp;
        <kbd>Shift</kbd> rennen
      </div>
      <button class="start-btn">Klicke zum Starten</button>
    </div>
  `;
  document.getElementById('ui-root').appendChild(el);

  el.querySelector('.start-btn').addEventListener('click', () => {
    el.classList.add('hidden');
    onStart();
  });

  return {
    show: () => el.classList.remove('hidden'),
    hide: () => el.classList.add('hidden'),
    remove: () => el.remove()
  };
}
