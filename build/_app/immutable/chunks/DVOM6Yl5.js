const e=`# Anleitung: Trading Dashboard

Willkommen beim Trading Dashboard! Dieses Tool wurde entwickelt, um Ihnen bei der präzisen Berechnung Ihrer Positionsgröße und der Analyse potenzieller Trades zu helfen, basierend auf einem soliden Risikomanagement. Verstehen Sie Ihre Kennzahlen auf einen Blick und treffen Sie fundierte Entscheidungen.

## 1. Grundlagen der Eingabe

Bevor Sie mit der Berechnung beginnen, geben Sie bitte die erforderlichen Handelsdaten ein.

### Allgemein
*   **Trade-Typ:** Wählen Sie, ob Sie eine **Long**-Position (Kauf) oder eine **Short**-Position (Verkauf) eingehen möchten.
*   **Hebel (Leverage):** Geben Sie den Hebel ein, den Sie verwenden möchten (z.B. \`10x\`, \`20x\`).
*   **Gebühren pro Trade (%):** Tragen Sie die geschätzten Handelsgebühren Ihrer Börse in Prozent ein (z.B. \`0.075\` für 0,075%).

### Portfolio
*   **Konto Guthaben:** Ihr gesamtes verfügbares Kapital auf dem Handelskonto.
*   **Risiko je Trade (%):** Der Prozentsatz Ihres Kontoguthabens, den Sie bereit sind, pro Trade zu riskieren (z.B. \`1\` für 1%).

### Trade Setup
*   **Symbol:** Das Handelspaar, das Sie analysieren möchten (z.B. \`BTCUSDT\`, \`ETHUSDT\`). Klicken Sie auf den **Pfeil-Button**, um den aktuellen Live-Preis von Binance zu laden.
*   **Kaufpreis (Entry Price):** Der Preis, zu dem Sie die Position eröffnen möchten.
*   **Stopp Loss (Stop-Loss Price):** Der Preis, bei dem Ihre Position automatisch geschlossen wird, um Verluste zu begrenzen. Sie haben zwei Optionen:
    *   **Manueller Stopp Loss:** Geben Sie den gewünschten Stopp-Loss-Preis direkt ein.
    *   **ATR Stopp Loss:** Aktivieren Sie den Schalter, um den Stopp-Loss basierend auf dem Average True Range (ATR) Indikator zu berechnen.
        *   **ATR Wert:** Der aktuelle Wert des ATR-Indikators für das gewählte Zeitfenster.
        *   **Multiplikator:** Ein Faktor, mit dem der ATR-Wert multipliziert wird (üblich sind z.B. \`1.5\` oder \`2\`).
        *   **Formel (Long):** \`Stopp Loss = Kaufpreis - (ATR Wert * Multiplikator)\`
        *   **Formel (Short):** \`Stopp Loss = Kaufpreis + (ATR Wert * Multiplikator)\`

## 2. Take-Profit Ziele (Partiell)

Legen Sie mehrere Take-Profit-Ziele fest, um Ihre Gewinne schrittweise zu realisieren.

*   **Preis:** Der Zielpreis, bei dem ein Teil Ihrer Position verkauft werden soll.
*   **Prozentsatz:** Der Prozentsatz Ihrer *ursprünglichen* Positionsgröße, der bei diesem Zielpreis verkauft werden soll. Die Summe aller Prozentsätze kann 100% nicht überschreiten.
*   **Schloss-Symbol:** Sperren/Entsperren Sie den Prozentsatz, um ihn bei Anpassungen beizubehalten.
*   **Entfernen:** Löschen Sie ein Take-Profit-Ziel.
*   **Weiteres Ziel hinzufügen:** Fügen Sie zusätzliche Take-Profit-Ziele hinzu.

## 3. Zusammenfassung & Metriken

Nachdem Sie alle Eingaben gemacht haben, berechnet das Dashboard automatisch wichtige Kennzahlen:

### Positionsgröße
*   **Positionsgröße:** Die wichtigste Kennzahl! Sie zeigt Ihnen, wie viele Einheiten des Assets Sie kaufen/verkaufen sollten, um Ihr definiertes Risiko pro Trade einzuhalten.
*   **Positionsgröße sperren:** Klicken Sie auf das Schloss-Symbol neben der Positionsgröße. Wenn gesperrt, bleibt die Positionsgröße fix. Änderungen am Stopp-Loss oder Einstiegspreis wirken sich dann auf Ihr Risiko in % aus, anstatt die Positionsgröße anzupassen. Dies ist nützlich, um die Auswirkung von SL-Anpassungen auf Ihr Risiko zu sehen.
*   **Kopieren:** Kopieren Sie die berechnete Positionsgröße in die Zwischenablage.

### Gesamt-Trade Metriken
Diese Kennzahlen geben Ihnen einen Überblick über den gesamten Trade, wenn alle Take-Profit-Ziele erreicht werden würden.

*   **Risiko pro Trade (Währung):** Der absolute Geldbetrag, den Sie maximal riskieren, basierend auf Ihrem Konto Guthaben und Risiko je Trade (%).
*   **Gesamte Gebühren:** Die geschätzten Gesamtkosten für diesen Trade (Kauf, Verkauf, Stopp-Loss/Take-Profit).
*   **Max. potenzieller Gewinn:** Der maximale Netto-Gewinn, wenn die gesamte Position zum besten TP geschlossen würde.
*   **Gewichtetes R/R (Risk/Reward):** Das durchschnittliche Chance-Risiko-Verhältnis aller Teilverkäufe. Ein höheres R/R ist besser.
*   **Gesamt Netto-Gewinn:** Der kumulierte Netto-Gewinn aus allen Teilverkäufen.
*   **Verkaufte Position:** Der Gesamtprozentsatz der ursprünglichen Position, der durch die Take-Profit-Ziele verkauft wird.

### Weitere Kennzahlen
*   **Benötigte Margin:** Das Kapital, das von Ihrem Konto für diesen Trade blockiert wird.
*   **Gesch. Liquidationspreis:** Der geschätzte Preis, bei dem Ihre Position liquidiert wird, wenn Sie einen Hebel verwenden.
*   **Break-Even Preis:** Der Kurs, bei dem Ihr Trade unter Berücksichtigung aller Gebühren null Gewinn/Verlust macht.

## 4. Visuelle Analyse

Die visuelle Leiste bietet eine grafische Darstellung Ihres Trades:

*   **Einstiegspreis:** Markiert Ihren Kauf-/Verkaufspreis.
*   **Stopp Loss:** Zeigt den Punkt an, an dem Ihr Trade geschlossen wird, um Verluste zu begrenzen.
*   **Take-Profit-Ziele:** Markiert Ihre Gewinnziele.
*   **Gewinn-/Verlustzonen:** Farbige Bereiche zeigen an, wo Sie Gewinn oder Verlust machen würden.
*   **Tooltips:** Fahren Sie mit der Maus über die TP-Marker, um Details zu Netto-Gewinn und R/R für diesen spezifischen Teilverkauf zu sehen.

## 5. Presets

Speichern Sie Ihre aktuellen Eingaben als Preset, um häufig verwendete Einstellungen schnell wieder laden zu können. Dies ist ideal für verschiedene Strategien oder Märkte.

## 6. Trade zum Journal hinzufügen

Nachdem Sie einen Trade analysiert haben, können Sie ihn mit einem Klick zum Trade Journal hinzufügen, um Ihre Performance zu verfolgen.
`;export{e as default};
