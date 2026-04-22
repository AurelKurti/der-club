import * as THREE from 'three';

/**
 * Mili-Lesezeichen — versteckte Bonus-Sammelobjekte, 1 pro Raum.
 *
 * Dargestellt als kleine leuchtende Papierschnipsel (Plane mit subtler Glow).
 * Der Spieler kann sie übersehen — das ist der Punkt. Alle 8 finden → Bonus-Sequenz.
 *
 * Aktivierung: `addMili(scene, position, roomId, ctx)` in jedem Raum.
 */

export function addMili(scene, position, roomId, ctx) {
  const id = `mili-${roomId}`;

  // Falls bereits gesammelt, nicht anzeigen
  if (ctx.save.getCollectibles().includes(id)) return null;

  const group = new THREE.Group();

  // Kleines Blatt als Plane mit Canvas-Textur (chinesische Zeichen 永远米利)
  const tex = _makeMiliTexture();
  const paper = new THREE.Mesh(
    new THREE.PlaneGeometry(0.18, 0.14),
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    })
  );
  group.add(paper);

  // Weicher Glow-Ring unterhalb
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xd8b878,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.22, 24), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = -0.08;
  group.add(ring);

  group.position.copy(position);
  group.userData.isMili = true;
  group.userData.miliId = id;
  scene.add(group);

  // Animation hook — pulsiert
  group.userData._update = (t) => {
    group.position.y = position.y + Math.sin(t * 2) * 0.06;
    paper.rotation.y = t * 0.5;
    ring.material.opacity = 0.2 + Math.sin(t * 3) * 0.15;
  };

  return group;
}

/**
 * Registriert Mili als Interactable im Raum.
 */
export function registerMiliInteraction(room, miliMesh, roomId) {
  if (!miliMesh) return;
  let pickedUp = false;
  room.addInteractable(miliMesh, async () => {
    if (pickedUp) return;           // Idempotent: verhindert Doppel-Klick
    pickedUp = true;
    await room.ctx.dialog.show([
      { text: '[Ein kleines vergilbtes Blatt Papier. Chinesische Zeichen:]' },
      { speaker: 'Mili', text: '«永远» — Für immer.' }
    ]);
    room.ctx.save.addCollectible(`mili-${roomId}`);
    room.ctx.audio?.pickup();
    // Entferne Mesh + Interactable (sauber, auch wenn parent=null)
    room.removeInteractable(miliMesh);

    // Bei allen 8 gesammelt → Bonus-Text (mit schneller Cleanup-Option)
    const total = room.ctx.save.getCollectibles()
      .filter((id) => id.startsWith('mili-')).length;
    if (total >= 8) {
      room._miliBonusTimer = setTimeout(async () => {
        // Raum könnte mittlerweile weg sein — safety check
        if (!room.scene || !room.ctx.dialog) return;
        await room.ctx.dialog.show([
          { speaker: 'Mili', text: '«Wecker: 7 Uhr.»' },
          { speaker: 'Mili', text: '«Sport: 50 Liegestützen, 30 Dips. Frühstück: Jiaozi mit Instantnudeln.»' },
          { speaker: 'Mili', text: '«Losung des Tages: Der Beste sein.»' },
          { text: '[Eine Stimme, die nur Hans hört. Seine Schwester Mili — gestorben vor langer Zeit. «永远米利» — Mili für immer.]' }
        ]);
      }, 800);
    }
  }, 'Ein kleines Blatt Papier');
}

function _makeMiliTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 96;
  const ctx = c.getContext('2d');

  // Hintergrund: vergilbtes Papier
  const bg = ctx.createLinearGradient(0, 0, 0, c.height);
  bg.addColorStop(0, '#f0e4c8');
  bg.addColorStop(1, '#d8c0a0');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, c.width, c.height);

  // Chinesische Zeichen 永远米利 (Forever Mili)
  ctx.fillStyle = '#2a1a08';
  ctx.font = '28px serif';
  ctx.fillText('永远米利', 20, 60);

  // Rand-Rissiges Detail
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = '#8a6820';
    ctx.fillRect(Math.random() * c.width, Math.random() * c.height, 1, 1);
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
