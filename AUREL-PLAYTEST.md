# Playtest-Anleitung für Aurel — Der Club

Hi Aurel! Das Spiel ist jetzt deutlich besser. Spiel es einmal komplett
durch (ca. **15–20 Minuten**) und melde Leon, was hakt.

---

## Vorbereitung (2 Minuten)

**Falls du schon alles von letzter Runde hast:**

```bash
cd <wo-auch-immer-das-Projekt-liegt>
git pull    # falls per GitHub
# ODER: neues ZIP entpacken und ersetzen
npm install  # nur wenn neue Pakete dazukamen (sind sie nicht)
npm run dev
```

**Falls frisch:**

1. Entpack das ZIP nach `~/der-club` (oder wo du willst)
2. Terminal öffnen, dort rein: `cd ~/der-club`
3. `npm install` (1 Minute)
4. `npm run dev`
5. Browser öffnet sich automatisch bei `http://localhost:5173`

**Wichtig:** Falls du vorher schon mal getestet hast, **Browser-Cache leeren**:
- Chrome / Firefox / Safari: `Cmd+Shift+R` (Mac) oder `Strg+Shift+R` (Windows)
- Oder DevTools öffnen (F12) → Application → Local Storage → `http://localhost:5173` → Clear storage

Sonst bleiben alte Flags (z.B. "Trigger-Warnung gesehen") hängen und
du siehst den Intro-Screen nicht.

---

## Was du machen sollst

### 1. Komplett durchspielen (kein Skippen!)

Spiel das Spiel so, **wie es ein Lehrer spielen würde**: in einer Sitzung,
von Anfang bis Ende, ohne Speed-Run. Achte auf dein Gefühl, nicht auf Bugs.

**Ziel:** 15–20 Minuten, Credits-Screen am Ende erreichen.

### 2. Notier dir während des Spielens

Hab **Papier + Stift** neben dir (oder eine Notizen-App). Für jeden Punkt,
der dir auffällt, schreib auf:
- **In welchem Raum** (Nr. oder Name)
- **Was ist passiert** (z.B. "bin gegen unsichtbare Wand gelaufen bei der Werkbank")
- **Was erwartet hatte** (z.B. "wollte durchgehen")

### 3. Nach dem Durchspielen: Leon alles melden

Schreib Leon eine Nachricht oder geh mit ihm den Zettel durch.

---

## Worauf du speziell achten sollst

### 🟢 Was gut sein sollte (bitte bestätigen)

- [ ] **Intro-Screen** erscheint zuerst nach Trigger-Warnung (Widmung "Für Mili" + Zitat)
- [ ] **Objective-Banner** oben mittig zeigt dauerhaft, was zu tun ist
- [ ] **Steuerung**: WASD bewegt, Maus schaut, E interagiert
- [ ] **Interact-Hint** (großer E-Button unten) erscheint, wenn du auf Objekte/Figuren zielst
- [ ] **Objekte pulsieren leicht** wenn du sie anvisierst
- [ ] **Nach Mini-Game geht's automatisch weiter** (kein "Spiel bleibt stehen" mehr)
- [ ] **Exit-Kegel** (goldenes Licht) sind sehr auffällig — du siehst sofort, wo's weitergeht
- [ ] Alle **8 Räume** erreichbar
- [ ] Am Ende kommt **Credits-Screen** mit "Es ist alles wahr"

### 🟡 Was kritisch ist (bitte melden, falls)

**Navigation / "ich wusste nicht wo durch"**
- Gibt es irgendwo einen Moment, wo du **nicht weisst, was du tun sollst**?
  → Schreib auf: in welchem Raum, nach welcher Aktion
- Ist der **Objective-Banner immer klar**? Oder ist eine Formulierung missverständlich?

**Unsichtbare Wände**
- Läufst du irgendwo **gegen eine Wand, die nicht da ist**?
- Besonders prüfen: Säulen in Raum 4, Bäume/Werkbank in Raum 1

**Interaktionen**
- Gibt es Objekte, **die nicht reagieren** wenn du E drückst?
- Reagieren alle **Figuren-Silhouetten**?
- Wenn du etwas **zweimal anklickst**: passiert was Komisches?

