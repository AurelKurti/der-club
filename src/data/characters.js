/**
 * Characters — zentrale Dialog-Zitate pro Figur, direkt aus dem Roman.
 *
 * Nutzung: import { CHAR } from '../data/characters.js';
 *          dialog.show(CHAR.mutter.garten);
 */

export const CHAR = {
  mutter: {
    profile: 'mutter',
    color: 0xf4e4b8,
    tint: 0xffe4a0,
    garten: [
      { speaker: 'Mutter', text: '«Ich kenne jedes Kraut in diesem Wald.»' },
      { text: 'In meiner frühsten Erinnerung läuft meine Mutter mit nackten Füssen durch den Garten auf mich zu. Sie trägt ein gelbes Kleid aus Leinen.' },
      { text: '[Sie starb, bevor ich fünfzehn war. Ein Bienenstich, den ihr Herz nicht verzieh.]' }
    ]
  },

  vater: {
    profile: 'vater',
    color: 0x7a6a58,
    werkbank: [
      { speaker: 'Vater', text: '«Meistens ist alles im Leben grau.»' },
      { speaker: 'Vater', text: '«Aber manchmal gibt es nur Richtig und Falsch. Und wenn Stärkere Schwächeren Leid antun, ist das falsch.»' },
      { text: 'Er legte zwei schwarze Boxhandschuhe aus Rindsleder neben meinen Teller.' },
      { text: '[Er starb auf der Brücke über die Havel. Zementlaster. Ich blieb allein zurück. Kurz danach holte mich Tante Alex ins Internat.]' }
    ]
  },

  alexJung: {
    profile: 'alexJung',
    color: 0x6878a0,
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
    color: 0x8a8aa0,
    buero: [
      { speaker: 'Alex', text: '«Hans. Es gibt im Pitt Club eine Gruppe. Sie nennen sich die Schmetterlinge.»' },
      { speaker: 'Alex', text: '«Sie laden Studentinnen mit gefälschten Briefen zu Partys ein. Dann drogen sie sie.»' },
      { speaker: 'Alex', text: '«Du musst rein. Du bist der einzige, den sie nicht kennen.»' }
    ],
    buero_backstory: [
      { text: 'Alex dreht sich zum Fenster. Regen läuft an der Scheibe herunter.' },
      { speaker: 'Alex', text: '«Ich war achtzehn, als ich hier ankam. Aus Stoke-on-Trent.»' },
      { speaker: 'Alex', text: '«Vor vierzig Jahren haben sie etwas getan, das ich nie verwunden habe. Mehr musst du jetzt nicht wissen.»' },
      { text: 'Pause. Sie atmet laut ein.' },
      { speaker: 'Alex', text: '«Ich will Charlotte nicht verlieren wie mich selbst.»' },
      { speaker: 'Alex', text: '«Ich habe Josh letzte Woche am Hinterausgang abgepasst. Zwanzig Schläge. Er hat mich nicht erkannt.»' },
      { speaker: 'Alex', text: '«Was den Menschen vom Pavian unterscheidet, ist nicht die Würde. Es ist die Rache.»' }
    ]
  },

  charlotte: {
    profile: 'charlotte',
    color: 0xd0a898,
    tint: 0xd88878,
    somerset: [
      { speaker: 'Charlotte', text: '«Vor ein paar Wochen hast du mit mir Tango getanzt. Du hast die Schritte der Frau getanzt, weisst du noch?»' },
      { speaker: 'Charlotte', text: '«Meine Mutter starb an einer Nervenkrankheit, als ich fünfzehn war. Sie schickte mich nach East London, um Werbeprospekte auszutragen.»' },
      { speaker: 'Charlotte', text: '«Sie wollte, dass ich geerdet bin. Ich habe sie nie gefragt, wozu.»' },
      { text: 'Ich hörte ihr zu und dachte an die Kette meiner Mutter in meiner Tasche.' }
    ]
  },

  angus: {
    profile: 'angus',
    color: 0x8a8a90,
    pittclub: [
      { speaker: 'Angus Farewell', text: '«Ich habe dich vorgeschlagen, Hans.»' },
      { speaker: 'Angus Farewell', text: '«Du gehörst jetzt dazu.»' },
      { text: 'Er legte mir die Fliege um den Hals. In der Innenseite: ein gelber Schmetterling, den ich erst viel später verstehen würde. Die Männer riefen: «Stickler!»' }
    ]
  },

  josh: {
    profile: 'josh',
    color: 0x9a9a9a,
    pittclub: [
      { speaker: 'Josh', text: '«Komm nach hinten, brother. Heute bekommst du alles.»' },
      { speaker: 'Josh', text: '«La nuit tous les chats sont gris. Immer wieder ein geiler Spruch.»' }
    ]
  },

  billy: {
    profile: 'billy',
    color: 0xa07048,
    ring: [
      { speaker: 'Billy', text: '«Bringt dir Glück.»' },
      { text: 'Er reichte mir eine handpolierte Kastanie und lächelte, als wüsste er, dass ich log.' }
    ]
  },

  paterGerald: {
    profile: 'paterGerald',
    color: 0x6a5040,
    keller: [
      // Pater Gerald spricht im Buch Englisch (sudanesischer Mönch),
      // deshalb bewusst zweisprachig belassen mit DE-Ergänzung.
      { speaker: 'Pater Gerald', text: '«Your left is too low.» («Deine Linke ist zu tief.»)' },
      { speaker: 'Pater Gerald', text: '«Tu das Gegenteil von dem, was dein Gegner erwartet.»' }
    ]
  },

  magicMike: {
    profile: 'magicMike',
    color: 0x8888a0,
    halle: [
      // Aus dem Buch Kap. 35: Mike summt vor dem Kampf Wagner und sagt
      // den berühmten Satz über das Team - hier leicht verdichtet.
      { text: 'Magic Mike summt Wagner in sein Handtuch.' },
      { speaker: 'Magic Mike', text: '«Priest, ein Verbrecher. Josh, ein Psycho. Billy, ein Homo. Du, Stichler, ein Deutscher.»' },
      { speaker: 'Magic Mike', text: '«Gott hat mir dieses Team als Prüfung gegeben.»' }
    ]
  }
};
