import * as THREE from 'three';
import { BaseRoom } from '../core/BaseRoom.js';
import { Silhouette } from '../core/Silhouette.js';
import { CHAR } from '../data/characters.js';
import { addMili, registerMiliInteraction } from '../core/Collectible.js';

/**
 * Raum 4 — Pitt Club (Jesus Lane, Cambridge) — STUB
 *
 * Quelle: Teil 2, Kap. 16 (Säule) + Kap. 19 (Aufnahme)
 * Stub für Tag 11 — wird mit weiteren Interaktionen in Woche 2 ausgebaut.
 */
export class PittClub extends BaseRoom {
  constructor(ctx) {
    super(ctx);
    this.id = 'pitt-club';
    this.name = 'Pitt Club, Jesus Lane';
    this.spawnPoint.set(0, 1.6, 12);
    this.ambientProfile = 'street';
    this.floorMaterial = 'stone';

    this._silhouettes = [];
  }

  build() {
    const { scene } = this;
    scene.background = new THREE.Color(0x050508);
    scene.fog = new THREE.FogExp2(0x050508, 0.02);

    this._buildGround(scene);
    this._buildFacade(scene);
    this._buildStreet(scene);
    this._buildLighting(scene);
    this._buildAngus(scene);
    this._buildExit(scene);

    // Mili auf Strassenpflaster neben der Laterne
    this._miliRef = addMili(scene, new THREE.Vector3(-6.5, 0.3, 6), this.id, this.ctx);
    registerMiliInteraction(this, this._miliRef, this.id);

    this.ctx.objective.set('Berühre die markierte Säule der Pitt-Club-Fassade.');
  }

