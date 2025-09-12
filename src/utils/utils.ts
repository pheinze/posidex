import { Decimal } from 'decimal.js';

export function debounce<T extends (...args: unknown[]) => void>(func: T, delay: number) {
    let timeout: ReturnType<typeof setTimeout>;
    return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

export function parseDecimal(value: string | number | Decimal | null | undefined): Decimal {
    if (value instanceof Decimal) {
        return value;
    }
    if (value === null || value === undefined) {
        return new Decimal(0);
    }
    // Convert to string to handle both numbers and strings uniformly
    const stringValue = String(value).replace(',', '.').trim();

    // If the string is empty after trimming, it's a 0.
    if (stringValue === '') {
        return new Decimal(0);
    }

    // Check if the result is a finite number
    if (!isFinite(Number(stringValue))) {
        return new Decimal(0);
    }

    // If all checks pass, create the new Decimal
    return new Decimal(stringValue);
}

export function formatDynamicDecimal(value: Decimal | string | number | null | undefined, maxPlaces = 4): string {
    if (value === null || value === undefined) return '-';

    const dec = new Decimal(value);
    if (dec.isNaN()) return '-';

    // Format to a fixed number of decimal places, then remove trailing zeros
    const formatted = dec.toFixed(maxPlaces);

    // If it's a whole number after formatting, return it without decimals.
    if (new Decimal(formatted).isInteger()) {
        return new Decimal(formatted).toFixed(0);
    }

    // Otherwise, remove only the trailing zeros and the decimal point if it's the last char
    return formatted.replace(/0+$/, '').replace(/\.$/, '');
}

export function parseGermanDate(dateStr: string, timeStr: string): string {
    const dateParts = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    const timeParts = timeStr.match(/^(\d{1,2}):(\d{1,2}):(\d{1,2})$/);

    if (!dateParts || !timeParts) {
        throw new Error(`Invalid German date or time format: ${dateStr} ${timeStr}`);
    }

    const [, day, month, year] = dateParts;
    const [, hours, minutes, seconds] = timeParts;

    // Construct an ISO-8601 string. This format is unambiguous.
    const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}.000Z`;

    const date = new Date(isoString);
    if (isNaN(date.getTime()) || date.getUTCFullYear() !== parseInt(year) || date.getUTCMonth() !== parseInt(month) - 1) {
        throw new Error(`Invalid date created from parts: ${isoString}`);
    }

    return date.toISOString();
}

export function parseDateFlexible(dateStr: string, timeStr?: string): string {
    if (!dateStr) {
        throw new Error('Date string cannot be empty.');
    }
    const normalizedDateStr = dateStr.trim();
    const normalizedTimeStr = timeStr ? timeStr.trim() : '00:00:00';

    // Attempt to parse different date formats
    const formats = [
        // 1. YYYY-MM-DD
        (d: string) => d.match(/^(\d{4})-(\d{2})-(\d{2})$/),
        // 2. DD.MM.YYYY
        (d: string) => {
            const parts = d.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
            return parts ? [parts[0], parts[3], parts[2], parts[1]] : null; // Rearrange to YYYY, MM, DD
        },
        // 3. MM/DD/YYYY
        (d: string) => {
            const parts = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            return parts ? [parts[0], parts[3], parts[1], parts[2]] : null; // Rearrange to YYYY, MM, DD
        },
    ];

    for (const format of formats) {
        const parts = format(normalizedDateStr);
        if (parts) {
            const [, year, month, day] = parts;
            const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${normalizedTimeStr}.000Z`;
            const date = new Date(isoString);
            // Final check to ensure date is valid (e.g. not 31.02.2024)
            if (!isNaN(date.getTime()) && date.toISOString().startsWith(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)) {
                return date.toISOString();
            }
        }
    }

    // As a last resort, try the native Date constructor, which can be surprisingly flexible
    const nativeDate = new Date(`${normalizedDateStr} ${normalizedTimeStr}`);
    if (!isNaN(nativeDate.getTime())) {
        return nativeDate.toISOString();
    }

    throw new Error(`Invalid date format: "${dateStr}". Please use YYYY-MM-DD, DD.MM.YYYY, or MM/DD/YYYY.`);
}

/**
 * Formats a date string or object into a consistent, localized string.
 * @param date - The date to format (ISO string or Date object).
 * @param locale - The locale to use for formatting (e.g., 'en-US', 'de-DE').
 * @returns A formatted date-time string.
 */
export function formatDate(date: string | Date, locale: string | null | undefined): string {
    if (!date) return '-';
    try {
        const options: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        };
        return new Intl.DateTimeFormat(locale || undefined, options).format(new Date(date));
    } catch (e) {
        console.error("Error formatting date:", e);
        return 'Invalid Date';
    }
}
