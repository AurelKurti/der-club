import * as THREE from 'three';
import { BaseRoom } from '../core/BaseRoom.js';
import { Silhouette } from '../core/Silhouette.js';
import { CHAR } from '../data/characters.js';
import { addMili, registerMiliInteraction } from '../core/Collectible.js';

/**
 * Raum 1 — Försterhaus im Deister (Hans' Kindheit)
 *
 * Quelle: Teil 1, Kap. 1-3 (Buch)
 * Ziel: Hans etablieren, Eltern andeuten, Boxhandschuhe einsammeln.
 */
export class Foersterhaus extends BaseRoom {
  constructor(ctx) {
    super(ctx);
    this.id = 'foersterhaus';
    this.name = 'Försterhaus im Deister';
    this.spawnPoint.set(0, 1.6, 10);
    this.ambientProfile = 'forest';
    this.floorMaterial = 'grass';

    // Erst-Besuch-Tutorial: erscheint nach erstem Pointer-Lock
    // (sonst öffnet es sich während Trigger-Warnung/Start-Overlay und verschwindet unbemerkt)
    if (!ctx.save.hasFlag('tutorialShown')) {
      const handler = () => {
        ctx.player.controls.removeEventListener('lock', handler);
        setTimeout(async () => {
          if (ctx.dialog.isOpen() || !ctx.player.isLocked()) return;
          await ctx.dialog.show([
            { text: '[Du bist Hans. Dies ist das Haus deiner Eltern im Deister.]' },
            { text: '[Mit WASD bewegst du dich. Mit der Maus schaust du dich um.]' },
            { text: '[Nähere dich Objekten oder Figuren — wenn E aufblinkt, kannst du interagieren.]' },
            { text: '[Mit T öffnest du das Tagebuch. Mit ESC pausierst du.]' }
          ]);
          ctx.save.setFlag('tutorialShown');
        }, 600);
      };
      ctx.player.controls.addEventListener('lock', handler);
    }

    this._silhouettes = []; // für faceCamera-Updates
  }

  build() {
    const { scene } = this;
    scene.background = new THREE.Color(0x2a1e14);   // warmer Sommer-Ton
    scene.fog = new THREE.FogExp2(0x2a1e14, 0.012);

    this._buildGround(scene);
    this._buildHouse(scene);
    this._buildCherryTree(scene);
    this._buildWorkbench(scene);
    this._buildFence(scene);
    this._buildCampfire(scene);
    this._buildTreeLine(scene);
    this._buildLighting(scene);

    this._buildSilhouettes(scene);
    this._buildInteractables(scene);
    this._buildExit(scene);

    // Verstecktes Mili-Lesezeichen: im Stall hinten links
    const mili = addMili(scene, new THREE.Vector3(-10, 0.8, -4), this.id, this.ctx);
    registerMiliInteraction(this, mili, this.id);
    this._miliRef = mili;

    // Foto von Mili auf der Werkbank — etabliert sie als Figur
    this._buildMiliPhoto(scene);

    // Initiales Ziel setzen
    this.ctx.objective.set('Erkunde den Garten. Finde die Werkbank deines Vaters.');
  }

