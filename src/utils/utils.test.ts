import { describe, it, expect } from 'vitest';
import { parseGermanDate } from './utils';

describe('parseGermanDate', () => {
  it('should correctly parse a standard German date and time string', () => {
    const dateStr = '25.12.2024';
    const timeStr = '14:30:00';
    const expectedISO = '2024-12-25T14:30:00.000Z';
    expect(parseGermanDate(dateStr, timeStr)).toBe(expectedISO);
  });

  it('should correctly parse a date with single-digit day and month', () => {
    const dateStr = '5.1.2023';
    const timeStr = '08:05:01';
    const expectedISO = '2023-01-05T08:05:01.000Z';
    expect(parseGermanDate(dateStr, timeStr)).toBe(expectedISO);
  });

  it('should throw an error for an invalid date format', () => {
    const dateStr = '2024-12-25'; // Wrong format
    const timeStr = '14:30:00';
    expect(() => parseGermanDate(dateStr, timeStr)).toThrow('Invalid German date or time format: 2024-12-25 14:30:00');
  });

    it('should throw an error for a logically invalid date (e.g., day 32)', () => {
        const dateStr = '32.12.2024';
        const timeStr = '10:00:00';
        expect(() => parseGermanDate(dateStr, timeStr)).toThrow(/Invalid date created from parts/);
    });
});
