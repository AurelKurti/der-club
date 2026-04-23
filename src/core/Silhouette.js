import * as THREE from 'three';

/**
 * Silhouette — Platzhalter für Figuren in den Räumen.
 *
 * Ein vertikal stehendes Plane mit Umriss eines Menschen (Canvas-gezeichnet
 * als Textur). Immer Richtung Kamera ausgerichtet (Billboard).
 *
 * Vorteile: Null Modellierungsaufwand, null Animationen, ästhetisch
 * passend zum atmosphärisch-minimalistischen Stil.
 */
const _targetVec = new THREE.Vector3();

/**
 * Silhouette-Profile pro Figur — unterschiedliche Umrisse damit
 * Charaktere unterscheidbar sind (breit, schmal, gebückt, aufrecht).
 */
const PROFILES = {
  default:   { headR: 26, shoulderW: 50, hipW: 46, legW: 24, posture: 0 },
  mutter:    { headR: 22, shoulderW: 38, hipW: 44, legW: 22, posture: 0, dress: true },
  vater:     { headR: 28, shoulderW: 56, hipW: 50, legW: 28, posture: 0 },
  alexJung:  { headR: 20, shoulderW: 36, hipW: 38, legW: 20, posture: -5 },
  alex:      { headR: 22, shoulderW: 38, hipW: 40, legW: 22, posture: 0, shortHair: true },
  charlotte: { headR: 22, shoulderW: 36, hipW: 42, legW: 22, posture: 0, hair: true, dress: true },
  angus:     { headR: 26, shoulderW: 54, hipW: 48, legW: 26, posture: 0, hair: true },
  josh:      { headR: 25, shoulderW: 52, hipW: 46, legW: 24, posture: 0 },
  billy:     { headR: 28, shoulderW: 58, hipW: 52, legW: 28, posture: 3 },
  paterGerald: { headR: 24, shoulderW: 42, hipW: 46, legW: 24, posture: 0, robe: true },
  magicMike: { headR: 22, shoulderW: 40, hipW: 38, legW: 22, posture: 0 }
};

export class Silhouette extends THREE.Mesh {
  constructor({
    profile = 'default',
    color = 0x0a0a0a,
    tint = null,
    height = 1.75,
    width = 0.6,
    opacity = 1.0
  } = {}) {
    const geo = new THREE.PlaneGeometry(width, height);
    const canvas = _makeCanvas(PROFILES[profile] || PROFILES.default);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    // Billboards brauchen keine Mipmaps — spart ~33% VRAM pro Silhouette
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;

    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity,
      depthWrite: false,
      side: THREE.DoubleSide,
      color
    });
    super(geo, mat);

    this.height = height;
    this._tint = tint;

    if (tint) {
      const light = new THREE.PointLight(tint, 0.5, 2);
      light.position.set(0, 0.3, 0);
      this.add(light);
    }
  }

  faceCamera(camera) {
    camera.getWorldPosition(_targetVec);
    _targetVec.y = this.position.y;
    this.lookAt(_targetVec);
  }
}

function _makeCanvas(p) {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 384;
  const ctx = c.getContext('2d');

  ctx.clearRect(0, 0, c.width, c.height);
  // WICHTIG: Canvas zeichnet WEISS. Die Material-Color modiliert dann die
  // tatsächliche Silhouetten-Farbe. Früher war alles '#000' → jede CHAR-Color
  // wurde mit Schwarz multipliziert = immer unsichtbar-schwarz.
  ctx.fillStyle = '#ffffff';

  // Kopf (mit optional Haaren)
  const cx = 64 + p.posture;
  ctx.beginPath();
  ctx.arc(cx, 60, p.headR, 0, Math.PI * 2);
  ctx.fill();

  if (p.hair) {
    // Lange Haare
    ctx.beginPath();
    ctx.moveTo(cx - p.headR - 2, 55);
    ctx.quadraticCurveTo(cx, 100 + p.headR, cx + p.headR + 2, 55);
    ctx.lineTo(cx + p.headR, 40);
    ctx.quadraticCurveTo(cx, 20, cx - p.headR, 40);
    ctx.closePath();
    ctx.fill();
  } else if (p.shortHair) {
    // Kurz rasiert — kleine Haar-Andeutung
    ctx.beginPath();
    ctx.arc(cx, 45, p.headR - 2, Math.PI, 0);
    ctx.fill();
  }

  // Schultern + Körper (Trapez, ggf. mit Kleid)
  const shoulderY = 90;
  const hipY = p.dress ? 240 : 260;
  const shoulderX = p.shoulderW / 2;
  const hipX = p.hipW / 2;

  ctx.beginPath();
  ctx.moveTo(cx - shoulderX, shoulderY);
  ctx.lineTo(cx + shoulderX, shoulderY);
  if (p.robe) {
    // Talar: weite Form nach unten
    ctx.lineTo(cx + hipX + 20, 360);
    ctx.lineTo(cx - hipX - 20, 360);
  } else if (p.dress) {
    // Kleid: A-Form
    ctx.lineTo(cx + hipX + 6, hipY);
    ctx.lineTo(cx + hipX + 18, 360);
    ctx.lineTo(cx - hipX - 18, 360);
    ctx.lineTo(cx - hipX - 6, hipY);
  } else {
    ctx.lineTo(cx + hipX, hipY);
    ctx.lineTo(cx - hipX, hipY);
  }
  ctx.closePath();
  ctx.fill();

  // Beine (nur wenn kein Talar/Kleid die bis unten decken)
  if (!p.robe && !p.dress) {
    ctx.fillRect(cx - p.legW - 2, hipY, p.legW, 120);
    ctx.fillRect(cx + 2, hipY, p.legW, 120);
  }

  // Weiche Kanten
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const data = img.data;
  const w = c.width;
  for (let y = 1; y < c.height - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4 + 3;
      if (data[idx] > 0) {
        const n = [
          data[(y * w + x + 1) * 4 + 3],
          data[(y * w + x - 1) * 4 + 3],
          data[((y + 1) * w + x) * 4 + 3],
          data[((y - 1) * w + x) * 4 + 3]
        ];
        if (n.some((v) => v < 100)) data[idx] = 200;
      }
    }
  }
  ctx.putImageData(img, 0, 0);

  return c;
}