**Mini-Games**
- **Box-Rhythmus (Raum 2)**: Funktioniert das A/D-Timing? Geht's nach Ende automatisch weiter?
- **Boxkampf (Raum 6)**: Kontrollen klar (E=Schlag, Shift=Block, A/D=ausweichen)?
- **Hinterraum (Raum 7)**: 3 Beweise klickbar, dann Hold-E für Rettung?
- Kann man Mini-Games mit **"Überspringen"-Button** oben rechts abbrechen und Story läuft trotzdem weiter?

**Dialog**
- Alle Texte lesbar?
- **Space-Taste** advanced den Dialog?
- "Weiter"-Button klickbar (auch wenn Cursor unsichtbar ist)?

### 🔴 Show-Stopper (sofort melden)

- Schwarzer Bildschirm
- Crash / Fehlermeldung im Browser (F12 → Console)
- Komplett stuck (kein Weiter möglich, auch nicht mit T/ESC/Reload)
- Mini-Game lässt sich nicht beenden

---

## Was du NICHT melden musst

- Silhouetten sehen abstrakt aus (das ist Absicht — "atmosphärisch-minimalistisch")
- Räume wirken noch etwas leer (Design-Entscheidung)
- Audio ist dezent (Web-Audio-Synth, keine grossen Samples)
- FPS-Einbrüche nur auf ganz alten Laptops

---

## Erwartete Spielzeit pro Raum

| # | Raum | Dauer |
|---|---|---|
| Intro | Widmung + Trigger | 30 s |
| 1 | Försterhaus Deister | 2–3 min |
| 2 | Internat Weinkeller (Box-Rhythmus) | 2 min |
| 3 | Alex' Büro Cambridge | 2 min |
| 4 | Pitt Club Fassade | 1–2 min |
| 5 | Manor House Somerset | 2 min |
| 6 | Markthalle (Boxkampf) | 3 min |
| 7 | Pitt Club Hinterraum (Beweise) | 2 min |
| 8 | Gardasee Epilog + Credits | 2 min |
| **Gesamt** | | **15–20 min** |

Wenn du deutlich länger brauchst, ist irgendwo ein UX-Problem. Melde bitte wo.

---

## Bonus: Mili-Lesezeichen suchen (optional)

In jedem Raum ist **1 kleines glühendes Papier-Lesezeichen** mit chinesischen
Zeichen (永远米利 = "Forever Mili") versteckt. Wenn du alle 8 findest, gibt's
eine spezielle Bonus-Sequenz mit Milis Stimme.

Die sind **absichtlich versteckt** — in Ecken, unter Möbeln, hinter Säulen.
Nicht kritisch fürs Spiel, nur Bonus-Content.

---

## Format der Bug-Meldung (Beispiel)

Sowas schickst du Leon:

```
BUG 1 — Raum 2 (Weinkeller)
- Ich habe auf die Pratzen geklickt
- Mini-Game startete, ich spielte zu Ende
- Danach öffnete sich ein Dialog, aber die "Weiter"-Taste reagierte nicht
- Musste Space drücken, dann ging's

BUG 2 — Raum 5 (Manor)
- Objective-Banner sagte "Sprich mit Charlotte"
- Aber Charlotte war nirgends
- War hinter dem Vorhang versteckt, kein Hinweis
- Gefunden nach 45 Sekunden Suchen

UNKLAR — Raum 7
- Was soll der Glaskasten? Hab ihn geklickt, nichts passiert
- Stellt sich raus: muss erst 3 Beweise klicken
- Objective war klar, aber der Glaskasten gibt kein Feedback beim Klick
```

Je präziser desto besser — Leon kann dann gezielt fixen.

---

## Zum Schluss: hat's Spaß gemacht?

Unabhängig von Bugs: wie war das Gesamtgefühl?
- Fesselnd / langweilig?
- Zu kurz / genau richtig / zu lang?
- Glaubwürdig als Buch-Zusammenfassung?

Das ist wichtig für den Lehrer-Eindruck.

**Viel Spass!** 🎮
