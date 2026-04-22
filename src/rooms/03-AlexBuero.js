import * as THREE from 'three';
import { BaseRoom } from '../core/BaseRoom.js';
import { Silhouette } from '../core/Silhouette.js';
import { CHAR } from '../data/characters.js';
import { addMili, registerMiliInteraction } from '../core/Collectible.js';

/**
 * Raum 3 — Alex' Büro, St. John's College Cambridge
 *
 * Quelle: Teil 1, Kap. 8 + Teil 2, Kap. 22
 * Ziel: Auftrag enthüllen, Goya-Bild etablieren, Tarn-Ausweis aushändigen.
 */
export class AlexBuero extends BaseRoom {
  constructor(ctx) {
    super(ctx);
    this.id = 'alex-buero';
    this.name = 'Alex\' Büro, Cambridge';
    this.spawnPoint.set(0, 1.6, 3.5);
    this.ambientProfile = 'office';
    this.floorMaterial = 'wood';

    this._silhouettes = [];
    this._firePoints = null;
  }

  build() {
    const { scene } = this;
    scene.background = new THREE.Color(0x0c0a08);
    scene.fog = new THREE.FogExp2(0x0c0a08, 0.04);

    this._buildFloor(scene);
    this._buildWalls(scene);
    this._buildCeiling(scene);
    this._buildBookshelves(scene);
    this._buildDesk(scene);
    this._buildFireplace(scene);
    this._buildWindow(scene);
    this._buildGoya(scene);
    this._buildLighting(scene);
    this._buildAlex(scene);
    this._buildProps(scene);
    this._buildInteractables(scene);
    this._buildExit(scene);

    // Mili zwischen Büchern im rechten Regal
    this._miliRef = addMili(scene, new THREE.Vector3(3.5, 2.2, -1), this.id, this.ctx);
    registerMiliInteraction(this, this._miliRef, this.id);

    this.ctx.objective.set('Sprich mit Tante Alex hinter dem Schreibtisch.');
  }

