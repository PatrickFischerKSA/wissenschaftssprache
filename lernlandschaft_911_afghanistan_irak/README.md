# lernlandschaft_911_afghanistan_irak

Interaktive Lernlandschaft zu 9/11, Afghanistan und Irak mit kurzem Rückblick auf den Golfkrieg 1990/91.

Statische Web-App mit 3 Stationen, Freischaltlogik, Sofortkorrektur und Synonymerkennung.

## Enthalten

- 3 Stationen: `9/11`, `Afghanistan 2001 bis 2021`, `Irak von 1990/91 bis 2011`
- 8 geordnete YouTube-Filme aus der vorgegebenen Linkliste
- kommentierte Zusatzquellen von bpb, National Archives, 9/11 Memorial, CRS, DoD, Office of the Historian und White House Archive
- kurze Textfragen mit Synonymerkennung und Sofortfeedback
- Drag-and-drop-Chronologien
- Modulfreischaltung ab 60 % im jeweils vorangehenden Modul

## Filmordnung

1. `Tagesschau vom 11. September 2001`
2. `Wer war Terrorpilot Atta?`
3. `USA: 9/11 überlebt und krank an Leib und Seele`
4. `Die Geschichte Afghanistans: Ein Land im Kriegszustand`
5. `Die Jagd auf Amerikas Staatsfeind Nr. 1`
6. `Der geheime Kampf des Westens gegen die Taliban`
7. `Die Golfkriege einfach erklärt`
8. `Saddam Hussein - Biografie eines Tyrannen`

Hinweis: Der Link zur ARTE-Reportage war in der Ausgangsliste doppelt vorhanden und wurde deshalb bewusst nur einmal eingebaut.

## Start

`index.html` direkt im Browser öffnen oder den Ordner über einen lokalen Server ausliefern.

## Struktur

- `index.html`: Oberfläche und Einstiegstexte
- `styles.css`: Gestaltung
- `data.js`: Stationen, Ressourcen, Kommentare, Fragen und Musterlösungen
- `app.js`: Navigation, Fortschritt, Sofortkorrektur und Lehrer*innenmodus
