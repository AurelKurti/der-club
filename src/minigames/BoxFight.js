import { BaseMiniGame } from './BaseMiniGame.js';

/**
 * Mini-Game 2 — Boxkampf gegen Oxford (3 Runden).
 *
 * Gegner-Silhouette attackiert in Pattern. Spieler:
 *  - E = Schlag
 *  - Shift = Block
 *  - A/D = ausweichen (links/rechts)
 *
 * Auto-Win nach 3 Runden — die Story verlangt Hans' Sieg. Wer schlecht
 * spielt, bekommt als Detail eine "gebrochene Nase" (Blut-Sprite) —
 * passt zum Buch.
 */
const ROUNDS = 3;
const ROUND_MS = 20_000;
const ATTACK_TELEGRAPH_MS = 700;

export class BoxFight extends BaseMiniGame {
  constructor(ctx) {
    super(ctx);
    this.round = 0;
    this.hp = 100;
    this.oppHp = 100;
    this.state = 'idle'; // idle | attacking | winning
    this.attackTimer = 0;
    this.attackSide = 'straight';
    this.playerBlock = false;
    this.playerDodgeDir = 0;
    this._roundStart = 0;
    this._timers = [];
  }

  /** Tracked setTimeout — alle Timer werden in cleanup() gecleart. */
  _setTimeout(fn, ms) {
    const id = setTimeout(() => {
      if (!this._ended) fn();
    }, ms);
    this._timers.push(id);
    return id;
  }

  start() {
    this.setTitle('Boxkampf gegen Oxford — 3 Runden');
    this.setHint('E = Schlag · Shift = Block · A/D = ausweichen');

    this.bodyEl.innerHTML = `
      <div class="fight-scene">
        <div class="fight-stats">
          <div class="hp-bar you">
            <span class="hp-label">Hans</span>
            <div class="hp-track"><div class="hp-fill"></div></div>
          </div>
          <div class="round-info">Runde <span class="round-n">1</span> / ${ROUNDS}</div>
          <div class="hp-bar opp">
            <span class="hp-label">Oxford</span>
            <div class="hp-track"><div class="hp-fill"></div></div>
          </div>
        </div>
        <div class="fight-arena">
          <div class="fight-opponent">
            <div class="opp-silhouette"></div>
            <div class="opp-warning"></div>
          </div>
          <div class="fight-player-view">
            <div class="fight-feedback"></div>
          </div>
        </div>
      </div>
    `;

    this.youHpFill = this.bodyEl.querySelector('.hp-bar.you .hp-fill');
    this.oppHpFill = this.bodyEl.querySelector('.hp-bar.opp .hp-fill');
    this.roundN = this.bodyEl.querySelector('.round-n');
    this.feedbackEl = this.bodyEl.querySelector('.fight-feedback');
    this.warningEl = this.bodyEl.querySelector('.opp-warning');
    this.oppSilhouette = this.bodyEl.querySelector('.opp-silhouette');
    this.arenaEl = this.bodyEl.querySelector('.fight-arena');

    this._updateHp();
    this._ended = false;

    this.onKey((e) => {
      if (this.state === 'winning' || this._ended) return;
      if (e.repeat) return;
      if (e.code === 'KeyE') this._playerAttack();
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this._playerBlock();
      if (e.code === 'KeyA') this._playerDodge(-1);
      if (e.code === 'KeyD') this._playerDodge(1);
    });

    this.onKeyUp((e) => {
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.playerBlock = false;
        this.arenaEl?.classList.remove('blocking');
      }
    });

