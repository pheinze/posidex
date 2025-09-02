import { describe, it, expect, vi, afterEach } from 'vitest';
import { numberInput } from './inputUtils';

describe('numberInput Svelte Action', () => {

    function setupTest(initialValue: string, options: any = {}) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = initialValue;
        document.body.appendChild(input);

        // JSDOM doesn't implement setSelectionRange, so we mock it.
        if (!input.setSelectionRange) {
            input.setSelectionRange = vi.fn();
        }

        const action = numberInput(input, options);
        const dispatchEventSpy = vi.spyOn(input, 'dispatchEvent');
        return { input, action, dispatchEventSpy };
    }

    afterEach(() => {
        document.body.innerHTML = '';
        vi.restoreAllMocks();
    });

    // --- Sanitization and Formatting Tests ---
    it('should replace comma with a period on input', () => {
        const { input } = setupTest('1,23');
        input.dispatchEvent(new Event('input'));
        expect(input.value).toBe('1.23');
    });

    it('should remove non-numeric characters on input', () => {
        const { input } = setupTest('a1b2c.3d');
        input.dispatchEvent(new Event('input'));
        expect(input.value).toBe('12.3');
    });

    it('should allow only one decimal point when pasting', () => {
        const { input } = setupTest('1.2.3');
        input.dispatchEvent(new Event('input'));
        expect(input.value).toBe('1.23');
    });

    // --- Keydown Prevention Tests ---
    it('should prevent typing non-numeric keys', () => {
        const { input } = setupTest('123');
        const event = new KeyboardEvent('keydown', { key: 'a', cancelable: true });
        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
        input.dispatchEvent(event);
        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should prevent typing a second decimal point', () => {
        const { input } = setupTest('1.23');
        const event = new KeyboardEvent('keydown', { key: '.', cancelable: true });
        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
        input.dispatchEvent(event);
        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should prevent typing a decimal point when noDecimals is true', () => {
        const { input } = setupTest('123', { noDecimals: true });
        const event = new KeyboardEvent('keydown', { key: '.', cancelable: true });
        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
        input.dispatchEvent(event);
        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should prevent typing more decimal places than allowed', () => {
        const { input } = setupTest('1.2345', { decimalPlaces: 4 });
        const event = new KeyboardEvent('keydown', { key: '6', cancelable: true });
        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
        input.selectionStart = 6; // Cursor at the end
        input.dispatchEvent(event);
        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    // --- Arrow Key Stepping Tests (existing logic) ---
    it('should increment the last digit when cursor is at the end', () => {
        const { input } = setupTest('123');
        input.selectionStart = 3;
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        expect(input.value).toBe('124');
    });

    it('should respect `decimalPlaces` option when provided for stepping', () => {
        const { input } = setupTest('1.2345', { decimalPlaces: 4 });
        input.selectionStart = 6;
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        expect(input.value).toBe('1.2346');
    });

    it('should handle `noDecimals: true` option by rounding on step', () => {
        const { input } = setupTest('1.8', { noDecimals: true });
        input.selectionStart = 1;
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        expect(input.value).toBe('3');
    });
});
