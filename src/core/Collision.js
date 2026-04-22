import * as THREE from 'three';

/**
 * Einfache Kollisionsprüfung gegen Array von Box3.
 *
 * Player hat einen "Body" — ein kleines Box3 um seine Position.
 * Wir testen, ob der neue Position-Vektor in irgendeine Collider-Box ragt.
 */
const PLAYER_RADIUS = 0.3; // Horizontaler Radius des Player-Bodys
const PLAYER_HEIGHT = 1.7;

const _bodyBox = new THREE.Box3();
const _min = new THREE.Vector3();
const _max = new THREE.Vector3();

export function wouldCollide(position, colliders) {
  _min.set(
    position.x - PLAYER_RADIUS,
    position.y - PLAYER_HEIGHT * 0.5,
    position.z - PLAYER_RADIUS
  );
  _max.set(
    position.x + PLAYER_RADIUS,
    position.y + PLAYER_HEIGHT * 0.5,
    position.z + PLAYER_RADIUS
  );
  _bodyBox.set(_min, _max);

  for (const box of colliders) {
    if (_bodyBox.intersectsBox(box)) return true;
  }
  return false;
}
