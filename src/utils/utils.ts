import { Decimal } from 'decimal.js';

export function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
    let timeout: ReturnType<typeof setTimeout>;
    return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

export function parseDecimal(value: string | number | null | undefined): Decimal {
    if (value === null || value === undefined || value === '') return new Decimal(0);
    const stringValue = String(value).replace(',', '.');
    if (isNaN(stringValue as any) || stringValue.trim() === '') return new Decimal(0);
    return new Decimal(stringValue);
}
