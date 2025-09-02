# Vorschläge zur Optimierung der numerischen Eingabefelder

Hier sind vier ausgearbeitete Vorschläge zur Implementierung einer "intelligenten" Inkrement- und Dekrement-Logik. Jeder Vorschlag hat unterschiedliche Vorteile und Komplexitätsgrade.

---

### Vorschlag 1: "Potenz-Schritt" (Einfach & Vorhersehbar)

*   **Konzept:** Der Inkrement-Schritt ist immer eine Zehnerpotenz (z.B. 0.1, 1, 10), abhängig von der Cursor-Position.
*   **Logik:** Die Position des Cursors *relativ zum Komma* bestimmt die Schrittweite.
    *   Beispielwert: `123.45`
    *   Cursor bei `123.4|5` -> Schritt ist `0.1` -> Ergebnis: `123.55`
    *   Cursor bei `12|3.45` -> Schritt ist `10` -> Ergebnis: `133.45`
*   **Vorteile:**
    *   Einfach zu verstehen und umzusetzen.
    *   Sehr vorhersehbares Verhalten.
*   **Nachteile:**
    *   Nicht sehr granular. Man kann z.B. den Wert `123` nicht auf `124` ändern, sondern nur auf `133` (wenn der Cursor vor der `3` steht).

---

### Vorschlag 2: "Positions-Inkrement" (Intelligent & Präzise)

*   **Konzept:** Inkrementiert den Wert der Ziffer, die sich links vom Cursor befindet. Dies scheint der ursprünglich gewünschten "intelligenten" Logik am nächsten zu kommen.
*   **Logik:** Das System erkennt die Ziffer links vom Cursor und erhöht den Gesamtwert um den Stellenwert dieser Ziffer.
    *   Beispielwert: `123.45`
    *   Cursor bei `123.45|` -> Schritt ist `0.01` -> Ergebnis: `123.46`
    *   Cursor bei `123.4|5` -> Schritt ist `0.1` -> Ergebnis: `123.55`
    *   Cursor bei `123.|45` -> Schritt ist `1` -> Ergebnis: `124.45`
    *   Cursor bei `12|3.45` -> Schritt ist `10` -> Ergebnis: `133.45`
*   **Vorteile:**
    *   Extrem intuitiv und mächtig für Power-User.
    *   Ermöglicht sehr präzise und schnelle Wertanpassungen. Fühlt sich wie ein "Profi-Feature" an.
*   **Nachteile:**
    *   Höherer Implementierungsaufwand, vor allem bei der Behandlung von Dezimalstellen und Grenzfällen.

---

### Vorschlag 3: "Hybrid-Ansatz" (Bestehende Logik erweitern)

*   **Konzept:** Die einfache Inkrementierung (+1/-1) bleibt Standard. Die Schrittweite wird durch Modifier-Tasten (`Shift`, `Ctrl`, etc.) geändert, unabhängig von der Cursor-Position. Dies ist eine Erweiterung der bereits existierenden Logik.
*   **Logik:**
    *   **Pfeiltaste:** Schrittweite `1`
    *   **Shift + Pfeiltaste:** Schrittweite `10`
    *   **Ctrl + Pfeiltaste:** Schrittweite `0.1`
    *   *(Man könnte weitere Tasten wie `Alt` für z.B. `100` hinzufügen)*
*   **Vorteile:**
    *   Baut auf bekannten Mustern auf.
    *   Keine komplexe Cursor-Logik notwendig.
*   **Nachteile:**
    *   Weniger "magisch" als Vorschlag 2.
    *   Der Benutzer muss die Tastenkombinationen kennen.

---

### Vorschlag 4: "Visueller Schrittwähler" (Explizit & Klar)

*   **Konzept:** Anstatt die Logik zu "verstecken", wird die Schrittweite explizit in der Benutzeroberfläche ausgewählt.
*   **Logik:** Neben den Stepper-Tasten befindet sich ein kleines Dropdown-Menü oder Buttons, mit denen der Benutzer die Schrittweite (z.B. `0.1`, `1`, `10`) vor der Inkrementierung auswählen kann.
*   **Vorteile:**
    *   Maximale Transparenz für den Benutzer, keine versteckte Logik.
*   **Nachteile:**
    *   Fügt der UI mehr Komplexität hinzu.
    *   Benötigt mehr Klicks (Schrittweite wählen, dann erst klicken).

---

**Empfehlung:**
Vorschlag 2 ("Positions-Inkrement") scheint Ihre ursprüngliche Vision am besten zu treffen und würde den größten Mehrwert für eine Finanzanwendung bieten. Vorschlag 3 ("Hybrid-Ansatz") wäre eine sichere und schnell umzusetzende Verbesserung der bestehenden Funktionalität.

Bitte lassen Sie mich wissen, welchen Weg Sie bevorzugen.

---
