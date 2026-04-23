import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { wouldCollide } from './Collision.js';

// Modul-globale Scratch-Vektoren — vermeiden 120 Allokationen/Sek im Player.update.
const _prevPos = new THREE.Vector3();
const _afterXPos = new THREE.Vector3();

/**
 * Player — First-Person Kamera + WASD-Bewegung + Kollisions-Abfrage.
 *
 * PointerLockControls übernimmt NUR die Mausschau. Bewegung und Kollision
 * implementieren wir selbst.
 */
export class Player {
  constructor(camera, domElement) {
    this.camera = camera;
    this.controls = new PointerLockControls(camera, domElement);
    this.controls.pointerSpeed = 0.6;  // sanftere Mausbewegung (Default = 1.0)
    this.getColliders = () => []; // wird vom Game gesetzt
    this.paused = false;          // Game setzt true wenn UI blockiert

    // Bewegungs-State
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.running = false;

    // Konstanten
    this.walkSpeed = 3.5;    // m/s
    this.runSpeed = 6.0;
    this.damping = 10.0;     // höher = weniger Slide
    this.eyeHeight = 1.6;

    // Kamera auf Augenhöhe
    camera.position.y = this.eyeHeight;

    this._setupKeyboard();
  }

  _setupKeyboard() {
    const onKey = (pressed) => (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    this.moveForward  = pressed; break;
        case 'KeyS': case 'ArrowDown':  this.moveBackward = pressed; break;
        case 'KeyA': case 'ArrowLeft':  this.moveLeft     = pressed; break;
        case 'KeyD': case 'ArrowRight': this.moveRight    = pressed; break;
        case 'ShiftLeft': case 'ShiftRight': this.running = pressed; break;
      }
    };
    document.addEventListener('keydown', onKey(true));
    document.addEventListener('keyup', onKey(false));
  }

  lock() {
    // PointerLockControls.lock() ruft document.body.requestPointerLock() auf,
    // welches in Chromium ein Promise zurückgibt das rejecten kann (z.B.
    // wenn Document nicht fokussiert ist). Wir fangen das damit es nicht als
    // unhandled-rejection als pageerror auftaucht. pointerlockerror-Handler
    // in main.js übernimmt die Recovery (zeigt Start-Overlay).
    try {
      const result = this.controls.lock();
      if (result && typeof result.catch === 'function') {
        result.catch(() => { /* erwartet — Recovery via pointerlockerror-Event */ });
      }
    } catch { /* synchroner Throw — ebenfalls erwartet */ }
  }
  unlock() { this.controls.unlock(); }
  isLocked() { return this.controls.isLocked; }

  onLock(fn) { this.controls.addEventListener('lock', fn); }
  onUnlock(fn) { this.controls.addEventListener('unlock', fn); }

  /**
   * Pro Frame aufrufen. Aktualisiert Position basierend auf velocity.
   * Bewegung nur, wenn Maus gelockt — sonst steht der Spieler still.
   */
  update(delta) {
    if (this.paused || !this.controls.isLocked) {
      // Reset damit Spieler nicht nach Unlock weiterschleicht — auch
      // gehaltenes WASD darf den State nicht durch eine Pause überleben.
      this.velocity.set(0, 0, 0);
      this.moveForward = this.moveBackward = false;
      this.moveLeft = this.moveRight = false;
      return;
    }

    const speed = this.running ? this.runSpeed : this.walkSpeed;

    // Damping (Reibung) — macht Bewegung weich
    this.velocity.x -= this.velocity.x * this.damping * delta;
    this.velocity.z -= this.velocity.z * this.damping * delta;

    // Input zu normalisierter Richtung
    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
    this.direction.normalize();

    // Beschleunigung in Blickrichtung
    const accel = speed * 40.0;
    if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * accel * delta;
    if (this.moveLeft    || this.moveRight)    this.velocity.x -= this.direction.x * accel * delta;

    // Bewegung mit Kollisions-Check: Versuche X und Z getrennt, damit Spieler
    // an Wänden "entlanggleiten" kann statt komplett blockiert zu werden.
    const colliders = this.getColliders();
    _prevPos.copy(this.camera.position);

    this.controls.moveRight(-this.velocity.x * delta);
    if (wouldCollide(this.camera.position, colliders)) {
      this.camera.position.x = _prevPos.x;
      this.camera.position.z = _prevPos.z;
    }

    _afterXPos.copy(this.camera.position);
    this.controls.moveForward(-this.velocity.z * delta);
    if (wouldCollide(this.camera.position, colliders)) {
      this.camera.position.x = _afterXPos.x;
      this.camera.position.z = _afterXPos.z;
    }

    // Kamera bleibt auf Augenhöhe (kein Spring, kein Fallen für jetzt)
    this.camera.position.y = this.eyeHeight;
  }

  get position() {
    return this.camera.position;
  }

  /** Kamera wieder auf Default-Blickrichtung (-Z, horizontal) setzen. */
  resetView() {
    this.camera.rotation.set(0, 0, 0);
    this.camera.quaternion.setFromEuler(this.camera.rotation);
    // PointerLockControls liest direkt camera.rotation — keine weitere Action nötig
  }
}
