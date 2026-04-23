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
  // Touch-only-Geräte können WASD/Pointer-Lock nicht nutzen → freundlicher Hinweis
  if (('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.innerWidth < 1000) {
    const notice = document.createElement('div');
    notice.style.cssText = 'position:fixed;inset:0;background:#0a0808;color:#f4e8d0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Georgia,serif;text-align:center;padding:32px;z-index:9999;';
    notice.innerHTML = `
      <h1 style="color:#d8b878;font-size:26px;margin:0 0 16px;">Bitte am Computer öffnen</h1>
      <p style="opacity:0.85;max-width:420px;line-height:1.5;font-size:15px;">
        «Der Club» ist ein First-Person-Spiel und braucht Tastatur (WASD) und Maus.
        Auf Tablet oder Handy ist es leider nicht spielbar.
      </p>
      <p style="opacity:0.5;font-size:13px;margin-top:24px;">der-club.vercel.app</p>
    `;
    document.body.appendChild(notice);
    return;
  }

  const game = new Game({
    canvas: document.getElementById('game-canvas'),
    uiRoot: document.getElementById('ui-root')
  });

  // Globale Referenz für Debug + automatisierte Playwright-Tests.
  // Erlaubt z.B. window.__game.startMiniGame(...) aus DevTools heraus.
  window.__game = game;

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
        // Gardasee endet normalerweise via Credits-Overlay — dies ist nur ein Fallback.
        return;
      }
      game.audio?.door?.();
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
  // Context-aware: beim erstem Mal "start", danach "resume" (kompakte UI).
  let initialStart = true;
  const resumeIfIdle = () => {
    if (!game.player.isLocked() && !game.isUIBlocked()) {
      startOverlay.show(initialStart ? 'start' : 'resume');
    }
  };

  game.player.onUnlock(resumeIfIdle);
  game.player.onLock(() => {
    initialStart = false; // ab erstem Lock: "resume"-Mode
    startOverlay.hide();
  });
  game.onResumeNeeded(resumeIfIdle);
  game.dialog.onClose = resumeIfIdle;
  game.diary._onHide = resumeIfIdle;

  // Tab-Out-Recovery: wenn Browser den Tab fokussiert UND Spieler ist
  // unlocked (Browser hat Pointer-Lock bei Tab-Wechsel aufgegeben), zeige
  // Start-Overlay im "resume"-Mode. Ohne diesen Handler fehlte der sichere
  // Re-Entry-Weg nach Cmd+Tab / Alt+Tab.
  const handleTabReturn = () => {
    if (document.hidden) return;
    // Browser könnte Pointer-Lock automatisch aufgegeben haben
    if (!game.player.isLocked() && !game.isUIBlocked()) {
      startOverlay.show(initialStart ? 'start' : 'resume');
    }
  };
  document.addEventListener('visibilitychange', handleTabReturn);
  window.addEventListener('focus', handleTabReturn);

  // Pointer-Lock-Error-Handler: Browser lehnt Request ab (z.B. kurz nach ESC)
  document.addEventListener('pointerlockerror', () => {
    console.warn('[Der Club] Pointer-Lock abgelehnt. Klicke erneut.');
    // Fallback: zeige Overlay, damit User erneut klicken kann
    if (!game.player.isLocked() && !game.isUIBlocked()) {
      startOverlay.show('resume');
    }
  });

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

}

function showBootError(err) {
  console.error('[Der Club] Boot fehlgeschlagen:', err);
  const root = document.getElementById('ui-root') || document.body;
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;inset:0;background:#0a0808;color:#f4e8d0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Georgia,serif;text-align:center;padding:32px;z-index:9999;';
  el.innerHTML = `
    <h1 style="color:#d8b878;font-size:28px;margin:0 0 16px;">Das Spiel kann nicht starten</h1>
    <p style="opacity:0.85;max-width:480px;line-height:1.5;">
      Dein Browser unterstützt vielleicht kein WebGL, oder etwas ist schief gelaufen.
      Bitte aktualisiere die Seite (Cmd/Ctrl + R) oder probiere einen aktuellen Chrome / Firefox / Safari.
    </p>
    <p style="opacity:0.5;font-size:12px;margin-top:24px;">${err?.message ?? err}</p>
    <button onclick="location.reload()" style="margin-top:24px;padding:10px 24px;background:#d8b878;border:none;color:#0a0808;font-size:15px;cursor:pointer;border-radius:2px;">Neu laden</button>
  `;
  root.appendChild(el);
}

boot().catch(showBootError);
