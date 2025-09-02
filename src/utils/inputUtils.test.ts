import { describe, it, expect, vi } from 'vitest';
import { numberInput } from './inputUtils';
import { JSDOM } from 'jsdom';

// Setup a DOM environment for testing
const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.window = dom.window as unknown as Window & typeof globalThis;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Event = dom.window.Event;
global.KeyboardEvent = dom.window.KeyboardEvent;


describe('numberInput Svelte Action', () => {

    function setupTest(initialValue: string, options: any = {}) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = initialValue;
        document.body.appendChild(input);

        // Mock setSelectionRange
        input.setSelectionRange = vi.fn();

        const action = numberInput(input, options);

        const dispatchEventSpy = vi.spyOn(input, 'dispatchEvent');

        return { input, action, dispatchEventSpy };
    }

    it('should increment the last digit when cursor is at the end', () => {
        const { input } = setupTest('123');
        input.selectionStart = 3;

        const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        input.dispatchEvent(event);

        expect(input.value).toBe('124');
    });

    it('should decrement the last digit when cursor is at the end', () => {
        const { input } = setupTest('123');
        input.selectionStart = 3;

        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        input.dispatchEvent(event);

        expect(input.value).toBe('122');
    });

    it('should increment the tens place based on cursor position', () => {
        const { input } = setupTest('123');
        input.selectionStart = 2; // Cursor at 12|3

        const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        input.dispatchEvent(event);

        expect(input.value).toBe('133');
    });

    it('should increment the hundreds place based on cursor position', () => {
        const { input } = setupTest('123');
        input.selectionStart = 1; // Cursor at 1|23

        const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        input.dispatchEvent(event);

        expect(input.value).toBe('223');
    });

    it('should correctly increment a decimal value', () => {
        const { input } = setupTest('12.34', { decimalPlaces: 2 });
        input.selectionStart = 4; // Cursor at 12.3|4

        const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        input.dispatchEvent(event);

        expect(input.value).toBe('12.44');
    });

    it('should stop at 0 when decrementing across zero by default', () => {
        const { input } = setupTest('0.1', { decimalPlaces: 1 });
        input.selectionStart = 1; // Cursor at |0.1

        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        input.dispatchEvent(event);

        // Default minValue is 0, so it should stop at 0
        expect(input.value).toBe('0.0');
    });

    it('should handle empty input by starting at 1', () => {
        const { input } = setupTest('');
        input.selectionStart = 0;

        const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        input.dispatchEvent(event);

        expect(input.value).toBe('1');
    });

    it('should handle empty input by starting at 0 when decrementing', () => {
        const { input } = setupTest('');
        input.selectionStart = 0;

        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        input.dispatchEvent(event);

        // Default minValue is 0, so it should start at 0
        expect(input.value).toBe('0');
    });

    it('should respect maxValue', () => {
        const { input } = setupTest('99', { maxValue: 100 });
        input.selectionStart = 2;

        const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        input.dispatchEvent(event);
        expect(input.value).toBe('100');

        input.dispatchEvent(event);
        expect(input.value).toBe('100'); // Should not go above max
    });

    it('should respect minValue', () => {
        const { input } = setupTest('1', { minValue: 0 });
        input.selectionStart = 1;

        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        input.dispatchEvent(event);
        expect(input.value).toBe('0');

        input.dispatchEvent(event);
        expect(input.value).toBe('0'); // Should not go below min
    });

    it('should handle the user-reported zero bug', () => {
        const { input } = setupTest('1', { minValue: 0 });
        input.selectionStart = 1;

        // Decrement from 1 to 0
        const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        input.dispatchEvent(downEvent);
        expect(input.value).toBe('0');

        // Try to decrement again, should stay at 0
        input.dispatchEvent(downEvent);
        expect(input.value).toBe('0');
    });

    it('should maintain cursor position after incrementing', () => {
        const { input } = setupTest('123');
        const setSelectionRangeSpy = vi.spyOn(input, 'setSelectionRange');
        input.selectionStart = 2; // 12|3

        const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        input.dispatchEvent(event);

        expect(input.value).toBe('133');
        // Length is the same, so cursor position should be the same
        expect(setSelectionRangeSpy).toHaveBeenCalledWith(2, 2);
    });

    it('should adjust cursor position when length changes (e.g. 9 -> 10)', () => {
        const { input } = setupTest('9');
        const setSelectionRangeSpy = vi.spyOn(input, 'setSelectionRange');
        input.selectionStart = 1; // 9|

        const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        input.dispatchEvent(event);

        expect(input.value).toBe('10');
        // Value changed from '9' to '10', length increased by 1. Cursor should be at 2.
        expect(setSelectionRangeSpy).toHaveBeenCalledWith(2, 2);
    });

});