  _buildFloor(scene) {
    // Parkett — warmes Holz
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 10),
      new THREE.MeshStandardMaterial({ color: 0x4a2e1a, roughness: 0.8 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Teppich (dunkelrot) unter dem Schreibtisch
    const rug = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 4),
      new THREE.MeshStandardMaterial({ color: 0x3a1a14, roughness: 0.95 })
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.005, -1);
    scene.add(rug);
  }

  _buildWalls(scene) {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 0.9 });

    // Hintere Wand
    const back = new THREE.Mesh(new THREE.BoxGeometry(8, 3.8, 0.3), wallMat);
    back.position.set(0, 1.9, -5);
    back.receiveShadow = true;
    scene.add(back);
    this.addCollider(back);

    // Vorder­wand mit Tür-Lücke
    const frontL = new THREE.Mesh(new THREE.BoxGeometry(3, 3.8, 0.3), wallMat);
    frontL.position.set(-2.5, 1.9, 5);
    scene.add(frontL);
    this.addCollider(frontL);

    const frontR = new THREE.Mesh(new THREE.BoxGeometry(3, 3.8, 0.3), wallMat);
    frontR.position.set(2.5, 1.9, 5);
    scene.add(frontR);
    this.addCollider(frontR);

    // Seitenwände
    const left = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.8, 10), wallMat);
    left.position.set(-4, 1.9, 0);
    scene.add(left);
    this.addCollider(left);

    const right = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.8, 10), wallMat);
    right.position.set(4, 1.9, 0);
    scene.add(right);
    this.addCollider(right);
  }

  _buildCeiling(scene) {
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 10),
      new THREE.MeshStandardMaterial({ color: 0x180e08, roughness: 0.95 })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 3.8;
    scene.add(ceiling);

    // Holzbalken angedeutet
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x2a1810, roughness: 0.9 });
    for (let z = -4; z <= 4; z += 2) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 0.25), beamMat);
      beam.position.set(0, 3.6, z);
      scene.add(beam);
    }
  }

  _buildBookshelves(scene) {
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0xe0d8c8, roughness: 0.8 });
    const bookMat = new THREE.MeshStandardMaterial({ color: 0x4a2818, roughness: 0.9 });
    const bookMat2 = new THREE.MeshStandardMaterial({ color: 0x1a2a3a, roughness: 0.9 });
    const bookMat3 = new THREE.MeshStandardMaterial({ color: 0x2a1818, roughness: 0.9 });

    // Linke Seitenregale (drei Regale übereinander)
    for (let y = 0; y < 3; y++) {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 8), shelfMat);
      shelf.position.set(-3.8, 0.5 + y * 0.9, 0);
      shelf.castShadow = true;
      scene.add(shelf);

      // Buchrücken — kleine Box-Array
      for (let i = 0; i < 30; i++) {
        const bookW = 0.08 + Math.random() * 0.08;
        const bookH = 0.35 + Math.random() * 0.15;
        const mat = [bookMat, bookMat2, bookMat3][i % 3];
        const book = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, bookH, bookW),
          mat
        );
        book.position.set(-3.8, 0.5 + y * 0.9 + bookH / 2 + 0.03, -3.6 + i * 0.24);
        scene.add(book);
      }
    }

    // Rechte Seitenregale (gleiches Prinzip)
    for (let y = 0; y < 3; y++) {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 8), shelfMat);
      shelf.position.set(3.8, 0.5 + y * 0.9, 0);
      shelf.castShadow = true;
      scene.add(shelf);

      for (let i = 0; i < 30; i++) {
        const bookW = 0.08 + Math.random() * 0.08;
        const bookH = 0.35 + Math.random() * 0.15;
        const mat = [bookMat, bookMat2, bookMat3][(i + 1) % 3];
        const book = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, bookH, bookW),
          mat
        );
        book.position.set(3.8, 0.5 + y * 0.9 + bookH / 2 + 0.03, -3.6 + i * 0.24);
        scene.add(book);
      }
    }
  }

  _buildDesk(scene) {
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.7 });

    // Tischplatte
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 1.1), deskMat);
    top.position.set(0, 0.96, -2.5);
    top.castShadow = true;
    top.receiveShadow = true;
    scene.add(top);
    this.addCollider(top);

    // Tischbeine
    [[-1, -2.9], [1, -2.9], [-1, -2.1], [1, -2.1]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.92, 0.12),
        deskMat
      );
      leg.position.set(x, 0.46, z);
      leg.castShadow = true;
      scene.add(leg);
    });

    // Bücher + Papiere auf dem Tisch
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.7 });
    for (let i = 0; i < 3; i++) {
      const paper = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.4), paperMat);
      paper.position.set(-0.5 + Math.random() * 1, 1.01 + i * 0.02, -2.5 + (Math.random() - 0.5) * 0.5);
      scene.add(paper);
    }
    // Teetasse (Cylinder)
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.05, 0.08, 12),
      new THREE.MeshStandardMaterial({ color: 0xe0dcc8, roughness: 0.3 })
    );
    cup.position.set(0.7, 1.04, -2.3);
    scene.add(cup);

    this._deskRef = top;
  }

  _buildFireplace(scene) {
    // Kamin in der linken Wand
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.95 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.6, 1.8), frameMat);
    frame.position.set(-3.85, 0.8, 1.5);
    scene.add(frame);

    // Kamin-Öffnung (dunklere Fläche)
    const openingMat = new THREE.MeshBasicMaterial({ color: 0x1a0a04 });
    const opening = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.0), openingMat);
    opening.position.set(-3.68, 0.55, 1.5);
    opening.rotation.y = Math.PI / 2;
    scene.add(opening);

    // Sims obendrauf
    const sill = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.1, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x8a6848, roughness: 0.7 })
    );
    sill.position.set(-3.7, 1.65, 1.5);
    scene.add(sill);

    // Feuer: warm-flackernde PointLight
    const fire = new THREE.PointLight(0xff6020, 1.8, 8);
    fire.position.set(-3.5, 0.5, 1.5);
    fire.castShadow = true;
    scene.add(fire);
    this._firePoints = fire;

    // Emissive Glut-Punkte
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff8040 })
    );
    glow.position.set(-3.5, 0.3, 1.5);
    scene.add(glow);
    this._fireGlow = glow;
  }

  _buildWindow(scene) {
    // Flügelfenster rechts, zeigt kalten Kapellenhof
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x3a2818, roughness: 0.85 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.2, 1.8), frameMat);
    frame.position.set(3.88, 1.5, -2);
    scene.add(frame);

    // Fenster-Glas (bläulich, halbtransparent)
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x6a7888,
      transparent: true,
      opacity: 0.3,
      emissive: 0x2a3848,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.0), glassMat);
    glass.position.set(3.84, 1.5, -2);
    glass.rotation.y = -Math.PI / 2;
    scene.add(glass);

    // Kreuz-Sprossen
    const sprossen = new THREE.MeshStandardMaterial({ color: 0x1a0e08 });
    const vSplit = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.0, 0.06), sprossen);
    vSplit.position.set(3.83, 1.5, -2);
    scene.add(vSplit);
    const hSplit = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 1.6), sprossen);
    hSplit.position.set(3.83, 1.5, -2);
    scene.add(hSplit);
  }

  _buildGoya(scene) {
    // Goya "Saturn verschlingt seinen Sohn" — Platzhalter mit dunkler Textur.
    // Wir malen das Motiv abstrakt via Canvas als Textur.
    const texture = _makeGoyaTexture();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x2a1810, roughness: 0.9 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.4, 0.1), frameMat);
    frame.position.set(0, 2.3, -4.9);
    scene.add(frame);

    const painting = new THREE.Mesh(
      new THREE.PlaneGeometry(0.85, 1.25),
      new THREE.MeshBasicMaterial({ map: texture })
    );
    painting.position.set(0, 2.3, -4.84);
    scene.add(painting);

    this._goyaRef = painting;
  }

  _buildLighting(scene) {
    scene.add(new THREE.AmbientLight(0x201810, 0.15));

    // Kaltes Tageslicht durchs Fenster
    const window = new THREE.DirectionalLight(0x8898a8, 0.5);
    window.position.set(6, 3, -2);
    window.target.position.set(0, 1, -2);
    scene.add(window);
    scene.add(window.target);

    // Warme Schreibtischlampe
    const deskLamp = new THREE.PointLight(0xffbf80, 0.8, 4);
    deskLamp.position.set(0.6, 1.4, -2.3);
    scene.add(deskLamp);
  }

  _buildAlex(scene) {
    const alex = new Silhouette({
      profile: CHAR.alex.profile,
      color: CHAR.alex.color,
      height: 1.68,
      width: 0.54
    });
    alex.position.set(0, 0.84, -3.5); // hinter dem Schreibtisch
    scene.add(alex);
    this._silhouettes.push(alex);

    this.addInteractable(alex, async () => {
      if (this._firstVisit !== false) {
        await this.ctx.dialog.show(CHAR.alex.buero);
        await this.ctx.dialog.show(CHAR.alex.buero_backstory);
        await this.ctx.dialog.show([
          { speaker: 'Alex', text: '«Hier. Dein Studentenausweis. Der Name — Stichler — gehört jetzt dir.»' }
        ]);
        if (this._ausweis) this._ausweis.visible = true;
        this.ctx.save.addDiaryEntry({
          room: this.id,
          title: 'Alex\' Büro',
          text: 'Alex hat mir die Wahrheit gesagt. Der Pitt Club. Die Schmetterlinge. Vierzig Jahre alt ist ihr Geheimnis. Ein Mann namens Angus führte sie damals in einen Hinterraum. Jetzt will sie Rache — und ich bin ihr Werkzeug. Ich heiße ab heute Hans Stichler.'
        });
        this._firstVisit = false;
        this.ctx.objective.set('Nimm den Tarn-Ausweis vom Schreibtisch.');
      } else {
        await this.ctx.dialog.show([
          { speaker: 'Alex', text: '«Du weisst jetzt genug. Geh.»' }
        ]);
      }
    }, 'Alex');
  }

  _buildInteractables(scene) {
    // Goya-Bild klickbar
    this.addInteractable(this._goyaRef, async () => {
      await this.ctx.dialog.show([
        { speaker: 'Alex', text: '«Goya war 1792 taub geworden. Er malte vierzehn Bilder auf die Wände seines Esszimmers.»' },
        { speaker: 'Alex', text: '«Eines zeigt Saturn, der seinen Sohn verschlingt, weil ein Orakel ihm vorausgesagt hatte, dass einer seiner Söhne ihn stürzen würde.»' },
        { speaker: 'Alex', text: '«Das ist die Welt, in die ich dich schicke.»' }
      ]);
    }, 'Pinturas negras — Goya');

    // Tarn-Ausweis auf dem Schreibtisch (erst nach Alex-Dialog sichtbar)
    const cardMat = new THREE.MeshStandardMaterial({
      color: 0xf0e8d8,
      emissive: 0x302818,
      emissiveIntensity: 0.3,
      roughness: 0.4
    });
    const card = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 0.13), cardMat);
    card.position.set(-0.4, 1.02, -2.3);
    card.visible = false;
    scene.add(card);
    this._ausweis = card;

    let ausweisTaken = false;
    this.addInteractable(card, async () => {
      if (ausweisTaken) return;
      ausweisTaken = true;
      await this.ctx.dialog.show([
        { text: 'Der Studentenausweis. Mein Name steht darauf: Hans Stichler.' },
        { text: 'Niemand wird es wissen.' }
      ]);
      this.ctx.inventory.add({ id: 'studentenausweis' });
      this.removeInteractable(card);
      if (this._exitCone) this._exitCone.visible = true;
      this.ctx.objective.done('Tarn-Ausweis erhalten', 'Verlasse das Büro durch die Tür.');
    }, 'Ausweis einstecken');
  }

  _buildProps(scene) {
    // Sessel vor Kamin (links)
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x3a1810, roughness: 0.85 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 0.7), chairMat);
    seat.position.set(-2.6, 0.45, 0.5);
    seat.castShadow = true;
    scene.add(seat);
    const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.15), chairMat);
    backrest.position.set(-2.6, 0.95, 0.15);
    backrest.castShadow = true;
    scene.add(backrest);
    [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]].forEach(([dx, dz]) => {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.35, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x2a1810, roughness: 0.9 })
      );
      leg.position.set(-2.6 + dx, 0.175, 0.5 + dz);
      scene.add(leg);
    });

    // Globus in der Ecke
    const globeStand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.05, 0.8, 8),
      new THREE.MeshStandardMaterial({ color: 0x1a0e08, metalness: 0.5 })
    );
    globeStand.position.set(3, 0.4, 3);
    scene.add(globeStand);
    const globeRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.26, 0.02, 6, 20),
      new THREE.MeshStandardMaterial({ color: 0x8a6830, metalness: 0.6 })
    );
    globeRing.position.set(3, 1.05, 3);
    globeRing.rotation.x = Math.PI / 2;
    scene.add(globeRing);
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x4a6a80, roughness: 0.7 })
    );
    globe.position.set(3, 1.05, 3);
    globe.rotation.z = -0.3;
    globe.castShadow = true;
    scene.add(globe);

    // Stehlampe neben Schreibtisch
    const lampPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.04, 1.6, 6),
      new THREE.MeshStandardMaterial({ color: 0x2a1a0e, metalness: 0.4 })
    );
    lampPole.position.set(-1.8, 0.8, -2.3);
    scene.add(lampPole);
    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.22, 0.3, 12, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0xe8c888,
        side: THREE.DoubleSide,
        emissive: 0xc88840,
        emissiveIntensity: 0.5,
        roughness: 0.6
      })
    );
    shade.position.set(-1.8, 1.75, -2.3);
    shade.rotation.z = Math.PI;
    scene.add(shade);
    const lampGlow = new THREE.PointLight(0xffc070, 0.5, 3);
    lampGlow.position.set(-1.8, 1.6, -2.3);
    scene.add(lampGlow);

    // Lesepult an der hinteren Wand
    const pultTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.05, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x4a2a18, roughness: 0.7 })
    );
    pultTop.position.set(-2.5, 1.1, -4.5);
    pultTop.rotation.x = -0.15;
    scene.add(pultTop);
    const book = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.04, 0.28),
      new THREE.MeshStandardMaterial({ color: 0x5a1818, roughness: 0.8 })
    );
    book.position.set(-2.5, 1.15, -4.5);
    book.rotation.x = -0.15;
    scene.add(book);

    // Teppichläufer zur Tür
    const runnerMat = new THREE.MeshStandardMaterial({ color: 0x2a0a08, roughness: 0.95 });
    const runner = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 6), runnerMat);
    runner.rotation.x = -Math.PI / 2;
    runner.position.set(0, 0.008, 1.5);
    scene.add(runner);
  }

  _buildExit(scene) {
    // Tür mit Fade nach draußen
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x3a1e10,
      roughness: 0.9,
      emissive: 0x1a0a04,
      emissiveIntensity: 0.3
    });
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.4, 0.12), doorMat);
    door.position.set(0, 1.2, 5);
    scene.add(door);
    // Tür-Collider: verhindert Durchlaufen der Gap in frontL/frontR
    this.addCollider(door);

    const coneMat = new THREE.MeshStandardMaterial({
      color: 0xd8b878,
      emissive: 0x8a6020,
      emissiveIntensity: 0.9
    });
    // Cone 1m vor Tür, sichtbar für Spieler der Richtung +Z (zur Tür) blickt
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 8), coneMat);
    cone.position.set(0, 1.3, 4);
    cone.visible = false;
    scene.add(cone);
    this._exitCone = cone;

    this.addInteractable(door, async () => {
      if (!this.ctx.inventory.has('studentenausweis')) {
        await this.ctx.dialog.show('Ich kann nicht gehen, ohne Alex gesprochen zu haben.');
        return;
      }
      this.onExit?.();
    }, 'Das Büro verlassen');
  }

  update(_delta) {
    this._silhouettes.forEach((s) => s.faceCamera(this.ctx.camera));

    const t = performance.now() * 0.001;
    // Kamin-Flicker
    if (this._firePoints) {
      const flicker = 1.5 + Math.sin(t * 15) * 0.3 + Math.random() * 0.2;
      this._firePoints.intensity = flicker;
    }
    if (this._exitCone && this._exitCone.visible) {
      this._exitCone.position.y = 1.3 + Math.sin(t * 2) * 0.12;
      this._exitCone.rotation.y += 0.01;
    }
    if (this._miliRef?.userData._update) this._miliRef.userData._update(t);
  }
}

