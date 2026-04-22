# Der Club — Literarischer Raum

Interaktive 3D-Zusammenfassung des Romans *Der Club* von Takis Würger (2016).
Schul-Projekt. Umgesetzt mit Three.js + Vite statt Delightex/CoSpaces.

---

## Dev starten

```bash
npm install
npm run dev
```

Öffnet `http://localhost:5173/`.

## Production-Build testen

```bash
npm run build
npm run preview
```

## Auf Vercel deployen

Einmal-Setup:

```bash
# 1. Vercel CLI installieren (nur wenn nicht via npx)
npm install -g vercel

# 2. Einloggen (öffnet Browser)
npx vercel login
# → Email oder GitHub wählen, einmal bestätigen

# 3. Projekt mit Vercel verknüpfen (erster Deploy = Preview)
npx vercel
# → "Link to existing project? No"
# → "Project name? der-club" (oder eigenen Namen)
# → "In which directory is your code located? ./"
# → Build-Einstellungen: Vite wird automatisch erkannt

# 4. Produktions-Deploy
npx vercel --prod
```

Output am Ende: `https://der-club-<hash>.vercel.app` — das ist der Link für den Lehrer.

## Struktur

```
src/
├── main.js                 # Entry-Point, Raum-Kette
├── core/
│   ├── Game.js             # Orchestrator
│   ├── Player.js           # First-Person Controls + WASD
│   ├── Collision.js        # Box3-basierte Kollision
│   ├── SceneManager.js     # Raum-Wechsel + Fade-Transitions
│   ├── BaseRoom.js         # Abstract Raum-Klasse
│   ├── InteractionSystem.js  # Raycaster + E-Key
│   ├── SaveManager.js      # localStorage-Saves
│   ├── AudioManager.js     # Prozedurales Audio (Web Audio API)
│   ├── FootstepTracker.js  # Distanz-basierte Schritt-Sounds
│   ├── Silhouette.js       # Figuren-Platzhalter (Billboard)
│   └── Collectible.js      # Mili-Bonus-Objekte
├── rooms/
│   ├── 01-Foersterhaus.js  # Deister (Kindheit)
│   ├── 02-Internat.js      # Weinkeller (Pater Gerald)
│   ├── 03-AlexBuero.js     # Cambridge (Goya-Bild, Auftrag)
│   ├── 04-PittClub.js      # Jesus Lane (Initiation)
│   ├── 05-ManorHouse.js    # Somerset (Charlotte)
│   ├── 06-Markthalle.js    # Boxkampf gegen Oxford
│   ├── 07-Hinterraum.js    # Schmetterlinge (Enthüllung)
│   └── 08-Gardasee.js      # Epilog
├── minigames/
│   ├── BaseMiniGame.js
│   ├── BoxRhythm.js        # Raum 2
│   ├── BoxFight.js         # Raum 6
│   └── EvidenceHunt.js     # Raum 7
├── ui/
│   ├── Dialog.js
│   ├── Inventory.js
│   ├── Diary.js
│   ├── startOverlay.js
│   └── triggerWarning.js
├── data/
│   └── characters.js       # Buch-Zitate zentralisiert
└── styles/global.css
```

## Spielablauf

1. Trigger-Warnung (einmalig, Pflicht wegen Themen im Roman)
2. Start-Screen → Klick zum Starten
3. 8 Räume linear, chronologisch nach Buch-Kapiteln
4. 3 Mini-Games (überspringbar)
5. Credits-Screen nach Raum 8

## Steuerung

- `W A S D` bewegen
- Maus umschauen
- `E` / Linksklick interagieren
- `T` Tagebuch öffnen
- `Shift` rennen
- `ESC` pausieren

## Assets

Komplett selbst-generiert: alle 3D-Geometrien mit primitiven Formen
(Box, Cylinder, Plane, Icosahedron), alle Texturen Canvas-gezeichnet,
alle Sounds prozedural über Web Audio API.

Keine externen Asset-Downloads nötig. Keine Lizenz-Attribution erforderlich.

## Bewertungskriterien (aus Aufgabenstellung)

| Kriterium | Umsetzung |
|---|---|
| Zentrale Schlüsselstellen | 8 Räume = 8 Schlüsselszenen |
| Alle Hauptfiguren | Hans (POV), Alex, Charlotte, Angus, Josh, Billy + Neben-Figuren |
| Inhaltlich korrekt | Buch-Zitate wörtlich, verifizierte Fakten |
| Vollständigkeit | Linearer Durchlauf, verständlich ohne Vorwissen |
| Interaktive Möglichkeiten | 3 Mini-Games + 2-4 Klicks pro Raum |
| Kreativität | Standuhr ohne Zeiger, Glaskasten-Schmetterling, Tagebuch |
| Logischer Aufbau | 1:1 Buch-Reihenfolge |

## Trigger-sensible Inhalte

Das Buch behandelt sexualisierte Gewalt. Dieses Spiel zeigt **nichts explizit**:
- Keine Figuren in bedrohlichen Posen (nur Silhouetten)
- Billardtisch leer (Tatort bleibt unbevölkert)
- Lucia als goldener Umriss, keine explizite Darstellung
- Arztbericht/Zeitung nur als Text-Overlay
- Doppelmord-Selbstmord als Zeitungs-Headline, nie visuell

Trigger-Warnung wird vor Spielbeginn einmalig angezeigt.
