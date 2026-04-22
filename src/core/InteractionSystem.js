import * as THREE from 'three';

/**
 * InteractionSystem — Raycaster aus Kamera-Mitte.
 *
 * Pro Frame: prüft was vor dem Spieler ist. Wenn ein Interactable
 * in Reichweite: blendet Hint "Drücke E" ein. Bei E-Druck: trigger onInteract.
 */
const MAX_REACH = 3.0; // Meter

export class InteractionSystem {
  constructor(camera, getInteractables, isUIBlocked = () => false) {
    this.camera = camera;
    this.getInteractables = getInteractables;
    this.isUIBlocked = isUIBlocked;

    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = MAX_REACH;

    this.hovered = null;
    this._interactLock = false; // verhindert Doppel-Trigger bei async onInteract

    this.hintEl = document.createElement('div');
    this.hintEl.className = 'interact-hint hidden';
    this.hintEl.innerHTML = '<kbd>E</kbd> <span class="label"></span>';
    document.getElementById('ui-root').appendChild(this.hintEl);
    this.hintLabel = this.hintEl.querySelector('.label');

    document.addEventListener('keydown', (e) => {
      if (e.code !== 'KeyE' || e.repeat) return;
      this._tryInteract();
    });

    document.addEventListener('click', () => {
      if (!document.pointerLockElement) return;
      this._tryInteract();
    });
  }

  async _tryInteract() {
    if (this._interactLock) return;
    if (this.isUIBlocked()) return;
    if (!this.hovered) return;
    const target = this.hovered;
    this._interactLock = true;
    try {
      await target.onInteract();
    } catch (err) {
      console.error('[InteractionSystem] onInteract failed:', err);
    } finally {
      this._interactLock = false;
    }
  }

  update() {
    const interactables = this.getInteractables();

    // Vorheriges Hover-Target aus Highlight-Scale zurücksetzen
    if (this.hovered && this.hovered.mesh && this.hovered.mesh.userData._origScale) {
      this.hovered.mesh.scale.copy(this.hovered.mesh.userData._origScale);
    }
    this.hovered = null;

    if (interactables.length === 0) {
      this.hintEl.classList.add('hidden');
      return;
    }

    this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
    const meshes = interactables.map((i) => i.mesh).filter(Boolean);
    const hits = this.raycaster.intersectObjects(meshes, true);

    if (hits.length > 0) {
      const rootMesh = this._findRootInteractable(hits[0].object, interactables);
      if (rootMesh) {
        this.hovered = rootMesh;
        this.hintLabel.textContent = rootMesh.label || 'Interagieren';
        this.hintEl.classList.remove('hidden');
        // Highlight: 8 % Scale-Up für visuelles Feedback
        if (rootMesh.mesh) {
          if (!rootMesh.mesh.userData._origScale) {
            rootMesh.mesh.userData._origScale = rootMesh.mesh.scale.clone();
          }
          rootMesh.mesh.scale.copy(rootMesh.mesh.userData._origScale).multiplyScalar(1.08);
        }
        return;
      }
    }
    this.hintEl.classList.add('hidden');
  }

  _findRootInteractable(hitObj, interactables) {
    let current = hitObj;
    while (current) {
      const match = interactables.find((i) => i.mesh === current);
      if (match) return match;
      current = current.parent;
    }
    return null;
  }
}
