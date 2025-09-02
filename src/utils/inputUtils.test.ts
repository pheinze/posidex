import { describe, it, expect, vi, afterEach } from 'vitest';
import { numberInput } from './inputUtils';

// Note: No more manual JSDOM setup. Vitest's 'jsdom' environment handles this.

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

        // Spy on dispatchEvent to check for 'input' events
        const dispatchEventSpy = vi.spyOn(input, 'dispatchEvent');

        return { input, action, dispatchEventSpy };
    }

    afterEach(() => {
        // Clean up the DOM after each test
        document.body.innerHTML = '';
        vi.restoreAllMocks();
    });

    // --- Existing Logic Tests (Adjusted) ---

    it('should increment the last digit when cursor is at the end', () => {
        const { input } = setupTest('123');
        input.selectionStart = 3;
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        expect(input.value).toBe('124');
    });

    it('should increment the tens place based on cursor position', () => {
        const { input } = setupTest('123');
        input.selectionStart = 2; // Cursor at 12|3
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        expect(input.value).toBe('133');
    });

    it('should handle empty input by starting at 1 on ArrowUp', () => {
        const { input } = setupTest('');
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        expect(input.value).toBe('1');
    });

    it('should handle empty input by starting at 0 on ArrowDown', () => {
        const { input } = setupTest('');
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        expect(input.value).toBe('0');
    });

    it('should respect minValue', () => {
        const { input } = setupTest('0');
        input.selectionStart = 1;
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        expect(input.value).toBe('0'); // Stays at min value
    });

    // --- New/Updated Tests for Hybrid Logic ---

    it('should use "sticky precision" based on initial value', () => {
        const { input } = setupTest('1.20'); // 2 decimal places
        input.selectionStart = 4; // cursor at the end
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        // Should increment by 0.01 and strip trailing zero
        expect(input.value).toBe('1.21');
    });

    it('should update "sticky precision" when user types a new value', () => {
        const { input } = setupTest('1.2'); // Starts with 1 decimal place
        input.selectionStart = 3;

        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        expect(input.value).toBe('1.3');

        // Simulate user typing a new value with different precision
        input.value = '5.432';
        input.dispatchEvent(new Event('input')); // Trigger precision update

        input.selectionStart = 5;
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        expect(input.value).toBe('5.433');
    });

    it('should increment by 1 for integers', () => {
        const { input } = setupTest('100');
        input.selectionStart = 3;
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        expect(input.value).toBe('101');
    });

    it('should strip trailing zeros on blur', () => {
        const { input } = setupTest('1.200');
        input.dispatchEvent(new Event('blur'));
        expect(input.value).toBe('1.2');
    });

    it('should handle `noDecimals: true` option by rounding', () => {
        const { input } = setupTest('1.8', { noDecimals: true });
        input.selectionStart = 1; // cursor on the 1, so step is 1
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        // 1.8 + 1 = 2.8, which rounds to 3
        expect(input.value).toBe('3');
    });

    it('should respect `decimalPlaces` option when provided', () => {
        const { input } = setupTest('1.234', { decimalPlaces: 2 });
        input.selectionStart = 5;
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        // Should round to 2 decimal places and pad with zero
        expect(input.value).toBe('1.24');
    });

    it('should go from a decimal to an integer correctly', () => {
        const { input } = setupTest('0.9');
        input.selectionStart = 3;
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        // Should become '1', not '1.0'
        expect(input.value).toBe('1');
    });

    it('should go from an integer to a smaller decimal correctly', () => {
        const { input } = setupTest('1');
        input.selectionStart = 1;

        // Simulate user changing value to have decimals
        input.value = '1.0';
        input.dispatchEvent(new Event('input'));

        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        // Should become '0.9'
        expect(input.value).toBe('0.9');
    });
});
