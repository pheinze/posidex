# Anleitung: Die Berechnungen verstehen

Diese Anleitung erklärt detailliert, wie die Berechnungen in der App funktionieren. Wenn Sie verstehen, wie die Zahlen zustande kommen, können Sie das Tool optimal für Ihr Risikomanagement und Ihre Handelsstrategie nutzen.

<p></p>

### Grundlegende Kennzahlen (Base Metrics)

Alles beginnt mit der Einrichtung Ihres Trades. Die folgenden Kennzahlen sind die Grundlage für alle weiteren Berechnungen.

*   **Risikobetrag (Risk Amount):** Dies ist der Geldbetrag, den Sie bei diesem Trade maximal zu verlieren bereit sind.
    *   **Formel:** `Kontogröße * (Risiko % / 100)`
    *   **Beispiel:** Bei einem 10.000 € Konto und 1 % Risiko riskieren Sie 100 €.

*   **Positionsgröße (Position Size):** Dies ist die Menge der Einheiten des Assets (z.B. Anzahl an Aktien oder Coins), die Sie kaufen oder verkaufen müssen, um genau Ihren gewünschten Risikobetrag zu riskieren.
    *   **Formel:** `Risikobetrag / |Einstiegspreis - Stop-Loss-Preis|`
    *   **Nutzen:** Diese Berechnung ist entscheidend, um in jedem Trade ein konsistentes Risiko zu gewährleisten, unabhängig von der Volatilität des Marktes.

*   **Ordervolumen (Order Volume):** Der Gesamtwert Ihrer Position in der Basiswährung (z.B. USDT).
    *   **Formel:** `Positionsgröße * Einstiegspreis`

*   **Benötigte Margin (Required Margin):** Das Kapital, das Sie tatsächlich auf Ihrem Konto als Sicherheit (Margin) für die Eröffnung der gehebelten Position hinterlegen müssen.
    *   **Formel:** `Ordervolumen / Hebel`
    *   **Hinweis:** Bei einem Hebel von 1 (oder ohne Hebel) entspricht die Margin dem vollen Ordervolumen.

*   **Nettoverlust (Net Loss):** Der tatsächliche Verlust, wenn Ihr Stop-Loss ausgelöst wird. Er berücksichtigt nicht nur den Risikobetrag, sondern auch die Gebühren für die Eröffnung und Schließung der Position.
    *   **Formel:** `Risikobetrag + Einstiegsgebühr + Stop-Loss-Ausstiegsgebühr`

*   **Break-Even-Preis (Break-Even Price):** Der Preis, bei dem Ihr Trade weder Gewinn noch Verlust macht, da die potenziellen Gewinne genau die Handelsgebühren decken.
    *   **Nutzen:** Ein nützlicher Anhaltspunkt, um zu wissen, ab wann Ihr Trade profitabel wird.

*   **Liquidationspreis (Liquidation Price):** (Nur bei Hebel-Trades) Der Preis, bei dem Ihre Position von der Börse automatisch geschlossen wird, weil Ihr Margin-Kapital aufgebraucht ist.
    *   **Warnung:** Dieser Preis sollte immer weit von Ihrem Stop-Loss entfernt sein, um eine ungewollte Liquidation zu vermeiden.

<p></p>

### Kennzahlen der Take-Profit-Ziele (TP)

Für jedes einzelne Take-Profit-Ziel werden individuelle Metriken berechnet.

*   **Nettogewinn (Net Profit):** Der Reingewinn für einen Teilverkauf an einem TP-Ziel. Er berücksichtigt die anteiligen Gebühren.
    *   **Formel:** `Bruttogewinn des Teils - Anteilige Einstiegsgebühr - Ausstiegsgebühr`

*   **Chance-Risiko-Verhältnis (Risk/Reward Ratio):** Zeigt, wie viel Gewinn Sie im Verhältnis zum eingegangenen Risiko für diesen Teil der Position erzielen.
    *   **Formel:** `Nettogewinn / Anteiliger Risikobetrag`
    *   **Nutzen:** Ein R/R von 2:1 bedeutet, dass der potenzielle Gewinn dieses Teilverkaufs doppelt so hoch ist wie das dafür eingegangene Risiko.

*   **Kapitalrendite (Return on Capital - ROC):** Zeigt die prozentuale Rendite auf das eingesetzte Margin-Kapital für diesen Teilverkauf.
    *   **Formel:** `(Nettogewinn / (Benötigte Margin * Verkaufsanteil %)) * 100`

<p></p>

### Gesamt-Kennzahlen des Trades (Total Metrics)

Diese Metriken fassen die Performance des gesamten Trades über alle Take-Profit-Ziele hinweg zusammen.

*   **Gesamter Nettogewinn (Total Net Profit):** Die Summe der Nettogewinne aller Ihrer Teilverkäufe.
*   **Gewichtetes CRV (Weighted R/R):** Das durchschnittliche Chance-Risiko-Verhältnis des gesamten Trades, gewichtet nach dem prozentualen Anteil jedes Ziels.
*   **Maximal potenzieller Gewinn (Max Potential Profit):** Der Nettogewinn, den Sie erzielen würden, wenn Sie 100% Ihrer Position am besten Ihrer gesetzten TP-Ziele verkaufen würden.

Indem Sie diese Berechnungen verstehen, können Sie fundiertere Handelsentscheidungen treffen und Ihre Strategie präzise planen.
