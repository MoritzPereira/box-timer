# Box-Timer – Konzept

> Stand: 31.10.2026 · Original: [konzept.pdf](konzept.pdf)
> Umsetzungsstand v1.0.0 ist jeweils mit ✅ markiert.

## Idee & Zielgruppe

Ein Box-Timer, der für Sparring zu zweit gebaut ist: aus drei Metern lesbar, mit Handschuhen bedienbar, mit einer Glocke, die man auch über Musik hört.

**Das Problem mit bestehenden Timer-Apps beim Sparring:**

- Zahlen zu klein, um sie im Ring oder auf der Matte zu lesen
- Bedienung mit Boxhandschuhen kaum möglich (kleine Buttons, Menüs)
- Werbung oder Paywall genau dann, wenn man starten will
- Display geht aus, oder der Timer stoppt im Sperrbildschirm
- Signalton geht unter, wenn nebenbei Musik läuft

**Zielgruppe:** Hobby-Boxer und Kampfsportler (Boxen, Kickboxen, MMA, Muay Thai), die mit Partner oder in kleinen Gruppen trainieren, sowie kleine Gyms ohne Rundenuhr an der Wand.

## Kernfeatures MVP

Version 1 kann genau eine Sache richtig gut: Runden zuverlässig takten.

| Feature | Was es tut | Warum wichtig | v1.0 |
|---|---|---|---|
| Presets | Runden, Rundenzeit, Pause, Vorbereitung, Warnzeit einstellen und speichern | Einmal einrichten, dann nur noch Start drücken | ✅ |
| Fertige Vorlagen | Amateur 3 × 3/1, Profi 12 × 3/1, Sparring 6 × 2/1, MMA 5 × 5/1 | Sofort startklar ohne Setup | ✅ |
| Vollbild-Countdown | Riesige Zahlen, Rundenanzeige „Runde 3/6“ | Aus 3 m lesbar | ✅ |
| Farbcodes | Grün = Runde, Orange = letzte 10 s, Blau = Pause | Status ohne Lesen erfassen | ✅ |
| Sound | Glocke bei Start/Ende, Klack-Signal 10 s vorher | Man muss nicht aufs Handy schauen | ✅ |
| Handschuh-Modus | Tippen irgendwo = Pause/Weiter, Reset nur per langem Drücken | Bedienbar mit Handschuhen | ✅ |
| Display bleibt an | Bildschirm geht während des Timers nicht aus | Kein Entsperren mitten im Sparring | ✅ |
| Läuft im Hintergrund | Signale auch bei gesperrtem Handy | Zuverlässigkeit | ✅ ¹ |
| Musik läuft weiter | Glocke wird über Spotify & Co. gelegt | Training mit Musik | ✅ |
| Vibration | Haptik bei Rundenwechsel | Zusätzliches Signal | ✅ |

¹ Mit eigenem Glockenton erst im eigenen Build (in Expo Go: Standard-Mitteilungston).

**Bewusst nicht in v1:** Login, Cloud, Statistiken, Werbung, Android.

## Screens & User Flow

1. **Home:** Liste der Presets (Vorlagen + eigene), groß antippbar. Ein Tap startet den Timer.
2. **Preset bearbeiten:** Runden, Rundenzeit, Pause, Vorbereitung, Hinweiszeit per Stepper. Name vergeben, speichern.
3. **Timer:** Vollbild-Countdown mit Farbe, Rundenanzeige, sonst nichts.

Ablauf: Vorbereitung → Runde → Pause → Runde → … → Ende. Jeder Wechsel bekommt Glocke und Vibration.

## USP

Der Unterschied liegt nicht in mehr Features, sondern darin, dass die App für die Situation im Ring designt ist.

- **Handschuh-first:** Der ganze Bildschirm ist der Button. Keine Menüs während des Trainings.
- **Lesbar auf Distanz:** Countdown füllt den Screen, Farbe zeigt den Status.
- **Hörbar mit Musik:** Glocke legt sich über laufende Musik, statt sie zu unterbrechen.
- **Kein Bullshit:** Keine Werbung, kein Account, sofort startklar.

Diese vier Punkte gehören genau so in die App-Store-Beschreibung und auf die Screenshots.

## Technik

Expo-Stack ohne Backend. Wichtigster Punkt ist die Timer-Logik:

1. Nicht mit `setInterval` runterzählen, sondern beim Start alle Zeitpunkte als absolute Zeitstempel vorausberechnen.
2. Die Anzeige rechnet immer `Zielzeit − jetzt`. So driftet nichts.
3. Beim Start alle Übergänge als lokale Mitteilungen mit Glocken-Sound einplanen. Vordergrund: App spielt selbst. Gesperrt: Mitteilung übernimmt.
4. Bei Pause/Reset alle geplanten Mitteilungen löschen und bei Weiter neu planen.

Dadurch braucht die App keinen Hintergrund-Audio-Modus, was das App-Review vereinfacht. Umsetzung: siehe [ARCHITEKTUR.md](ARCHITEKTUR.md).

## Später (v1.1+) & Monetarisierung

- **Kombi-Ansagen:** Sprachausgabe ruft zufällige Schlagkombis („Jab, Cross, Hook“) für Pratzen- und Sandsacktraining.
- **Sparring-Rotation:** Bei 3+ Leuten zeigt die App nach jeder Runde, wer gegen wen boxt.
- **Live Activity:** Countdown im Sperrbildschirm und in der Dynamic Island.
- **Apple Watch:** Vibration am Handgelenk bei Rundenwechsel.
- **Android-Version:** Mit Expo fast ohne Mehraufwand.

**Monetarisierung:** v1 kostenlos und werbefrei, um Bewertungen zu sammeln. Ab v1.1 Extra-Features (Kombi-Ansagen, Rotation, unbegrenzte Presets) als einmaliger Pro-Kauf, z. B. über RevenueCat.

## Fahrplan

| # | Schritt | Status |
|---|---|---|
| 1 | Apple Developer Account beantragen | offen |
| 2 | Projekt aufsetzen, Timer-Logik + Timer-Screen, Test mit Expo Go | ✅ |
| 3 | Presets, Vorlagen und Speicherung | ✅ |
| 4 | Sounds, Mitteilungen, Keep-Awake, Haptik – im echten Sparring testen | ✅ (Sparring-Test offen) |
| 5 | Icon, Screenshots, Store-Texte, Datenschutzseite | offen |
| 6 | EAS Build → TestFlight → App Store Review | offen |

## Offene Fragen

- [ ] App-Name festlegen und Verfügbarkeit im App Store prüfen
- [ ] Welche Rundeneinstellungen werden beim Sparring konkret genutzt?
- [x] Glocken-Sound: lizenzfreie Ringglocke (Pixabay), bearbeitet
- [x] Erst nur iPhone, Android später
