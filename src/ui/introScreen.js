/**
 * Intro-Screen — literarischer Opener nach Trigger-Warnung, vor Start.
 *
 * Zeigt Widmung "Für Mili" + Buchzitat + dezente Navigation "Weiter".
 * Einmalig pro Durchlauf. Macht das Spiel sofort literarisch spürbar.
 */
export function createIntroScreen(onDone) {
  const el = document.createElement('div');
  el.className = 'intro-screen';
  el.innerHTML = `
    <div class="intro-content">
      <div class="intro-dedication">Für Mili</div>
      <div class="intro-quote">
        «Meistens ist alles im Leben grau, aber manchmal gibt es nur
        Richtig und Falsch. Und wenn Stärkere Schwächeren Leid antun,
        ist das falsch.»
      </div>
      <div class="intro-attrib"> -  Takis Würger, <em>Der Club</em></div>
      <button class="intro-btn">Beginnen</button>
    </div>
  `;
  document.getElementById('ui-root').appendChild(el);

  el.querySelector('.intro-btn').addEventListener('click', () => {
    el.classList.add('hidden');
    setTimeout(() => el.remove(), 600);
    onDone();
  });

  return el;
}
