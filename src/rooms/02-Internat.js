import * as THREE from 'three';
import { BaseRoom } from '../core/BaseRoom.js';
import { Silhouette } from '../core/Silhouette.js';
import { CHAR } from '../data/characters.js';
import { BoxRhythm } from '../minigames/BoxRhythm.js';
import { addMili, registerMiliInteraction } from '../core/Collectible.js';

/**
 * Raum 2 — Internat Weinkeller (Johannes-Kolleg)
 *
 * Quelle: Teil 1, Kap. 5
 * Pater Gerald als heimlicher Box-Lehrer. Mini-Game 1.
 */
export class InternatKeller extends BaseRoom {
  constructor(ctx) {
    super(ctx);
    this.id = 'internat';
    this.name = 'Weinkeller, Johannes-Kolleg';
    this.spawnPoint.set(0, 1.6, 16);
    this.ambientProfile = 'basement';
    this.floorMaterial = 'stone';

    this._silhouettes = [];
    this._minigameDone = false;
  }

  build() {
    const { scene } = this;
    scene.background = new THREE.Color(0x08080c);
    scene.fog = new THREE.FogExp2(0x08080c, 0.07);

    this._buildFloor(scene);
    this._buildCeiling(scene);
    this._buildWalls(scene);
    this._buildWineRacks(scene);
    this._buildArches(scene);
    this._buildLighting(scene);
    this._buildPater(scene);
    this._buildPratzen(scene);
    this._buildExit(scene);

    // Mili versteckt zwischen Weinflaschen (linkes Regal, mittig)
    this._miliRef = addMili(scene, new THREE.Vector3(-4.5, 1.3, 4), this.id, this.ctx);
    registerMiliInteraction(this, this._miliRef, this.id);

    this.ctx.objective.set('Geh zu Pater Gerald am Ende des Kellers.');
  }

  _buildFloor(scene) {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 40),
      new THREE.MeshStandardMaterial({ color: 0x2a2420, roughness: 0.95 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
  }

  _buildCeiling(scene) {
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 40),
      new THREE.MeshStandardMaterial({ color: 0x14100c, roughness: 0.95 })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 3.4;
    scene.add(ceiling);
  }

