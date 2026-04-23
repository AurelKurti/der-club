import * as THREE from 'three';
import { BaseRoom } from '../core/BaseRoom.js';
import { Silhouette } from '../core/Silhouette.js';
import { CHAR } from '../data/characters.js';
import { addMili, registerMiliInteraction } from '../core/Collectible.js';

/**
 * Raum 5 — Manor House Somerset (Charlottes Familiensitz)
 *
 * Quelle: Teil 2, Kap. 24
 * Ziel: Charlotte etablieren, Liebesnacht andeuten, Standuhr ohne Zeiger
 *       als Symbol, Mutter-Kette weitergeben.
 */
export class ManorHouse extends BaseRoom {
  constructor(ctx) {
    super(ctx);
    this.id = 'manor';
    this.name = 'Manor House, Somerset';
    this.spawnPoint.set(0, 1.6, 6);
    this.ambientProfile = 'manor';
    this.floorMaterial = 'wood';
    this._silhouettes = [];
  }

  build() {
    const { scene } = this;
    scene.background = new THREE.Color(0x0a0c0e);
    scene.fog = new THREE.FogExp2(0x0a0c0e, 0.025);

    this._buildFloor(scene);
    this._buildWalls(scene);
    this._buildCoveredFurniture(scene);
    this._buildStandingClock(scene);
    this._buildSleepingBags(scene);
    this._buildPhotoFrame(scene);
    this._buildLighting(scene);
    this._buildProps(scene);
    this._buildCharlotte(scene);
    this._buildCharlotteTraumaEvidence(scene);
    this._buildExit(scene);

    // Mili auf der verhüllten Truhe
    this._miliRef = addMili(scene, new THREE.Vector3(-4, 1.7, 4), this.id, this.ctx);
    registerMiliInteraction(this, this._miliRef, this.id);

    this.ctx.objective.set('Charlotte wartet. Draussen ist Nebel, drinnen nur sie.');
  }

