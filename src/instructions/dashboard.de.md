# Anleitung: Meistere dein Trading mit Cachy

Willkommen bei Cachy! Diese Anleitung ist Ihr Leitfaden, um die volle Leistungsfähigkeit dieses Tools zu verstehen und Ihr Trading auf das nächste Level zu heben.

Der Kern des erfolgreichen Tradings ist **diszipliniertes Risikomanagement**. Cachy wurde entwickelt, um Ihnen genau dabei zu helfen, indem es die komplexen, aber entscheidenden Berechnungen für Sie automatisiert.

---

### Inhaltsverzeichnis
1.  [Der Standard-Workflow: Die Positionsgröße berechnen](#standard-workflow)
2.  [Alternative Workflows: Die Sperr-Funktionen](#sperr-funktionen)
3.  [Stop-Loss für Profis: Der ATR-Modus](#atr-modus)
4.  [Das Chance-Risiko-Verhältnis (CRV) verstehen](#crv-verstehen)
5.  [Fazit](#fazit)

---

### <a name="standard-workflow"></a>1. Der Standard-Workflow: Die Positionsgröße berechnen

Dies ist der häufigste Anwendungsfall. Sie geben vor, wie viel Prozent Ihres Kapitals Sie riskieren möchten, und Cachy berechnet die **exakte Positionsgröße**, die Sie handeln müssen.

**Beispiel-Szenario:**

*   **Ihr Kapital:** 10.000 €
*   **Ihr Risiko pro Trade:** 1 % (also 100 €)
*   **Asset:** BTC/USDT
*   **Geplanter Einstieg:** 50.000 €
*   **Geplanter Stop-Loss:** 49.500 €

**So funktioniert die Berechnung:**

**Schritt 1: Risikobetrag in €**
Zuerst wird Ihr prozentuales Risiko in einen konkreten Geldbetrag umgerechnet.
```
Kapital * (Risiko % / 100)
// Beispiel: 10.000 € * (1 / 100) = 100 €
```

**Schritt 2: Risiko pro Anteil (Unit)**
Als Nächstes berechnet die App, wie viel Sie pro gekaufter Einheit (z.B. pro "Stück" BTC) verlieren würden, wenn Ihr Stop-Loss ausgelöst wird.
```
|Einstiegspreis - Stop-Loss-Preis|
// Beispiel: |50.000 € - 49.500 €| = 500 €
```

**Schritt 3: Die Positionsgröße**
Jetzt wird Ihr gesamtes Risiko durch das Risiko pro Anteil geteilt. Das Ergebnis ist die exakte Menge an Anteilen (hier: BTC), die Sie kaufen müssen.
```
Risikobetrag / Risiko pro Anteil
// Beispiel: 100 € / 500 € = 0,2
```

**Ergebnis:** Sie müssen genau **0,2 BTC** kaufen, um exakt 100 € zu riskieren.

**Der Nutzen für Sie:** Kein Raten mehr. Kein "ungefähr". Sie wissen auf den Cent genau, dass Sie Ihr Risikolimit einhalten, egal wie volatil der Markt ist.

---

### <a name="sperr-funktionen"></a>2. Alternative Workflows: Die Sperr-Funktionen

Manchmal möchten Sie die Berechnung andersherum durchführen. Dafür gibt es die **Sperr-Buttons** (🔒) neben dem Risikobetrag und der Positionsgröße.

#### Szenario A: Risikobetrag sperren

*   **Wann nutzen?** Wenn Sie in **festen Geldbeträgen** denken ("Ich riskiere heute 50 €") anstatt in Prozent.

*   **Wie es funktioniert:**
    1.  Geben Sie Ihren gewünschten Risikobetrag (z.B. 50 €) in das Feld "Risk Amount" ein und klicken Sie auf das Schloss-Symbol.
    2.  Die App passt nun automatisch das Feld "Risiko pro Trade (%)" für Sie an.
    3.  Alle anderen Berechnungen laufen wie gewohnt ab.

*   **Ihr Vorteil:** Flexibilität für Trader, die ihr Risiko lieber in ihrer Währung als in Prozent planen.

#### Szenario B: Positionsgröße sperren

*   **Wann nutzen?** Wenn Sie eine **feste Positionsgröße** handeln möchten (z.B. immer 1 ganze Aktie, immer 0.5 ETH).

*   **Wie es funktioniert:**
    1.  Sperren Sie das Feld "Position Size" und geben Sie Ihre gewünschte Größe ein.
    2.  Passen Sie nun Ihren Einstieg und Stop-Loss an.
    3.  Die App berechnet jetzt **rückwärts**, wie hoch Ihr Risiko (in % und €) bei dieser Positionsgröße und diesem Stop-Loss ist.

*   **Ihr Vorteil:** Perfekt für Strategien, die auf festen Handelsgrößen basieren. Sie sehen sofort die Risiko-Konsequenzen Ihrer Planung.

---

### <a name="atr-modus"></a>3. Stop-Loss für Profis: Der ATR-Modus

Einen Stop-Loss zu setzen ist eine Kunst. Der **ATR (Average True Range)** Modus hilft Ihnen dabei, indem er die aktuelle Marktvolatilität berücksichtigt.

**Was ist der ATR?**
Der ATR misst die **durchschnittliche Preisschwankung** über einen bestimmten Zeitraum (z.B. die letzten 14 Tage). Ein hoher ATR bedeutet hohe Volatilität, ein niedriger ATR bedeutet geringe Volatilität.

**Wie Cachy den ATR berechnet:**
Cachy holt sich die Kerzendaten (Hoch, Tief, Schlusskurs) der letzten 15 Perioden für das gewählte Zeitfenster (z.B. 1D für 15 Tage). Für jede der letzten 14 Perioden wird die **"True Range"** berechnet, was der größte der folgenden drei Werte ist:
1.  `Aktuelles Hoch - Aktuelles Tief`
2.  `|Aktuelles Hoch - Vorheriger Schlusskurs|`
3.  `|Aktuelles Tief - Vorheriger Schlusskurs|`

Der ATR ist dann der **Durchschnitt** dieser 14 "True Range"-Werte.

**So nutzen Sie den ATR Stop-Loss:**
1.  Aktivieren Sie den Schalter **"ATR Stop-Loss"**.
2.  Wählen Sie den Modus:
    *   **Auto:** Cachy holt den aktuellen ATR-Wert für das gewählte Symbol und Zeitfenster automatisch von der Börse.
    *   **Manual:** Sie geben einen eigenen ATR-Wert ein.
3.  Geben Sie einen **Multiplikator** ein. Ein üblicher Wert ist 2.
4.  Der Stop-Loss wird nun automatisch berechnet:
    ```
    // Long-Trade:
    Stop-Loss = Einstiegspreis - (ATR-Wert * Multiplikator)

    // Short-Trade:
    Stop-Loss = Einstiegspreis + (ATR-Wert * Multiplikator)
    ```

**Ihr Vorteil:** Ihr Stop-Loss ist nicht willkürlich, sondern passt sich intelligent der aktuellen Marktlage an. Bei hoher Volatilität gibt er dem Trade mehr Raum zum Atmen, bei niedriger Volatilität sitzt er enger am Preis.

---

### <a name="crv-verstehen"></a>4. Das Chance-Risiko-Verhältnis (CRV / R-R) verstehen

Das CRV ist eine der wichtigsten Kennzahlen im Trading. Es sagt Ihnen, wie viel Gewinn Sie im Verhältnis zu Ihrem Risiko erwarten.

Ein **CRV von 1:1** bedeutet: Sie riskieren 100 €, um 100 € zu gewinnen.
Ein **CRV von 3:1** bedeutet: Sie riskieren 100 €, um 300 € zu gewinnen.

**Wie Cachy das CRV anzeigt:**

*   **Individuelles CRV:** Für jedes Take-Profit (TP) Ziel sehen Sie ein eigenes CRV. So können Sie die Attraktivität jedes einzelnen Ziels bewerten.
*   **Gewichtetes CRV (Weighted R/R):** Dies ist das durchschnittliche CRV für Ihren gesamten Trade, unter Berücksichtigung der prozentualen Anteile, die Sie an den jeweiligen Zielen verkaufen.

**Ihr Vorteil:** Cachy zwingt Sie quasi dazu, über Ihr CRV nachzudenken. Trades mit einem CRV unter 1:1 sind oft langfristig nicht profitabel. Mit diesem Tool können Sie sicherstellen, dass Ihre potenziellen Gewinne Ihre Verluste systematisch übersteigen.

---

### <a name="fazit"></a>5. Fazit

Cachy ist Ihr Partner für diszipliniertes, datengestütztes Trading. Es nimmt Ihnen die fehleranfälligen Berechnungen ab und ermöglicht es Ihnen, sich auf das zu konzentrieren, was zählt: **Ihre Strategie und das Finden guter Trading-Setups.**