  _buildWalls(scene) {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x3a3028, roughness: 0.9 });
    [-6, 6].forEach((x) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.4, 40), wallMat);
      wall.position.set(x, 1.7, 0);
      wall.castShadow = true;
      wall.receiveShadow = true;
      scene.add(wall);
      this.addCollider(wall);
    });
    [-20, 20].forEach((z) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(12, 3.4, 0.4), wallMat);
      wall.position.set(0, 1.7, z);
      wall.castShadow = true;
      scene.add(wall);
      this.addCollider(wall);
    });
  }

  _buildWineRacks(scene) {
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x2a1e12, roughness: 0.95 });
    const bottleMat = new THREE.MeshStandardMaterial({ color: 0x181008, roughness: 0.3, metalness: 0.15 });

    for (let z = -16; z <= 16; z += 4) {
      [-5.2, 5.2].forEach((x) => {
        // Regal
        const rack = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.8, 3), rackMat);
        rack.position.set(x, 1.4, z);
        rack.castShadow = true;
        rack.receiveShadow = true;
        scene.add(rack);
        this.addCollider(rack);

        // Flaschen
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 4; col++) {
            const bottle = new THREE.Mesh(
              new THREE.CylinderGeometry(0.06, 0.06, 0.35, 8),
              bottleMat
            );
            const offsetX = x > 0 ? -0.5 : 0.5;
            bottle.position.set(
              x + offsetX,
              0.5 + row * 0.7,
              z - 1.2 + col * 0.7
            );
            bottle.rotation.z = x > 0 ? Math.PI / 2 : -Math.PI / 2;
            scene.add(bottle);
          }
        }
      });
    }
  }

  _buildArches(scene) {
    // Tragbogen-Andeutungen alle 8m — dickere Säulen seitlich
    const archMat = new THREE.MeshStandardMaterial({ color: 0x3a2e22, roughness: 0.95 });
    for (let z = -12; z <= 12; z += 8) {
      [-5.5, 5.5].forEach((x) => {
        const pillar = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 3.4, 0.6),
          archMat
        );
        pillar.position.set(x, 1.7, z);
        pillar.castShadow = true;
        scene.add(pillar);
        this.addCollider(pillar);
      });
    }
  }

  _buildLighting(scene) {
    scene.add(new THREE.AmbientLight(0x402818, 0.08));

    // Einzelne Glühbirnen als Punktlichter entlang des Gangs
    for (let z = -14; z <= 14; z += 7) {
      const lamp = new THREE.PointLight(0xff7828, 1.0, 9);
      lamp.position.set(0, 3.0, z);
      lamp.castShadow = true;
      lamp.shadow.mapSize.width = 512;
      lamp.shadow.mapSize.height = 512;
      scene.add(lamp);

      // Glühbirne als emissive Sphere
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffae5a })
      );
      bulb.position.copy(lamp.position);
      scene.add(bulb);

      // Kabel (dünner Cylinder nach oben)
      const wire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.4, 6),
        new THREE.MeshBasicMaterial({ color: 0x1a1a1a })
      );
      wire.position.set(0, 3.2, z);
      scene.add(wire);
    }

    // Schwächere Akzent-Beleuchtung am Ende (nahe Pater Gerald)
    const accent = new THREE.PointLight(0xaa5830, 0.6, 6);
    accent.position.set(0, 2.0, -10);
    scene.add(accent);
  }

  _buildPater(scene) {
    const pater = new Silhouette({
      profile: CHAR.paterGerald.profile,
      color: CHAR.paterGerald.color,
      height: 1.88,
      width: 0.66
    });
    pater.position.set(0, 0.94, -10);
    scene.add(pater);
    this._silhouettes.push(pater);
    let paterTalked = false;
    this.addInteractable(pater, async () => {
      if (paterTalked) {
        await this.ctx.dialog.show('Pater Gerald nickt: «You know what to do.»');
        return;
      }
      paterTalked = true;
      await this.ctx.dialog.show(CHAR.paterGerald.keller);
      this.ctx.save.addDiaryEntry({
        room: this.id,
        title: 'Johannes-Kolleg, Winter',
        text: 'Pater Gerald trainiert mich heimlich im Weinkeller. Er war Boxer. Er sagt, ich solle das Gegenteil von dem tun, was mein Gegner erwartet.'
      });
      this.ctx.objective.set('Klicke auf die Box-Pratzen für das Training.');
    }, 'Pater Gerald');
  }

  _buildPratzen(scene) {
    // Zwei Pratzen-Sofakissen-Ersatz, wie im Buch mit "Filetiermesser-Löchern"
    const pratzeMat = new THREE.MeshStandardMaterial({
      color: 0x5a3820,
      roughness: 0.85,
      emissive: 0x1a0a04,
      emissiveIntensity: 0.15
    });

    const pratzeGroup = new THREE.Group();
    [-0.35, 0.35].forEach((xOffset) => {
      const kissen = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.55, 0.18),
        pratzeMat
      );
      kissen.position.x = xOffset;
      kissen.castShadow = true;
      pratzeGroup.add(kissen);
    });
    pratzeGroup.position.set(0, 1.35, -9);
    // Leicht in Richtung Pater rotieren, als halte er sie
    pratzeGroup.rotation.y = Math.PI;
    scene.add(pratzeGroup);

    this.addInteractable(pratzeGroup, async () => {
      if (this._minigameDone) {
        await this.ctx.dialog.show('Ich habe heute genug getrainiert.');
        return;
      }
      await this.ctx.dialog.show([
        { speaker: 'Pater Gerald', text: '«Show me what you have. Left. Right. On the beat.»' }
      ]);
      const result = await this.ctx.game.startMiniGame(new BoxRhythm(this.ctx));
      this._minigameDone = true;

      if (result === 'skipped') {
        await this.ctx.dialog.show('[Übung abgebrochen. Ich werde ein anderes Mal wiederkommen.]');
      }

      await this.ctx.dialog.show([
        { speaker: 'Pater Gerald', text: '«Go. It is late.»' }
      ]);

      // Ausgang aktivieren
      if (this._exitBeam) this._exitBeam.visible = true;
      if (this._exitCone) this._exitCone.visible = true;
      this.ctx.objective.done('Training abgeschlossen', 'Folge dem goldenen Licht zur Tür.');
    }, this._minigameDone ? 'Pratzen' : 'Box-Training starten');
  }

  _buildExit(scene) {
    // Tür am Südende (zurück zur Welt, weiter nach Cambridge)
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x4a2e18,
      roughness: 0.9,
      emissive: 0x1a0e08,
      emissiveIntensity: 0.4
    });
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.4, 0.15), doorMat);
    door.position.set(0, 1.2, 19.8);
    scene.add(door);

    // Glimm-Cone vor der Tür (aktiviert nach Mini-Game)
    const coneMat = new THREE.MeshStandardMaterial({
      color: 0xd8b878,
      emissive: 0x8a6020,
      emissiveIntensity: 0.9
    });
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.7, 8), coneMat);
    cone.position.set(0, 1.3, 18);
    cone.visible = false;
    scene.add(cone);
    this._exitCone = cone;

    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xd8b878,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 5, 12, 1, true),
      beamMat
    );
    beam.position.set(0, 3.2, 18);
    beam.visible = false;
    scene.add(beam);
    this._exitBeam = beam;

    this.addInteractable(door, async () => {
      if (!this._minigameDone) {
        await this.ctx.dialog.show('Das Training ist noch nicht zu Ende. Die Pratzen warten.');
        return;
      }
      this.onExit?.();
    }, 'Die Burg verlassen');
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
