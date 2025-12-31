# Rauf und Runter - Punktezähler

Eine moderne Web-Anwendung zum Zählen der Punkte für das Kartenspiel "Rauf und Runter".

## Features

- 🎮 Einfache Bedienung über drei Seiten
- 👥 Dynamische Spielerverwaltung (beliebig viele Spieler)
- 🎯 Tracking von Soll- und Ist-Stichen
- 🔄 Automatische Geber-Rotation
- 📱 Responsive Design für alle Geräte
- 🇩🇪 Vollständig auf Deutsch

## Verwendung

Die App ist live unter GitHub Pages verfügbar: https://baumgartner-games.github.io/rauf-und-runter/

### Lokale Entwicklung

```bash
# Einfach einen lokalen Webserver starten
python3 -m http.server 8000

# Oder mit Node.js
npx http-server
```

Dann im Browser öffnen: http://localhost:8000

## Spielablauf

1. **Landing Page**: Klick auf "Punktezähler"
2. **Spieler Setup**: 
   - Spielernamen eingeben (mind. 2 Spieler)
   - "Stiche dürfen aufgehen" aktivieren/deaktivieren
   - "Spiel starten" klicken
3. **Spiel**:
   - Der aktuelle Geber wird oben angezeigt
   - Für jeden Spieler "Soll" (vorhergesagte Stiche) und "Ist" (tatsächliche Stiche) eingeben
   - Mit "Nächste Runde" zum nächsten Geber wechseln

## Technologie

- HTML5
- CSS3 (mit CSS Custom Properties)
- Vanilla JavaScript
- GitHub Actions für automatisches Deployment

## Lizenz

Siehe [LICENSE](LICENSE) Datei.