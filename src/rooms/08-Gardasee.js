import * as THREE from 'three';
import { BaseRoom } from '../core/BaseRoom.js';
import { Silhouette } from '../core/Silhouette.js';
import { CHAR } from '../data/characters.js';
import { addMili, registerMiliInteraction } from '../core/Collectible.js';

/**
 * Raum 8 — Gardasee / Epilog (Gardone Riviera)
 *
 * Quelle: Teil 4, Kap. 53-56
 * Ziel: Auflösung, Zeitungs-Enthüllung, Foto "Es ist alles wahr",
 *       emotionaler Abschluss, Übergang zum Credits-Screen.
 */
export class Gardasee extends BaseRoom {
  constructor(ctx) {
    super(ctx);
    this.id = 'gardasee';
    this.name = 'Gardasee, Gardone Riviera';
    this.spawnPoint.set(-2, 1.6, 4);
    this.ambientProfile = 'lake';
    this.floorMaterial = 'stone';

    this._silhouettes = [];
    this._ended = false;
  }

  build() {
    const { scene } = this;
    scene.background = new THREE.Color(0xffd4a8);
    scene.fog = new THREE.FogExp2(0xffd4a8, 0.004);

    this._buildWater(scene);
    this._buildTerrace(scene);
    this._buildVilla(scene);
    this._buildMountains(scene);
    this._buildTable(scene);
    this._buildLighting(scene);
    this._buildProps(scene);
    this._buildCharlotte(scene);

    // Mili am Ufer, nahe Stufen zum Wasser
    this._miliRef = addMili(scene, new THREE.Vector3(5, 0.5, -0.8), this.id, this.ctx);
    registerMiliInteraction(this, this._miliRef, this.id);

    this.ctx.objective.set('Lies die Zeitung, drehe das Foto um, sprich mit Charlotte.');
  }

