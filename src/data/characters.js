/**
 * Characters — zentrale Dialog-Zitate pro Figur, direkt aus dem Roman.
 *
 * Nutzung: import { CHAR } from '../data/characters.js';
 *          dialog.show(CHAR.mutter.garten);
 */

export const CHAR = {
  mutter: {
    profile: 'mutter',
    color: 0xfff4d0,
    tint: 0xffe4a0,
    garten: [
      { speaker: 'Mutter', text: '«Ich kenne jedes Kraut in diesem Wald.»' },
      { text: 'In meiner frühsten Erinnerung läuft meine Mutter mit nackten Füßen durch den Garten auf mich zu. Sie trägt ein gelbes Kleid aus Leinen.' }
    ]
  },

  vater: {
    profile: 'vater',
    color: 0x2a2420,
    werkbank: [
      { speaker: 'Vater', text: '«Meistens ist alles im Leben grau.»' },
      { speaker: 'Vater', text: '«Aber manchmal gibt es nur Richtig und Falsch. Und wenn Stärkere Schwächeren Leid antun, ist das falsch.»' },
      { text: 'Er legte zwei schwarze Boxhandschuhe aus Rindsleder neben meinen Teller.' }
    ]
  },

  alexJung: {
    profile: 'alexJung',
    color: 0x1a1a2a,
    tint: 0x4a3a50,
    opacity: 0.6,
    nacht: [
      { speaker: 'Tante Alex', text: '«Als ich so alt war wie du, war es bei mir auch so.»' },
      { text: 'Ich fragte: «Haben die anderen dir wehgetan?»' },
      { speaker: 'Tante Alex', text: '«Wenn sie dich anfassen, hol mich, dann töte ich sie.»' }
    ]
  },

  alex: {
    profile: 'alex',
    color: 0x0a0a0a,
    buero: [
      { speaker: 'Alex', text: '«Hans. Es gibt im Pitt Club eine Gruppe. Sie nennen sich die Schmetterlinge.»' },
      { speaker: 'Alex', text: '«Sie laden Studentinnen mit gefälschten Briefen zu Partys ein. Dann drogen sie sie.»' },
      { speaker: 'Alex', text: '«Du musst rein. Du bist der einzige, den sie nicht kennen.»' }
    ],
    buero_backstory: [
      { text: 'Alex dreht sich zum Fenster. Regen läuft an der Scheibe herunter.' },
      { speaker: 'Alex', text: '«Ich war achtzehn, als ich hier ankam. Aus Stoke-on-Trent. Meine Mutter hat Porzellan bemalt.»' },
      { speaker: 'Alex', text: '«Vor vierzig Jahren gab es einen Mann, der war für mich freundlich. Er hieß Angus.»' },
      { speaker: 'Alex', text: '«Er hat mich in den Pitt Club eingeladen. In einen Hinterraum. Auf einen Billardtisch.»' },
      { text: 'Pause. Sie atmet laut ein.' },
      { speaker: 'Alex', text: '«Ich habe es vierzig Jahre niemandem gesagt. Jetzt sag ich es dir, weil ich Charlotte nicht verlieren will wie mich selbst.»' },
      { speaker: 'Alex', text: '«Was den Menschen vom Pavian unterscheidet, ist nicht die Würde. Es ist die Rache.»' }
    ]
  },

  charlotte: {
    profile: 'charlotte',
    color: 0x2a1010,
    tint: 0xd88878,
    somerset: [
      { speaker: 'Charlotte', text: '«Meine Mutter ist an einer Nervenkrankheit gestorben, als ich fünfzehn war.»' },
      { speaker: 'Charlotte', text: '«Sie schickte mich nach East London, um Werbeprospekte auszutragen. Sie wollte, dass ich geerdet bin.»' },
      { text: 'Ich gab ihr die rotgoldene Kette meiner Mutter.' }
    ]
  },

  angus: {
    profile: 'angus',
    color: 0x101010,
    pittclub: [
      { speaker: 'Angus Farewell', text: '«Ich habe dich vorgeschlagen, Hans.»' },
      { speaker: 'Angus Farewell', text: '«Du gehörst jetzt dazu.»' },
      { text: 'Er legte mir die Fliege um den Hals. Die Männer riefen: «Stickler!»' }
    ]
  },

  josh: {
    profile: 'josh',
    color: 0x3a3a3a,
    pittclub: [
      { speaker: 'Josh', text: '«Komm mit nach hinten, Bruder. Das ist unsere Nacht.»' }
    ]
  },

  billy: {
    profile: 'billy',
    color: 0x2a1a0a,
    ring: [
      { speaker: 'Billy', text: '«Bringt dir Glück.»' },
      { text: 'Er reichte mir eine handpolierte Kastanie.' }
    ]
  },

  paterGerald: {
    profile: 'paterGerald',
    color: 0x0a0a0a,
    keller: [
      { speaker: 'Pater Gerald', text: '«Your left is too low.»' },
      { speaker: 'Pater Gerald', text: '«Tu das Gegenteil von dem, was dein Gegner erwartet.»' }
    ]
  },

  magicMike: {
    profile: 'magicMike',
    color: 0x2a2a3a,
    halle: [
      { speaker: 'Magic Mike', text: '«Gott hat mir dieses Team als Prüfung gegeben.»' }
    ]
  }
};