  _buildGround(scene) {
    const street = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 40),
      new THREE.MeshStandardMaterial({ color: 0x181410, roughness: 0.95 })
    );
    street.rotation.x = -Math.PI / 2;
    street.receiveShadow = true;
    scene.add(street);
  }

  _buildFacade(scene) {
    const facadeMat = new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.5 });

    // Hauptfassade
    const wall = new THREE.Mesh(new THREE.BoxGeometry(16, 8, 1), facadeMat);
    wall.position.set(0, 4, -4);
    wall.castShadow = true;
    wall.receiveShadow = true;
    scene.add(wall);
    this.addCollider(wall);

    // 6 ionische Säulen
    const columnMat = new THREE.MeshStandardMaterial({
      color: 0xf0e4c8,
      roughness: 0.4,
      emissive: 0x1a1408,
      emissiveIntensity: 0.1
    });
    const columnPositions = [-5, -3, -1, 1, 3, 5];
    columnPositions.forEach((x) => {
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.4, 6, 16),
        columnMat
      );
      shaft.position.set(x, 3, -2.5);
      shaft.castShadow = true;
      shaft.receiveShadow = true;
      scene.add(shaft);
      this.addCollider(shaft);

      // Kapitell
      const capital = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.3, 0.9),
        columnMat
      );
      capital.position.set(x, 6.15, -2.5);
      scene.add(capital);

      // Basis
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.2, 0.8),
        columnMat
      );
      base.position.set(x, 0.1, -2.5);
      scene.add(base);
    });

    // Pediment (dreieckiger Giebel angedeutet)
    const pedimentMat = new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.5 });
    const pedimentShape = new THREE.Shape();
    pedimentShape.moveTo(-6, 0);
    pedimentShape.lineTo(6, 0);
    pedimentShape.lineTo(0, 2.5);
    pedimentShape.lineTo(-6, 0);
    const pedimentGeo = new THREE.ExtrudeGeometry(pedimentShape, {
      depth: 0.6,
      bevelEnabled: false
    });
    const pediment = new THREE.Mesh(pedimentGeo, pedimentMat);
    pediment.position.set(0, 6.5, -3.1);
    pediment.castShadow = true;
    scene.add(pediment);

    // Runde Plakette im Giebel mit Schmetterling — subtil etabliert das Motiv
    const plaqueBackMat = new THREE.MeshStandardMaterial({
      color: 0xc8b888,
      emissive: 0x403020,
      emissiveIntensity: 0.3
    });
    const plaqueBack = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24), plaqueBackMat);
    plaqueBack.position.set(0, 7.3, -2.48);
    scene.add(plaqueBack);

    // Schmetterling-Sprite in der Plakette
    const btex = _makeSmallButterflyTexture();
    const plaqueButterfly = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.5),
      new THREE.MeshBasicMaterial({ map: btex, transparent: true })
    );
    plaqueButterfly.position.set(0, 7.3, -2.46);
    scene.add(plaqueButterfly);

    // Tür
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 2.6, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x2a1610, roughness: 0.9 })
    );
    door.position.set(0, 1.3, -2.0);
    scene.add(door);

    this._doorRef = door;
  }

  _buildStreet(scene) {
    // Kopfsteinpflaster-Andeutung via dunklere Planes
    // Strassenlaterne (einzeln, am Rand)
    const postMat = new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 0.95 });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 3.5, 8), postMat);
    post.position.set(-6, 1.75, 8);
    scene.add(post);

    const lantern = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.35, 0.25),
      new THREE.MeshBasicMaterial({ color: 0xffc080 })
    );
    lantern.position.set(-6, 3.7, 8);
    scene.add(lantern);

    const lamplight = new THREE.PointLight(0xffb060, 0.8, 10);
    lamplight.position.set(-6, 3.7, 8);
    scene.add(lamplight);

    // Zweite Laterne
    const post2 = post.clone();
    post2.position.set(6, 1.75, 8);
    scene.add(post2);
    const lantern2 = lantern.clone();
    lantern2.position.set(6, 3.7, 8);
    scene.add(lantern2);
    const lamplight2 = lamplight.clone();
    lamplight2.position.set(6, 3.7, 8);
    scene.add(lamplight2);
  }

  _buildLighting(scene) {
    scene.add(new THREE.AmbientLight(0x4a5868, 0.6));
    scene.add(new THREE.HemisphereLight(0x8898b8, 0x303040, 0.4));

    // Kaltes Mondlicht
    const moon = new THREE.DirectionalLight(0x8898b8, 0.8);
    moon.position.set(-5, 12, 8);
    moon.castShadow = true;
    moon.shadow.mapSize.width = 1024;
    moon.shadow.mapSize.height = 1024;
    moon.shadow.camera.left = -15;
    moon.shadow.camera.right = 15;
    moon.shadow.camera.top = 15;
    moon.shadow.camera.bottom = -15;
    scene.add(moon);

    // Fassaden-Spot (als würde Laterne darauf scheinen)
    const spot = new THREE.SpotLight(0xffe0b0, 2.5, 25, Math.PI / 4, 0.5);
    spot.position.set(0, 10, 6);
    spot.target.position.set(0, 3, -3);
    scene.add(spot);
    scene.add(spot.target);
  }

  _buildAngus(scene) {
    const angus = new Silhouette({
      profile: CHAR.angus.profile,
      color: CHAR.angus.color,
      height: 1.84,
      width: 0.62
    });
    angus.position.set(0, 0.92, -0.5); // vor der Tür
    scene.add(angus);
    this._silhouettes.push(angus);

    let angusTalked = false;
    this.addInteractable(angus, async () => {
      if (!this._colonnadeTouched) {
        await this.ctx.dialog.show('Angus Farewell steht reglos vor der Tür. Ich sollte erst die Säule berühren.');
        return;
      }
      if (angusTalked) {
        await this.ctx.dialog.show('Angus nickt mir zu. Es ist genug gesagt worden.');
        return;
      }
      angusTalked = true;
      await this.ctx.dialog.show(CHAR.angus.pittclub);
      this.ctx.inventory.add({ id: 'pitt-fliege' });
      // Zweite Dialog-Szene: väterlicher Angus zeigt Familienfoto (setzt Doppelrolle)
      await this.ctx.dialog.show([
        { text: 'Angus zog ein kleines Lederetui aus der Brusttasche.' },
        { text: 'Darin: ein verblichenes Foto einer Familie — er, eine blonde Frau, ein kleines Mädchen.' },
        { speaker: 'Angus', text: '«Das ist meine Charlotte. Sie ist das Einzige, was mir geblieben ist.»' },
        { speaker: 'Angus', text: '«Pass auf sie auf, Hans. Bitte.»' },
        { text: 'Ich nickte. Ich wusste noch nicht, dass er der Mann war, den Alex vor vierzig Jahren mir gezeigt hatte.' }
      ]);
      this.ctx.save.addDiaryEntry({
        room: this.id,
        title: 'Pitt Club, Nacht',
        text: 'Angus hat mir die Fliege umgebunden. Innen ein kleiner gelber Schmetterling — das geheime Zeichen. Ich gehöre jetzt zu ihnen. Er bat mich, auf Charlotte aufzupassen, als wäre er ein Vater. Ich spürte Ekel.'
      });
      if (this._exitCone) this._exitCone.visible = true;
      this.ctx.objective.done('Aufnahme in den Pitt Club', 'Folge dem goldenen Licht.');
    }, 'Angus Farewell');
  }

  _buildExit(scene) {
    // Eine zentrale Säule wird als Haupt-Interaktion markiert
    // (wir nutzen die mittlere der 6 — bei Index 2, x = -1)
    const marker = new THREE.Mesh(
      new THREE.RingGeometry(0.55, 0.65, 32),
      new THREE.MeshBasicMaterial({
        color: 0xd8b878,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    marker.position.set(-1, 0.01, -2.5);
    marker.rotation.x = -Math.PI / 2;
    scene.add(marker);
    this._columnMarker = marker;

    // Transparente Klick-Box vor der linken Mittelsäule
    const triggerMat = new THREE.MeshBasicMaterial({ visible: false });
    const trigger = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3, 0.8), triggerMat);
    trigger.position.set(-1, 1.5, -2.5);
    scene.add(trigger);

    let touched = false;
    this.addInteractable(trigger, async () => {
      if (touched) return;
      touched = true;
      await this.ctx.dialog.show([
        { text: 'Die Säule ist kalt unter meiner Hand.' },
        { text: 'Ich wusste in diesem Moment: ich wollte dazugehören.' }
      ]);
      this._colonnadeTouched = true;
      this.removeInteractable(trigger);
      scene.remove(marker);
      if (this._silhouettes[0]) {
        this._silhouettes[0].material.color.setHex(0x5a4028);
      }
      this.ctx.objective.set('Sprich mit Angus Farewell vor der Tür.');
    }, 'Die Säule berühren');

    // Ausgangs-Cone ist selbst klickbar (kein separater Trigger)
    // Position so, dass Cone im -Z Blickfeld vom Spawn (0,1.6,12) ist
    const coneMat = new THREE.MeshStandardMaterial({
      color: 0xd8b878,
      emissive: 0x8a6020,
      emissiveIntensity: 0.9
    });
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.9, 8), coneMat);
    cone.position.set(3, 1.3, 8);   // vor Spieler-Blickrichtung, seitlich
    cone.visible = false;
    scene.add(cone);
    this._exitCone = cone;

    this.addInteractable(cone, async () => {
      if (!this.ctx.inventory.has('pitt-fliege')) {
        await this.ctx.dialog.show('Ich bin noch nicht fertig hier. Angus wartet.');
        return;
      }
      this.onExit?.();
    }, 'Weiter');
  }

  update(_delta) {
    this._silhouettes.forEach((s) => s.faceCamera(this.ctx.camera));

    // Ring pulsiert (Säule-Marker)
    const t = performance.now() * 0.001;
    if (this._columnMarker) {
      this._columnMarker.material.opacity = 0.4 + Math.sin(t * 2) * 0.2;
    }
    if (this._exitCone && this._exitCone.visible) {
      this._exitCone.position.y = 1.3 + Math.sin(t * 2) * 0.12;
      this._exitCone.rotation.y += 0.01;
    }
    if (this._miliRef?.userData._update) this._miliRef.userData._update(t);
  }
}

// Kleine Schmetterling-Textur für Giebel-Plakette (Pitt-Club-Zeichen)
function _makeSmallButterflyTexture() {
  const c = document.createElement('canvas');
  c.width = 96;
  c.height = 64;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#2a1a0a';
  ctx.fillRect(46, 18, 4, 32);
  ctx.fillStyle = '#3a2618';
  ctx.beginPath();
  ctx.ellipse(32, 24, 16, 10, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(64, 24, 16, 10, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(36, 42, 12, 7, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(60, 42, 12, 7, 0.1, 0, Math.PI * 2);
  ctx.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
