### **Cachy - How-To: Eine Anleitung zur Nutzung des Trading-Rechners**

Herzlich willkommen zu Cachy! Dieser Leitfaden erklärt Ihnen alle Funktionen der Anwendung, damit Sie Ihre Trades optimal planen und verwalten können.

**Wichtiger Hinweis zur Datenspeicherung:** Alle Ihre Eingaben, Presets und Journal-Einträge werden **ausschließlich lokal in Ihrem Browser** gespeichert. Es werden keine Daten an einen Server gesendet. Das bedeutet, Ihre Daten sind privat, aber auch, dass sie verloren gehen können, wenn Sie Ihre Browserdaten löschen.

---

#### **1. Die Grundlagen: Trade-Berechnung**

Die Hauptfunktion von Cachy ist die Berechnung Ihrer Positionsgröße und anderer wichtiger Kennzahlen basierend auf Ihrem Risiko.

**Schritt 1: Allgemeine Eingaben**
*   **Long/Short:** Wählen Sie die Richtung Ihres Trades.
*   **Hebel (Leverage):** Geben Sie den Hebel ein, den Sie verwenden möchten (z.B. 10 für 10x).
*   **Gebühren (Fees %):** Geben Sie die prozentualen Gebühren Ihrer Börse an (z.B. 0.04 für 0.04%).

**Schritt 2: Portfolio-Eingaben**
*   **Konto Guthaben (Account Size):** Geben Sie die Gesamtgröße Ihres Trading-Kontos ein.
*   **Risiko pro Trade (%):** Legen Sie fest, wie viel Prozent Ihres Kontos Sie bei diesem einen Trade maximal riskieren möchten (z.B. 1 für 1%).

**Schritt 3: Trade-Setup**
*   **Symbol:** Geben Sie das Handelspaar ein (z.B. BTCUSDT).
    *   **Preis holen:** Klicken Sie auf den Pfeil-Button, um den aktuellen Preis von Binance zu laden.
*   **Einstieg (Entry Price):** Der Preis, zu dem Sie die Position eröffnen.
*   **Stop Loss (SL):** Der Preis, bei dem Ihre Position zur Verlustbegrenzung automatisch geschlossen wird.
    *   **ATR Stop Loss verwenden:** Aktivieren Sie diesen Schalter, um den SL automatisch mittels ATR (Average True Range) zu berechnen. Geben Sie dazu den aktuellen ATR-Wert und einen Multiplikator an. Die Formel wird Ihnen zur Kontrolle angezeigt.

Sobald alle diese Felder ausgefüllt sind, sehen Sie die Ergebnisse im rechten Bereich.

---

#### **2. Die Ergebnisse verstehen**

Cachy berechnet für Sie die folgenden Werte:

*   **Positionsgröße (Position Size):** Die Menge des Assets, die Sie kaufen/verkaufen sollten, um Ihr festgelegtes Risiko einzuhalten.
*   **Max. Nettoverlust (Max Net Loss):** Der maximale Geldbetrag, den Sie verlieren, wenn Ihr Stop Loss erreicht wird.
*   **Benötigte Margin (Required Margin):** Die Menge an Kapital, die auf Ihrem Konto für diesen Trade blockiert wird (unter Berücksichtigung des Hebels).
*   **Einstiegsgebühr (Entry Fee):** Die geschätzten Gebühren für die Eröffnung der Position.
*   **Gesch. Liquidationspreis (Est. Liquidation Price):** Eine Schätzung, bei welchem Preis Ihre Position vom Broker liquidiert würde (nur bei Hebel > 1 relevant).
*   **Break-Even-Preis (Break Even Price):** Der Preis, bei dem Sie die Position schließen können, ohne Gewinn oder Verlust zu machen (nach Abzug der Gebühren).

---

#### **3. Take-Profit (TP) Ziele definieren**

Sie können bis zu 5 Take-Profit-Ziele festlegen, um Teile Ihrer Position bei bestimmten Preisen zu verkaufen.

