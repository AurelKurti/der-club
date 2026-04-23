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

    // Vorheriges Hover-Target zurücksetzen: Scale + Emissive
    if (this.hovered && this.hovered.mesh) {
      const m = this.hovered.mesh;
      if (m.userData._origScale) m.scale.copy(m.userData._origScale);
      if (m.userData._origEmissive !== undefined && m.material?.emissiveIntensity !== undefined) {
        m.material.emissiveIntensity = m.userData._origEmissive;
      }
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
        // Highlight: Scale + Emissive-Bump (Scale allein reicht nicht bei
        // organischen Shapes oder Silhouetten — Emissive-Bump macht es klar).
        if (rootMesh.mesh) {
          const m = rootMesh.mesh;
          if (!m.userData._origScale) m.userData._origScale = m.scale.clone();
          m.scale.copy(m.userData._origScale).multiplyScalar(1.08);
          if (m.material?.emissiveIntensity !== undefined) {
            if (m.userData._origEmissive === undefined) {
              m.userData._origEmissive = m.material.emissiveIntensity;
            }
            m.material.emissiveIntensity = m.userData._origEmissive + 0.4;
          }
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
