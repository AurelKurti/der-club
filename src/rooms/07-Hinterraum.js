import * as THREE from 'three';
import { BaseRoom } from '../core/BaseRoom.js';
import { Silhouette } from '../core/Silhouette.js';
import { CHAR } from '../data/characters.js';
import { EvidenceHunt } from '../minigames/EvidenceHunt.js';
import { addMili, registerMiliInteraction } from '../core/Collectible.js';

/**
 * Raum 7 — Pitt Club Hinterraum (DAS GEHEIMNIS)
 *
 * Quelle: Teil 4, Kap. 46
 * Ziel: Enthüllung, moralischer Wendepunkt, Mini-Game 3.
 *
 * WICHTIG: Alle Trigger-sensiblen Inhalte symbolisch:
 *  - Billardtisch LEER
 *  - Lucia als stummer goldener Umriss, KEINE explizite Darstellung
 *  - Andere Schmetterlinge als regungslose Schatten
 */
export class Hinterraum extends BaseRoom {
  constructor(ctx) {
    super(ctx);
    this.id = 'hinterraum';
    this.name = 'Pitt Club -  Hinterraum';
    // Spawn MUSS innerhalb der Wände liegen (Wände bei z=±7).
    // Früher stand hier z=8 → Spieler spawnte HINTER der Wand.
    this.spawnPoint.set(0, 1.6, 6);
    this.ambientProfile = 'backroom';
    this.floorMaterial = 'carpet';

    this._silhouettes = [];
    this._rescued = false;
  }

  build() {
    const { scene } = this;
    scene.background = new THREE.Color(0x1c1018);
    scene.fog = new THREE.FogExp2(0x1c1018, 0.02);

    this._buildFloor(scene);
    this._buildWalls(scene);
    this._buildPoolTable(scene);
    this._buildGlassCase(scene);
    this._buildSofas(scene);
    this._buildLighting(scene);
    this._buildProps(scene);
    this._buildSilhouettes(scene);
    this._buildExit(scene);

    // Mili unter dem Sofa (versteckt, in dunkler Ecke)
    this._miliRef = addMili(scene, new THREE.Vector3(5, 0.3, -3), this.id, this.ctx);
    registerMiliInteraction(this, this._miliRef, this.id);

    this.ctx.objective.set('Umkreise den Tisch. Du wirst sehen, was du siehst.');
  }