*   **Ziel hinzufügen:** Klicken Sie auf den **`+`** Button, um eine neue TP-Zeile hinzuzufügen.
*   **Preis & Prozent:** Geben Sie für jedes Ziel den Preis und den prozentualen Anteil der Position an, der verkauft werden soll.
*   **Automatische Anpassung:** Wenn Sie den Prozentwert eines Ziels ändern, werden die anderen (nicht gesperrten) Ziele automatisch angepasst, sodass die Summe immer 100% ergibt.
*   **Prozentsatz sperren:** Klicken Sie auf das Schloss-Symbol, um den Prozentwert eines Ziels zu sperren. Dieser wird bei der automatischen Anpassung nicht mehr verändert.

Für jedes gültige TP-Ziel sehen Sie eine detaillierte Aufschlüsselung mit Kennzahlen wie dem **Netto-Gewinn** und dem **Chance-Risiko-Verhältnis (RRR)** für dieses spezifische Ziel.

---

#### **4. Erweiterte Funktionen**

Cachy bietet eine Reihe von Werkzeugen, um Ihren Workflow zu optimieren.

**Presets (Voreinstellungen)**
*   **Speichern:** Haben Sie eine Reihe von Eingaben (z.B. für Ihr Standard-Setup), die Sie oft verwenden? Klicken Sie auf den **Speichern-Button** (Diskettensymbol), geben Sie einen Namen ein, und Ihre aktuellen Eingaben werden als Preset gespeichert.
*   **Laden:** Wählen Sie ein gespeichertes Preset aus dem Dropdown-Menü aus, um alle Eingabefelder automatisch auszufüllen.
*   **Löschen:** Wählen Sie ein Preset aus und klicken Sie auf den **Löschen-Button** (Mülleimer), um es zu entfernen.

**Positionsgröße sperren**
*   Klicken Sie auf das **Schloss-Symbol** neben der berechneten Positionsgröße.
*   Wenn diese Funktion aktiv ist, bleibt die Positionsgröße konstant. Wenn Sie nun den Stop-Loss oder Einstiegspreis ändern, wird stattdessen Ihr **Risiko pro Trade (%)** angepasst. Das ist nützlich, wenn Sie mit einer festen Positionsgröße arbeiten möchten.

**Trade Journal**
*   **Trade hinzufügen:** Nachdem Sie einen Trade berechnet haben, können Sie Notizen hinzufügen und auf **"Trade zum Journal hinzufügen"** klicken. Der Trade wird mit allen Details in Ihrem Journal gespeichert.
*   **Journal ansehen:** Klicken Sie auf den **"Journal"**-Button oben rechts, um alle Ihre gespeicherten Trades anzuzeigen. Sie können den Status jedes Trades ändern (z.B. von "Open" zu "Gewinn" oder "Verlust").
*   **Import/Export:** Im Journal-Fenster können Sie Ihr gesamtes Journal als **CSV-Datei exportieren** (z.B. für Excel) oder eine bestehende CSV-Datei **importieren**.

**Weitere Funktionen**
*   **Theme wechseln:** Mit dem Sonnen-/Mond-Symbol können Sie zwischen einem hellen und dunklen Design wechseln.
*   **Sprache wechseln:** Unten links finden Sie die Möglichkeit, die Sprache der Benutzeroberfläche zu ändern.
*   **Alles zurücksetzen:** Der Besen-Button setzt alle Eingabefelder auf den Standardwert zurück.

---

#### **5. Tastaturkürzel (Shortcuts)**

Für eine schnellere Bedienung können Sie die folgenden Tastaturkürzel verwenden:

*   `Alt + L`: Stellt den Trade-Typ auf **Long** um.
*   `Alt + S`: Stellt den Trade-Typ auf **Short** um.
*   `Alt + R`: Setzt alle Eingaben auf die Standardwerte zurück (**Reset**).
*   `Alt + J`: Öffnet oder schließt das **Journal**-Fenster.