  _buildProps(scene) {
    // Zweiter Bistrostuhl gegenüber des Tischs (leer — für Charlotte)
    const chairMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.6,
      roughness: 0.5
    });
    // Stuhl bei Bistrotisch (Tisch ist bei -2,5)
    for (const sx of [-2.7, -1.3]) {
      const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 16), chairMat);
      seat.position.set(sx, 0.5, 5);
      scene.add(seat);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8), chairMat);
      leg.position.set(sx, 0.25, 5);
      scene.add(leg);
      const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 0.04), chairMat);
      backrest.position.set(sx, 0.75, 5 + 0.15);
      scene.add(backrest);
    }

    // Grosse Terracotta-Blumentopf mit Olivenzweig
    const potMat = new THREE.MeshStandardMaterial({ color: 0x8a4a28, roughness: 0.8 });
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 0.5, 16), potMat);
    pot.position.set(3, 0.25, 6);
    pot.castShadow = true;
    scene.add(pot);
    // Olivenzweig (angedeuter Busch)
    for (let i = 0; i < 7; i++) {
      const branch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.02, 0.8, 5),
        new THREE.MeshStandardMaterial({ color: 0x5a6830, roughness: 0.85 })
      );
      const a = (i / 7) * Math.PI * 2;
      branch.position.set(3 + Math.cos(a) * 0.1, 0.9, 6 + Math.sin(a) * 0.1);
      branch.rotation.z = Math.cos(a) * 0.4;
      branch.rotation.x = Math.sin(a) * 0.4;
      scene.add(branch);
      // Ein paar silbrige Blätter
      for (let j = 0; j < 3; j++) {
        const leaf = new THREE.Mesh(
          new THREE.PlaneGeometry(0.1, 0.04),
          new THREE.MeshStandardMaterial({
            color: 0x8a9a5a,
            roughness: 0.85,
            side: THREE.DoubleSide
          })
        );
        leaf.position.set(
          3 + Math.cos(a) * 0.15,
          0.7 + j * 0.15,
          6 + Math.sin(a) * 0.15
        );
        leaf.rotation.y = Math.random() * Math.PI;
        scene.add(leaf);
      }
    }

    // Steinernes Geländer entlang Wasserkante (schmal, niedrig)
    const railMat = new THREE.MeshStandardMaterial({ color: 0xd8c8a8, roughness: 0.8 });
    for (let x = -6; x <= 6; x += 0.6) {
      const baluster = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.05, 0.35, 8),
        railMat
      );
      baluster.position.set(x, 0.88, -1.2);
      scene.add(baluster);
    }
    const railTop = new THREE.Mesh(
      new THREE.BoxGeometry(13, 0.06, 0.2),
      railMat
    );
    railTop.position.set(0, 1.1, -1.2);
    scene.add(railTop);

    // Kleine Lampions aufgehängt
    for (let i = 0; i < 4; i++) {
      const lampionMat = new THREE.MeshStandardMaterial({
        color: 0xe8b070,
        emissive: 0xc88040,
        emissiveIntensity: 1.0,
        roughness: 0.6
      });
      const lampion = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), lampionMat);
      lampion.position.set(-5 + i * 3, 3.5, 3);
      scene.add(lampion);
      const cord = new THREE.Mesh(
        new THREE.CylinderGeometry(0.005, 0.005, 1.5, 4),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
      );
      cord.position.set(-5 + i * 3, 4.25, 3);
      scene.add(cord);
    }
  }

  _buildWater(scene) {
    // Großer See (Plane mit leicht welliger Normal-Map-Alternative via rotating subtile animation)
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x6080a8,
      roughness: 0.3,
      metalness: 0.6,
      emissive: 0x204868,
      emissiveIntensity: 0.3
    });
    const water = new THREE.Mesh(new THREE.PlaneGeometry(120, 80), waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -0.2, -15);
    water.receiveShadow = true;
    scene.add(water);
    this._waterRef = water;
  }

  _buildTerrace(scene) {
    // Steinterrasse in Marmor-Beige
    const terraceMat = new THREE.MeshStandardMaterial({
      color: 0xe8d8b8,
      roughness: 0.7
    });
    const terrace = new THREE.Mesh(new THREE.BoxGeometry(14, 0.3, 10), terraceMat);
    terrace.position.set(0, 0, 4);
    terrace.receiveShadow = true;
    scene.add(terrace);
    this.addCollider(terrace, 1.0);

    // Seitliche Mauer am Wasser
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xd8c8a8, roughness: 0.8 });
    const wall = new THREE.Mesh(new THREE.BoxGeometry(14, 0.9, 0.4), wallMat);
    wall.position.set(0, 0.6, -1);
    scene.add(wall);
    this.addCollider(wall);

    // Stufen nach oben zur Villa
    for (let i = 0; i < 3; i++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(4, 0.2, 0.6),
        terraceMat
      );
      step.position.set(0, 0.25 + i * 0.2, 8.2 + i * 0.6);
      scene.add(step);
    }
  }

  _buildVilla(scene) {
    // Villa aus rotem Marmor (historisch: Mussolini-Aufenthaltsort)
    const villaMat = new THREE.MeshStandardMaterial({
      color: 0xc8583c,
      roughness: 0.5,
      emissive: 0x3a140a,
      emissiveIntensity: 0.15
    });
    const body = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 4), villaMat);
    body.position.set(0, 3, 12);
    body.receiveShadow = true;
    body.castShadow = true;
    scene.add(body);
    this.addCollider(body);

    // Fenster
    const winMat = new THREE.MeshStandardMaterial({
      color: 0xe8d8a0,
      emissive: 0xc8a868,
      emissiveIntensity: 0.5
    });
    [-3, 0, 3].forEach((x) => {
      const w = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.05), winMat);
      w.position.set(x, 3.5, 9.97);
      scene.add(w);
    });

    // Dach
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x3a1410, roughness: 0.9 });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(10.4, 0.3, 4.4), roofMat);
    roof.position.set(0, 5.65, 12);
    scene.add(roof);
  }

  _buildMountains(scene) {
    // Berg-Silhouetten hinten als flache IcosahedronGeometries
    const mountMat = new THREE.MeshStandardMaterial({
      color: 0x6070a0,
      roughness: 0.95,
      emissive: 0x202838,
      emissiveIntensity: 0.2
    });
    for (let i = 0; i < 7; i++) {
      const mount = new THREE.Mesh(
        new THREE.ConeGeometry(6 + Math.random() * 4, 8 + Math.random() * 4, 4),
        mountMat
      );
      mount.position.set(-30 + i * 10, 3, -30);
      scene.add(mount);
    }
  }

  _buildTable(scene) {
    // Kleiner Bistrotisch auf der Terrasse
    const topMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const tableTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.6, 0.05, 24),
      topMat
    );
    tableTop.position.set(-2, 0.9, 5);
    tableTop.castShadow = true;
    scene.add(tableTop);

    const tableLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.5 })
    );
    tableLeg.position.set(-2, 0.45, 5);
    scene.add(tableLeg);

    // Zeitung auf dem Tisch
    const paperTex = _makeNewspaperTexture();
    const paper = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.45),
      new THREE.MeshBasicMaterial({ map: paperTex })
    );
    paper.rotation.x = -Math.PI / 2;
    paper.position.set(-2, 0.93, 5);
    scene.add(paper);
    this._paperRef = paper;

    // Foto daneben
    const photoTex = _makeFamilyPhotoTexture();
    const photo = new THREE.Mesh(
      new THREE.PlaneGeometry(0.25, 0.35),
      new THREE.MeshBasicMaterial({ map: photoTex })
    );
    photo.rotation.x = -Math.PI / 2;
    photo.position.set(-1.3, 0.93, 5.3);
    scene.add(photo);
    this._photoRef = photo;

    this.addInteractable(paper, async () => {
      if (this._paperRead) return;
      this._paperRead = true;
      await this.ctx.dialog.show([
        { speaker: 'Schlagzeile', text: 'Skandal in Cambridge — Pitt-Club-Mitglied Josh Levan in Familienvilla erschossen.' },
        { text: 'Der Täter: Angus Farewell, Investmentbanker, Vater der Opfer-Tochter. Er richtete die Waffe danach gegen sich selbst.' },
        { text: 'Aus dem Artikel:' },
        { text: '«Ermittler fanden im Nachlass Farewells ein altes Familienfoto mit der handschriftlichen Notiz: "Es ist alles wahr."»' },
        { text: '«Die Enthüllung der "Schmetterlinge" geht zurück auf eine Cambridge-Kunsthistorikerin, deren eigenes Missbrauchs-Trauma von vor 40 Jahren auf denselben Billardtisch führt. Farewell war damals Mitglied — und ihr Täter.»' },
        { text: 'Alex hat ihre Rache.' }
      ]);
      this._maybeTriggerEnd();
    }, 'Die Zeitung lesen');

    this.addInteractable(photo, async () => {
      if (this._photoRead) return;
      this._photoRead = true;
      await this.ctx.dialog.show([
        { text: 'Auf der Rückseite des Fotos stand in Angus\' Handschrift ein einziger Satz:' },
        { speaker: 'Angus (letzte Worte)', text: '«Es ist alles wahr.»' }
      ]);
      this._maybeTriggerEnd();
    }, 'Das Foto umdrehen');
  }

  _buildLighting(scene) {
    // Warme Abendsonne
    scene.add(new THREE.AmbientLight(0xffd4a0, 0.45));

    const sun = new THREE.DirectionalLight(0xffb070, 1.5);
    sun.position.set(-18, 6, -12);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;
    scene.add(sun);
  }

  _buildCharlotte(scene) {
    // Charlotte am Seeufer
    const charlotte = new Silhouette({
      profile: CHAR.charlotte.profile,
      color: CHAR.charlotte.color,
      tint: CHAR.charlotte.tint,
      height: 1.72,
      width: 0.5
    });
    charlotte.position.set(3, 0.86, -0.5);
    scene.add(charlotte);
    this._silhouettes.push(charlotte);

    this.addInteractable(charlotte, async () => {
      if (this._charlotteTalked) return;
      this._charlotteTalked = true;
      await this.ctx.dialog.show([
        { speaker: 'Charlotte', text: '«Ich schaffe es nur, wenn du bei mir bleibst.»' },
        { text: 'Ich bleibe. Ich werde nie wieder lügen.' }
      ]);
      this._maybeTriggerEnd();
    }, 'Charlotte');
  }

  _maybeTriggerEnd() {
    if (this._ended) return;
    // Inkrementelles Feedback — sonst weiss Spieler nie ob Subtask zählt.
    const remaining = [];
    if (!this._paperRead) remaining.push('Zeitung lesen');
    if (!this._photoRead) remaining.push('Foto umdrehen');
    if (!this._charlotteTalked) remaining.push('mit Charlotte sprechen');
    if (remaining.length > 0) {
      this.ctx.objective.set('Noch offen: ' + remaining.join(', ') + '.');
      return;
    }
    this._ended = true;
    setTimeout(() => this._showCredits(), 1500);
  }

  _showCredits() {
    this.ctx.objective.clear();
    this.ctx.save.addDiaryEntry({
      room: this.id,
      title: 'Gardasee',
      text: 'Josh ist tot. Angus hat ihn erschossen und dann sich selbst. Alex hat ihre Rache. Auf der Rückseite eines Fotos stand seine letzte Schrift: «Es ist alles wahr.» Ich werde nie wieder lügen.'
    });

    const credits = document.createElement('div');
    credits.className = 'credits-overlay';
    credits.innerHTML = `
      <div class="credits-content">
        <h1>Der Club</h1>
        <p class="epilogue">
          «Es gibt keine Gerechtigkeit. Es gibt nur Geschichten, die wir uns
          erzählen, bis sie wahr werden.»
        </p>
        <hr>
        <p class="credit-line">Nach dem Roman <em>Der Club</em> von <strong>Takis Würger</strong></p>
        <p class="credit-line-small">Kein &amp; Aber, 2016</p>
        <p class="credit-section">Ein Schulprojekt</p>
        <p class="credit-line-small">Assets: Poly Haven · Freesound · OpenGameArt (CC0)</p>
        <div class="credits-buttons">
          <button class="credits-replay">Noch einmal beginnen</button>
          <button class="credits-diary">Tagebuch öffnen</button>
        </div>
      </div>
    `;
    document.getElementById('ui-root').appendChild(credits);

    credits.querySelector('.credits-replay').addEventListener('click', () => {
      if (!confirm('Möchtest du wirklich neu starten? Alle Tagebuch-Einträge gehen verloren.')) return;
      this.ctx.save.reset();
      location.reload();
    });
    credits.querySelector('.credits-diary').addEventListener('click', () => {
      credits.remove();
      this.ctx.diary.show();
    });
  }

  update(delta) {
    this._silhouettes.forEach((s) => s.faceCamera(this.ctx.camera));
    const t = performance.now() * 0.001;

    if (this._waterRef) {
      this._waterRef.material.emissiveIntensity = 0.25 + Math.sin(t * 0.4) * 0.08;
    }
    if (this._miliRef?.userData._update) this._miliRef.userData._update(t);
  }
}

