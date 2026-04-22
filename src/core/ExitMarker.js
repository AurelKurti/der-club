import * as THREE from 'three';

/**
 * ExitMarker — wiederverwendbarer Exit-Indikator (Cone + Beam + Ring).
 * Deutlich sichtbar, pulsierend, kommunziert "Hier geht's weiter".
 *
 *   const marker = new ExitMarker(scene, new THREE.Vector3(0, 1.3, 4));
 *   marker.hide();
 *   marker.show();
 *   marker.update(t);   // pro Frame
 *   marker.interactable  // das Mesh für addInteractable()
 */
export class ExitMarker {
  constructor(scene, position, { color = 0xd8b878 } = {}) {
    this.position = position.clone();
    this.group = new THREE.Group();

    // Hauptkegel (interactable) — grösser + dramatischer
    const coneMat = new THREE.MeshStandardMaterial({
      color,
      emissive: new THREE.Color(color).multiplyScalar(0.4),
      emissiveIntensity: 1.2
    });
    this.cone = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.0, 8), coneMat);
    this.cone.position.set(0, 0.5, 0);
    this.group.add(this.cone);

    // Lichtstrahl (halbtransparenter Zylinder nach oben)
    const beamMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 8, 16, 1, true),
      beamMat
    );
    this.beam.position.set(0, 4.5, 0);
    this.group.add(this.beam);

    // Boden-Ring (rotiert, macht Stelle unübersehbar)
    const ringMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.ring = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.7, 32), ringMat);
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.position.y = 0.02;
    this.group.add(this.ring);

    // Akzent-Punktlicht
    this.light = new THREE.PointLight(color, 1.2, 4);
    this.light.position.set(0, 0.8, 0);
    this.group.add(this.light);

    this.group.position.copy(position);
    this.group.visible = false;
    scene.add(this.group);

    // Cone ist der Klick-Target für Raycaster
    this.interactable = this.cone;
  }

  show() { this.group.visible = true; }
  hide() { this.group.visible = false; }
  get visible() { return this.group.visible; }

  update(tSec) {
    if (!this.group.visible) return;
    this.cone.position.y = 0.5 + Math.sin(tSec * 2) * 0.15;
    this.cone.rotation.y += 0.02;
    this.ring.rotation.z += 0.008;
    this.ring.material.opacity = 0.4 + Math.sin(tSec * 2) * 0.3;
    this.light.intensity = 1.0 + Math.sin(tSec * 2) * 0.3;
  }

  dispose() {
    this.group.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
  }
}
