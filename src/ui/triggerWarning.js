/**
 * TriggerWarning — erstes Bild beim Öffnen des Spiels.
 *
 * Pflicht laut Spec wegen schwerer Themen des Romans.
 * Wird nur beim ersten Besuch angezeigt (Save gemerkt).
 */
export function createTriggerWarning(onAcknowledge, saveManager) {
  const el = document.createElement('div');
  el.className = 'trigger-warning';
  el.innerHTML = `
    <div class="tw-content">
      <h2>Inhaltshinweis</h2>
      <p>
        Dieses Spiel basiert auf dem Roman <em>Der Club</em> von Takis Würger
        und behandelt Themen wie <strong>Tod von Angehörigen, körperliche
        Gewalt, sexualisierte Gewalt, Selbstverletzung und Suizid</strong>.
      </p>
      <p class="small">
        Die Darstellung erfolgt symbolisch und nie explizit -  das Spiel zeigt
        keine gewaltvollen Bilder.
      </p>
      <button class="tw-btn">Ich habe verstanden</button>
    </div>
  `;
  document.getElementById('ui-root').appendChild(el);

  el.querySelector('.tw-btn').addEventListener('click', () => {
    el.classList.add('hidden');
    setTimeout(() => el.remove(), 500);
    saveManager?.markTriggerWarningSeen();
    onAcknowledge();
  });

  return el;
}

export function shouldShowTriggerWarning(saveManager) {
  return !saveManager?.hasTriggerWarningBeenSeen();
}