// Zeitungs-Canvas (Schlagzeile + Textblöcke als Balken)
function _makeNewspaperTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 160;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#f0e8d8';
  ctx.fillRect(0, 0, c.width, c.height);

  // Masthead
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 16px serif';
  ctx.fillText('THE CAMBRIDGE TIMES', 40, 22);

  // Schlagzeile
  ctx.font = 'bold 12px serif';
  ctx.fillText('SKANDAL IM PITT CLUB', 14, 45);
  ctx.font = '10px serif';
  ctx.fillText('Schmetterlinge enthüllt', 14, 60);

  // Text-Balken als Platzhalter
  ctx.fillStyle = '#5a5a5a';
  for (let line = 0; line < 7; line++) {
    ctx.fillRect(14, 72 + line * 9, 110, 2);
    ctx.fillRect(140, 72 + line * 9, 100, 2);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function _makeFamilyPhotoTexture() {
  const c = document.createElement('canvas');
  c.width = 96;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#c8a878';
  ctx.fillRect(0, 0, c.width, c.height);

  // Drei Silhouetten — Angus, Frau, kleine Charlotte
  ctx.fillStyle = '#3a2814';
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

  // "Es ist alles wahr" am unteren Rand (handschriftlich)
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'italic 8px cursive';
  ctx.fillText('Es ist alles wahr.', 14, 115);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
