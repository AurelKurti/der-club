import * as THREE from 'three';

/**
 * BaseRoom — Abstrakte Basis für alle 8 Story-Räume.
 *
 * Jeder Raum erstellt sein eigenes Scene-Graph (Licht, Geometrie, Figuren)
 * und eine Liste von Collidern (Box3), an denen der Player nicht durchlaufen kann.
 *
 * Lifecycle:
 *   1. constructor(gameContext) — speichert Referenzen
 *   2. build() — wird beim Betreten aufgerufen, setzt Szene auf
 *   3. update(delta) — pro Frame
 *   4. dispose() — räumt auf beim Wechsel
 */
export class BaseRoom {
  constructor(gameContext) {
    this.ctx = gameContext; // { renderer, camera, player, ui, audio, save }
    this.scene = new THREE.Scene();
    this.colliders = [];       // Array von THREE.Box3
    this.interactables = [];   // Array von { mesh, onInteract, label }
    this.spawnPoint = new THREE.Vector3(0, 1.6, 0);
    this.id = 'base';
    this.name = 'Base Room';
    this.ambientProfile = 'default'; // override pro Raum
    this.floorMaterial = 'stone';    // wood | stone | grass | carpet
  }

  /** Override: Szene aufbauen (Licht, Geometrie, Audio). */
  build() {
    throw new Error(`build() not implemented in room "${this.id}"`);
  }

  /** Override: Per-Frame-Update (Animationen, Partikel). */
  update(_delta) { /* optional */ }

  /** Bounding Box aus Mesh generieren und als Collider registrieren.
   *  Aktualisiert zuerst WorldMatrix durch alle Eltern (kritisch, sonst sind
   *  Collider von Meshes innerhalb von Groups an falscher Position → unsichtbare Wände). */
  addCollider(mesh, shrinkFactor = 1.0) {
    mesh.updateWorldMatrix(true, false); // ensures parent transforms applied
    const box = new THREE.Box3().setFromObject(mesh);
    if (shrinkFactor !== 1.0) {
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3()).multiplyScalar(shrinkFactor);
      box.setFromCenterAndSize(center, size);
    }
    this.colliders.push(box);
    return box;
  }

  /** Interaktives Objekt registrieren (Spieler kann draufklicken / E drücken). */
  addInteractable(mesh, onInteract, label = '') {
    this.interactables.push({ mesh, onInteract, label });
  }

  /** Interactable entfernen — verhindert Phantom-Hints nach Pickup.
   *  Entfernt auch den Mesh sicher aus Scene (auch wenn bereits detached).
   */
  removeInteractable(mesh) {
    const idx = this.interactables.findIndex((i) => i.mesh === mesh);
    if (idx >= 0) this.interactables.splice(idx, 1);
    if (mesh && mesh.parent) mesh.parent.remove(mesh);
  }

  /** Aufräumen: Geometrie + Material freigeben, Event-Listener entfernen. */
  dispose() {
    // Pending setTimeouts canceln (z.B. Mili-Bonus)
    if (this._miliBonusTimer) { clearTimeout(this._miliBonusTimer); this._miliBonusTimer = null; }

    this.scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => {
          Object.values(m).forEach((v) => {
            if (v && typeof v.dispose === 'function') v.dispose();
          });
          m.dispose();
        });
      }
    });
    this.colliders.length = 0;
    this.interactables.length = 0;
  }
}
