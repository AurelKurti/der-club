import { Game } from './core/Game.js';
import { Foersterhaus } from './rooms/01-Foersterhaus.js';
import { InternatKeller } from './rooms/02-Internat.js';
import { AlexBuero } from './rooms/03-AlexBuero.js';
import { PittClub } from './rooms/04-PittClub.js';
import { ManorHouse } from './rooms/05-ManorHouse.js';
import { Markthalle } from './rooms/06-Markthalle.js';
import { Hinterraum } from './rooms/07-Hinterraum.js';
import { Gardasee } from './rooms/08-Gardasee.js';
import { createStartOverlay } from './ui/startOverlay.js';
import { createTriggerWarning, shouldShowTriggerWarning } from './ui/triggerWarning.js';
import { createIntroScreen } from './ui/introScreen.js';

// ==========================================================================
// Entry Point — Tag 8-11: Räume 2 ausgebaut, 3 + 4 neu, Mini-Game 1
// ==========================================================================

async function boot() {
  const game = new Game({
    canvas: document.getElementById('game-canvas'),
    uiRoot: document.getElementById('ui-root')
  });

  // ---- Raum-Kette definieren ----
  const makeRoom = {
    foersterhaus: () => new Foersterhaus(game.sceneManager.ctx),
    internat:     () => new InternatKeller(game.sceneManager.ctx),
    'alex-buero': () => new AlexBuero(game.sceneManager.ctx),
    'pitt-club':  () => new PittClub(game.sceneManager.ctx),
    manor:        () => new ManorHouse(game.sceneManager.ctx),
    markthalle:   () => new Markthalle(game.sceneManager.ctx),
    hinterraum:   () => new Hinterraum(game.sceneManager.ctx),
    gardasee:     () => new Gardasee(game.sceneManager.ctx)
  };

  const transitions = {
    foersterhaus_internat: 'Als ich fünfzehn war, starben meine Eltern. Ich kam ins Internat.',
    internat_alex:         'Abitur. Meine Tante holte mich nach Cambridge.',
    alex_pittclub:         'Ich musste in den Club. Charlotte führte mich ein.',
    pittclub_manor:        'Im Frühling fuhren wir nach Somerset. Das Haus stand seit Jahren leer.',
    manor_markthalle:      'Drei Wochen später: der Boxkampf gegen Oxford.',
    markthalle_hinterraum: 'Ich wurde in den engeren Kreis aufgenommen. Die Schmetterlinge.',
    hinterraum_gardasee:   'Wir flohen an den Gardasee. Hans Stichler — der Name, den ich zurückließ.'
  };

  // Chain wiring
  function setExit(room, nextId, transitionKey) {
    room.onExit = async () => {
      if (!nextId) {
        await game.dialog.show('[Demo-Ende. Raum 7-8 werden im nächsten Schritt ergänzt.]');
        return;
      }
      const next = makeRoom[nextId]();
      wireExit(next, nextId);
      await game.enterRoom(next, transitions[transitionKey]);
    };
  }

  function wireExit(room, id) {
    if (id === 'foersterhaus') setExit(room, 'internat',   'foersterhaus_internat');
    if (id === 'internat')     setExit(room, 'alex-buero', 'internat_alex');
    if (id === 'alex-buero')   setExit(room, 'pitt-club',  'alex_pittclub');
    if (id === 'pitt-club')    setExit(room, 'manor',      'pittclub_manor');
    if (id === 'manor')        setExit(room, 'markthalle', 'manor_markthalle');
    if (id === 'markthalle')   setExit(room, 'hinterraum', 'markthalle_hinterraum');
    if (id === 'hinterraum')   setExit(room, 'gardasee',   'hinterraum_gardasee');
    if (id === 'gardasee')     setExit(room, null,         null); // ends via credits
  }

  // Start in Raum 1
  const first = makeRoom.foersterhaus();
  wireExit(first, 'foersterhaus');
  await game.enterRoom(first);

  // ---- UI Overlays ----
  const uiRoot = document.getElementById('ui-root');

  // Dezenter Keyboard-Hint unten rechts, immer sichtbar
  const hud = document.createElement('div');
  hud.className = 'hud-hint';
  hud.innerHTML = `
    <kbd>W A S D</kbd> bewegen &nbsp;·&nbsp;
    <kbd>E</kbd> Interagieren &nbsp;·&nbsp;
    <kbd>T</kbd> Tagebuch &nbsp;·&nbsp;
    <kbd>ESC</kbd> Pause
  `;
  uiRoot.appendChild(hud);

  const crosshair = document.createElement('div');
  crosshair.className = 'crosshair';
  uiRoot.appendChild(crosshair);

  const startOverlay = createStartOverlay(() => game.player.lock());

  // Zeigt Start-Overlay, wenn der Spieler keine Maus-Lock hat und kein UI aktiv ist.
  // Wird aus mehreren Pfaden aufgerufen (ESC, Mini-Game-Ende, Dialog-Ende).
  const resumeIfIdle = () => {
    if (!game.player.isLocked() && !game.isUIBlocked()) {
      startOverlay.show();
    }
  };

  game.player.onUnlock(resumeIfIdle);
  game.player.onLock(() => startOverlay.hide());
  game.onResumeNeeded(resumeIfIdle);
  game.dialog.onClose = resumeIfIdle;
  game.diary._onHide = resumeIfIdle;

  game.start();

  // Flow: Trigger-Warnung → Intro → StartOverlay. Alles nur beim ersten Besuch.
  if (shouldShowTriggerWarning(game.save)) {
    startOverlay.hide();
    createTriggerWarning(() => {
      if (!game.save.hasFlag('introShown')) {
        createIntroScreen(() => {
          game.save.setFlag('introShown');
          startOverlay.show();
        });
      } else {
        startOverlay.show();
      }
    }, game.save);
  } else if (!game.save.hasFlag('introShown')) {
    startOverlay.hide();
    createIntroScreen(() => {
      game.save.setFlag('introShown');
      startOverlay.show();
    });
  }

  console.log('[Der Club] Räume 1-4 verlinkt.');
}

boot();