// Goya-Saturn Platzhalter als Canvas-Textur — abstrakt, atmosphärisch
function _makeGoyaTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 360;
  const ctx = c.getContext('2d');

  // Dunkler Hintergrund (Grau-Braun)
  const bg = ctx.createRadialGradient(128, 180, 10, 128, 180, 220);
  bg.addColorStop(0, '#3a2820');
  bg.addColorStop(1, '#0a0806');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, c.width, c.height);

  // Abstrakte Saturn-Figur (Kopf + Oberkörper, beschnitten)
  ctx.fillStyle = '#1a0e08';
  ctx.beginPath();
  ctx.ellipse(128, 90, 40, 55, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#2a1a10';
  ctx.beginPath();
  ctx.moveTo(80, 120);
  ctx.quadraticCurveTo(128, 160, 176, 120);
  ctx.lineTo(200, 340);
  ctx.lineTo(56, 340);
  ctx.closePath();
  ctx.fill();

  // Rote Augen (Wahnsinn)
  ctx.fillStyle = '#c83a20';
  ctx.beginPath();
  ctx.arc(115, 85, 4, 0, Math.PI * 2);
  ctx.arc(141, 85, 4, 0, Math.PI * 2);
  ctx.fill();

  // Rissige Textur
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < 80; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#1a0a04' : '#5a3a20';
    ctx.fillRect(Math.random() * c.width, Math.random() * c.height, 1, Math.random() * 20);
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
