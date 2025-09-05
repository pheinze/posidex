Diese Anleitung bricht die Magie hinter den Zahlen auf. Sie zeigt Ihnen Schritt für Schritt, wie Cachy aus Ihren Eingaben die zentralen Handelskennzahlen berechnet. Jede Formel wird mit einem klaren Beispiel erklärt, damit Sie genau nachvollziehen können, wie die Ergebnisse zustande kommen und was sie für Ihre Handelsentscheidungen bedeuten.

#### **Die Eingaben - Unsere Beispielwerte**

Für alle folgenden Berechnungen verwenden wir ein einheitliches Beispiel, damit Sie die Zusammenhänge leicht nachvollziehen können.

*   **Trade-Typ:** `Long`
*   **Kontoguthaben:** `1.000 €`
*   **Risiko pro Trade:** `2 %`
*   **Hebel:** `10x`
*   **Gebühren:** `0,1 %` (für Ein- und Ausstieg)
*   **Einstiegspreis:** `100 €`
*   **Stop Loss Preis:** `98 €`

---

### **Teil 1: Die Kernberechnungen**

Dies sind die grundlegenden Metriken, die für jeden Trade berechnet werden.

**1. Risikobetrag (€)**
*   **Was es ist:** Der maximale Geldbetrag, den Sie bei diesem Trade riskieren, basierend auf Ihrem prozentualen Risiko.
*   **Formel:** `Kontoguthaben * (Risiko pro Trade / 100)`
*   **Beispiel:** `1.000 € * (2 / 100) = 20 €`

**2. Positionsgröße**
*   **Was es ist:** Die Menge des Assets, die Sie kaufen müssen, um genau Ihren festgelegten Risikobetrag zu riskieren. Dies ist die wichtigste Berechnung für das Risikomanagement.
*   **Formel:** `Risikobetrag / |Einstiegspreis - Stop Loss Preis|` (Der Betrag `|...|` wird verwendet, damit es für Long und Short funktioniert)
*   **Beispiel:** `20 € / |100 € - 98 €| = 10 Einheiten`

**3. Benötigte Margin**
*   **Was es ist:** Das Kapital, das von Ihrem Konto als Sicherheit für die gehebelte Position hinterlegt wird. Bei einem Hebel von 1x entspricht die Margin dem vollen Ordervolumen.
*   **Formel:** `(Positionsgröße * Einstiegspreis) / Hebel`
*   **Beispiel:** `(10 Einheiten * 100 €) / 10 = 100 €`

**4. Maximaler Nettoverlust**
*   **Was es ist:** Ihr tatsächlicher, maximaler Verlust in Euro, wenn der Stop Loss erreicht wird. Dieser Wert berücksichtigt bereits die Gebühren für die Eröffnung (Einstieg) und die Schließung (Ausstieg am SL) der Position.
*   **Formeln:**
    *   `Einstiegsgebühr = (Positionsgröße * Einstiegspreis) * (Gebühren / 100)`
    *   `Stop-Loss-Ausstiegsgebühr = (Positionsgröße * Stop Loss Preis) * (Gebühren / 100)`
    *   `Max. Nettoverlust = Risikobetrag + Einstiegsgebühr + Stop-Loss-Ausstiegsgebühr`
*   **Beispiel:**
    *   `Einstiegsgebühr = (10 * 100 €) * 0,001 = 1 €`
    *   `Stop-Loss-Ausstiegsgebühr = (10 * 98 €) * 0,001 = 0,98 €`
    *   `Max. Nettoverlust = 20 € + 1 € + 0,98 € = 21,98 €`

**5. Break-Even-Preis**
*   **Was es ist:** Der Preis, bei dem Sie aus dem Trade aussteigen können, ohne Gewinn oder Verlust zu machen. An diesem Punkt sind die Kosten für die Ein- und Ausstiegsgebühren gedeckt.
*   **Formel (Long):** `Einstiegspreis * (1 + Gebühren%) / (1 - Gebühren%)`
*   **Beispiel:** `100 € * (1 + 0,001) / (1 - 0,001) ≈ 100,20 €`

**6. Geschätzter Liquidationspreis**
*   **Was es ist:** Eine Schätzung des Preises, bei dem Ihre Position von der Börse zwangsliquidiert wird, weil der Verlust die hinterlegte Margin aufgebraucht hat. (Dies ist eine vereinfachte Formel, die tatsächliche Berechnung der Börsen kann leicht abweichen).
*   **Formel (Long):** `Einstiegspreis * (1 - (1 / Hebel))`
*   **Beispiel:** `100 € * (1 - (1 / 10)) = 90 €`

---

### **Teil 2: Take-Profit-Berechnungen**

Wenn Sie Take-Profit (TP) Ziele festlegen, werden für jedes Ziel separate Metriken berechnet. Nehmen wir an, Sie haben ein Ziel festgelegt:

*   **TP 1 Preis:** `104 €`
*   **Zu verkaufender Anteil:** `50 %`

**1. Netto-Gewinn (pro Ziel)**
*   **Was es ist:** Der Reingewinn für diesen spezifischen Teilverkauf, nachdem die anteiligen Gebühren für den Ein- und Ausstieg abgezogen wurden.
*   **Formeln:**
    *   `Anteilige Positionsgröße = Positionsgröße * (Anteil / 100)`
    *   `Brutto-Gewinn = |TP Preis - Einstiegspreis| * Anteilige Positionsgröße`
    *   `Anteilige Gebühren = (Anteilige Positionsgröße * Einstiegspreis * Gebühren%) + (Anteilige Positionsgröße * TP Preis * Gebühren%)`
    *   `Netto-Gewinn = Brutto-Gewinn - Anteilige Gebühren`
*   **Beispiel (TP 1):**
    *   `Anteilige Positionsgröße = 10 * 0,5 = 5 Einheiten`
    *   `Brutto-Gewinn = |104 € - 100 €| * 5 = 20 €`
    *   `Anteilige Gebühren = (5 * 100 € * 0,001) + (5 * 104 € * 0,001) = 0,50 € + 0,52 € = 1,02 €`
    *   `Netto-Gewinn = 20 € - 1,02 € = 18,98 €`

**2. Chance-Risiko-Verhältnis (CRV / RRR)**
*   **Was es ist:** Vergleicht den potenziellen Netto-Gewinn dieses Teilverkaufs mit dem dafür eingegangenen anteiligen Risiko. Ein CRV von 2 bedeutet, Sie können das Doppelte von dem gewinnen, was Sie für diesen Teil der Position riskiert haben.
*   **Formel:** `Netto-Gewinn / (Risikobetrag * (Anteil / 100))`
*   **Beispiel (TP 1):**
    *   `Anteiliges Risiko = 20 € * 0,5 = 10 €`
    *   `CRV = 18,98 € / 10 € ≈ 1,90`

---

#### **Schlussbemerkung**

Diese Berechnungen geben Ihnen eine solide, datengestützte Grundlage für Ihre Handelsentscheidungen. Indem Sie verstehen, *wie* diese Zahlen entstehen, können Sie die Kontrolle über Ihr Risikomanagement verbessern. Viel Erfolg beim Handeln!
