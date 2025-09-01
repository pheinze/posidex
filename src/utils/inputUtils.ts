export function numberInput(node: HTMLInputElement, options: { decimalPlaces?: number, isPercentage?: boolean, noDecimals?: boolean, maxValue?: number }) {
    let { decimalPlaces, isPercentage = false, noDecimals = false, maxValue } = options;

    function formatValue(value: string): string {
        // 1. Komma zu Punkt konvertieren
        let formattedValue = value.replace(/,/g, '.');

        // 2. Nur Zahlen und (optional) einen Punkt zulassen
        if (noDecimals) {
            formattedValue = formattedValue.replace(/[^0-9]/g, ''); // Nur Ziffern
        } else {
            formattedValue = formattedValue.replace(/[^0-9.]/g, ''); // Ziffern und Punkt
        }

        // 3. Mehrere Punkte verhindern
        const parts = formattedValue.split('.');
        if (parts.length > 2) {
            formattedValue = parts[0] + '.' + parts.slice(1).join('');
        }

        // 4. Dezimalstellen begrenzen (wenn nicht noDecimals)
        if (!noDecimals && decimalPlaces !== undefined && formattedValue.includes('.')) {
            const decimalPart = formattedValue.split('.')[1];
            if (decimalPart && decimalPart.length > decimalPlaces) {
                formattedValue = formattedValue.substring(0, formattedValue.indexOf('.') + decimalPlaces + 1);
            }
        }

        // 5. Maximalwert prüfen
        if (maxValue !== undefined) {
            if (parseFloat(formattedValue) > maxValue) {
                formattedValue = maxValue.toString();
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

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();

            const currentValue = parseFloat(node.value.replace(',', '.')) || 0;
            const step = event.shiftKey ? 10 : (event.ctrlKey ? 0.1 : 1);
            let newValue: number;

            if (event.key === 'ArrowUp') {
                newValue = currentValue + step;
            } else { // ArrowDown
                newValue = currentValue - step;
            }

            // Ensure the new value respects the options
            let formattedNewValue = formatValue(newValue.toString());

            node.value = formattedNewValue;
            node.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    node.addEventListener('input', handleInput);
    node.addEventListener('keydown', handleKeyDown);

    return {
        update(newOptions: { decimalPlaces?: number, isPercentage?: boolean, noDecimals?: boolean, maxValue?: number }) {
            // Update options without overwriting defaults for unspecified values
            options = { ...options, ...newOptions };
            decimalPlaces = newOptions.decimalPlaces;
            isPercentage = newOptions.isPercentage ?? isPercentage;
            noDecimals = newOptions.noDecimals ?? noDecimals;
            maxValue = newOptions.maxValue;
        },
        destroy() {
            node.removeEventListener('input', handleInput);
            node.removeEventListener('keydown', handleKeyDown);
        }
    };
}