  _buildMiliPhoto(scene) {
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xe0d8c0,
      metalness: 0.3,
      roughness: 0.6
    });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 0.03), frameMat);
    frame.position.set(6.2, 1.08, -2.8);
    frame.rotation.y = -0.3;
    scene.add(frame);

    // Sepia-Foto eines Mädchens als Canvas-Sprite
    const tex = _makeMiliPhotoTexture();
    const photo = new THREE.Mesh(
      new THREE.PlaneGeometry(0.18, 0.22),
      new THREE.MeshBasicMaterial({ map: tex })
    );
    photo.position.set(6.17, 1.08, -2.78);
    photo.rotation.y = -0.3;
    scene.add(photo);

    this.addInteractable(frame, async () => {
      await this.ctx.dialog.show([
        { text: 'Ein kleines Foto im Silberrahmen. Ein Mädchen mit dunklem Haar, vielleicht sechs Jahre alt.' },
        { speaker: 'Hans', text: '«Meine Schwester Mili. Sie ist gestorben, als ich klein war. Ich vergesse sie nie.»' }
      ]);
      this.ctx.save.addDiaryEntry({
        room: this.id,
        title: 'Meine Schwester Mili',
        text: 'Auf Vaters Werkbank steht ein Foto von Mili. Ich weiss nicht mehr, wie sie klang. Aber ich höre sie manchmal, in den Morgen: «永远» — für immer.'
      });
    }, 'Foto von Mili');
  }

  // ------------------------------------------------------------------

  _buildGround(scene) {
    const grass = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ color: 0x4a5028, roughness: 0.95 })
    );
    grass.rotation.x = -Math.PI / 2;
    grass.receiveShadow = true;
    scene.add(grass);

    // Kies-Pfad zum Haus
    const path = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 14),
      new THREE.MeshStandardMaterial({ color: 0x7a6848, roughness: 0.9 })
    );
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, 0.01, 2);
    path.receiveShadow = true;
    scene.add(path);
  }

  _buildHouse(scene) {
    // Sandstein-Försterhaus als Fassade (nicht betretbar)
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xa08060, roughness: 0.9 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x3a2018, roughness: 0.95 });

    const house = new THREE.Group();

    const body = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 6), wallMat);
    body.position.y = 2;
    body.castShadow = true;
    body.receiveShadow = true;
    house.add(body);

    // Dach (Prisma via 2 angewinkelte Planes)
    const roofL = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.2, 4.2), roofMat);
    roofL.position.set(0, 4 + 1.5, -1.5);
    roofL.rotation.x = -Math.PI / 5;
    roofL.castShadow = true;
    house.add(roofL);

    const roofR = roofL.clone();
    roofR.position.z = 1.5;
    roofR.rotation.x = Math.PI / 5;
    house.add(roofR);

    // Tür
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 2.2, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.85 })
    );
    door.position.set(0, 1.1, 3.05);
    house.add(door);

    // Fenster (als emissive Rechtecke — warmer Glow)
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0xffd080,
      emissive: 0xffa050,
      emissiveIntensity: 0.8,
      roughness: 0.5
    });
    [-2.5, 2.5].forEach((x) => {
      const w = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.05), windowMat);
      w.position.set(x, 2.3, 3.03);
      house.add(w);
    });

    house.position.set(0, 0, -5);
    scene.add(house);
    this.addCollider(body);
  }

  _buildCherryTree(scene) {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.35, 3.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x3a2415, roughness: 0.95 })
    );
    trunk.position.set(-7, 1.75, -2);
    trunk.castShadow = true;
    scene.add(trunk);
    this.addCollider(trunk);

    // Krone aus 3 überlappenden Kugeln für organischen Look
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xf8dde0,
      roughness: 0.85,
      emissive: 0x301820,
      emissiveIntensity: 0.15
    });
    const crownPositions = [
      [0, 0, 0, 1.6],
      [0.8, 0.5, 0.4, 1.3],
      [-0.7, 0.2, -0.3, 1.2]
    ];
    const crownGroup = new THREE.Group();
    crownPositions.forEach(([x, y, z, r]) => {
      const s = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), crownMat);
      s.position.set(x, y, z);
      s.castShadow = true;
      crownGroup.add(s);
    });
    crownGroup.position.set(-7, 4, -2);
    scene.add(crownGroup);

    this._cherryRef = trunk;
    this._cherryCrown = crownGroup;
  }

  _buildWorkbench(scene) {
    const bench = new THREE.Group();
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.15, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x6a4828, roughness: 0.9 })
    );
    top.position.y = 0.9;
    top.castShadow = true;
    bench.add(top);

    [-0.85, 0.85].forEach((x) => {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.9, 0.7),
        new THREE.MeshStandardMaterial({ color: 0x4a3020, roughness: 0.95 })
      );
      leg.position.set(x, 0.45, 0);
      bench.add(leg);
    });

    bench.position.set(7, 0, -3);
    bench.rotation.y = -0.3;
    scene.add(bench);
    this.addCollider(top);
    this._workbenchRef = top;
  }

  _buildFence(scene) {
    // Angedeuteter Zaun zur Pferdeweide (links)
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.95 });
    const posts = [];
    for (let i = -12; i <= -8; i += 1) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.2, 0.15), fenceMat);
      p.position.set(i, 0.6, -6);
      p.castShadow = true;
      scene.add(p);
      posts.push(p);
    }
    const rail = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.1, 0.1), fenceMat);
    rail.position.set(-10, 0.9, -6);
    scene.add(rail);
  }

  _buildCampfire(scene) {
    // Erloschenes Feuer als Atmosphäre-Detail
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.6, 0.1, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0x2a2420, roughness: 0.95 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(4, 0.1, 4);
    scene.add(ring);

    // Glow-Lichtchen
    const glow = new THREE.PointLight(0xff6030, 0.8, 4);
    glow.position.set(4, 0.4, 4);
    scene.add(glow);
  }

  _buildTreeLine(scene) {
    // Wald-Silhouette am Rand (InstancedMesh wäre performanter, aber hier reicht's)
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.95 });
    const crownMat = new THREE.MeshStandardMaterial({ color: 0x1a2a14, roughness: 0.95 });

    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const radius = 22 + Math.random() * 5;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const tTrunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.3, 4, 6),
        trunkMat
      );
      tTrunk.position.set(x, 2, z);
      scene.add(tTrunk);

      const tCrown = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.5 + Math.random() * 0.5, 0),
        crownMat
      );
      tCrown.position.set(x, 4.5, z);
      scene.add(tCrown);
    }
  }

  _buildLighting(scene) {
    scene.add(new THREE.AmbientLight(0xffe4c4, 0.35));

    const sun = new THREE.DirectionalLight(0xffc888, 1.8);
    sun.position.set(-8, 10, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 40;
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;
    scene.add(sun);

    // Wärmliche Haus-Lampe als Akzent
    const window = new THREE.PointLight(0xffb870, 0.8, 8);
    window.position.set(-2.5, 2.5, -2);
    scene.add(window);
  }

  _buildSilhouettes(scene) {
    // Mutter am Kirschbaum
    const mutter = new Silhouette({
      profile: CHAR.mutter.profile,
      color: CHAR.mutter.color,
      tint: CHAR.mutter.tint,
      height: 1.72
    });
    mutter.position.set(-7, 0.86, 0);
    scene.add(mutter);
    this._silhouettes.push(mutter);
    this.addInteractable(mutter, async () => {
      await this.ctx.dialog.show(CHAR.mutter.garten);
    }, 'Mutter');

    // Vater an der Werkbank
    const vater = new Silhouette({
      profile: CHAR.vater.profile,
      color: CHAR.vater.color,
      height: 1.82
    });
    vater.position.set(6.5, 0.91, -2.5);
    scene.add(vater);
    this._silhouettes.push(vater);
    this.addInteractable(vater, async () => {
      await this.ctx.dialog.show(CHAR.vater.werkbank);
    }, 'Vater');

    // Alex jung, sitzend am Feuer, halbtransparent
    const alex = new Silhouette({
      profile: CHAR.alexJung.profile,
      color: CHAR.alexJung.color,
      tint: CHAR.alexJung.tint,
      opacity: 0.55,
      height: 1.55
    });
    alex.position.set(3, 0.78, 5);
    scene.add(alex);
    this._silhouettes.push(alex);
    this.addInteractable(alex, async () => {
      await this.ctx.dialog.show(CHAR.alexJung.nacht);
    }, 'Tante Alex');
  }

  _buildInteractables(scene) {
    // Kirschbaum klickbar
    this.addInteractable(this._cherryRef, async () => {
      await this.ctx.dialog.show([
        { text: 'Der Kirschbaum. Meine Eltern haben ihn gepflanzt, als ich geboren wurde.' },
        { text: 'Jedes Frühjahr trägt er weiße Blüten.' }
      ]);
    }, 'Kirschbaum');

    // Boxhandschuhe auf der Werkbank — aus primitiven Geometrien geformt
    const gloves = new THREE.Group();
    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x1a0a04,
      roughness: 0.75,
      metalness: 0.1,
      emissive: 0x0a0502,
      emissiveIntensity: 0.15
    });
    const leatherMatDark = new THREE.MeshStandardMaterial({
      color: 0x120804,
      roughness: 0.85
    });
    const stitchMat = new THREE.MeshStandardMaterial({
      color: 0x8a6840,
      roughness: 0.8
    });

    const makeGlove = (side) => {
      const glove = new THREE.Group();
      const flip = side === 'R' ? -1 : 1;

      // Hauptkörper — ovaler Dome (gedrückte Sphere)
      const main = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 14, 10),
        leatherMat
      );
      main.scale.set(1.1, 0.85, 1.3);
      main.position.y = 0.06;
      main.castShadow = true;
      glove.add(main);

      // Daumen — kleinere Sphere schräg angesetzt
      const thumb = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 10, 8),
        leatherMat
      );
      thumb.position.set(flip * 0.07, 0.04, -0.06);
      thumb.scale.set(0.9, 0.9, 1.2);
      thumb.castShadow = true;
      glove.add(thumb);

      // Handgelenk-Manschette (Cylinder, nach unten)
      const cuff = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.07, 0.08, 16),
        leatherMatDark
      );
      cuff.position.set(0, -0.015, 0.10);
      cuff.rotation.x = 0.2;
      cuff.castShadow = true;
      glove.add(cuff);

      // Manschetten-Rand
      const cuffEdge = new THREE.Mesh(
        new THREE.TorusGeometry(0.068, 0.01, 6, 20),
        stitchMat
      );
      cuffEdge.position.set(0, -0.055, 0.10);
      cuffEdge.rotation.x = Math.PI / 2 + 0.2;
      glove.add(cuffEdge);

      // Naht-Detail an Haupt-Sphere (zierlicher Torus)
      const seam = new THREE.Mesh(
        new THREE.TorusGeometry(0.095, 0.004, 4, 20),
        stitchMat
      );
      seam.rotation.x = Math.PI / 2;
      seam.position.y = 0.06;
      seam.scale.set(1.0, 1.3, 1.0);
      glove.add(seam);

      return glove;
    };

    const leftGlove = makeGlove('L');
    leftGlove.position.set(-0.14, 0, 0);
    leftGlove.rotation.y = -0.3;
    gloves.add(leftGlove);

    const rightGlove = makeGlove('R');
    rightGlove.position.set(0.12, 0, -0.03);
    rightGlove.rotation.y = 0.5;
    gloves.add(rightGlove);

    gloves.position.set(7, 1.0, -3);
    gloves.rotation.y = -0.3;
    scene.add(gloves);
    this._gloves = gloves;

    let glovesTaken = false;
    this.addInteractable(gloves, async () => {
      if (glovesTaken) return;
      glovesTaken = true;
      await this.ctx.dialog.show([
        { text: 'Schwere, schwarze Handschuhe aus Rindsleder. Sie duften nach Wachs.' },
        { speaker: 'Vater', text: '«Stärkere und Schwächere. Merk dir das.»' }
      ]);
      this.ctx.inventory.add({ id: 'boxhandschuhe' });
      this.ctx.save.addDiaryEntry({
        room: this.id,
        title: '14. Juli',
        text: 'Heute hat mir Vater Boxhandschuhe geschenkt. Er sagte, es gebe Richtig und Falsch, und wenn Stärkere Schwächeren Leid antun, sei das falsch.'
      });
      this.removeInteractable(gloves);
      if (this._exitMarker) {
        this._exitMarker.visible = true;
        this._exitBeam.visible = true;
      }
      this.ctx.objective.done('Boxhandschuhe gefunden', 'Folge dem goldenen Licht — verlasse den Garten.');
    }, 'Boxhandschuhe aufheben');
  }

  _buildExit(scene) {
    // Weg-Zeichen nach Süden — Cone SELBST ist klickbar, nicht ein unsichtbarer Trigger
    const markerGeo = new THREE.ConeGeometry(0.35, 0.9, 8);
    const markerMat = new THREE.MeshStandardMaterial({
      color: 0xd8b878,
      emissive: 0x8a6020,
      emissiveIntensity: 0.8
    });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.set(0, 1.5, 14);
    marker.visible = false;
    scene.add(marker);
    this._exitMarker = marker;

    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 6, 16, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xd8b878,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    beam.position.set(0, 4, 14);
    beam.visible = false;
    scene.add(beam);
    this._exitBeam = beam;

    this.addInteractable(marker, async () => {
      if (!this.ctx.inventory.has('boxhandschuhe')) {
        await this.ctx.dialog.show('Ich habe noch nicht alles gefunden. Die Werkbank meines Vaters ruft.');
        return;
      }
      this.onExit?.();
    }, 'Den Wald betreten');
  }

  update(_delta) {
    this._silhouettes.forEach((s) => s.faceCamera(this.ctx.camera));
    const t = performance.now() * 0.001;
    if (this._exitMarker && this._exitMarker.visible) {
      this._exitMarker.position.y = 1.5 + Math.sin(t * 2) * 0.15;
      this._exitMarker.rotation.y += 0.01;
    }
    if (this._miliRef?.userData._update) this._miliRef.userData._update(t);
  }
}

