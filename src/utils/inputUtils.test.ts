import { describe, it, expect, vi, afterEach } from 'vitest';
import { numberInput } from './inputUtils';

describe('numberInput Svelte Action', () => {

    function setupTest(initialValue: string, options: any = {}) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = initialValue;
        document.body.appendChild(input);

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

    it('should increment the last digit when cursor is at the end', () => {
        const { input } = setupTest('123');
        input.selectionStart = 3;
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        expect(input.value).toBe('124');
    });

    it('should increment the tens place based on cursor position', () => {
        const { input } = setupTest('123');
        input.selectionStart = 2;
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        expect(input.value).toBe('133');
    });

    it('should handle empty input by starting at 1 on ArrowUp', () => {
        const { input } = setupTest('', { minValue: 0 });
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        expect(input.value).toBe('1');
    });

    it('should handle empty input by starting at 0 on ArrowDown', () => {
        const { input } = setupTest('', { minValue: 0 });
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        expect(input.value).toBe('0');
    });

    it('should respect minValue on ArrowDown', () => {
        const { input } = setupTest('1', { minValue: 1 });
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        expect(input.value).toBe('1');
    });

    it('should respect minValue on ArrowUp from empty', () => {
        const { input } = setupTest('', { minValue: 1 });
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        expect(input.value).toBe('1');
    });

    it('should use "sticky precision" based on initial value', () => {
        const { input } = setupTest('1.20');
        input.selectionStart = 4;
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        expect(input.value).toBe('1.21');
    });

    it('should update "sticky precision" when user types a new value', () => {
        const { input } = setupTest('1.2');
        input.selectionStart = 3;
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        expect(input.value).toBe('1.3');

        input.value = '5.432';
        input.dispatchEvent(new Event('input'));
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
        input.selectionStart = 1;
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        expect(input.value).toBe('3');
    });

    it('should respect `decimalPlaces` option when provided for stepping', () => {
        const { input } = setupTest('1.2345', { decimalPlaces: 4 });
        input.selectionStart = 6;
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        expect(input.value).toBe('1.2346');
    });

    it('should prevent typing more decimal places than allowed', () => {
        const { input } = setupTest('1.2345', { decimalPlaces: 4 });
        const event = new KeyboardEvent('keydown', { key: '6', cancelable: true });
        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
        input.selectionStart = 6;
        input.dispatchEvent(event);
        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should go from a decimal to an integer correctly', () => {
        const { input } = setupTest('0.9');
        input.selectionStart = 3;
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        expect(input.value).toBe('1');
    });

    it('should go from an integer to a smaller decimal correctly', () => {
        const { input } = setupTest('1');
        input.selectionStart = 1;
        input.value = '1.0';
        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        expect(input.value).toBe('0.9');
    });
});
