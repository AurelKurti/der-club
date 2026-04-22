import * as THREE from 'three';
import { BaseRoom } from '../core/BaseRoom.js';
import { Silhouette } from '../core/Silhouette.js';
import { CHAR } from '../data/characters.js';
import { BoxFight } from '../minigames/BoxFight.js';
import { addMili, registerMiliInteraction } from '../core/Collectible.js';

/**
 * Raum 6 — Markthalle Cambridge (Boxkampf gegen Oxford)
 *
 * Quelle: Teil 3, Kap. 34-37
 * Ziel: Dramaturgisches Zentrum, Billy + Magic Mike einführen,
 *       Mini-Game 2 (Boxkampf).
 */
export class Markthalle extends BaseRoom {
  constructor(ctx) {
    super(ctx);
    this.id = 'markthalle';
    this.name = 'Markthalle, Cambridge';
    this.spawnPoint.set(0, 1.6, 10);
    this.ambientProfile = 'hall';
    this.floorMaterial = 'stone';

    this._silhouettes = [];
    this._fightDone = false;
  }

  build() {
    const { scene } = this;
    scene.background = new THREE.Color(0x0a0806);
    scene.fog = new THREE.FogExp2(0x0a0806, 0.03);

    this._buildFloor(scene);
    this._buildWalls(scene);
    this._buildRing(scene);
    this._buildChairs(scene);
    this._buildCurtain(scene);
    this._buildLighting(scene);
    this._buildCharacters(scene);
    this._buildExit(scene);

    // Mili unter einem der Plastikstühle in der letzten Reihe
    this._miliRef = addMili(scene, new THREE.Vector3(4, 0.3, -12), this.id, this.ctx);
    registerMiliInteraction(this, this._miliRef, this.id);

    this.ctx.objective.set('Steig in den Boxring in der Mitte der Halle.');
  }

  _buildFloor(scene) {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 30),
      new THREE.MeshStandardMaterial({ color: 0x3a2820, roughness: 0.9 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
  }

  _buildWalls(scene) {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x2a1e14, roughness: 0.9 });
    [
      { pos: [0, 4, -15], size: [26, 8, 0.3] },
      { pos: [0, 4,  15], size: [26, 8, 0.3] },
      { pos: [-13, 4, 0], size: [0.3, 8, 30] },
      { pos: [13, 4, 0],  size: [0.3, 8, 30] }
    ].forEach(({ pos, size }) => {
      const w = new THREE.Mesh(new THREE.BoxGeometry(...size), wallMat);
      w.position.set(...pos);
      scene.add(w);
      this.addCollider(w);
    });

