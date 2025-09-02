import Decimal from 'decimal.js';

export function numberInput(node: HTMLInputElement, options: { decimalPlaces?: number, isPercentage?: boolean, noDecimals?: boolean, maxValue?: number, minValue?: number }) {
    let { decimalPlaces, isPercentage = false, noDecimals = false, maxValue, minValue = 0 } = options;

    function formatValue(value: string): string {
        // This function remains mostly for the live input formatting, not for the keydown logic
        let formattedValue = value.replace(/,/g, '.');
        if (noDecimals) {
            formattedValue = formattedValue.replace(/[^0-9-]/g, '');
        } else {
            formattedValue = formattedValue.replace(/[^0-9.-]/g, '');
        }
        const parts = formattedValue.split('.');
        if (parts.length > 2) {
            formattedValue = parts[0] + '.' + parts.slice(1).join('');
        }
        const minusParts = formattedValue.split('-');
        if (minusParts.length > 2 || (minusParts.length === 2 && minusParts[0] !== '')) {
            // Invalid use of '-', remove all but the first character if it's a minus
            formattedValue = formattedValue.replace(/-/g, (match, offset) => (offset > 0 ? '' : match));
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
            const newLengthDiff = newValue.length - oldValue.length;
            if (start !== null && end !== null) {
                inputElement.setSelectionRange(start + newLengthDiff, end + newLengthDiff);
            }
            node.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
            return;
        }
        event.preventDefault();

        const MAPPING = { 'ArrowUp': 'add', 'ArrowDown': 'sub' } as const;
        const operation = MAPPING[event.key as keyof typeof MAPPING];

        const rawValue = node.value.replace(',', '.');
        const cursorPosition = node.selectionStart ?? rawValue.length;

        if (rawValue.trim() === '' || isNaN(parseFloat(rawValue))) {
            let newValue = operation === 'add' ? new Decimal(1) : new Decimal(0);
            if (minValue !== undefined && newValue.lessThan(minValue)) {
                newValue = new Decimal(minValue);
            }
            if (maxValue !== undefined && newValue.greaterThan(maxValue)) {
                newValue = new Decimal(maxValue);
            }
            const finalValueString = newValue.toString();
            node.value = finalValueString;
            node.dispatchEvent(new Event('input', { bubbles: true }));
            node.setSelectionRange(finalValueString.length, finalValueString.length);
            return;
        }

        try {
            let value = new Decimal(rawValue);
            const decimalPointIndex = rawValue.indexOf('.');

            let power;
            if (decimalPointIndex === -1) {
                power = rawValue.length - cursorPosition;
            } else {
                if (cursorPosition > decimalPointIndex) {
                    power = (decimalPointIndex + 1) - cursorPosition;
                } else {
                    power = decimalPointIndex - cursorPosition;
                }
            }

            const step = new Decimal(10).pow(power);
            let newValue = value[operation](step);

            if (maxValue !== undefined && newValue.greaterThan(maxValue)) {
                newValue = new Decimal(maxValue);
            }
            if (minValue !== undefined && newValue.lessThan(minValue)) {
                newValue = new Decimal(minValue);
            }

            const originalLength = node.value.length;

            let finalValueString: string;
            if (noDecimals) {
                finalValueString = newValue.toFixed(0);
            } else if (decimalPlaces !== undefined) {
                finalValueString = newValue.toFixed(decimalPlaces);
            } else {
                finalValueString = newValue.toString();
            }

            const lengthDifference = finalValueString.length - originalLength;
            let newCursorPosition = cursorPosition + lengthDifference;

            node.value = finalValueString;
            node.dispatchEvent(new Event('input', { bubbles: true }));
            node.setSelectionRange(newCursorPosition, newCursorPosition);

        } catch (error) {
            console.error("Error in handleKeyDown:", error);
        }
    }

    node.addEventListener('input', handleInput);
    node.addEventListener('keydown', handleKeyDown);

    return {
        update(newOptions: { decimalPlaces?: number, isPercentage?: boolean, noDecimals?: boolean, maxValue?: number, minValue?: number }) {
            options = { ...options, ...newOptions };
            decimalPlaces = newOptions.decimalPlaces;
            isPercentage = newOptions.isPercentage ?? isPercentage;
            noDecimals = newOptions.noDecimals ?? noDecimals;
            maxValue = newOptions.maxValue;
            minValue = newOptions.minValue ?? 0;
        },
        destroy() {
            node.removeEventListener('input', handleInput);
            node.removeEventListener('keydown', handleKeyDown);
        }
    };
}
