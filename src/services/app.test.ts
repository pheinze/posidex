import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tradeStore, updateTradeStore, initialTradeState } from '../stores/tradeStore';
import { app } from './app';
import { get } from 'svelte/store';

// Mock the uiStore to prevent errors during tests
vi.mock('../stores/uiStore', () => ({
    uiStore: { showError: vi.fn() }
}));

describe('app service - adjustTpPercentages (Prioritized Logic)', () => {

    beforeEach(() => {
        // Deep copy and set initial state for each test to ensure isolation
        tradeStore.set(JSON.parse(JSON.stringify(initialTradeState)));
        // Set up a standard 3-target scenario
        updateTradeStore(state => ({
            ...state,
            targets: [
                { price: '110', percent: '50', isLocked: false },
                { price: '120', percent: '30', isLocked: false },
                { price: '130', percent: '20', isLocked: false },
            ]
        }));
    });

    // --- DECREASE SCENARIOS ---
    it('should give surplus to TP1 when another TP is decreased', () => {
        // User decreases TP2 from 30 to 20. Surplus of 10 should go to TP1.
        get(tradeStore).targets[1].percent = '20';
        app.adjustTpPercentages(1);

        const targets = get(tradeStore).targets;
        expect(targets[0].percent).toBe('60'); // 50 + 10
        expect(targets[1].percent).toBe('20');
        expect(targets[2].percent).toBe('20');
    });

    it('should distribute surplus evenly to T2, T3... if TP1 is locked', () => {
        get(tradeStore).targets[0].isLocked = true;
        // User decreases TP3 from 20 to 10. Surplus of 10 should go to TP2.
        get(tradeStore).targets[2].percent = '10';
        app.adjustTpPercentages(2);

        const targets = get(tradeStore).targets;
        expect(targets[0].percent).toBe('50'); // Locked
        expect(targets[1].percent).toBe('40'); // 30 + 10
        expect(targets[2].percent).toBe('10');
    });

    // --- INCREASE SCENARIOS ---
    it('should take deficit from other TPs in reverse order (T3 then T2)', () => {
        // User increases TP1 from 50 to 70. Deficit of 20.
        // Should be taken from T3 first. T3 has 20, so it becomes 0.
        get(tradeStore).targets[0].percent = '70';
        app.adjustTpPercentages(0);

        const targets = get(tradeStore).targets;
        expect(targets[0].percent).toBe('70');
        expect(targets[1].percent).toBe('30');
        expect(targets[2].percent).toBe('0');
    });

    it('should take deficit from T3, then T2 if T3 is depleted', () => {
        // User increases TP1 from 50 to 80. Deficit of 30.
        // T3 has 20, so it becomes 0. Remaining deficit is 10.
        // The remaining 10 is taken from T2 (30 -> 20).
        get(tradeStore).targets[0].percent = '80';
        app.adjustTpPercentages(0);

        const targets = get(tradeStore).targets;
        expect(targets[0].percent).toBe('80');
        expect(targets[1].percent).toBe('20');
        expect(targets[2].percent).toBe('0');
    });

    it('should not take deficit from locked TPs', () => {
        get(tradeStore).targets[2].isLocked = true; // T3 is locked at 20
        // User increases TP1 from 50 to 75. Deficit of 25.
        // T3 is locked, so deficit must come from T2.
        // T2 has 30, so it becomes 5.
        get(tradeStore).targets[0].percent = '75';
        app.adjustTpPercentages(0);

        const targets = get(tradeStore).targets;
        expect(targets[0].percent).toBe('75');
        expect(targets[1].percent).toBe('5');
        expect(targets[2].percent).toBe('20'); // Locked
    });

    // --- EDGE CASE TESTS ---
    it('should revert change if only one unlocked TP is edited (increase)', () => {
        updateTradeStore(state => ({
            ...state,
            targets: [
                { price: '110', percent: '50', isLocked: true },
                { price: '120', percent: '30', isLocked: true },
                { price: '130', percent: '20', isLocked: false },
            ]
        }));
        // User tries to increase the only unlocked TP. Should be reverted.
        get(tradeStore).targets[2].percent = '30';
        app.adjustTpPercentages(2);

        const targets = get(tradeStore).targets;
        expect(targets[2].percent).toBe('20');
    });

    it('should revert change if only one unlocked TP is edited (decrease)', () => {
        updateTradeStore(state => ({
            ...state,
            targets: [
                { price: '110', percent: '50', isLocked: true },
                { price: '120', percent: '30', isLocked: true },
                { price: '130', percent: '20', isLocked: false },
            ]
        }));
        // User tries to decrease the only unlocked TP. Should be reverted.
        get(tradeStore).targets[2].percent = '10';
        app.adjustTpPercentages(2);

        const targets = get(tradeStore).targets;
        expect(targets[2].percent).toBe('20');
    });

    it('should ignore changes to a locked field', () => {
        // This test ensures that if the UI somehow allows a change to a disabled
        // field, the logic doesn't process it.
        updateTradeStore(state => {
            state.targets[0].isLocked = true;
            return state;
        });

        // This simulates the user somehow changing the value, which updates the store
        updateTradeStore(state => {
            state.targets[0].percent = '99';
            return state;
        });

        app.adjustTpPercentages(0);

        const targets = get(tradeStore).targets;
        // The logic should simply RETURN and not process the change.
        // The "dirty" value of 99 will remain in the store, but this is expected
        // as the UI's `disabled` attribute is the primary guard. The logic is just a safeguard.
        expect(targets[0].percent).toBe('99');
        expect(targets[1].percent).toBe('30'); // Unchanged
        expect(targets[2].percent).toBe('20'); // Unchanged
    });

    it('should re-balance correctly when a lock is released', () => {
        // Setup an invalid state created by locking
        updateTradeStore(state => ({
            ...state,
            targets: [
                { price: '110', percent: '60', isLocked: true },
                { price: '120', percent: '60', isLocked: true },
                { price: '130', percent: '0', isLocked: false },
            ]
        }));
        // User unlocks TP2. The app should see the total is 120 and fix it.
        // The `adjustTpPercentages` is called from the UI on lock toggle.
        get(tradeStore).targets[1].isLocked = false;
        app.adjustTpPercentages(1); // The changedIndex is the one unlocked

        const targets = get(tradeStore).targets;
        const total = targets.reduce((sum, t) => sum + parseInt(t.percent, 10), 0);
        expect(total).toBe(100);
        expect(targets[0].percent).toBe('60'); // Locked, unchanged
        // The unlocked TPs (TP2 and TP3) should share the remaining 40%
        expect(targets[1].percent).toBe('40'); // Or some other distribution, but sum must be 100
    });
});
