import { getItem } from '../data/items.js';

/**
 * Inventory — HUD oben rechts, persistiert via SaveManager.
 *
 * Items werden über Item-Registry rekonstruiert beim Reload.
 */
export class Inventory {
  constructor(audio = null, save = null) {
    this.audio = audio;
    this.save = save;
    this.items = [];
    this.maxSlots = 12;

    this.el = document.createElement('div');
    this.el.className = 'inventory-hud';
    document.getElementById('ui-root').appendChild(this.el);

    // Beim Start: aus Save rehydrieren
    if (save) {
      const ids = save.getInventoryIds?.() || [];
      for (const id of ids) {
        const item = getItem(id);
        if (item) this.items.push(item);
      }
    }
    this._render();
  }

  add(item) {
    // Item kann entweder vollständiges Objekt oder nur { id: '...' } sein
    const full = item.label ? item : getItem(item.id);
    if (!full) {
      console.warn('[Inventory] Unknown item id:', item.id);
      return false;
    }
    if (this.items.find((i) => i.id === full.id)) return false;
    if (this.items.length >= this.maxSlots) return false;
    this.items.push(full);
    this._persist();
    this._render();
    this._flashNewItem();
    this.audio?.pickup();
    return true;
  }

  has(id) {
    return this.items.some((i) => i.id === id);
  }

  get(id) {
    return this.items.find((i) => i.id === id);
  }

  remove(id) {
    this.items = this.items.filter((i) => i.id !== id);
    this._persist();
    this._render();
  }

  toJSON() {
    return this.items.map((i) => i.id);
  }

  _persist() {
    this.save?.setInventoryIds?.(this.toJSON());
  }

  _render() {
    this.el.innerHTML = this.items.map((item) => `
      <div class="inv-slot" data-id="${item.id}" title="${item.label}">
        <span class="inv-symbol">${item.symbolChar || '◆'}</span>
        <span class="inv-tooltip">
          <strong>${item.label}</strong>
          ${item.description ? `<br><span>${item.description}</span>` : ''}
        </span>
      </div>
    `).join('');
  }

  _flashNewItem() {
    const lastSlot = this.el.lastElementChild;
    if (!lastSlot) return;
    lastSlot.classList.add('flash');
    setTimeout(() => lastSlot.classList.remove('flash'), 1500);
  }
}