    // Decke (dunkel, mit Metallträgern)
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0x0a0806, roughness: 0.95 });
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(26, 30), ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = 8;
    scene.add(ceil);

    // Träger
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x1a1410, metalness: 0.6, roughness: 0.5 });
    for (let z = -12; z <= 12; z += 4) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(26, 0.3, 0.3), beamMat);
      beam.position.set(0, 7.5, z);
      scene.add(beam);
    }
  }

  _buildRing(scene) {
    const ringCenter = new THREE.Vector3(0, 0, 0);
    const ringSize = 5;

    // Ring-Matte (Segeltuch-Anmutung)
    const matMat = new THREE.MeshStandardMaterial({
      color: 0xbcaa8c,
      roughness: 0.95
    });
    const mat = new THREE.Mesh(
      new THREE.BoxGeometry(ringSize * 2, 0.2, ringSize * 2),
      matMat
    );
    mat.position.set(ringCenter.x, 0.6, ringCenter.z);
    mat.castShadow = true;
    mat.receiveShadow = true;
    scene.add(mat);
    this.addCollider(mat);

    // 4 Eckpfosten
    const postMat = new THREE.MeshStandardMaterial({ color: 0xc82820, roughness: 0.7 });
    const corners = [
      [-ringSize, -ringSize], [ringSize, -ringSize],
      [ringSize, ringSize], [-ringSize, ringSize]
    ];
    corners.forEach(([x, z]) => {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 2.4, 8),
        postMat
      );
      post.position.set(ringCenter.x + x, 1.8, ringCenter.z + z);
      post.castShadow = true;
      scene.add(post);
    });

    // Seile (drei Höhen zwischen Pfosten)
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.9 });
    for (let i = 0; i < 4; i++) {
      const a = corners[i];
      const b = corners[(i + 1) % 4];
      const midX = (a[0] + b[0]) / 2;
      const midZ = (a[1] + b[1]) / 2;
      const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const angle = Math.atan2(b[1] - a[1], b[0] - a[0]);

      [1.3, 2.0, 2.7].forEach((y) => {
        const rope = new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.03, length, 6),
          ropeMat
        );
        rope.position.set(midX, y, midZ);
        rope.rotation.z = Math.PI / 2;
        rope.rotation.y = -angle;
        scene.add(rope);
      });
    }
  }

  _buildChairs(scene) {
    // Plastik-Stuhl-Andeutungen als InstancedMesh — vereinfacht: wenige Boxes in Reihen
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x1a1814, roughness: 0.85 });
    for (let row = 0; row < 4; row++) {
      for (let seat = -8; seat <= 8; seat++) {
        if (Math.abs(seat) < 2 && row < 1) continue; // Platz vor Ring frei

        const chair = new THREE.Mesh(
          new THREE.BoxGeometry(0.45, 0.9, 0.45),
          chairMat
        );
        chair.position.set(seat * 0.55, 0.45, -9 - row * 0.7);
        scene.add(chair);
      }
      for (let seat = -8; seat <= 8; seat++) {
        if (Math.abs(seat) < 2 && row < 1) continue;
        const chair = new THREE.Mesh(
          new THREE.BoxGeometry(0.45, 0.9, 0.45),
          chairMat
        );
        chair.position.set(seat * 0.55, 0.45, 9 + row * 0.7);
        scene.add(chair);
      }
    }

    // Zuschauer-Silhouetten als Plane-Reihen (angedeutet, ohne einzelne Meshes)
    const crowdTex = _makeCrowdTexture();
    const crowdMat = new THREE.MeshBasicMaterial({
      map: crowdTex,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const crowdBack = new THREE.Mesh(new THREE.PlaneGeometry(16, 4), crowdMat);
    crowdBack.position.set(0, 2, -13);
    scene.add(crowdBack);
    const crowdFront = crowdBack.clone();
    crowdFront.position.set(0, 2, 13);
    crowdFront.rotation.y = Math.PI;
    scene.add(crowdFront);
  }

  _buildCurtain(scene) {
    // Roter Samtvorhang am Eingang (Süden)
    const curtMat = new THREE.MeshStandardMaterial({
      color: 0x8a1812,
      roughness: 0.95,
      emissive: 0x1a0a08,
      emissiveIntensity: 0.2
    });
    const curt = new THREE.Mesh(new THREE.BoxGeometry(12, 7.5, 0.3), curtMat);
    curt.position.set(0, 3.75, 14);
    scene.add(curt);
  }

  _buildLighting(scene) {
    scene.add(new THREE.AmbientLight(0x3a2a20, 0.4));
    scene.add(new THREE.HemisphereLight(0xffe8c0, 0x202018, 0.2));

    // 4 SpotLights über dem Ring (3 hell, 1 tot — Buchdetail)
    const spotPositions = [
      { pos: [-3, 7, -3], active: true  },
      { pos: [ 3, 7, -3], active: true  },
      { pos: [-3, 7,  3], active: true  },
      { pos: [ 3, 7,  3], active: false }  // die dunkle Lampe
    ];

    spotPositions.forEach(({ pos, active }) => {
      if (active) {
        const spot = new THREE.SpotLight(0xffe8c0, 2.0, 15, Math.PI / 6, 0.3);
        spot.position.set(...pos);
        spot.target.position.set(0, 0.6, 0);
        spot.castShadow = true;
        scene.add(spot);
        scene.add(spot.target);
      }
      // Lampen-Gehäuse (kleiner Zylinder)
      const housing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.15, 0.3, 8),
        new THREE.MeshStandardMaterial({
          color: active ? 0xffe080 : 0x0a0804,
          emissive: active ? 0xffe080 : 0x0,
          emissiveIntensity: active ? 1.0 : 0,
          metalness: 0.5
        })
      );
      housing.position.set(...pos);
      scene.add(housing);
    });

    // Leichte Rückbeleuchtung
    const back = new THREE.PointLight(0xaa4020, 0.4, 20);
    back.position.set(0, 4, 14);
    scene.add(back);
  }

  _buildCharacters(scene) {
    // Billy in der Ecke (warm getinted)
    const billy = new Silhouette({
      profile: CHAR.billy.profile,
      color: CHAR.billy.color,
      tint: 0xd86830,
      height: 1.9,
      width: 0.66
    });
    billy.position.set(-6, 0.95, -5);
    scene.add(billy);
    this._silhouettes.push(billy);
    let billyTalked = false;
    this.addInteractable(billy, async () => {
      if (billyTalked) {
        await this.ctx.dialog.show('Billy nickt. «Viel Glück da drin.»');
        return;
      }
      billyTalked = true;
      await this.ctx.dialog.show(CHAR.billy.ring);
      this.ctx.inventory.add({ id: 'kastanie' });
    }, 'Billy');

    // Magic Mike, gegenüber
    const mike = new Silhouette({
      profile: CHAR.magicMike.profile,
      color: CHAR.magicMike.color,
      height: 1.78,
      width: 0.58
    });
    mike.position.set(6, 0.89, -5);
    scene.add(mike);
    this._silhouettes.push(mike);
    let mikeTalked = false;
    this.addInteractable(mike, async () => {
      if (mikeTalked) {
        await this.ctx.dialog.show('Magic Mike starrt in sein Bibelbuch.');
        return;
      }
      mikeTalked = true;
      await this.ctx.dialog.show(CHAR.magicMike.halle);
    }, 'Magic Mike');
  }

  _buildExit(scene) {
    // Klick-Target auf Ring → startet Boxkampf
    const ringTrigger = new THREE.Mesh(
      new THREE.BoxGeometry(9, 3, 9),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    ringTrigger.position.set(0, 1.5, 0);
    scene.add(ringTrigger);

    this.addInteractable(ringTrigger, async () => {
      if (this._fightDone) {
        await this.ctx.dialog.show('Ich habe gewonnen. Der Ring steht leer.');
        return;
      }
      await this.ctx.dialog.show([
        { speaker: 'Priest', text: '«Drei Runden. Du gehst da rein und kommst als Sieger raus.»' }
      ]);
      const result = await this.ctx.game.startMiniGame(new BoxFight(this.ctx));
      this._fightDone = true;

      await this.ctx.dialog.show([
        { text: 'Der Ringarzt wischt mir das Blut aus der Nase.' },
        { text: 'Billy läuft mit der Regenbogenfahne ein und schlägt den Samoaner nieder.' },
        { text: 'Cambridge gewinnt 5:4.' }
      ]);

      this.ctx.inventory.add({ id: 'blazer' });
      this.ctx.save.addDiaryEntry({
        room: this.id,
        title: 'Boxkampf gegen Oxford',
        text: 'Mike ging im ersten Treffer zu Boden. Kiefer gebrochen. Ich stieg in den Ring. Drei Runden. Ich gewann. Billy lief mit der Regenbogenfahne ein und schlug den Samoaner nieder. Cambridge gewann 5:4. Priest nahm die Fahne und ging.'
      });

      if (this._exitCone) this._exitCone.visible = true;
      this.ctx.objective.done('Cambridge gewinnt 5:4', 'Verlasse die Halle — die Schmetterlinge warten.');
    }, this._fightDone ? 'Ring' : 'In den Ring steigen');

    // Ausgang nach Norden (durch Samtvorhang Richtung Süden zurück,
    // aber mit Cone Richtung Nord — Pitt Club Hinterraum folgt)
    const exitDoor = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 3, 0.15),
      new THREE.MeshStandardMaterial({
        color: 0x3a1810,
        roughness: 0.9,
        emissive: 0x1a0a04,
        emissiveIntensity: 0.3
      })
    );
    exitDoor.position.set(0, 1.5, -14.8);
    scene.add(exitDoor);

    const coneMat = new THREE.MeshStandardMaterial({
      color: 0xd8b878,
      emissive: 0x8a6020,
      emissiveIntensity: 0.9
    });
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 8), coneMat);
    cone.position.set(0, 1.3, -12);
    cone.visible = false;
    scene.add(cone);
    this._exitCone = cone;

    this.addInteractable(exitDoor, async () => {
      if (!this._fightDone) {
        await this.ctx.dialog.show('Noch nicht. Der Ring wartet.');
        return;
      }
      this.onExit?.();
    }, 'Aus der Halle');
  }

  update(_delta) {
    this._silhouettes.forEach((s) => s.faceCamera(this.ctx.camera));
    const t = performance.now() * 0.001;
    if (this._exitCone && this._exitCone.visible) {
      this._exitCone.position.y = 1.3 + Math.sin(t * 2) * 0.12;
      this._exitCone.rotation.y += 0.01;
    }
    if (this._miliRef?.userData._update) this._miliRef.userData._update(t);
  }
}

// Einfache Zuschauer-Massen-Textur via Canvas
function _makeCrowdTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, c.width, c.height);

  // Reihen von Kopf-Silhouetten
  for (let row = 0; row < 4; row++) {
    const y = 30 + row * 20;
    for (let x = 0; x < c.width; x += 14 + Math.random() * 8) {
      ctx.fillStyle = `rgba(20,20,20,${0.4 + Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(x, y, 7 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 6, y + 4, 12, 16);
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
