export interface ChartPattern {
    id: string;
    name: string;
    category: string;
    description: string;
    characteristics: string[];
    trading: string;
    advancedConsiderations: string;
    performanceStats: string;
}

const rawData = {
    "Umkehrmuster": [
        {
            id: 'headAndShoulders',
            name: 'SKS (Schulter-Kopf-Schulter)',
            description: 'Ein SKS-Muster ist eine bärische Umkehrformation, die typischerweise am Ende eines Aufwärtstrends auftritt. Es besteht aus drei Hochs, wobei das mittlere Hoch (Kopf) höher ist als die beiden seitlichen Hochs (Schultern). Eine Nackenlinie verbindet die Tiefs zwischen den Hochs.',
            characteristics: [
                'Tritt nach einem Aufwärtstrend auf.',
                'Drei Peaks: linke Schulter, Kopf (höchster Peak), rechte Schulter.',
                'Nackenlinie (Neckline) verbindet die Tiefs zwischen den Peaks.',
                'Volumen ist oft höher bei der linken Schulter und dem Kopf, geringer bei der rechten Schulter.'
            ],
            trading: 'Ein Verkaufssignal entsteht, wenn der Kurs die Nackenlinie nach unten durchbricht. Das Kursziel wird oft als die Distanz vom Kopf zur Nackenlinie, projiziert nach unten vom Ausbruchspunkt, berechnet.<br><br><strong>Wahrscheinlichkeit eines guten Trades:</strong> Mittel bis hoch, insbesondere bei klarem Bruch der Nackenlinie mit erhöhtem Volumen und nachfolgender Bestätigung (z.B. Pullback zur Nackenlinie, die dann als Widerstand hält).<br><strong>Tradingeinstieg mit TP und SL:</strong> Einstieg: Short-Position bei oder nach dem Bruch der Nackenlinie. Stop-Loss (SL): Knapp über der Nackenlinie oder über der rechten Schulter. Take-Profit (TP): Mindestens die Distanz vom Kopf zur Nackenlinie, vom Ausbruchspunkt nach unten projiziert.',
            advancedConsiderations: '<strong>Fehlausbrüche:</strong> Ein Fehlausbruch über die Nackenlinie (nach oben) kann ein starkes bullisches Signal sein (siehe SKS-Top Fehlausbruch). Ein Fehlausbruch unter die Nackenlinie, der schnell wieder darüber schließt, kann ebenfalls eine Falle sein.<br><strong>Variationen:</strong> Die Nackenlinie kann leicht geneigt sein. Die Schultern müssen nicht exakt gleich hoch sein.<br><strong>Kontext:</strong> Stärkeres Signal, wenn es nach einem längeren, etablierten Aufwärtstrend auftritt. Bärische Divergenzen im RSI oder MACD können das Signal verstärken.<br><strong>Kombinationen:</strong> Kann Teil einer größeren Top-Bildung sein oder nach einem Fehlausbruch eines anderen Musters entstehen.',
            performanceStats: 'Historisch gesehen eine der zuverlässigeren Umkehrformationen. Die Erfolgsquote kann je nach Markt und Zeitrahmen variieren, liegt aber oft über 60-70% bei idealtypischer Ausbildung und Bestätigung. Das Risk-Reward-Verhältnis ist oft günstig, da das Kursziel klar definiert ist.',
        },
        {
            id: 'inverseHeadAndShoulders',
            name: 'Inverse SKS (iSKS)',
            description: 'Eine inverse SKS-Formation ist ein bullisches Umkehrmuster, das typischerweise am Ende eines Abwärtstrends auftritt. Es ist das Spiegelbild des SKS-Musters.',
            characteristics: [
                'Tritt nach einem Abwärtstrend auf.',
                'Drei Tiefs: linke Schulter, Kopf (tiefster Punkt), rechte Schulter.',
                'Nackenlinie verbindet die Hochs zwischen den Tiefs.',
                'Volumen kann beim Ausbruch über die Nackenlinie ansteigen.'
            ],
            trading: 'Ein Kaufsignal entsteht, wenn der Kurs die Nackenlinie nach oben durchbricht. Das Kursziel wird oft als die Distanz vom Kopf zur Nackenlinie, projiziert nach oben vom Ausbruchspunkt, berechnet.<br><br><strong>Wahrscheinlichkeit eines guten Trades:</strong> Mittel bis hoch, insbesondere bei klarem Bruch der Nackenlinie mit erhöhtem Volumen und nachfolgender Bestätigung (z.B. Pullback zur Nackenlinie, die dann als Unterstützung hält).<br><strong>Tradingeinstieg mit TP und SL:</strong> Einstieg: Long-Position bei oder nach dem Bruch der Nackenlinie. SL: Knapp unter der Nackenlinie oder unter der rechten Schulter. TP: Mindestens die Distanz vom Kopf zur Nackenlinie, vom Ausbruchspunkt nach oben projiziert.',
            advancedConsiderations: '<strong>Fehlausbrüche:</strong> Ein Fehlausbruch unter die Nackenlinie (nach unten) kann ein starkes bärisches Signal sein (siehe iSKS-Boden Fehlausbruch).<br><strong>Variationen:</strong> Die Nackenlinie kann leicht geneigt sein. Die Schultern müssen nicht exakt gleich tief sein.<br><strong>Kontext:</strong> Stärkeres Signal, wenn es nach einem längeren, etablierten Abwärtstrend auftritt. Bullische Divergenzen im RSI oder MACD können das Signal verstärken.',
            performanceStats: 'Ähnlich zuverlässig wie das SKS-Top. Die Erfolgsquote ist vergleichbar, und das Risk-Reward-Verhältnis kann attraktiv sein.',
        },
        {
            id: 'headAndShouldersTopFailure',
            name: 'SKS-Top Fehlausbruch',
            description: 'Ein SKS-Top Fehlausbruch tritt auf, wenn ein SKS-Muster sich zu bilden beginnt, der Kurs aber die Nackenlinie nicht nachhaltig nach unten durchbricht und stattdessen wieder über die rechte Schulter oder sogar den Kopf ansteigt. Dies kann ein starkes bullisches Signal sein.',
            characteristics: [
                'Ansatz eines SKS-Top-Musters (linke Schulter, Kopf, rechte Schulter).',
                'Der Kurs scheitert daran, die Nackenlinie signifikant nach unten zu durchbrechen.',
                'Stattdessen steigt der Kurs wieder an, oft über das Niveau der rechten Schulter oder des Kopfes.',
                'Signalisiert, dass die Verkäufer nicht stark genug waren, den Trend zu wenden.'
            ],
            trading: 'Ein Kaufsignal entsteht, wenn der Kurs nach dem gescheiterten Bruch der Nackenlinie wieder Stärke zeigt und über wichtige Widerstandsniveaus des unvollendeten SKS-Musters steigt.<br><br><strong>Wahrscheinlichkeit eines guten Trades:</strong> Mittel bis hoch, da der Fehlausbruch oft eine Falle für Short-Seller darstellt und eine starke Gegenbewegung auslösen kann.<br><strong>Tradingeinstieg mit TP und SL:</strong> Einstieg: Long-Position, wenn der Kurs über die rechte Schulter oder den Kopf des gescheiterten SKS-Musters steigt. SL: Unterhalb der Nackenlinie oder des Tiefs der rechten Schulter. TP: Basierend auf vorherigen Widerständen oder Fibonacci-Projektionen des vorherigen Aufwärtstrends.',
            advancedConsiderations: 'Achten Sie auf das Volumen: Ein Fehlausbruch mit geringem Volumen beim Versuch, die Nackenlinie zu durchbrechen, und anschließendem Anstieg mit höherem Volumen ist ein stärkeres Signal.',
            performanceStats: 'Fehlausbrüche können starke Signale sein, da sie Marktteilnehmer auf dem falschen Fuß erwischen. Die Zuverlässigkeit hängt von der Stärke der Umkehr ab.',
        },
        {
            id: 'headAndShouldersBottomFailure',
            name: 'iSKS-Boden Fehlausbruch',
            description: 'Ein iSKS-Boden Fehlausbruch tritt auf, wenn ein inverses SKS-Muster sich zu bilden beginnt, der Kurs aber die Nackenlinie nicht nachhaltig nach oben durchbricht und stattdessen wieder unter die rechte Schulter oder sogar den Kopf fällt. Dies kann ein starkes bärisches Signal sein.',
            characteristics: [
                'Ansatz eines iSKS-Musters (linke Schulter, Kopf, rechte Schulter).',
                'Der Kurs scheitert daran, die Nackenlinie signifikant nach oben zu durchbrechen.',
                'Stattdessen fällt der Kurs wieder ab, oft unter das Niveau der rechten Schulter oder des Kopfes.',
                'Signalisiert, dass die Käufer nicht stark genug waren, den Trend zu wenden.'
            ],
            trading: 'Ein Verkaufssignal entsteht, wenn der Kurs nach dem gescheiterten Bruch der Nackenlinie wieder Schwäche zeigt und unter wichtige Unterstützungsniveaus des unvollendeten iSKS-Musters fällt.<br><br><strong>Wahrscheinlichkeit eines guten Trades:</strong> Mittel bis hoch.<br><strong>Tradingeinstieg mit TP und SL:</strong> Einstieg: Short-Position, wenn der Kurs unter die rechte Schulter oder den Kopf des gescheiterten iSKS-Musters fällt. SL: Oberhalb der Nackenlinie oder des Hochs der rechten Schulter. TP: Basierend auf vorherigen Unterstützungen oder Fibonacci-Projektionen des vorherigen Abwärtstrends.',
            advancedConsiderations: 'Achten Sie auf das Volumen: Ein Fehlausbruch mit geringem Volumen beim Versuch, die Nackenlinie zu durchbrechen, und anschließendem Abfall mit höherem Volumen ist ein stärkeres Signal.',
            performanceStats: 'Analog zum SKS-Top Fehlausbruch, nur in die entgegengesetzte Richtung.',
        },
        {
            id: 'doubleTop',
            name: 'Doppeltop',
            description: 'Ein Doppeltop ist ein bärisches Umkehrmuster, das nach einem signifikanten Aufwärtstrend auftritt. Es besteht aus zwei etwa gleich hohen Hochs mit einem moderaten Tief dazwischen.',
            characteristics: [ 'Zwei aufeinanderfolgende Hochs auf ähnlichem Niveau.', 'Ein Zwischentief (Unterstützungslinie) zwischen den Hochs.', 'Volumen ist oft beim ersten Hoch höher als beim zweiten.'],
            trading: 'Ein Verkaufssignal wird generiert, wenn der Kurs unter die Unterstützungslinie (das Zwischentief) fällt. Das Kursziel ist oft die Höhe des Musters (Distanz von den Hochs zur Unterstützungslinie), projiziert nach unten.<br><br><strong>Wahrscheinlichkeit eines guten Trades:</strong> Mittel bis hoch, wenn der Bruch der Unterstützungslinie mit Volumen bestätigt wird. Eine höhere Wahrscheinlichkeit besteht, wenn das zweite Hoch das erste nicht übersteigt und ggf. bärische Divergenzen bei Indikatoren auftreten.<br><strong>Tradingeinstieg mit TP und SL:</strong> Einstieg: Short-Position nach dem Bruch der Unterstützungslinie. SL: Knapp über der Unterstützungslinie (die nun Widerstand ist) oder über den Hochs. TP: Höhe des Musters vom Ausbruchspunkt nach unten projiziert.',
            advancedConsiderations: '<strong>Fehlausbrüche:</strong> Ein Fehlausbruch unter die Unterstützungslinie, der schnell wieder darüber schließt, kann eine Falle sein. Ein Ausbruch über die Hochs negiert das Muster.<br><strong>Variationen:</strong> Die Hochs müssen nicht exakt gleich sein; leichte Abweichungen sind normal. Das Zwischentief kann unterschiedlich tief sein.<br><strong>Kontext:</strong> Stärker nach einem langen Aufwärtstrend. Bärische Divergenzen (z.B. im RSI) zwischen den beiden Hochs erhöhen die Aussagekraft.<br><strong>Kombinationen:</strong> Kann Teil einer größeren Verteilungsphase sein.',
            performanceStats: 'Gilt als zuverlässiges Umkehrmuster. Die Erfolgsrate kann durch Bestätigungssignale wie Volumen oder Divergenzen verbessert werden.',
        },
        {
            id: 'doubleBottom',
            name: 'Doppelboden',
            description: 'Ein Doppelboden ist ein bullisches Umkehrmuster, das nach einem signifikanten Abwärtstrend auftritt. Es besteht aus zwei etwa gleich tiefen Tiefs mit einem moderaten Hoch dazwischen.',
            characteristics: ['Zwei aufeinanderfolgende Tiefs auf ähnlichem Niveau.', 'Ein Zwischenhoch (Widerstandslinie) zwischen den Tiefs.', 'Volumen kann beim zweiten Tief geringer sein und beim Ausbruch ansteigen.'],
            trading: 'Ein Kaufsignal wird generiert, wenn der Kurs über die Widerstandslinie (das Zwischenhoch) steigt. Das Kursziel ist oft die Höhe des Musters (Distanz von den Tiefs zur Widerstandslinie), projiziert nach oben.<br><br><strong>Wahrscheinlichkeit eines guten Trades:</strong> Mittel bis hoch, wenn der Bruch der Widerstandslinie mit Volumen bestätigt wird. Eine höhere Wahrscheinlichkeit besteht, wenn das zweite Tief das erste nicht unterschreitet und ggf. bullische Divergenzen bei Indikatoren auftreten.<br><strong>Tradingeinstieg mit TP und SL:</strong> Einstieg: Long-Position nach dem Bruch der Widerstandslinie. SL: Knapp unter der Widerstandslinie (die nun Unterstützung ist) oder unter den Tiefs. TP: Höhe des Musters vom Ausbruchspunkt nach oben projiziert.',
            advancedConsiderations: '<strong>Fehlausbrüche:</strong> Ein Fehlausbruch über die Widerstandslinie, der schnell wieder darunter schließt, kann eine Falle sein. Ein Bruch unter die Tiefs negiert das Muster.<br><strong>Variationen:</strong> Die Tiefs müssen nicht exakt gleich sein. Das Zwischenhoch kann unterschiedlich hoch sein.<br><strong>Kontext:</strong> Stärker nach einem langen Abwärtstrend. Bullische Divergenzen (z.B. im RSI) zwischen den beiden Tiefs erhöhen die Aussagekraft.<br><strong>Kombinationen:</strong> Kann Teil einer größeren Akkumulationsphase sein.',
            performanceStats: 'Gilt als zuverlässiges Umkehrmuster. Analog zum Doppeltop, Bestätigungssignale sind wichtig.',
        },
        {
            id: 'tripleTop',
            name: 'Dreifachtop (Triple Top)',
            description: 'Ein Dreifachtop ist ein bärisches Umkehrmuster, ähnlich dem Doppeltop, aber mit drei Hochs auf etwa gleichem Niveau. Es signalisiert eine stärkere Widerstandszone.',
            characteristics: [
                'Drei aufeinanderfolgende Hochs auf ähnlichem Niveau.',
                'Zwei Zwischentiefs (Unterstützungslinie) zwischen den Hochs.',
                'Volumen nimmt oft bei jedem folgenden Hoch ab.'
            ],
            trading: 'Ein Verkaufssignal wird generiert, wenn der Kurs unter die Unterstützungslinie (gebildet durch die Zwischentiefs) fällt. Das Kursziel ist oft die Höhe des Musters.<br><br><strong>Wahrscheinlichkeit eines guten Trades:</strong> Hoch, da es eine stärkere Bestätigung des Widerstands darstellt als ein Doppeltop. Bestätigung durch Volumen beim Bruch ist wichtig.<br><strong>Tradingeinstieg mit TP und SL:</strong> Einstieg: Short-Position nach dem Bruch der Unterstützungslinie. SL: Knapp über der Unterstützungslinie oder über den Hochs. TP: Höhe des Musters vom Ausbruchspunkt nach unten projiziert.',
            advancedConsiderations: '<strong>Kontext:</strong> Ein Triple Top nach einem sehr starken Aufwärtstrend hat eine höhere Aussagekraft. Achten Sie auf Divergenzen bei Indikatoren über die drei Hochs hinweg.',
            performanceStats: 'Stärker als ein Doppeltop, da der Widerstand dreimal bestätigt wurde. Gute Erfolgsquote bei klarem Bruch.',
        },
        {
            id: 'tripleBottom',
            name: 'Dreifachboden (Triple Bottom)',
            description: 'Ein Dreifachboden ist ein bullisches Umkehrmuster, ähnlich dem Doppelboden, aber mit drei Tiefs auf etwa gleichem Niveau. Es signalisiert eine stärkere Unterstützungszone.',
            characteristics: [
                'Drei aufeinanderfolgende Tiefs auf ähnlichem Niveau.',
                'Zwei Zwischenhochs (Widerstandslinie) zwischen den Tiefs.',
                'Volumen kann beim dritten Tief geringer sein und beim Ausbruch ansteigen.'
            ],
            trading: 'Ein Kaufsignal wird generiert, wenn der Kurs über die Widerstandslinie (gebildet durch die Zwischenhochs) steigt. Das Kursziel ist oft die Höhe des Musters.<br><br><strong>Wahrscheinlichkeit eines guten Trades:</strong> Hoch, da es eine stärkere Bestätigung der Unterstützung darstellt als ein Doppelboden. Bestätigung durch Volumen beim Bruch ist wichtig.<br><strong>Tradingeinstieg mit TP und SL:</strong> Einstieg: Long-Position nach dem Bruch der Widerstandslinie. SL: Knapp unter der Widerstandslinie oder unter den Tiefs. TP: Höhe des Musters vom Ausbruchspunkt nach oben projiziert.',
            advancedConsiderations: '<strong>Kontext:</strong> Ein Triple Bottom nach einem sehr starken Abwärtstrend hat eine höhere Aussagekraft. Achten Sie auf Divergenzen bei Indikatoren über die drei Tiefs hinweg.',
            performanceStats: 'Stärker als ein Doppelboden. Gute Erfolgsquote bei klarem Bruch.',
        },
        {
            id: 'fallingWedge',
            name: 'Fallender Keil (Falling Wedge)',
            description: 'Ein fallender Keil ist typischerweise eine bullische Umkehrformation, kann aber auch als Fortsetzungsmuster in einem Aufwärtstrend auftreten. Er wird durch zwei konvergierende, abwärts geneigte Linien gebildet.',
            characteristics: [
                'Zwei abwärts geneigte Linien (Widerstand und Unterstützung), die konvergieren.',
                'Die obere Linie (Widerstand) fällt steiler als die untere Linie (Unterstützung).',
                'Volumen nimmt oft während der Bildung ab und steigt beim Ausbruch stark an.'
            ],
            trading: 'Ein Kaufsignal entsteht, wenn der Kurs über die obere Widerstandslinie ausbricht. Das Kursziel ist oft der breiteste Teil des Keils, projiziert vom Ausbruchspunkt.<br><br><strong>Wahrscheinlichkeit eines guten Trades:</strong> Mittel bis hoch, besonders wenn der Ausbruch mit hohem Volumen erfolgt und der Keil sich nach einem Abwärtstrend bildet (Umkehr).<br><strong>Tradingeinstieg mit TP und SL:</strong> Einstieg: Long-Position nach dem Ausbruch über die obere Keillinie. SL: Unterhalb des Ausbruchspunktes oder unter dem letzten Tief innerhalb des Keils. TP: Höhe der Basis des Keils, projiziert vom Ausbruchspunkt nach oben.',
            advancedConsiderations: '<strong>Fehlausbrüche:</strong> Ein Fehlausbruch nach unten, gefolgt von einer schnellen Umkehr und einem Ausbruch nach oben, kann ein besonders starkes Signal sein.<br><strong>Kontext und Interpretation (Dualität):</strong><ul>    <li><strong>Als bullische Umkehrformation (häufiger):</strong><ul><li><em>Vorhergehender Trend:</em> Etablierter Abwärtstrend.</li><li><em>Formation:</em> Zeigt nachlassende Verkaufsdynamik.</li><li><em>Ausbruch:</em> Nach oben aus der oberen Keillinie.</li><li><em>Interpretation:</em> Signalisiert das Ende des Abwärtstrends und den Beginn eines Aufwärtstrends. Am  am Ende eines deutlichen Abwärtstrends.</li></ul></li><li><strong>Als bullische Fortsetzungsformation:</strong><ul><li><em>Vorhergehender Trend:</em> Etablierter Aufwärtstrend.</li><li><em>Formation:</em> Stellt eine Konsolidierungsphase oder einen Pullback innerhalb des Aufwärtstrends dar.</li><li><em>Ausbruch:</em> Nach oben  der oberen Keillinie.</li><li><em>Interpretation:</em> Signalisiert das Ende der Konsolidierung und die Wiederaufnahme des Aufwärtstrends.</li></ul></li></ul>',
            performanceStats: 'Fallende Keile haben eine relativ hohe Erfolgsquote als bullische Muster, insbesondere wenn sie nach einem Abwärtstrend auftreten.',
        },
        {
            id: 'risingWedge',
            name: 'Steigender Keil (Rising Wedge)',
            description: 'Ein steigender Keil ist typischerweise eine bärische Umkehrformation, kann aber auch als Fortsetzungsmuster in einem Abwärtstrend auftreten. Er wird durch zwei konvergierende, aufwärts geneigte Linien gebildet.',
            characteristics: [
                'Zwei aufwärts geneigte Linien (Widerstand und Unterstützung), die konvergieren.',
                'Die untere Linie (Unterstützung) steigt steiler als die obere Linie (Widerstand).',
                'Volumen nimmt oft während der Bildung ab und steigt beim Ausbruch.'
            ],
            trading: 'Ein Verkaufssignal entsteht, wenn der Kurs unter die untere Unterstützungslinie ausbricht. Das Kursziel ist oft der breiteste Teil des Keils, projiziert vom Ausbruchspunkt.<br><br><strong>Wahrscheinlichkeit eines guten Trades:</strong> Mittel bis hoch, besonders wenn der Ausbruch mit hohem Volumen erfolgt und der Keil sich nach einem Aufwärtstrend bildet (Umkehr).<br><strong>Tradingeinstieg mit TP und SL:</strong> Einstieg: Short-Position nach dem Ausbruch unter die untere Keillinie. SL: Oberhalb des Ausbruchspunktes oder über dem letzten Hoch innerhalb des Keils. TP: Höhe der Basis des Keils, projiziert vom Ausbruchspunkt nach unten.',
            advancedConsiderations: '<strong>Fehlausbrüche:</strong> Ein Fehlausbruch nach oben, gefolgt von einer schnellen Umkehr und einem Ausbruch nach unten, kann ein besonders starkes Signal sein.<br><strong>Kontext und Interpretation (Dualität):</strong><ul><li><strong>Als bärische Umkehrformation (häufiger):</strong><ul><li><em>Vorhergehender Trend:</em> Etablierter Aufwärtstrend.</li><li><em>Formation:</em> Zeigt nachlassende Kaufdynamik, oft mit bärischen Divergenzen bei Indikatoren.</li><li><em>Ausbruch:</em> Nach unten aus der unteren Keillinie.</li><li><em>Interpretation:</em> Signalisiert das Ende des Aufwärtstrends und Beginn eines Abwärtstrends. Am zuverlässigsten am Ende eines deutlichen Aufwärtstrends.</li></ul></li><li><strong>Als bärische Fortsetzungsformation:</strong><ul><li><em>Vorhergehender Trend:</em> Etablierter Abwärtstrend.</li><li><em>Formation:</em> Stellt eine Konsolidierungsphase oder eine korrektive Gegenbewegung Bärenmarktrallye) innerhalb des Abwärtstrends dar.</li><li><em>Ausbruch:</em> Nach unten aus der unteren Keillinie.</li><li><em>Interpretation:</em> Signalisiert das Ende der Gegenbewegung und die Wiederaufnahme des Abwärtstrends.</li></ul></li></ul><strong>Zusätzlich:</strong> Bärische Divergenzen bei Oszillatoren (z.B. RSI, MACD) zwischen den Hochpunkten innerhalb des Keils können die Wahrscheinlichkeit einer bärischen Auflösung (besonders im Umkehrszenario) erhöhen.',
            performanceStats: 'Steigende Keile haben eine relativ hohe Erfolgsquote als bärische Muster, insbesondere wenn sie nach einem Aufwärtstrend auftreten.',
        },
        // ... (more patterns) ...
    ],
    "Fortsetzungsmuster": [
        // ... (patterns) ...
    ],
    "Bilaterale Muster": [
        // ... (patterns) ...
    ],
    "Gap-Typen": [
        // ... (patterns) ...
    ]
};

// Flatten the raw data and add the category to each pattern object
export const chartPatterns: ChartPattern[] = Object.entries(rawData).flatMap(([category, patterns]) =>
    patterns.map(pattern => ({
        ...pattern,
        category: category
    }))
);
