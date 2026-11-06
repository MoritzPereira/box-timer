# Architektur

## Überblick

```
Home (index.tsx) ──tap──▶ Timer (timer.tsx)
      │                        │
      └──✎──▶ Edit (edit.tsx)  ├─ buildTimeline()  → Segmente + Signale (timeline.ts)
                               ├─ scheduleCues()   → lokale Mitteilungen (notify.ts)
                               └─ playCue()        → Sound + Vibration (feedback.ts)
```

Kein Backend, keine Netzwerkzugriffe. Eigene Presets liegen nur lokal in AsyncStorage (`box-timer-presets`).

## Timer-Logik (`src/lib/timeline.ts`)

`buildTimeline(preset)` liefert:

- **`segments`**: `{ phase: 'prep' | 'round' | 'rest', round, start, end }` in ms ab Timer-Null
- **`cues`**: Signale `{ kind, at, title, body }`
- **`total`**: Gesamtdauer

| Signal (`kind`) | Zeitpunkt | Sound |
|---|---|---|
| `roundStart` | Beginn jeder Runde | `bell` |
| `warn` | `warnSec` vor Rundenende (nur wenn Runde länger) | `click` |
| `roundEnd` | Ende jeder Runde außer der letzten | `bell_end` |
| `getReady` | `warnSec` vor Rundenstart, nur wenn mind. 2 s nach Beginn von Vorbereitung/Pause | `click` |
| `finish` | Ende der letzten Runde | `bell_end` |

Beispiel Amateur (3 × 3:00 / 1:00, Vorbereitung 10 s, Hinweis 10 s):

```
0:10 roundStart   3:00 warn   3:10 roundEnd   4:00 getReady
4:10 roundStart   7:00 warn   7:10 roundEnd   8:00 getReady
8:10 roundStart  11:00 warn  11:10 finish
```

## Timer-Screen (`src/app/timer.tsx`)

- **Anker:** Beim Start/Weiter wird `anchor = Date.now() − elapsed` gesetzt. Angezeigt wird `segment.end − (now − anchor)`.
- **Tick (100 ms):** Prüft, welche Signale seit dem letzten Tick überschritten wurden, und spielt das jüngste – aber nur, wenn es weniger als 1,5 s alt ist (verpasste Signale, z. B. während das Handy gesperrt war, werden nicht nachgeholt; die hat die Mitteilung schon gespielt).
- **Pause:** `anchor = null`, `pausedElapsed` merken, alle Mitteilungen löschen. **Weiter:** neuer Anker, Mitteilungen neu planen.
- **Bedienung:** ganzer Bildschirm ist ein `Pressable`. Tippen = Pause/Weiter; 1,2 s halten = Beenden (weißer Fortschrittsbalken).
- **Keep-Awake** mit Tag `box-timer`, solange der Screen offen ist.

## Sound (`src/lib/feedback.ts`)

- Audio-Modus: `playsInSilentMode`, `interruptionMode: 'mixWithOthers'` → Musik anderer Apps läuft weiter.
- **Wiedergabe ohne Zurückspulen:** Pro Sound liegt immer ein frischer, vorgeladener Player bereit. Bei einem Signal wird er abgespielt, sofort ein neuer vorgeladen und der alte nach dem Ausklingen (`LIFETIME_MS`) freigegeben. Ein Player wird nie zweimal benutzt.
  *Hintergrund:* Wiederverwendete Player (`seekTo(0)` + `play()`) blieben in Expo Go ab dem zweiten/dritten Abspielen stumm.
- Fehler beim Laden/Abspielen werden abgefangen; fehlt ein vorgeladener Player, wird sofort ein neuer erzeugt.

## Hintergrund-Signale (`src/lib/notify.ts`)

- Alle kommenden Signale werden als lokale Mitteilungen mit `DATE`-Trigger geplant (max. 60, iOS-Limit 64).
- Im Vordergrund unterdrückt der Notification-Handler Banner und Ton – dann spielt die App selbst.
- Sound der Mitteilung: `bell.wav` / `bell_end.wav` / `click.wav` aus dem App-Bundle (über das `expo-notifications`-Plugin in `app.json` eingebunden). In Expo Go nicht verfügbar → Standardton.
- Kein Hintergrund-Audio-Modus nötig → einfacheres App-Review.

## Presets (`src/lib/presets.ts`)

- Vorlagen sind fest im Code (`TEMPLATES`), eigene Presets in Zustand + AsyncStorage.
- Bearbeiten einer Vorlage erzeugt ein neues eigenes Preset.
- Store-Version 2: Migration setzt den Hinweis alter Presets von 15 s auf 10 s.

## Sounds (`scripts/cut-sounds.py`)

| Datei | Herkunft | Bearbeitung |
|---|---|---|
| `bell.wav` | Doppel-Klingeln aus „Boxing Bell Signals“ (9,2–11,6 s) | + Oktave tiefer (40 %), Hall 3,2 s, Ausklang |
| `bell_end.wav` | dasselbe | Tonhöhe × 0,8 (≈ 4 Halbtöne tiefer), + Oktave (50 %), Hall 3,4 s |
| `click.wav` | synthetisch | Holzblock-Klacken (2,35/3,7/5,2 kHz), zweimal im Abstand von 110 ms |

Format: WAV, 44,1 kHz, mono, 16 bit (iOS-Mitteilungen akzeptieren nur WAV/CAF/AIFF).
