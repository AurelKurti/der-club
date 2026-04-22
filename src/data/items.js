/**
 * Item-Registry — alle Sammelobjekte zentral definiert.
 *
 * Inventory.add({ id: 'boxhandschuhe' }) nutzt diese Registry, um label +
 * description + symbolChar zu laden. Beim Reload werden aus gespeicherten
 * IDs die vollen Items via getItem() rekonstruiert.
 */

export const ITEMS = {
  boxhandschuhe: {
    id: 'boxhandschuhe',
    label: 'Boxhandschuhe',
    description: 'Schwarzes Rindsleder. Geschenk meines Vaters.',
    symbolChar: '✊'
  },
  studentenausweis: {
    id: 'studentenausweis',
    label: 'Tarn-Ausweis',
    description: '«Hans Stichler», St. John\'s College. Alex\' falsche Identität für mich.',
    symbolChar: '❖'
  },
  'pitt-fliege': {
    id: 'pitt-fliege',
    label: 'Pitt-Club-Fliege',
    description: 'Silber, Blau, Schwarz gestreift. Innen ein kleiner gelber Schmetterling. Das Zeichen des Clubs.',
    symbolChar: '⬨'
  },
  kette: {
    id: 'kette',
    label: 'Rotgoldene Kette',
    description: 'Die Kette meiner Mutter. Ich habe sie Charlotte gegeben.',
    symbolChar: '◌'
  },
  kastanie: {
    id: 'kastanie',
    label: 'Glückskastanie',
    description: 'Handpoliert. Billy sagt, sie bringt Glück.',
    symbolChar: '◉'
  },
  blazer: {
    id: 'blazer',
    label: 'Hellblauer Blazer',
    description: 'Roter Löwe eingestickt. Das Zeichen des Siegers gegen Oxford.',
    symbolChar: '▴'
  },
  flasche: {
    id: 'flasche',
    label: 'Plastikfläschchen',
    description: 'K.-o.-Tropfen. Beweis für Alex.',
    symbolChar: '◌'
  },
  arztbericht: {
    id: 'arztbericht',
    label: 'Arztbericht',
    description: 'Charlottes medizinisches Gutachten. Beweis ihres Traumas.',
    symbolChar: '☤'
  },
  brief: {
    id: 'brief',
    label: 'Brief mit Wachssiegel',
    description: 'Gelber Schmetterling auf Siegel. «Dies ist deine Nacht.»',
    symbolChar: '✉'
  }
};

export function getItem(id) {
  return ITEMS[id] || null;
}