  _buildCharlotteTraumaEvidence(scene) {
    // Ein Briefumschlag und gefaltetes Arztpapier auf der Truhe
    // (neben den Schlafsäcken) — macht Charlottes Trauma explizit
    const umschlagMat = new THREE.MeshStandardMaterial({
      color: 0xf0e8d8,
      roughness: 0.8
    });
    const umschlag = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.02, 0.18), umschlagMat);
    umschlag.position.set(-4, 1.62, 4);
    umschlag.castShadow = true;
    scene.add(umschlag);

    // Kleines gelbes Wachssiegel
    const siegelMat = new THREE.MeshStandardMaterial({
      color: 0xd8b040,
      emissive: 0x604020,
      emissiveIntensity: 0.5,
      roughness: 0.4
    });
    const siegel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.012, 16),
      siegelMat
    );
    siegel.position.set(-4, 1.64, 4);
    scene.add(siegel);

    let briefRead = false;
    this.addInteractable(umschlag, async () => {
      if (briefRead) return;
      briefRead = true;
      await this.ctx.dialog.show([
        { text: 'Ein Briefumschlag. Auf der Rückseite ein gelbes Wachssiegel -  ein Schmetterling.' },
        { text: 'Die Schrift auf dem Kuvert: «Charlotte Farewell.»' },
        { text: 'Innen liegt ein medizinisches Gutachten. Datum: vor vier Jahren.' },
        { speaker: 'Charlotte', text: '«Das habe ich niemandem gezeigt. Nicht einmal meinem Vater.»' },
        { text: 'Ich lese, was der Arzt geschrieben hat -  dann lege ich den Bericht zurück.' },
        { text: 'Die Worte auf dem Papier sind klinisch. Was sie bedeuten, ist das Gegenteil.' }
      ]);
      this.ctx.inventory.add({ id: 'brief' });
      this.ctx.inventory.add({ id: 'arztbericht' });
      this.ctx.save.addDiaryEntry({
        room: this.id,
        title: 'Charlottes Brief',
        text: 'Vier Jahre ein Brief in einer Schublade. Vier Jahre ein Arztbericht. Sie hat nie einen Namen genannt. Ich habe auch keinen genannt. Wir schliefen in zwei Schlafsäcken und froren.'
      });
    }, 'Brief mit Wachssiegel');
  }

  _buildFloor(scene) {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 18),
      new THREE.MeshStandardMaterial({ color: 0x3a2e22, roughness: 0.85 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
  }

  _buildWalls(scene) {
    // Hohe Decken (5m) — bewusst klösterlich kalt
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xb8a890, roughness: 0.85 });
    const walls = [
      { pos: [0, 2.5, -9],  size: [14, 5, 0.3] },
      { pos: [0, 2.5, 9],   size: [14, 5, 0.3] },
      { pos: [-7, 2.5, 0],  size: [0.3, 5, 18] },
      { pos: [7, 2.5, 0],   size: [0.3, 5, 18] }
    ];
    walls.forEach(({ pos, size }) => {
      const w = new THREE.Mesh(new THREE.BoxGeometry(...size), wallMat);
      w.position.set(...pos);
      w.receiveShadow = true;
      w.castShadow = true;
      scene.add(w);
      this.addCollider(w);
    });

    // Decke
    const ceil = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 18),
      new THREE.MeshStandardMaterial({ color: 0x2a2218, roughness: 0.95 })
    );
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = 5;
    scene.add(ceil);
  }

  _buildCoveredFurniture(scene) {
    // Verhüllte Möbel: weisse Leintücher über Box-Geometrien
    const sheetMat = new THREE.MeshStandardMaterial({
      color: 0xe8e0d0,
      roughness: 0.9,
      emissive: 0x1a1a18,
      emissiveIntensity: 0.1
    });

    const positions = [
      { pos: [-4, 0.8, -5], size: [2.2, 1.6, 1.0] },  // Sofa
      { pos: [4, 0.6, -5],  size: [1.6, 1.2, 1.6] },  // Sessel
      { pos: [-4, 0.8, 4],  size: [2.4, 1.6, 0.8] },  // Truhe
      { pos: [3.5, 0.5, 5], size: [1.2, 1, 1.2] }     // Hocker
    ];
    positions.forEach(({ pos, size }) => {
      const obj = new THREE.Mesh(new THREE.BoxGeometry(...size), sheetMat);
      obj.position.set(...pos);
      obj.castShadow = true;
      obj.receiveShadow = true;
      scene.add(obj);
      this.addCollider(obj);
    });
  }

  _buildStandingClock(scene) {
    // Standuhr OHNE ZEIGER — zentrales Symbol
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x3a2814, roughness: 0.8 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.6, 0.4), frameMat);
    body.position.set(-6.6, 1.3, 0);
    body.castShadow = true;
    scene.add(body);
    this.addCollider(body);

    // Zifferblatt (weiss, emissive, ohne Zeiger)
    const faceMat = new THREE.MeshStandardMaterial({
      color: 0xf0e8d8,
      emissive: 0x8a7868,
      emissiveIntensity: 0.4
    });
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.28, 24), faceMat);
    face.position.set(-6.39, 2.2, 0);
    face.rotation.y = Math.PI / 2;
    scene.add(face);

    // Ziffern-Striche (12 kurze Linien am Ring)
    const markMat = new THREE.MeshBasicMaterial({ color: 0x1a0e08 });
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const mark = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, 0.02), markMat);
      mark.position.set(
        -6.37,
        2.2 + Math.cos(angle) * 0.22,
        Math.sin(angle) * 0.22
      );
      scene.add(mark);
    }

    // Zeiger FEHLEN absichtlich — wichtig für Symbol "Zeit bleibt stehen"
    this._clockRef = body;

    this.addInteractable(body, async () => {
      await this.ctx.dialog.show([
        { text: 'Eine Standuhr ohne Zeiger.' },
        { text: 'In diesem Haus läuft keine Zeit mehr.' }
      ]);
    }, 'Standuhr');
  }

  _buildSleepingBags(scene) {
    // Zwei dünne Daunenschlafsäcke nebeneinander auf dem Boden
    const bagMat1 = new THREE.MeshStandardMaterial({ color: 0x4a3c28, roughness: 0.95 });
    const bagMat2 = new THREE.MeshStandardMaterial({ color: 0x3a2e1c, roughness: 0.95 });

    const bag1 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, 1.9), bagMat1);
    bag1.position.set(-0.45, 0.12, 0);
    bag1.castShadow = true;
    scene.add(bag1);

    const bag2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, 1.9), bagMat2);
    bag2.position.set(0.45, 0.12, 0);
    bag2.castShadow = true;
    scene.add(bag2);

    // Kerze dazwischen, als einzige Wärmequelle
    const candle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, 0.2, 8),
      new THREE.MeshStandardMaterial({ color: 0xe8e0c0, roughness: 0.6 })
    );
    candle.position.set(0, 0.12, -1.2);
    scene.add(candle);

    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffc080 })
    );
    flame.position.set(0, 0.26, -1.2);
    scene.add(flame);

    const candleLight = new THREE.PointLight(0xffa060, 1.0, 4);
    candleLight.position.set(0, 0.3, -1.2);
    scene.add(candleLight);
    this._candleLight = candleLight;
  }

  _buildPhotoFrame(scene) {
    // Silberrahmen-Foto von Charlotte als Kind — Setup für Finale-Raum
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xc8c8c8,
      metalness: 0.7,
      roughness: 0.3
    });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.05), frameMat);
    frame.position.set(-4, 1.2, -4.5);

    // Foto-Plane (Canvas-Textur schemenhaft Familie)
    const photoTex = _makeFamilyPhotoTexture();
    const photo = new THREE.Mesh(
      new THREE.PlaneGeometry(0.24, 0.32),
      new THREE.MeshBasicMaterial({ map: photoTex })
    );
    photo.position.set(-4, 1.2, -4.47);
    scene.add(frame);
    scene.add(photo);
    this._photoRef = frame;

    this.addInteractable(frame, async () => {
      await this.ctx.dialog.show([
        { text: 'Ein silberner Rahmen mit einem Foto.' },
        { text: 'Angus, eine blonde Frau und ein kleines Mädchen. Charlotte, vielleicht sechs.' },
        { text: 'Charlotte als Kind.' }
      ]);
    }, 'Silberrahmen');
  }

  _buildLighting(scene) {
    scene.add(new THREE.AmbientLight(0x506a8a, 0.6));
    scene.add(new THREE.HemisphereLight(0x9cb0cc, 0x303040, 0.4));

    // Kaltes Mondlicht
    const moon = new THREE.DirectionalLight(0x9cb0cc, 0.8);
    moon.position.set(5, 10, 5);
    scene.add(moon);
  }

  _buildCharlotte(scene) {
    const charlotte = new Silhouette({
      profile: CHAR.charlotte.profile,
      color: CHAR.charlotte.color,
      tint: CHAR.charlotte.tint,
      height: 1.72,
      width: 0.5
    });
    charlotte.position.set(0.45, 0.86, 0); // im zweiten Schlafsack
    scene.add(charlotte);
    this._silhouettes.push(charlotte);

    let charlotteTalked = false;
    this.addInteractable(charlotte, async () => {
      if (charlotteTalked) {
        await this.ctx.dialog.show('Charlotte schläft. Ich wecke sie nicht.');
        return;
      }
      charlotteTalked = true;
      await this.ctx.dialog.show(CHAR.charlotte.somerset);
      // Kette bekommt Hans hier - die Übergabe an Charlotte folgt erst
      // im Buch auf dem Dach vor dem Boxkampf (Kap. 33).
      this.ctx.inventory.add({ id: 'kette' });
      this.ctx.save.addDiaryEntry({
        room: this.id,
        title: 'Manor House, Somerset',
        text: 'Nebel auf den Feldern. Die Standuhr an der Wand hat keine Zeiger. In der Nacht hat Charlotte mir vom Tod ihrer Mutter erzählt, und ich habe sie nur angesehen. Die Kette meiner Mutter lag in meiner Tasche wie ein Stein.'
      });
      if (this._exitCone) this._exitCone.visible = true;
      this.ctx.objective.done('Nacht in Somerset', 'Geh. Das Haus hält dich nicht.');
    }, 'Charlotte');
  }

  _buildProps(scene) {
    // Klavier links an der Wand — unter Tuch
    const sheetMat = new THREE.MeshStandardMaterial({
      color: 0xe8e0d0,
      roughness: 0.9,
      emissive: 0x1a1a18,
      emissiveIntensity: 0.08
    });
    const piano = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 0.8), sheetMat);
    piano.position.set(-5.5, 0.6, -2);
    piano.castShadow = true;
    scene.add(piano);
    this.addCollider(piano);

    // Klavier-Erhöhung (Deckel)
    const pianoTop = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.8), sheetMat);
    pianoTop.position.set(-5.5, 1.26, -2);
    pianoTop.rotation.x = -0.2;
    scene.add(pianoTop);

    // Vase mit trockenen Blumen auf Möbelstück
    const vaseMat = new THREE.MeshStandardMaterial({ color: 0x1a1a14, roughness: 0.3, metalness: 0.2 });
    const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.3, 12), vaseMat);
    vase.position.set(3.5, 1.15, 5);
    scene.add(vase);
    // Angedeutete trockene Zweige (cylinder bundle)
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const twig = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.012, 0.5, 4),
        new THREE.MeshStandardMaterial({ color: 0x3a2814, roughness: 0.95 })
      );
      twig.position.set(3.5 + Math.cos(angle) * 0.05, 1.5, 5 + Math.sin(angle) * 0.05);
      twig.rotation.z = (Math.random() - 0.5) * 0.3;
      scene.add(twig);
    }

    // Geschlossene Holzläden an Fenstern (nur angedeutet, an Wänden)
    const shutterMat = new THREE.MeshStandardMaterial({ color: 0x3a2416, roughness: 0.9 });
    [-6.8, 6.8].forEach((x) => {
      const shutter = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2, 1.2), shutterMat);
      shutter.position.set(x, 2, -3);
      scene.add(shutter);
      const shutter2 = shutter.clone();
      shutter2.position.z = 3;
      scene.add(shutter2);
    });

    // Dielenlicht-Einfall als schwache Linien auf Boden
    const lightStrip = new THREE.Mesh(
      new THREE.PlaneGeometry(0.08, 8),
      new THREE.MeshBasicMaterial({
        color: 0xa0b8d0,
        transparent: true,
        opacity: 0.15,
        depthWrite: false
      })
    );
    lightStrip.rotation.x = -Math.PI / 2;
    lightStrip.position.set(-5.5, 0.02, 0);
    scene.add(lightStrip);

    // Grosser Gobelin an Hinterwand (Plane mit subtler Textur)
    const gobelin = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 2),
      new THREE.MeshStandardMaterial({
        color: 0x3a1a14,
        emissive: 0x1a0a08,
        emissiveIntensity: 0.15,
        roughness: 0.9
      })
    );
    gobelin.position.set(0, 2.5, -8.85);
    scene.add(gobelin);
  }

  _buildExit(scene) {
    // Allee-Ausgang im Süden
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x2a1810,
      roughness: 0.9,
      emissive: 0x0a0806,
      emissiveIntensity: 0.3
    });
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.8, 0.15), doorMat);
    door.position.set(0, 1.4, 8.9);
    scene.add(door);

    const coneMat = new THREE.MeshStandardMaterial({
      color: 0xd8b878,
      emissive: 0x8a6020,
      emissiveIntensity: 0.9
    });
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 8), coneMat);
    cone.position.set(0, 1.3, 7);
    cone.visible = false;
    scene.add(cone);
    this._exitCone = cone;

    this.addInteractable(door, async () => {
      if (!this.ctx.inventory.has('kette')) {
        await this.ctx.dialog.show('Charlotte schläft noch. Ich sollte bleiben.');
        return;
      }
      this.onExit?.();
    }, 'Das Haus verlassen');
  }

  update(_delta) {
    this._silhouettes.forEach((s) => s.faceCamera(this.ctx.camera));

    const t = performance.now() * 0.001;
    if (this._candleLight) {
      this._candleLight.intensity = 0.8 + Math.sin(t * 20) * 0.1 + Math.random() * 0.1;
    }
    if (this._exitCone && this._exitCone.visible) {
      this._exitCone.position.y = 1.3 + Math.sin(t * 2) * 0.12;
      this._exitCone.rotation.y += 0.01;
    }
    if (this._miliRef?.userData._update) this._miliRef.userData._update(t);
  }
}

function _makeFamilyPhotoTexture() {
  const c = document.createElement('canvas');
  c.width = 96;
  c.height = 128;
  const ctx = c.getContext('2d');

  // Sepia-Foto-Look
  ctx.fillStyle = '#c8a878';
  ctx.fillRect(0, 0, c.width, c.height);

  // Drei Figuren-Silhouetten (Vater, Mutter, Kind)
  ctx.fillStyle = '#4a3818';
  ctx.beginPath();
  ctx.arc(30, 45, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(20, 55, 20, 40);

  ctx.beginPath();
  ctx.arc(55, 48, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(46, 57, 18, 38);

  ctx.beginPath();
  ctx.arc(75, 65, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(68, 71, 14, 24);

  // Rahmen + Alterung
  ctx.globalAlpha = 0.2;
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = '#3a2814';
    ctx.fillRect(Math.random() * c.width, Math.random() * c.height, 1, 2);
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
