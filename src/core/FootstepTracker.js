/**
 * FootstepTracker — löst Footstep-SFX aus, wenn Player sich bewegt.
 *
 * Misst zurückgelegte Distanz. Alle ~1.4m ein Schritt.
 * Material wird vom aktiven Raum gesetzt (AudioManager spielt passenden Sound).
 */
const STRIDE_M = 1.4;

export class FootstepTracker {
  constructor(player, audio) {
    this.player = player;
    this.audio = audio;
    this._lastPos = player.position.clone();
    this._distance = 0;
    this.material = 'stone';
  }

  setMaterial(m) { this.material = m; }

  update() {
    const pos = this.player.position;
    const dx = pos.x - this._lastPos.x;
    const dz = pos.z - this._lastPos.z;
    const d = Math.sqrt(dx * dx + dz * dz);

    if (d > 0.005) {
      this._distance += d;
      this._lastPos.copy(pos);
      if (this._distance >= STRIDE_M) {
        this._distance = 0;
        this.audio.footstep(this.material);
      }
    }
  }
}
