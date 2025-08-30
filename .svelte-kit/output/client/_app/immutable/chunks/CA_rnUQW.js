const e=`# Anleitung: Trade Journal

Das Trade Journal ist Ihr persönliches Logbuch für alle Ihre Handelsaktivitäten. Es hilft Ihnen, Ihre Performance zu verfolgen, Muster zu erkennen und Ihre Strategie kontinuierlich zu verbessern.

## 1. Journal-Übersicht

Die Haupttabelle des Journals zeigt eine chronologische Liste all Ihrer Trades.

*   **Datum:** Der Zeitpunkt, zu dem der Trade zum Journal hinzugefügt wurde.
*   **Symbol:** Das gehandelte Asset (z.B. \`BTCUSDT\`).
*   **Typ:** Ob es sich um eine Long- oder Short-Position handelte.
*   **Einstieg (Entry):** Der Einstiegspreis des Trades.
*   **SL (Stop-Loss):** Der Stop-Loss-Preis des Trades.
*   **R/R (Risk/Reward):** Das Chance-Risiko-Verhältnis des Trades.
*   **Status:** Der aktuelle Status des Trades (\`Offen\`, \`Gewonnen\`, \`Verloren\`).
    *   Sie können den Status eines Trades direkt in der Tabelle ändern. Dies ist entscheidend für die korrekte Performance-Analyse.
*   **Notizen:** Persönliche Anmerkungen zum Trade.
    *   Längere Notizen können durch Klicken auf die Notiz-Zelle ein- und ausgeklappt werden.
*   **Aktion:** Hier finden Sie Optionen wie das Löschen eines Trades.

## 2. Suchen & Filtern

Oberhalb der Tabelle finden Sie Funktionen, um Ihre Trades zu organisieren:

*   **Symbol suchen:** Geben Sie ein Symbol ein, um nur Trades dieses Assets anzuzeigen.
*   **Filter:** Filtern Sie die Trades nach ihrem Status (\`Alle\`, \`Offen\`, \`Gewonnen\`, \`Verloren\`).

## 3. Performance-Statistiken

Am oberen Rand des Journals (oder in einem separaten Bereich) finden Sie eine Zusammenfassung Ihrer Performance.

*   **Performance pro Symbol:** Eine detaillierte Aufschlüsselung Ihrer Performance für jedes gehandelte Symbol.
    *   **Trades:** Die Anzahl der Trades für dieses Symbol.
    *   **Gewinn %:** Der Prozentsatz der Gewinntrades für dieses Symbol.
    *   **Gesamt P/L (Profit/Loss):** Der kumulierte Gewinn oder Verlust für dieses Symbol.

## 4. Daten-Management

Verwalten Sie Ihre Journaldaten sicher und effizient.

*   **Exportieren (CSV):** Exportieren Sie Ihr gesamtes Journal als CSV-Datei. Dies dient als Backup oder zur weiteren Analyse in Tabellenkalkulationsprogrammen.
*   **Importieren (CSV):** Importieren Sie eine zuvor exportierte CSV-Datei, um Ihr Journal wiederherzustellen oder zu aktualisieren. Doppelte Einträge (basierend auf der Trade-ID) werden dabei automatisch übersprungen.
*   **Alles löschen:** **Vorsicht!** Diese Aktion löscht Ihr gesamtes Journal unwiderruflich. Verwenden Sie diese Funktion mit Bedacht und nur, wenn Sie sicher sind, dass Sie alle Daten entfernen möchten.
`;export{e as default};