    this._startRound();
  }

  cleanup() {
    // Bricht Attack-Timer-Ketten durch _ended-Flag + cleart alle pending Timer
    this._ended = true;
    this._timers.forEach(clearTimeout);
    this._timers.length = 0;
  }

  _startRound() {
    if (this._ended) return;
    this.round++;
    this.roundN.textContent = this.round;
    this._roundStart = performance.now();
    this._scheduleNextAttack();
    this._showFeedback(`Runde ${this.round} — Gong!`, 'info');
  }

  _scheduleNextAttack() {
    if (this._ended) return;
    const delay = 1500 + Math.random() * 1500;
    this._setTimeout(() => this._beginAttack(), delay);
  }

  _beginAttack() {
    if (this.state === 'winning' || this._ended) return;
    this.state = 'attacking';
    this.attackSide = ['left', 'right', 'straight'][Math.floor(Math.random() * 3)];
    this.attackTimer = performance.now() + ATTACK_TELEGRAPH_MS;

    this.warningEl.textContent = this.attackSide === 'left'
      ? '← Angriff'
      : this.attackSide === 'right'
        ? 'Angriff →'
        : '↓ Mitte';
    this.warningEl.className = `opp-warning active ${this.attackSide}`;

    this._setTimeout(() => this._resolveAttack(), ATTACK_TELEGRAPH_MS);
  }

  _resolveAttack() {
    if (this.state === 'winning' || this._ended) return;
    this.warningEl.className = 'opp-warning';
    this.warningEl.textContent = '';

    let hit = true;

    if (this.playerBlock) {
      hit = false;
      this._showFeedback('Block', 'good');
    } else if (this.attackSide === 'left' && this.playerDodgeDir === 1) {
      hit = false;
      this._showFeedback('ausgewichen →', 'good');
    } else if (this.attackSide === 'right' && this.playerDodgeDir === -1) {
      hit = false;
      this._showFeedback('ausgewichen ←', 'good');
    }

    if (hit) {
      this.hp = Math.max(0, this.hp - 10);
      this._showFeedback('Treffer!', 'bad');
      this._flashArena();
    }

    this.playerDodgeDir = 0;
    this._updateHp();
    this.state = 'idle';

    if (performance.now() - this._roundStart > ROUND_MS) {
      this._endRound();
    } else {
      this._scheduleNextAttack();
    }
  }

  _playerAttack() {
    if (this.state !== 'idle' && this.state !== 'attacking') return;
    // Einfache Cooldown (verhindert Spam-Win)
    const now = performance.now();
    if (this._lastAttack && now - this._lastAttack < 350) return;
    this._lastAttack = now;
    // Schlag landet — Gegner kann nicht blocken
    this.oppHp = Math.max(0, this.oppHp - 8);
    this._showFeedback('Schlag!', 'good');
    this._updateHp();
  }

  _playerBlock() {
    this.playerBlock = true;
    this.arenaEl?.classList.add('blocking');
  }

  _playerDodge(dir) {
    this.playerDodgeDir = dir;
    this._setTimeout(() => { if (this.playerDodgeDir === dir) this.playerDodgeDir = 0; }, 500);
  }

  _endRound() {
    if (this._ended) return;
    if (this.round >= ROUNDS) {
      this._finish();
    } else {
      this._showFeedback(`Ende Runde ${this.round}`, 'info');
      this._setTimeout(() => this._startRound(), 2000);
    }
  }

  _finish() {
    this.state = 'winning';
    const hpPercent = this.hp / 100;
    // Immer Sieg — Story-bedingt
    const bloodyNose = hpPercent < 0.5;

    this.bodyEl.innerHTML = `
      <div class="fight-summary ${bloodyNose ? 'bloody' : ''}">
        <h3>Sieg nach Punkten</h3>
        <p>${bloodyNose
          ? 'Meine Nase bricht. Blut tropft auf meinen Blazer.'
          : 'Drei Runden. Kein Kratzer. Cambridge führt.'}</p>
        <p class="note">Billy läuft mit der Regenbogenfahne ein. Schlägt den Samoaner k.o.<br>Cambridge gewinnt 5:4.</p>
        <button class="minigame-continue">Aus dem Ring</button>
      </div>
    `;
    this.bodyEl.querySelector('.minigame-continue').addEventListener('click', () => {
      this.end('won');
    });
  }

  _updateHp() {
    this.youHpFill.style.width = `${Math.max(0, this.hp)}%`;
    this.oppHpFill.style.width = `${Math.max(0, this.oppHp)}%`;
  }

  _showFeedback(text, cls) {
    if (!this.feedbackEl) return;
    this.feedbackEl.textContent = text;
    this.feedbackEl.className = `fight-feedback ${cls}`;
    this._setTimeout(() => {
      if (!this.feedbackEl) return;
      if (this.feedbackEl.textContent === text) {
        this.feedbackEl.textContent = '';
        this.feedbackEl.className = 'fight-feedback';
      }
    }, 600);
  }

  _flashArena() {
    this.arenaEl?.classList.add('hit');
    this._setTimeout(() => this.arenaEl?.classList.remove('hit'), 200);
  }
}
