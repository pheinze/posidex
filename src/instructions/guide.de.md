# Cachy - How-To: Eine Anleitung zur Nutzung des Trading-Rechners

Herzlich willkommen zu Cachy! Dieser Leitfaden erklärt Ihnen alle Funktionen der Anwendung, damit Sie Ihre Trades optimal planen und verwalten können.

**Wichtiger Hinweis zur Datenspeicherung:** Alle Ihre Eingaben, Presets und Journal-Einträge werden **ausschließlich lokal in Ihrem Browser** gespeichert. Es werden keine Daten an einen Server gesendet. Das bedeutet, Ihre Daten sind privat, aber auch, dass sie verloren gehen können, wenn Sie Ihre Browserdaten löschen.

---

### 1. Die Grundlagen: Trade-Berechnung

Die Hauptfunktion von Cachy ist die Berechnung Ihrer Positionsgröße und anderer wichtiger Kennzahlen basierend auf Ihrem Risiko.

**Schritt 1: Allgemeine Eingaben**

*   **Long/Short:** Wählen Sie die Richtung Ihres Trades.
*   **Hebel (Leverage):** Geben Sie den Hebel ein, den Sie verwenden möchten (z.B. 10 für 10x).
*   **Gebühren (Fees %):** Geben Sie die prozentualen Gebühren Ihrer Börse an (z.B. 0.04 für 0.04%).

**Schritt 2: Portfolio-Eingaben**

*   **Konto Guthaben (Account Size):** Geben Sie die Gesamtgröße Ihres Trading-Kontos ein.
*   **Risiko/Trade (%):** Legen Sie fest, wie viel Prozent Ihres Kontos Sie bei diesem einen Trade maximal riskieren möchten (z.B. 1 für 1%).
*   **Risikobetrag:** Dieses Feld zeigt den aus Ihrem prozentualen Risiko berechneten Geldbetrag an. Sie können diesen Betrag auch direkt eingeben und sperren.

**Schritt 3: Trade-Setup**

*   **Symbol:** Geben Sie das Handelspaar ein (z.B. BTCUSDT). Klicken Sie auf den Pfeil-Button, um den aktuellen Preis zu laden.
*   **Einstieg (Entry Price):** Der Preis, zu dem Sie die Position eröffnen.
*   **Stop Loss (SL):** Der Preis, bei dem Ihre Position zur Verlustbegrenzung automatisch geschlossen wird.
*   **ATR Stop Loss verwenden:** Aktivieren Sie diesen Schalter, um den SL mittels ATR (Average True Range) zu berechnen.
    *   **Manual:** Geben Sie den ATR-Wert und einen Multiplikator manuell ein.
    *   **Auto:** Wählen Sie einen Zeitrahmen (z.B. 1h, 4h). Der aktuelle ATR-Wert wird automatisch geladen.

Sobald alle diese Felder ausgefüllt sind, sehen Sie die Ergebnisse im rechten Bereich.

---

### 2. Die Ergebnisse verstehen

Cachy berechnet für Sie die folgenden Werte:

*   **Positionsgröße (Position Size):** Die Menge des Assets, die Sie kaufen/verkaufen sollten.
*   **Max. Nettoverlust (Max Net Loss):** Der maximale Geldbetrag, den Sie verlieren, wenn Ihr Stop Loss erreicht wird.
*   **Benötigte Margin (Required Margin):** Das Kapital, das für diesen Trade blockiert wird.
*   **Einstiegsgebühr (Entry Fee):** Die geschätzten Gebühren für die Eröffnung der Position.
*   **Gesch. Liquidationspreis (Est. Liquidation Price):** Eine Schätzung, bei welchem Preis Ihre Position liquidiert würde.
*   **Break-Even-Preis (Break Even Price):** Der Preis, bei dem Sie ohne Gewinn oder Verlust aussteigen.

---

### 3. Take-Profit (TP) Ziele definieren

Sie können bis zu 5 Take-Profit-Ziele festlegen, um Teile Ihrer Position bei bestimmten Preisen zu verkaufen.

*   **Ziel hinzufügen:** Klicken Sie auf den **`+`** Button, um eine neue TP-Zeile hinzuzufügen.
*   **Preis & Prozent:** Geben Sie für jedes Ziel den Preis und den prozentualen Anteil der Position an, der verkauft werden soll.
*   **Automatische Anpassung:** Wenn Sie den Prozentwert eines Ziels ändern, werden die anderen (nicht gesperrten) Ziele automatisch angepasst, sodass die Summe 100% ergibt.
*   **Prozentsatz sperren:** Klicken Sie auf das Schloss-Symbol, um den Prozentwert eines Ziels zu sperren.

Für jedes gültige TP-Ziel sehen Sie eine detaillierte Aufschlüsselung mit Kennzahlen wie dem **Netto-Gewinn** und dem **Chance-Risiko-Verhältnis (RRR)**.

---

### 4. Erweiterte Funktionen

Cachy bietet eine Reihe von Werkzeugen, um Ihren Workflow zu optimieren.

**Presets (Voreinstellungen)**

*   **Speichern:** Klicken Sie auf den Speichern-Button (Diskettensymbol), um Ihre aktuellen Eingaben als Preset zu speichern.
*   **Laden:** Wählen Sie ein gespeichertes Preset aus dem Dropdown-Menü aus, um alle Eingabefelder automatisch auszufüllen.
*   **Löschen:** Wählen Sie ein Preset aus und klicken Sie auf den Löschen-Button (Mülleimer), um es zu entfernen.

**Erweiterte Sperr-Funktionen**

Es kann immer nur eine Sperre aktiv sein.

*   **Positionsgröße sperren:** Klicken Sie auf das Schloss-Symbol neben der **Positionsgröße**. Wenn aktiv, bleibt die Positionsgröße konstant. Ändern Sie den Stop-Loss, werden stattdessen Ihr **Risiko/Trade (%)** und der **Risikobetrag** angepasst.
*   **Risikobetrag sperren:** Klicken Sie auf das Schloss-Symbol neben dem **Risikobetrag**. Wenn aktiv, bleibt Ihr maximaler Verlust in Währung konstant. Ändern Sie den Stop-Loss, werden die **Positionsgröße** und das **Risiko/Trade (%)** angepasst.

**Trade Journal**

*   **Trade hinzufügen:** Klicken Sie auf **"Trade zum Journal hinzufügen"**, um den berechneten Trade zu speichern.
*   **Journal ansehen:** Klicken Sie auf den **"Journal"**-Button oben rechts, um Ihre Trades anzuzeigen und den Status zu ändern.
*   **Import/Export:** Im Journal-Fenster können Sie Ihr Journal als **CSV-Datei exportieren** oder eine bestehende CSV-Datei **importieren**.

**Weitere Funktionen**

*   **Theme wechseln:** Mit dem Sonnen-/Mond-Symbol können Sie das Design wechseln.
*   **Sprache wechseln:** Unten links können Sie die Sprache der Benutzeroberfläche ändern.
*   **Alles zurücksetzen:** Der Besen-Button setzt alle Eingabefelder zurück.

---

### 5. Tastaturkürzel (Shortcuts)

*   `Alt + L`: Stellt den Trade-Typ auf **Long** um.
*   `Alt + S`: Stellt den Trade-Typ auf **Short** um.
*   `Alt + R`: Setzt alle Eingaben zurück (**Reset**).
*   `Alt + J`: Öffnet oder schließt das **Journal**.
