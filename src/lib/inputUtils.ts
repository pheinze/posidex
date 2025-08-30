
export function numberInput(node: HTMLInputElement, options: { decimalPlaces: number, isPercentage?: boolean }) {
    const { decimalPlaces, isPercentage = false } = options;

    function formatValue(value: string): string {
        // 1. Komma zu Punkt konvertieren
        let formattedValue = value.replace(/,/g, '.');

        // 2. Nur Zahlen und einen Punkt zulassen
        // Erlaubt nur Ziffern und einen einzelnen Punkt
        formattedValue = formattedValue.replace(/[^0-9.]/g, '');

        // 3. Mehrere Punkte verhindern
        const parts = formattedValue.split('.');
        if (parts.length > 2) {
            formattedValue = parts[0] + '.' + parts.slice(1).join('');
        }

        // 4. Dezimalstellen begrenzen
        if (formattedValue.includes('.')) {
            const decimalPart = formattedValue.split('.')[1];
            if (decimalPart && decimalPart.length > decimalPlaces) {
                formattedValue = formattedValue.substring(0, formattedValue.indexOf('.') + decimalPlaces + 1);
            }
        }

        return formattedValue;
    }

    function handleInput(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        const start = inputElement.selectionStart;
        const end = inputElement.selectionEnd;
        const oldValue = inputElement.value;

        const newValue = formatValue(oldValue);

        if (newValue !== oldValue) {
            inputElement.value = newValue;
            // Restore cursor position
            const newLengthDiff = newValue.length - oldValue.length;
            if (start !== null && end !== null) {
                inputElement.setSelectionRange(start + newLengthDiff, end + newLengthDiff);
            }
            // Dispatch a new input event so bind:value works correctly
            node.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    node.addEventListener('input', handleInput);

    return {
        update(newOptions: { decimalPlaces: number, isPercentage?: boolean }) {
            options = newOptions;
        },
        destroy() {
            node.removeEventListener('input', handleInput);
        }
    };
}
