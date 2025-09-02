import Decimal from 'decimal.js';

type NumberInputOptions = {
    decimalPlaces?: number;
    isPercentage?: boolean;
    noDecimals?: boolean;
    maxValue?: number;
    minValue?: number;
};

export function numberInput(node: HTMLInputElement, options: NumberInputOptions) {
    let { decimalPlaces, isPercentage = false, noDecimals = false, maxValue, minValue = 0 } = options;
    let stickyDecimalPlaces: number | null = null;

    const getDecimalPlaces = (value: string): number => {
        if (value.includes('.')) {
            return value.split('.')[1].length;
        }
        return 0;
    };

    const updateStickyPrecision = (value: string) => {
        const cleanValue = value.replace(',', '.').trim();
        if (cleanValue === '' || isNaN(parseFloat(cleanValue))) {
            stickyDecimalPlaces = null;
        } else {
            stickyDecimalPlaces = getDecimalPlaces(cleanValue);
        }
    };

    updateStickyPrecision(node.value);

    function handleInput(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        updateStickyPrecision(inputElement.value);
    }

    function handleBlur(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        const rawValue = inputElement.value.replace(',', '.');
        try {
            if (rawValue.trim() !== '') {
                const val = new Decimal(rawValue);
                inputElement.value = val.toString();
            }
        } catch (e) {
            // Ignore invalid numbers
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
            let startValue = 1;
            if(minValue !== undefined && startValue < minValue) {
                startValue = minValue;
            }
            let newValue = operation === 'add' ? new Decimal(startValue) : new Decimal(minValue !== undefined ? minValue : 0);

            if (minValue !== undefined && newValue.lessThan(minValue)) {
                newValue = new Decimal(minValue);
            }
            if (maxValue !== undefined && newValue.greaterThan(maxValue)) {
                newValue = new Decimal(maxValue);
            }
            const finalValueString = newValue.toString();
            node.value = finalValueString;
            updateStickyPrecision(finalValueString);
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
            } else if (stickyDecimalPlaces !== null) {
                const roundedValue = newValue.toDecimalPlaces(stickyDecimalPlaces);
                finalValueString = roundedValue.toString();
            } else {
                finalValueString = newValue.toString();
            }

            const lengthDifference = finalValueString.length - originalLength;
            let newCursorPosition = cursorPosition + lengthDifference;

            node.value = finalValueString;
            updateStickyPrecision(finalValueString);
            node.dispatchEvent(new Event('input', { bubbles: true }));
            node.setSelectionRange(newCursorPosition, newCursorPosition);

        } catch (error) {
            console.error("Error in handleKeyDown:", error);
        }
    }

    node.addEventListener('input', handleInput);
    node.addEventListener('keydown', handleKeyDown);
    node.addEventListener('blur', handleBlur);

    return {
        update(newOptions: NumberInputOptions) {
            options = { ...options, ...newOptions };
            decimalPlaces = newOptions.decimalPlaces;
            isPercentage = newOptions.isPercentage ?? isPercentage;
            noDecimals = newOptions.noDecimals ?? noDecimals;
            maxValue = newOptions.maxValue;
            minValue = newOptions.minValue ?? 0;
            updateStickyPrecision(node.value);
        },
        destroy() {
            node.removeEventListener('input', handleInput);
            node.removeEventListener('keydown', handleKeyDown);
            node.removeEventListener('blur', handleBlur);
        }
    };
}
