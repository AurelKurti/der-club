# Anleitung für Aurel — Der Club 3D-Spiel deployen & abgeben

Hi Aurel!

Das hier ist ein interaktives 3D-Spiel zum Roman "Der Club" von Takis Würger.
Leon hat es für dich programmiert. Du musst es nur noch online stellen und
abgeben. Das hier ist die Schritt-für-Schritt-Anleitung.

Geschätzte Zeit: **20–30 Minuten**.

---

## Was du brauchst

- Einen Computer mit Internet (Mac, Windows oder Linux)
- Eine GitHub-Account (https://github.com/AurelKurti — hast du schon)
- Einen Vercel-Account (kostenlos, erstellen wir gleich)
- Node.js (Version 18 oder neuer)

---

## Schritt 1 — Node.js installieren (falls noch nicht da)

**Prüfen:** Öffne ein Terminal und tippe:
```bash
node --version
```

Wenn eine Zahl wie `v20.x.x` erscheint → **weiter zu Schritt 2**.

Wenn "command not found" erscheint:
- Gehe auf https://nodejs.org
- Klick "LTS" (der grosse grüne Button)
- Installer herunterladen + durchklicken
- Terminal neu öffnen, `node --version` nochmal prüfen

---

## Schritt 2 — Das Projekt auf deinen Computer holen

**Option A — Leon gibt dir einen USB-Stick oder ZIP:**

1. ZIP entpacken nach `~/der-club` (oder wohin du willst)
2. Terminal öffnen und ins Verzeichnis wechseln:
   ```bash
   cd ~/der-club
   ```

**Option B — Du bist an Leons Computer:**

Das Projekt liegt schon in:
```
/Users/leon/claude/personal/aurel-literarischer-raum
```

Terminal öffnen, dort hingehen:
```bash
cd /Users/leon/claude/personal/aurel-literarischer-raum
```

---

## Schritt 3 — Erstmal lokal ausprobieren

Damit du siehst, dass alles läuft, bevor du es online stellst:

```bash
npm install
```
(Dauert 30–60 Sekunden. Lädt alle Bausteine runter.)

```bash
npm run dev
```

Der Browser sollte sich automatisch öffnen bei `http://localhost:5173`. Falls nicht,
diese Adresse manuell eingeben.

**Jetzt spielst du das Spiel einmal durch** (15–20 Minuten). Merk dir, ob irgendwo
etwas komisch ist. Wenn alles läuft → weiter.

**Zum Stoppen:** Im Terminal `Ctrl + C` drücken.

---

## Schritt 4 — GitHub-Repo erstellen & hochladen

Wir pushen den Code zu deinem GitHub-Account, damit Vercel ihn von dort laden kann.

**4.1 — Git prüfen:**
```bash
git --version
```
Wenn "command not found" → https://git-scm.com/download (installer durchklicken).

**4.2 — Bei GitHub einloggen (einmalig):**
```bash
gh auth login
```
Falls `gh` nicht installiert ist, Alternative:
- Gehe auf https://github.com in deinem Browser, logge dich als AurelKurti ein
- Neues Repository erstellen: Klick auf das **+** oben rechts → "New repository"
- Name: `der-club`
- Private oder Public: **Public** (damit Vercel gratis funktioniert)
- "Create repository" klicken
- Kopiere den Link, den GitHub dir zeigt: `https://github.com/AurelKurti/der-club.git`

**4.3 — Code zu GitHub pushen:**

Im Terminal, im Projekt-Ordner:
```bash
# Falls noch kein Git initialisiert ist
git init
git branch -M main

# Konfigurieren (nur einmal nötig pro Computer)
git config user.name "Aurel Kurti"
git config user.email "DEINE-EMAIL@example.com"

# Alle Dateien staged, commit
git add .
git commit -m "Der Club — 3D Literaturspiel"

# Remote verbinden (falls noch nicht)
git remote add origin https://github.com/AurelKurti/der-club.git
# Falls schon vorhanden:
# git remote set-url origin https://github.com/AurelKurti/der-club.git

# Hochladen
git push -u origin main
```

Beim ersten Push fragt Git nach deinem GitHub-Passwort. GitHub verlangt heute einen
**Personal Access Token**:
- https://github.com/settings/tokens → "Generate new token (classic)"
- Name: "der-club"
- Expiration: 30 days
- Haken: "repo" (einfach den kompletten `repo`-Scope aktivieren)
- Token generieren, **kopieren** (wird nur einmal angezeigt!)
- Diesen Token als Passwort bei `git push` verwenden

---

## Schritt 5 — Auf Vercel deployen (der einfache Weg)

Vercel verbindet sich direkt mit deinem GitHub. Kein CLI, keine Terminal-Befehle.

**5.1** — Gehe auf https://vercel.com/signup

**5.2** — Klick auf **"Continue with GitHub"**
- Melde dich als AurelKurti an
- Vercel fragt nach Zugriff auf deine Repos → erlauben

**5.3** — Nach der Anmeldung: **"Add New..." → "Project"**

**5.4** — In der Liste deiner GitHub-Repos findest du `der-club` → klick **"Import"**

**5.5** — Vercel zeigt dir Build-Einstellungen:
- **Framework Preset:** Vite (wird automatisch erkannt ✓)
- **Root Directory:** `./` (Standard, passt)
- **Build Command:** `npm run build` (Standard, passt)
- **Output Directory:** `dist` (Standard, passt)

**5.6** — Klick **"Deploy"**

Vercel baut das Projekt (dauert 30–60 Sek.). Danach bekommst du eine **Live-URL**,
z.B. `https://der-club-aurelkurti.vercel.app`.

**Diese URL ist dein Abgabe-Link!** 🎉

---

## Schritt 6 — Abgeben beim Lehrer

Schreib eine E-Mail an deinen Lehrer, ungefähr so:

> Hallo [Name],
>
> hier meine Umsetzung der Aufgabe "Literarischer Raum schaffen" zum Roman
> "Der Club" von Takis Würger:
>
> **Link:** https://der-club-aurelkurti.vercel.app
>
> Hinweise:
> - Am besten in Chrome oder Firefox auf einem Desktop/Laptop spielen
> - Mit Maus und WASD bewegen, **E** für Interaktion, **T** für Tagebuch
> - Spielzeit ca. 15–20 Minuten
> - Am Anfang kommt eine Trigger-Warnung wegen der Themen im Buch
>
> Danke!
>
> Aurel

---

## Wenn etwas nicht klappt

### Problem: `npm install` bricht ab mit Fehlern
→ Node.js-Version zu alt. Update auf Version 18+ (siehe Schritt 1).

### Problem: `git push` sagt "permission denied"
→ Personal Access Token falsch kopiert. Neuen erstellen (Schritt 4.3).

### Problem: Vercel Build schlägt fehl
→ Lokal `npm run build` ausprobieren. Wenn das klappt, aber Vercel nicht: in
Vercel-Dashboard unter Deployments → Build Logs anschauen, meistens hilft ein
zweiter Deploy-Versuch (Button "Redeploy").

### Problem: Das Spiel zeigt schwarzen Bildschirm
→ In Browser DevTools (F12) → Console-Tab → Fehlermeldung anschauen.
Meistens fehlt die `/favicon.svg` oder Schriftart lädt nicht. Kein Dealbreaker.

### Problem: Trigger-Warnung erscheint immer wieder
→ Browser-Cache löschen (Strg+Shift+R / Cmd+Shift+R) oder localStorage löschen
in DevTools → Application → Local Storage → Domain löschen.

---

## Falls du etwas an der Geschichte oder am Code ändern willst

Der Code ist kommentiert und übersichtlich:

```
src/
├── main.js                 # Startpunkt
├── core/                   # Game-Engine-Sachen (Player, Rooms, UI-System)
├── rooms/                  # Die 8 Räume
│   ├── 01-Foersterhaus.js  # Deister (Kindheit)
│   ├── 02-Internat.js      # Jesuiten-Kolleg
│   ├── 03-AlexBuero.js     # Cambridge
│   ├── 04-PittClub.js      # Pitt Club
│   ├── 05-ManorHouse.js    # Somerset
│   ├── 06-Markthalle.js    # Boxkampf
│   ├── 07-Hinterraum.js    # Schmetterlinge
│   └── 08-Gardasee.js      # Epilog
├── minigames/              # Die 3 Mini-Games
├── ui/                     # Dialog, Inventar, Tagebuch
└── data/
    ├── characters.js       # Alle Zitate pro Figur
    └── items.js            # Sammelobjekte
```

Texte anpassen: `data/characters.js` öffnen → Dialoge ändern → speichern → Browser
zeigt Änderung sofort (während `npm run dev` läuft).

---

## Die Aufgabe-Kriterien vom Lehrer — so sind sie erfüllt

| Kriterium | Wie im Spiel |
|---|---|
| Zentrale Schlüsselstellen | 8 Räume = 8 Schlüsselszenen des Buchs |
| Alle Hauptfiguren | Hans, Alex, Charlotte, Angus, Josh, Billy + Nebenfiguren als Silhouetten |
| Inhaltlich korrekt | Alle Zitate wörtlich aus dem Buch |
| Vollständigkeit | Auch ohne Buch-Kenntnis verständlich — Twist wird explizit gezeigt |
| Interaktive Möglichkeiten | 3 Mini-Games + mehrere Klick-Interaktionen pro Raum |
| Kreativität | Mili-Bonus-Pfad (8 versteckte Lesezeichen), Tagebuch-Mechanik, Glaskasten-Symbol |
| Logischer Aufbau | Räume folgen Buch-Kapiteln chronologisch |
| Trigger-sensible Darstellung | Keine expliziten Bilder, Trigger-Warnung am Start |

---

## Viel Glück! 🍀

Wenn etwas nicht geht, frag Leon — er weiss, wo es hakt.
