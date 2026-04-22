import * as THREE from 'three';
import { Player } from './Player.js';
import { SceneManager } from './SceneManager.js';
import { InteractionSystem } from './InteractionSystem.js';
import { SaveManager } from './SaveManager.js';
import { Dialog } from '../ui/Dialog.js';
import { Inventory } from '../ui/Inventory.js';
import { Diary } from '../ui/Diary.js';
import { Toast } from '../ui/Toast.js';
import { ObjectiveTracker } from '../ui/ObjectiveTracker.js';
import { AudioManager } from './AudioManager.js';
import { FootstepTracker } from './FootstepTracker.js';

/**
 * Game — Zentraler Orchestrator.
 */
export class Game {
  constructor({ canvas, uiRoot }) {
    this.canvas = canvas;
    this.uiRoot = uiRoot;

    this._initRenderer();
    this._initCamera();
    this._initPlayer();
    this._initUI();
    this._initSystems();
    this._initSceneManager();
    this._initLoop();
    this._initResize();
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
  }

  _initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
  }

  _initPlayer() {
    // WICHTIG: Canvas als Pointer-Lock-Target (nicht document.body),
    // damit PointerLockControls.isLocked korrekt reflektiert wird.
    this.player = new Player(this.camera, this.canvas);
  }

  _initUI() {
    this.audio = new AudioManager();
    this.save = new SaveManager();
    this.dialog = new Dialog(this.audio, this.player);
    this.inventory = new Inventory(this.audio, this.save);
    this.diary = new Diary(this.save);
    this.toast = new Toast();
    this.objective = new ObjectiveTracker();

    // Toast bei neuem Tagebuch-Eintrag
    this.save.onDiaryChange((entry) => {
      this.toast.show(`📔 Neuer Tagebuch-Eintrag: «${entry.title}» — drücke T`);
    });
  }

  _initSystems() {
    this.interaction = new InteractionSystem(
      this.camera,
      () => this.sceneManager?.getInteractables() ?? [],
      () => this.isUIBlocked()
    );
    this.footsteps = new FootstepTracker(this.player, this.audio);
  }

  /** True wenn Dialog/Tagebuch/Mini-Game offen — Interaktionen blockiert. */
  isUIBlocked() {
    return !!this.activeMiniGame
        || this.dialog?.isOpen()
        || this.diary?.isOpen()
        || !!document.querySelector('.credits-overlay')
        || !!document.querySelector('.trigger-warning:not(.hidden)');
  }

  /** Callback für UI, die User zum Re-Engage auffordern muss. */
  onResumeNeeded(fn) { this._onResumeNeeded = fn; }
  _triggerResume() {
    if (!this.player.isLocked() && !this.isUIBlocked()) {
      this._onResumeNeeded?.();
    }
  }

  _initSceneManager() {
    this.sceneManager = new SceneManager({
      renderer: this.renderer,
      camera: this.camera,
      player: this.player,
      dialog: this.dialog,
      inventory: this.inventory,
      diary: this.diary,
      save: this.save,
      audio: this.audio,
      footsteps: this.footsteps,
      toast: this.toast,
      objective: this.objective,
      game: this
    });
    this.player.getColliders = () => this.sceneManager.getColliders();
  }

  _initLoop() {
    this.clock = new THREE.Clock();
    this._tick = this._tick.bind(this);
  }

  _initResize() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  start() {
    this._tick();
  }

  _tick() {
    const delta = Math.min(this.clock.getDelta(), 0.1);

    const uiBlocked = this.isUIBlocked();
    this.player.paused = uiBlocked;

    if (this.activeMiniGame) {
      this.activeMiniGame.update(delta);
      this.interaction.hintEl?.classList.add('hidden');
    } else if (uiBlocked) {
      // Dialog/Tagebuch: alles eingefroren, Hint versteckt
      this.player.update(delta); // respektiert paused → bleibt stehen
      this.interaction.hintEl?.classList.add('hidden');
    } else {
      this.player.update(delta);
      this.interaction.update();
      this.footsteps.update();
    }

    this.sceneManager.update(delta);

    const scene = this.sceneManager.getActiveScene();
    if (scene) this.renderer.render(scene, this.camera);
    requestAnimationFrame(this._tick);
  }

  async enterRoom(room, transitionText = null) {
    return this.sceneManager.enterRoom(room, transitionText);
  }

  /**
   * Mini-Game starten. Sperrt Player-Bewegung, zeigt Overlay,
   * wartet auf 'won' | 'skipped' | 'failed'.
   */
  async startMiniGame(minigame) {
    // Double-invoke-Schutz — verhindert zwei Mini-Game-Overlays gleichzeitig
    if (this.activeMiniGame) {
      console.warn('[Game] Mini-Game already active, ignoring new startMiniGame call');
      return 'skipped';
    }
    this.activeMiniGame = minigame;
    if (this.player.isLocked()) this.player.unlock();
    const result = await minigame.run();
    this.activeMiniGame = null;
    // KEIN _triggerResume() hier — sonst zeigt Start-Overlay mitten in
    // Room-Folge-Dialogen auf. Das Overlay wird erst nach dem LETZTEN Dialog
    // via Dialog.onClose → resumeIfIdle getriggert (sauber orchestriert).
    return result;
  }
}