// Sepia-Foto eines Mädchens für Mili
function _makeMiliPhotoTexture() {
  const c = document.createElement('canvas');
  c.width = 96;
  c.height = 120;
  const ctx = c.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, c.height);
  bg.addColorStop(0, '#d8b880');
  bg.addColorStop(1, '#a08050');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, c.width, c.height);

  // Mädchen-Silhouette
  ctx.fillStyle = '#4a3018';
  ctx.beginPath();
  ctx.arc(48, 45, 14, 0, Math.PI * 2);
  ctx.fill();
  // Haare (schulterlang)
  ctx.beginPath();
  ctx.moveTo(34, 45);
  ctx.quadraticCurveTo(36, 65, 42, 70);
  ctx.lineTo(54, 70);
  ctx.quadraticCurveTo(60, 65, 62, 45);
  ctx.quadraticCurveTo(48, 28, 34, 45);
  ctx.fill();
  // Körper
  ctx.fillRect(36, 62, 24, 50);

  // Chinesische Zeichen unten rechts
  ctx.fillStyle = '#2a1a0a';
  ctx.font = '8px serif';
  ctx.fillText('永远', 66, 115);

  // Alterungs-Punkte
  ctx.globalAlpha = 0.2;
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = '#1a0a04';
    ctx.fillRect(Math.random() * c.width, Math.random() * c.height, 1, 1);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
