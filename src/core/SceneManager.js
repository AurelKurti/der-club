/**
 * SceneManager — orchestriert Raum-Wechsel.
 *
 * Hält Referenz auf aktuellen Raum, rendert dessen Scene,
 * managed Transition (Fade-to-Black + Text).
 */
export class SceneManager {
  constructor(gameContext) {
    this.ctx = gameContext;
    this.currentRoom = null;
    this.fadeOverlay = this._createFadeOverlay();
  }

  _createFadeOverlay() {
    const el = document.createElement('div');
    el.className = 'fade-overlay';
    document.getElementById('ui-root').appendChild(el);
    return el;
  }

  /**
   * Zu neuem Raum wechseln.
   * @param {BaseRoom} newRoom — Instanz des Ziel-Raums
   * @param {string} transitionText — optional: Zeit-Bridge-Text
   */
  async enterRoom(newRoom, transitionText = null) {
    // Reentrancy-Guard: doppelter onExit-Trigger während der 2.5s-Fade würde
    // sonst den vorherigen Raum zweimal disposen.
    if (this._transitioning) return;
    this._transitioning = true;
    try {
      if (this.currentRoom) {
        await this._fadeOut(transitionText);
        this.currentRoom.dispose();
      }

      newRoom.build();
      this.currentRoom = newRoom;

    // Player an Spawnpoint setzen + Blickrichtung zurücksetzen (-Z)
    this.ctx.player.position.copy(newRoom.spawnPoint);
    this.ctx.player.resetView?.();

    // Audio-Kontext: Ambient + Footstep-Material
    if (this.ctx.audio) {
      this.ctx.audio.startAmbient(newRoom.ambientProfile || 'default');
    }
    if (this.ctx.footsteps) {
      this.ctx.footsteps.setMaterial(newRoom.floorMaterial || 'stone');
    }

      // Save-Hook
      this.ctx.save?.setCurrentRoom(newRoom.id);

      await this._fadeIn();
    } finally {
      this._transitioning = false;
    }
  }

  update(delta) {
    if (this.currentRoom) {
      this.currentRoom.update(delta);
    }
  }

  getActiveScene() {
    return this.currentRoom?.scene;
  }

  getColliders() {
    return this.currentRoom?.colliders ?? [];
  }

  getInteractables() {
    return this.currentRoom?.interactables ?? [];
  }

  _fadeOut(text) {
    return new Promise((resolve) => {
      this.fadeOverlay.classList.add('active');
      if (text) {
        this.fadeOverlay.innerHTML = `<p class="transition-text">${text}</p>`;
      }
      setTimeout(resolve, text ? 2500 : 500);
    });
  }

  _fadeIn() {
    return new Promise((resolve) => {
      this.fadeOverlay.classList.remove('active');
      this.fadeOverlay.innerHTML = '';
      setTimeout(resolve, 500);
    });
  }
}
