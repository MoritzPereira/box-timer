# Changelog

Alle wesentlichen Änderungen an Box-Timer. Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionierung nach [SemVer](https://semver.org/lang/de/).

## [1.0.0] – 2026-11-06

Erste vollständige Version des MVP aus dem [Konzept](docs/KONZEPT.md), auf dem iPhone (Expo Go) getestet.

### Funktionen
- Home mit eigenen Presets und Vorlagen (Amateur, Sparring, Profi, MMA)
- Presets anlegen, bearbeiten, löschen: Runden, Rundenzeit, Pause, Vorbereitung, Hinweiszeit
- Vollbild-Timer mit Farbcodes (Vorbereitung grau, Runde grün, letzte Sekunden orange, Pause blau) und Rundenanzeige
- Handschuh-Modus: Tippen = Pause/Weiter, Halten = Beenden
- Display bleibt während des Timers an
- Signale: helle Glocke zum Rundenstart, tiefe Glocke zum Rundenende, Klack-Klack 10 s vor Rundenende und vor Rundenstart
- Glocke wird über laufende Musik gelegt, Vibration bei jedem Signal
- Signale bei gesperrtem Handy über lokale Mitteilungen
- Timer-Logik über vorausberechnete Zeitstempel (driftfrei)

[1.0.0]: https://github.com/MoritzPereira/box-timer/releases/tag/v1.0.0
