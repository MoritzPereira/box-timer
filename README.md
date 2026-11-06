# Box-Timer

**Rundentimer fürs Sparring – aus 3 m lesbar, mit Handschuhen bedienbar, Glocke über laufender Musik.**

![Version](https://img.shields.io/badge/version-1.0.0-16A34A) ![Plattform](https://img.shields.io/badge/plattform-iOS-lightgrey) ![Expo SDK](https://img.shields.io/badge/Expo%20SDK-58-000020) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6)

Box-Timer kann genau eine Sache richtig gut: Runden zuverlässig takten. Keine Werbung, kein Account, sofort startklar.
Idee, Zielgruppe und Fahrplan stehen im [Konzept](docs/KONZEPT.md) ([Original-PDF](docs/konzept.pdf)).

---

## Inhalt

- [Funktionen](#funktionen)
- [Signale](#signale)
- [Tech-Stack](#tech-stack)
- [Loslegen](#loslegen)
- [Projektstruktur](#projektstruktur)
- [Wie der Timer funktioniert](#wie-der-timer-funktioniert)
- [Sounds bearbeiten](#sounds-bearbeiten)
- [Weitere Dokumente](#weitere-dokumente)

## Funktionen

| | |
|---|---|
| **Presets** | Runden, Rundenzeit, Pause, Vorbereitung und Hinweiszeit einstellen und speichern |
| **Vorlagen** | Amateur 3 × 3/1 · Sparring 6 × 2/1 · Profi 12 × 3/1 · MMA 5 × 5/1 – sofort startklar |
| **Vollbild-Countdown** | Riesige Zahlen, „RUNDE 3/6“, im Querformat noch größer |
| **Farbcodes** | Grau = Vorbereitung · Grün = Runde · Orange = letzte 10 s · Blau = Pause |
| **Handschuh-Modus** | Irgendwo tippen = Pause/Weiter · ~1 s halten = Beenden |
| **Display bleibt an** | Kein Entsperren mitten im Sparring |
| **Hintergrund** | Signale kommen auch bei gesperrtem Handy (lokale Mitteilungen) |
| **Musik läuft weiter** | Glocke wird über Spotify & Co. gelegt |
| **Vibration** | Haptik bei jedem Signal |

Bewusst nicht in v1: Login, Cloud, Statistiken, Werbung, Android.

## Signale

| Moment | Sound | Datei |
|---|---|---|
| Rundenstart | helles Doppel-Klingeln mit Nachhall | `bell.wav` |
| Rundenende, Training fertig | dasselbe Doppel-Klingeln, tiefer | `bell_end.wav` |
| 10 s vor Rundenende (Bildschirm wird orange) | helles Klack-Klack | `click.wav` |
| 10 s vor Rundenstart (wenn Pause/Vorbereitung länger als ~12 s) | helles Klack-Klack | `click.wav` |

Zum Start der Vorbereitung kommt bewusst kein Ton. Die 10 s sind pro Preset unter „Hinweis vor Rundenende/-start“ einstellbar.

## Tech-Stack

| Baustein | Lösung |
|---|---|
| Framework | [Expo](https://expo.dev) SDK 58, React Native 0.88, TypeScript (strict) |
| Navigation | Expo Router (Dateien in `src/app/`) |
| State & Speicherung | Zustand + AsyncStorage (nur lokal, kein Backend) |
| Sound | expo-audio, Modus „mit anderen Apps mischen“ |
| Hintergrund-Signale | expo-notifications (lokale Mitteilungen mit eigenem Sound) |
| Display an / Vibration | expo-keep-awake / expo-haptics |
| Styling | React Native `StyleSheet` |
| Build & Upload | EAS Build + EAS Submit |

> **Abweichung vom Konzept:** Statt NativeWind wird `StyleSheet` verwendet – bei drei Screens ohne Mehrwert und auf SDK 58 stabiler.

## Loslegen

**Voraussetzungen:** macOS, Node.js ≥ 20, die App **Expo Go** auf dem iPhone, ein Expo-Konto.

```bash
git clone https://github.com/MoritzPereira/box-timer.git
cd box-timer
npm install
npm run start:tunnel
```

Den QR-Code mit der iPhone-Kamera scannen → „In Expo Go öffnen“. Beim ersten Timer-Start **Mitteilungen erlauben**.

- `start:tunnel` ist nötig, wenn das WLAN Geräte voneinander trennt (z. B. Heim-Router mit Client-Isolation). Im offenen WLAN reicht `npm start`.
- Mac (`npx expo whoami`) und Expo Go müssen mit **demselben Expo-Konto** angemeldet sein.
- Codeänderungen erscheinen sofort auf dem iPhone.

### Befehle

| Befehl | Zweck |
|---|---|
| `npm start` | Dev-Server (QR-Code für Expo Go) |
| `npm run start:tunnel` | Dev-Server über Tunnel |
| `npm run web` | Schneller Blick im Browser (Sound/Mitteilungen eingeschränkt) |
| `npm run typecheck` | TypeScript prüfen |
| `npm run lint` | ESLint |
| `npm run check` | Typecheck + Lint |
| `npm run sounds` | Sounds neu erzeugen (macOS) |
| `npx expo-doctor` | Projekt-Konfiguration prüfen |

### Testen auf dem iPhone

| Test | Erwartung |
|---|---|
| Vorlage antippen | Timer startet: grau → grün → orange (letzte 10 s) → blau |
| Irgendwo tippen | Pause / Weiter |
| ~1 s gedrückt halten | Weißer Balken läuft oben voll → Timer wird beendet |
| Spotify laufen lassen | Musik läuft weiter, Glocke wird darübergelegt |
| Handy sperren | Rundenwechsel kommen als Mitteilung mit Ton |
| Mehrere Runden | Jede Runde: Glocke, Klacken, tiefe Glocke, Klacken in der Pause |

**Einschränkungen in Expo Go:** Bei gesperrtem Handy kommt der Standard-Mitteilungston statt der Glocke – die eigenen Sounds funktionieren erst im eigenen Build (Development Build / TestFlight). Stumm-Schalter und Fokus/„Nicht stören“ wirken bei gesperrtem Handy auf die Mitteilungen. iOS erlaubt max. 64 geplante Mitteilungen; die App plant bis zu 60 (≈ 15 Runden am Stück ohne Entsperren).

## Projektstruktur

```
src/
  app/                    Screens (Expo Router)
    _layout.tsx           Navigation, Audio + Mitteilungen initialisieren
    index.tsx             Home: eigene Presets & Vorlagen
    edit.tsx              Preset anlegen/bearbeiten
    timer.tsx             Vollbild-Timer, Handschuh-Modus
  components/Stepper.tsx  Großer +/−-Stepper (halten = schnell zählen)
  lib/
    timeline.ts           Timer-Logik: kompletter Ablauf als Zeitstempel
    presets.ts            Vorlagen + eigene Presets (Zustand + AsyncStorage)
    feedback.ts           Sound-Wiedergabe + Vibration
    notify.ts             Hintergrund-Signale als lokale Mitteilungen
    theme.ts              Farben
assets/sounds/            bell.wav, bell_end.wav, click.wav
scripts/cut-sounds.py     erzeugt die Sounds
docs/                     Konzept, Architektur
```

## Wie der Timer funktioniert

1. Beim Start berechnet `buildTimeline()` den **kompletten Ablauf** vorab: alle Segmente (Vorbereitung, Runde, Pause) und alle Signale als Millisekunden-Offsets.
2. Die Anzeige rechnet immer **`Segment-Ende − (jetzt − Anker)`**. Es wird nichts runtergezählt – deshalb driftet nichts, auch nicht nach Pause oder App-Wechsel.
3. Gleichzeitig werden alle kommenden Signale als **lokale Mitteilungen** eingeplant. Im Vordergrund werden sie unterdrückt und die App spielt den Sound selbst; bei gesperrtem Handy übernimmt die Mitteilung. Bei Pause werden alle gelöscht, bei Weiter neu geplant.
4. Jeder Sound wird mit einem **frischen, vorgeladenen Player** abgespielt, der danach freigegeben wird – kein Zurückspulen, keine Konflikte zwischen Signalen.

Details: [docs/ARCHITEKTUR.md](docs/ARCHITEKTUR.md)

## Sounds bearbeiten

Alle Sound-Parameter (Ausschnitt, Tonhöhe, Nachhall, Lautstärke) stehen in [`scripts/cut-sounds.py`](scripts/cut-sounds.py):

```bash
npm run sounds
```

Quelle der Glocke: „Boxing Bell Signals“ von freesound_community auf [Pixabay](https://pixabay.com/sound-effects/search/boxing%20bell%20signals/) (Pixabay Content License, kommerziell nutzbar). Die Original-MP3 ist laut Lizenz nicht im Repo – zum Neu-Erzeugen herunterladen und als `assets/sounds/source/boxing-bell-signals.mp3` ablegen. Das Klacken wird synthetisch erzeugt.

## Weitere Dokumente

- [Konzept](docs/KONZEPT.md) – Idee, Zielgruppe, USP, Roadmap
- [Architektur](docs/ARCHITEKTUR.md) – Timer-Logik, Sounds, Mitteilungen
- [Changelog](CHANGELOG.md)

---

© 2026 Moritz Pereira. Alle Rechte vorbehalten – siehe [LICENSE](LICENSE).