  _buildProps(scene) {
    // Zigarrenkiste auf Sofa
    const cigarBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.1, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x3a1810, roughness: 0.6 })
    );
    cigarBox.position.set(-5, 1.0, 3);
    cigarBox.castShadow = true;
    scene.add(cigarBox);

    // 2 Portraits an Wänden (Plane mit dunkler Textur, Gold-Rahmen)
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x8a6830,
      metalness: 0.5,
      roughness: 0.4
    });
    const portraitMat = new THREE.MeshStandardMaterial({
      color: 0x3a2818,
      emissive: 0x1a0e08,
      emissiveIntensity: 0.2,
      roughness: 0.85
    });
    const frameA = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.9, 0.06), frameMat);
    frameA.position.set(-5.88, 2.1, -3);
    frameA.rotation.y = Math.PI / 2;
    scene.add(frameA);
    const portraitA = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.75), portraitMat);
    portraitA.position.set(-5.85, 2.1, -3);
    portraitA.rotation.y = Math.PI / 2;
    scene.add(portraitA);

    const frameB = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.9, 0.06), frameMat);
    frameB.position.set(5.88, 2.1, 3);
    frameB.rotation.y = -Math.PI / 2;
    scene.add(frameB);
    const portraitB = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.75), portraitMat);
    portraitB.position.set(5.85, 2.1, 3);
    portraitB.rotation.y = -Math.PI / 2;
    scene.add(portraitB);

    // Kleiner Kronleuchter (keine echte Beleuchtung, nur visuell)
    const chandelierBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8),
      new THREE.MeshStandardMaterial({ color: 0x8a6830, metalness: 0.6 })
    );
    chandelierBase.position.set(0, 3.8, 0);
    scene.add(chandelierBase);
    const chandelierRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.35, 0.02, 6, 20),
      new THREE.MeshStandardMaterial({ color: 0x8a6830, metalness: 0.7, roughness: 0.3 })
    );
    chandelierRing.position.set(0, 3.5, 0);
    chandelierRing.rotation.x = Math.PI / 2;
    scene.add(chandelierRing);
    // 6 Kerzen
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const candle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.12, 6),
        new THREE.MeshStandardMaterial({ color: 0xe8e0c8, roughness: 0.7 })
      );
      candle.position.set(Math.cos(a) * 0.35, 3.57, Math.sin(a) * 0.35);
      scene.add(candle);
      const flame = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffc080 })
      );
      flame.position.set(Math.cos(a) * 0.35, 3.68, Math.sin(a) * 0.35);
      scene.add(flame);
    }

    // Bar-Regal an der linken Wand (dunkles Holz + ein paar Flaschen)
    const barShelf = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.05, 2.5),
      new THREE.MeshStandardMaterial({ color: 0x2a1410, roughness: 0.8 })
    );
    barShelf.position.set(-5.85, 1.8, 0);
    scene.add(barShelf);
    for (let i = 0; i < 5; i++) {
      const bottle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.05, 0.25, 8),
        new THREE.MeshStandardMaterial({
          color: 0x3a1a14,
          transparent: true,
          opacity: 0.7,
          roughness: 0.2
        })
      );
      bottle.position.set(-5.8, 1.94, -1.0 + i * 0.5);
      scene.add(bottle);
    }

    // Rotes Velvet-Teppich unter Billardtisch
    const rug = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 3),
      new THREE.MeshStandardMaterial({ color: 0x4a0814, roughness: 0.95 })
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.005, 0);
    scene.add(rug);
  }

  _buildFloor(scene) {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 14),
      new THREE.MeshStandardMaterial({ color: 0x180e10, roughness: 0.9 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
  }

  _buildWalls(scene) {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1a0e12, roughness: 0.95 });
    [
      { pos: [0, 2, -7],  size: [12, 4, 0.3] },
      { pos: [0, 2,  7],  size: [12, 4, 0.3] },
      { pos: [-6, 2, 0],  size: [0.3, 4, 14] },
      { pos: [6, 2, 0],   size: [0.3, 4, 14] }
    ].forEach(({ pos, size }) => {
      const w = new THREE.Mesh(new THREE.BoxGeometry(...size), wallMat);
      w.position.set(...pos);
      scene.add(w);
      this.addCollider(w);
    });

    // Decke
    const ceil = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 14),
      new THREE.MeshStandardMaterial({ color: 0x0a0608, roughness: 0.95 })
    );
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = 4;
    scene.add(ceil);
  }

  _buildPoolTable(scene) {
    // Billardtisch — zentral, leer (symbolisch wichtig: Tatort bleibt unbevölkert)
    const feltMat = new THREE.MeshStandardMaterial({ color: 0x1a3818, roughness: 0.9 });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x2a1410, roughness: 0.9 });

    const felt = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.08, 1.8), feltMat);
    felt.position.set(0, 0.82, 0);
    felt.receiveShadow = true;
    scene.add(felt);

    const frame = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.3, 2.2), frameMat);
    frame.position.set(0, 0.65, 0);
    frame.castShadow = true;
    scene.add(frame);
    this.addCollider(frame);

    // 4 Tischbeine
    [[-1.6, -1.0], [1.6, -1.0], [-1.6, 1.0], [1.6, 1.0]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.8, 0.2),
        frameMat
      );
      leg.position.set(x, 0.4, z);
      scene.add(leg);
    });

    this._tableRef = felt;
  }

  _buildGlassCase(scene) {
    // Glaskasten mit präpariertem Schmetterling (Ornithoptera goliath)
    const caseMat = new THREE.MeshStandardMaterial({
      color: 0x404050,
      metalness: 0.6,
      roughness: 0.1,
      transparent: true,
      opacity: 0.3
    });
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.2), caseMat);
    glass.position.set(0, 2.2, -6.7);
    scene.add(glass);

    // Rahmen
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xe8d8b0, roughness: 0.5 });
    const outerFrame = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.25), frameMat);
    outerFrame.position.set(0, 2.2, -6.72);
    scene.add(outerFrame);
    const innerHole = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.8, 0.26),
      new THREE.MeshBasicMaterial({ color: 0x0a0608 })
    );
    innerHole.position.set(0, 2.2, -6.71);
    scene.add(innerHole);

    // Schmetterling als emissive Plane mit Canvas-Textur
    const butterfly = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.4),
      new THREE.MeshBasicMaterial({
        map: _makeButterflyTexture(),
        transparent: true
      })
    );
    butterfly.position.set(0, 2.2, -6.6);
    scene.add(butterfly);

    // Gezielter Spot nur auf Kasten
    const spot = new THREE.SpotLight(0xd8b878, 3, 5, Math.PI / 10, 0.4);
    spot.position.set(0, 3.5, -6);
    spot.target.position.set(0, 2.2, -6.7);
    scene.add(spot);
    scene.add(spot.target);
  }

  _buildSofas(scene) {
    // Sofas an Seitenwänden (dunkelrot, Leder)
    const sofaMat = new THREE.MeshStandardMaterial({
      color: 0x2a1412,
      roughness: 0.7
    });
    const makeSofa = (x, z, rotY) => {
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 0.9), sofaMat);
      body.position.set(x, 0.5, z);
      body.rotation.y = rotY;
      body.castShadow = true;
      scene.add(body);
      this.addCollider(body);

      const back = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 0.3), sofaMat);
      back.position.set(x, 1.2, z);
      back.rotation.y = rotY;
      scene.add(back);

      // "Fläschchen" auf dem linken Sofa
      if (x < 0) {
        const flask = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 0.12, 8),
          new THREE.MeshStandardMaterial({
            color: 0x98a0b8,
            emissive: 0x303848,
            emissiveIntensity: 0.4,
            transparent: true,
            opacity: 0.7
          })
        );
        flask.position.set(x + 0.5, 1.0, z);
        scene.add(flask);
      }
      // Halbvolles Champagnerglas auf dem rechten Sofa
      if (x > 0) {
        const glass = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.03, 0.14, 12),
          new THREE.MeshStandardMaterial({
            color: 0xe8d880,
            emissive: 0x403820,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.6
          })
        );
        glass.position.set(x - 0.5, 1.0, z);
        scene.add(glass);
      }
    };
    makeSofa(-5, -3, 0);
    makeSofa(5, -3, 0);
    makeSofa(-5, 3, 0);
    makeSofa(5, 3, 0);
  }

  _buildLighting(scene) {
    scene.add(new THREE.AmbientLight(0x6a3a3a, 0.7));
    scene.add(new THREE.HemisphereLight(0xd8a890, 0x40302a, 0.35));

    // Rosa-dekadente Atmosphäre über Billardtisch
    const tableLamp = new THREE.PointLight(0xff8848, 2.0, 12);
    tableLamp.position.set(0, 3, 0);
    scene.add(tableLamp);

    // Akzent-Spotlight auf Tür
    const doorSpot = new THREE.PointLight(0xff9050, 1.2, 14);
    doorSpot.position.set(0, 2.5, 6);
    scene.add(doorSpot);

    // Fill-Light damit Wände nicht schwarz sind
    const fill = new THREE.PointLight(0xb88060, 0.8, 16);
    fill.position.set(0, 3.5, -4);
    scene.add(fill);
  }

  _buildSilhouettes(scene) {
    // Josh am Tisch
    const josh = new Silhouette({
      profile: CHAR.josh.profile,
      color: CHAR.josh.color,
      height: 1.86,
      width: 0.64
    });
    josh.position.set(-1.8, 0.93, -2.5);
    scene.add(josh);
    this._silhouettes.push(josh);

    // Zwei weitere regungslose Schmetterlinge an den Seiten
    const other1 = new Silhouette({ color: 0x2e2420, height: 1.78, width: 0.6 });
    other1.position.set(-4.5, 0.89, 0);
    scene.add(other1);
    this._silhouettes.push(other1);

    const other2 = new Silhouette({ color: 0x2e2420, height: 1.82, width: 0.62 });
    other2.position.set(4.5, 0.91, 0);
    scene.add(other2);
    this._silhouettes.push(other2);

    // Lucia als goldener Umriss — stark reduziert, nie explizit
    const lucia = new Silhouette({
      color: 0xd8b060,
      tint: 0xd8a040,
      opacity: 0.55,
      height: 1.68,
      width: 0.52
    });
    lucia.position.set(1.5, 0.84, -0.8);
    scene.add(lucia);
    this._silhouettes.push(lucia);
    this._luciaRef = lucia;

    // Josh-Dialog
    let joshTalked = false;
    this.addInteractable(josh, async () => {
      if (joshTalked) {
        await this.ctx.dialog.show('Josh grinst. Er weiss nicht, was er getan hat.');
        return;
      }
      joshTalked = true;
      await this.ctx.dialog.show(CHAR.josh.pittclub);
      await this.ctx.dialog.show([
        { text: 'Ich ging um den Tisch. Ich sah den Schmetterling im Glaskasten.' },
        { text: 'Ich dachte: «Was der Mensch in seinem Kern ist: ein Raubtier.»' }
      ]);
    }, 'Josh');
  }

  _buildExit(scene) {
    // Billardtisch als Trigger für Mini-Game 3
    const tableTrigger = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 1.5, 2.4),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    tableTrigger.position.set(0, 1.5, 0);
    scene.add(tableTrigger);

    this.addInteractable(tableTrigger, async () => {
      if (this._rescued) {
        await this.ctx.dialog.show('Der Raum ist leer. Ich bin hier fertig.');
        return;
      }
      const result = await this.ctx.game.startMiniGame(new EvidenceHunt(this.ctx));
      this._rescued = true;

      // Lucia verschwindet visuell
      if (this._luciaRef) {
        this._luciaRef.visible = false;
      }

      this.ctx.inventory.add({ id: 'flasche' });

      this.ctx.save.addDiaryEntry({
        room: this.id,
        title: 'Pitt Club, Hinterzimmer',
        text: 'Ornithoptera goliath. Derselbe Schmetterling wie in meiner Fliege. Derselbe wie auf Charlottes Brief. Ich hob Lucia hoch und trug sie hinaus. Es gab kein Grau. Ich hatte Billy schon verloren, bevor ich diesen Raum betrat, und wusste es erst jetzt.'
      });

      await this.ctx.dialog.show([
        { text: 'Ich lief durch die Bar. Niemand hielt mich auf.' },
        { text: 'Ich brachte sie in das Claire-Hall-Gästezimmer. Zimmer 42.' }
      ]);

      // Aha-Moment via Kastanie + Glaskasten (Buch Kap. 46):
      // Hans spürt Billys Kastanie in der Tasche, sieht den gelben
      // Schmetterling im Glaskasten - und versteht das Zeichen.
      await this.ctx.dialog.show([
        { text: 'Ich spürte Billys Kastanie in meiner Tasche. Dann sah ich den gelben Schmetterling im Glaskasten.' },
        { text: 'Das Zeichen in der Fliege. Das Zeichen auf dem Siegel. Das Zeichen hier.' },
        { text: 'Vierzig Jahre. So lange trug einer nach dem anderen diese Fliege. So lange hat niemand etwas gesagt.' }
      ]);

      if (this._exitCone) this._exitCone.visible = true;
      this.ctx.objective.done('Lucia gerettet', 'Raus. So schnell du kannst.');
    }, 'Den Tisch umkreisen');

    // Ausgang (Vorhang am Südende)
    const curtainMat = new THREE.MeshStandardMaterial({
      color: 0x4a1410,
      roughness: 0.95,
      emissive: 0x1a0604,
      emissiveIntensity: 0.4
    });
    const curtain = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 0.2), curtainMat);
    curtain.position.set(0, 1.5, 6.9);
    scene.add(curtain);

    const coneMat = new THREE.MeshStandardMaterial({
      color: 0xd8b878,
      emissive: 0x8a6020,
      emissiveIntensity: 0.9
    });
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 8), coneMat);
    cone.position.set(0, 1.3, 5);
    cone.visible = false;
    scene.add(cone);
    this._exitCone = cone;

    this.addInteractable(curtain, async () => {
      if (!this._rescued) {
        await this.ctx.dialog.show('Ich kann hier nicht einfach raus. Nicht so.');
        return;
      }
      this.onExit?.();
    }, 'Durch den Vorhang');
  }

  update(_delta) {
    this._silhouettes.forEach((s) => { if (s.visible) s.faceCamera(this.ctx.camera); });
    const t = performance.now() * 0.001;
    if (this._exitCone && this._exitCone.visible) {
      this._exitCone.position.y = 1.3 + Math.sin(t * 2) * 0.12;
      this._exitCone.rotation.y += 0.01;
    }
    if (this._miliRef?.userData._update) this._miliRef.userData._update(t);
  }
}

// Schmetterling im Glaskasten — Ornithoptera goliath (grün-gelb-schwarz)
function _makeButterflyTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 96;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, c.width, c.height);

  // Körper
  ctx.fillStyle = '#1a0e08';
  ctx.fillRect(62, 24, 4, 48);

  // Obere Flügel (gelb-grün)
  ctx.fillStyle = '#b8c040';
  ctx.beginPath();
  ctx.ellipse(40, 38, 24, 16, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(88, 38, 24, 16, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Untere Flügel (dunkler)
  ctx.fillStyle = '#5a6018';
  ctx.beginPath();
  ctx.ellipse(46, 62, 18, 12, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(82, 62, 18, 12, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Schwarze Flügel-Adern
  ctx.strokeStyle = '#1a0e08';
  ctx.lineWidth = 1.2;
  [[40, 38], [88, 38], [46, 62], [82, 62]].forEach(([cx, cy]) => {
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * 20, cy + Math.sin(angle) * 14);
      ctx.stroke();
    }
  });

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
