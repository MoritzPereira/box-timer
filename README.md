# Box-Timer

**Rundentimer fürs Sparring – aus 3 m lesbar, mit Handschuhen bedienbar, Glocke über laufender Musik.**

![Version](https://img.shields.io/badge/version-1.0.0-16A34A) ![Plattform](https://img.shields.io/badge/plattform-iOS-lightgrey) ![Expo SDK](https://img.shields.io/badge/Expo%20SDK-58-000020) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6)

📄 [Konzept](docs/KONZEPT.md) · 🛠 [Architektur](docs/ARCHITEKTUR.md) · 📝 [Changelog](CHANGELOG.md)

## Funktionen

- **Presets & Vorlagen:** Amateur, Sparring, Profi, MMA – oder eigene Runden, Pausen, Vorbereitung
- **Vollbild-Countdown** mit Farben: grün = Runde, orange = letzte 10 s, blau = Pause
- **Handschuh-Modus:** irgendwo tippen = Pause/Weiter, halten = Beenden
- **Signale:** Glocke zu Rundenstart und -ende, Klacken 10 s vorher, Vibration
- **Läuft mit Musik** und bei gesperrtem Handy, Display bleibt an
- Keine Werbung, kein Account, alles bleibt auf dem Gerät

## Tech-Stack

Expo SDK 58 · React Native · TypeScript · Expo Router · Zustand · expo-audio · expo-notifications

## Loslegen

Voraussetzungen: Node.js ≥ 20 und die App **Expo Go** auf dem iPhone.

```bash
git clone https://github.com/MoritzPereira/box-timer.git
cd box-timer
npm install
npm start
```

QR-Code mit der iPhone-Kamera scannen → in Expo Go öffnen.
Klappt die Verbindung im WLAN nicht, `npm run start:tunnel` verwenden (Mac und Expo Go mit demselben Expo-Konto angemeldet).

| Befehl | Zweck |
|---|---|
| `npm start` | Dev-Server starten |
| `npm run start:tunnel` | Dev-Server über Tunnel |
| `npm run check` | Typecheck + Lint |

## Lizenz

© 2026 Moritz Pereira. Alle Rechte vorbehalten – siehe [LICENSE](LICENSE).
