/**
 * SaveManager — localStorage-basiertes Auto-Save.
 *
 * Strukur im Storage:
 * {
 *   version: 1,
 *   currentRoom: 'foersterhaus',
 *   inventory: ['boxhandschuhe', 'kette'],
 *   diary: [{ room: 'foersterhaus', title: '14. Juli', text: '...' }],
 *   collectibles: ['mili-1'],
 *   flags: { triggerWarningSeen: true }
 * }
 */
const KEY = 'der-club-save';
const VERSION = 1;

export class SaveManager {
  constructor() {
    this.data = this._load();
  }

  _load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return this._default();
      const parsed = JSON.parse(raw);
      if (parsed.version !== VERSION) return this._default();
      return parsed;
    } catch {
      return this._default();
    }
  }

  _default() {
    return {
      version: VERSION,
      currentRoom: null,
      inventory: [],
      diary: [],
      collectibles: [],
      flags: {}
    };
  }

  _persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('[SaveManager] Persist failed:', e);
    }
  }

  // --- Room ---
  getCurrentRoom() { return this.data.currentRoom; }
  setCurrentRoom(id) { this.data.currentRoom = id; this._persist(); }

  // --- Inventory ---
  getInventoryIds() { return [...this.data.inventory]; }
  setInventoryIds(ids) { this.data.inventory = [...ids]; this._persist(); }

  // --- Diary ---
  getDiary() { return [...this.data.diary]; }
  addDiaryEntry(entry) {
    // Duplicate-check via (room + title)
    const key = `${entry.room}::${entry.title}`;
    if (this.data.diary.some((e) => `${e.room}::${e.title}` === key)) return;
    this.data.diary.push(entry);
    this._persist();
    // Listener für UI-Toast
    this._diaryListeners?.forEach((fn) => fn(entry));
  }
  onDiaryChange(fn) {
    if (!this._diaryListeners) this._diaryListeners = [];
    this._diaryListeners.push(fn);
  }

  // --- Collectibles ---
  getCollectibles() { return [...this.data.collectibles]; }
  addCollectible(id) {
    if (!this.data.collectibles.includes(id)) {
      this.data.collectibles.push(id);
      this._persist();
    }
  }

  // --- Flags ---
  hasFlag(key) { return !!this.data.flags[key]; }
  setFlag(key, value = true) {
    this.data.flags[key] = value;
    this._persist();
  }
  hasTriggerWarningBeenSeen() { return this.hasFlag('triggerWarningSeen'); }
  markTriggerWarningSeen() { this.setFlag('triggerWarningSeen'); }

  // --- Reset ---
  reset() {
    this.data = this._default();
    this._persist();
  }

  hasExistingSave() {
    return this.data.currentRoom !== null;
  }
}
