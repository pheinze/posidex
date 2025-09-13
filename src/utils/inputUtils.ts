import Decimal from 'decimal.js';

export type NumberInputOptions = {
    decimalPlaces?: number;
    maxDecimalPlaces?: number;
    isPercentage?: boolean;
    noDecimals?: boolean;
    maxValue?: number;
    minValue?: number;
};

export function numberInput(node: HTMLInputElement, options: NumberInputOptions) {
    let { decimalPlaces, maxDecimalPlaces, isPercentage = false, noDecimals = false, maxValue, minValue } = options;

    const getDecimalPlaces = (value: string): number => {
        if (value.includes('.')) {
            return value.split('.')[1].length;
        }
        return 0;
    };

    function handleInput(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        let value = inputElement.value;
        const originalValue = value;
        const cursorPosition = inputElement.selectionStart;

        value = value.replace(/,/g, '.');

        let sanitizedValue = '';
        let hasDecimal = false;
        for (const char of value) {
            if (/\d/.test(char)) {
                sanitizedValue += char;
            } else if (char === '.' && !hasDecimal) {
                sanitizedValue += char;
                hasDecimal = true;
            }
        }
        value = sanitizedValue;

        if (value !== originalValue) {
            const diff = value.length - originalValue.length;
            inputElement.value = value;
            if (cursorPosition) {
                const newCursorPosition = Math.max(0, cursorPosition + diff);
                inputElement.setSelectionRange(newCursorPosition, newCursorPosition);
            }
        }
    }

    function handleBlur(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        const rawValue = inputElement.value.replace(',', '.');
        try {
            if (rawValue.trim() !== '') {
                const val = new Decimal(rawValue);
                inputElement.value = val.toString();
            }
        } catch {
            // Ignore invalid numbers
        }
    }

    function handleKeyDown(event: KeyboardEvent) {
        const allowedKeys = [
            'Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'
        ];
        const isShortcut = event.ctrlKey || event.metaKey;
        const isAllowedKey = allowedKeys.includes(event.key);
        const isDecimalSeparator = event.key === '.' || event.key === ',';
        const isDigit = /^[0-9]$/.test(event.key);

        if (noDecimals && isDecimalSeparator) {
            event.preventDefault();
            return;
        }

        if (isDecimalSeparator && node.value.includes('.')) {
            event.preventDefault();
            return;
        }

        if (!isDigit && !isAllowedKey && !isShortcut && !isDecimalSeparator) {
            event.preventDefault();
            return;
        }

        if (isDigit) {
            const limit = maxDecimalPlaces ?? decimalPlaces;
            if (limit !== undefined) {
                const value = node.value;
                const selectionStart = node.selectionStart ?? 0;
                const selectionEnd = node.selectionEnd ?? 0;
                const decimalPointIndex = value.indexOf('.');

                if (decimalPointIndex !== -1 && selectionStart > decimalPointIndex) {
                    if (getDecimalPlaces(value) >= limit && selectionStart === selectionEnd) {
                        event.preventDefault();
                        return;
                    }
                }
            }
        }

        const isArrowKey = event.key === 'ArrowUp' || event.key === 'ArrowDown';
        if (!isArrowKey) {
            return;
        }
        event.preventDefault();

        const operation = event.key === 'ArrowUp' ? 'add' : 'sub';
        const rawValue = node.value.replace(',', '.');

        if (rawValue.trim() === '' || isNaN(parseFloat(rawValue))) {
            handleEmptyInputArrow(operation);
            return;
        }

        try {
            performStep(rawValue, operation);
        } catch (error) {
            console.error("Error in handleKeyDown:", error);
        }
    }

    function handleEmptyInputArrow(operation: 'add' | 'sub') {
        let startValue = new Decimal(minValue !== undefined ? minValue : 0);
        if (operation === 'add') {
            startValue = startValue.plus(calculateStep());
        }

        const newValue = clampValue(startValue);
        const finalValueString = formatNewValue(newValue);
        updateNodeValue(finalValueString, finalValueString.length);
    }

    function performStep(rawValue: string, operation: 'add' | 'sub') {
        let value = new Decimal(rawValue);
        const step = calculateStep();
        let newValue = value[operation](step);
        newValue = clampValue(newValue);

        const finalValueString = formatNewValue(newValue);
        updateNodeValue(finalValueString, finalValueString.length);
    }

    function calculateStep(): Decimal {
        if (noDecimals) {
            return new Decimal(1);
        }
        const limit = maxDecimalPlaces ?? decimalPlaces;
        if (limit !== undefined) {
            return new Decimal(1).dividedBy(new Decimal(10).pow(limit));
        }
        return new Decimal(1);
    }

    function clampValue(value: Decimal): Decimal {
        if (maxValue !== undefined && value.greaterThan(maxValue)) {
            return new Decimal(maxValue);
        }
        if (minValue !== undefined && value.lessThan(minValue)) {
            return new Decimal(minValue);
        }
        return value;
    }

    function formatNewValue(value: Decimal): string {
        if (noDecimals) {
            return value.toFixed(0);
        }
        const limit = maxDecimalPlaces ?? decimalPlaces;
        if (limit !== undefined) {
            return value.toFixed(limit);
        }
        return value.toString();
    }

    function updateNodeValue(finalValueString: string, newCursorPosition: number) {
        node.value = finalValueString;
        node.dispatchEvent(new Event('input', { bubbles: true }));
        node.setSelectionRange(newCursorPosition, newCursorPosition);
    }

    node.addEventListener('input', handleInput);
    node.addEventListener('keydown', handleKeyDown);
    node.addEventListener('blur', handleBlur);

    return {
        update(newOptions: NumberInputOptions) {
            options = { ...options, ...newOptions };
            decimalPlaces = newOptions.decimalPlaces;
            maxDecimalPlaces = newOptions.maxDecimalPlaces;
            isPercentage = newOptions.isPercentage ?? isPercentage;
            noDecimals = newOptions.noDecimals ?? noDecimals;
            maxValue = newOptions.maxValue;
            minValue = newOptions.minValue;
        },
        destroy() {
            node.removeEventListener('input', handleInput);
            node.removeEventListener('keydown', handleKeyDown);
            node.removeEventListener('blur', handleBlur);
        }
    };
}
