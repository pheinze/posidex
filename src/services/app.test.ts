import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tradeStore, updateTradeStore, initialAppState } from '../stores/tradeStore';
import { app } from './app';
import { get } from 'svelte/store';
import { Decimal } from 'decimal.js';

vi.mock('../stores/uiStore', () => ({
    uiStore: { showError: vi.fn(), showFeedback: vi.fn(), hideError: vi.fn() }
}));

describe('app service - adjustTpPercentages (Hybrid Logic)', () => {

    beforeEach(() => {
        tradeStore.set(JSON.parse(JSON.stringify(initialAppState)));
    });

    it('should proportionally reduce other unlocked targets if total exceeds 100%', () => {
        updateTradeStore(state => ({
            ...state,
            targets: [
                { price: '100', percent: '60', isLocked: false },
                { price: '110', percent: '60', isLocked: false }, // Will be reduced from 60 to 20
                { price: '120', percent: '20', isLocked: false }, // Will be reduced from 20 to 0
            ]
        }));
        // User changes the first TP to 80%. Initial state was 140%. New state is 160%.
        // Total should be 100. Excess is 60.
        // Other unlocked targets are TP2 (60) and TP3 (20). Their sum is 80.
        // TP2 reduction: 60 * (60 / 80) = 45. New value: 15.
        // TP3 reduction: 60 * (20 / 80) = 15. New value: 5.
        // Wait, the logic is on the *new* value. Let's re-think.
        // User changes TP1 to 80. The state is now [80, 60, 20]. Sum = 160. Excess = 60.
        // Others sum = 80.
        // TP2 new = 60 - 60 * (60/80) = 15.
        // TP3 new = 20 - 60 * (20/80) = 5.
        // Final state: [80, 15, 5]. Sum = 100.

        get(tradeStore).targets[0].percent = '80';
        app.adjustTpPercentages(0);

        const targets = get(tradeStore).targets;
        expect(targets[0].percent).toBe('80');
        expect(targets[1].percent).toBe('15');
        expect(targets[2].percent).toBe('5');
    });

    it('should not reduce locked targets, only other unlocked ones', () => {
        updateTradeStore(state => ({
            ...state,
            targets: [
                { price: '100', percent: '50', isLocked: true },
                { price: '110', percent: '50', isLocked: false },
                { price: '120', percent: '50', isLocked: false },
            ]
        }));
        // User changes TP3 to 80. State is [50, 50, 80]. Sum = 180. Excess = 80.
        // Only TP2 is unlocked and not changed. It must absorb the full 80 reduction.
        // New TP2 = 50 - 80 = -30. Should be floored at 0.
        // This implies the user's input on TP3 must be capped.
        // Max value for TP3 is 100 - 50 (locked) - 50 (TP2) = 0.
        // This is not right. The user input should be prioritized.
        // New TP2 = 50 - 80 = -30 -> 0. Remaining excess = 30.
        // This remaining excess must be applied to the user's input.
        // New TP3 = 80 - 30 = 50.
        // Final state: [50, 0, 50].
        get(tradeStore).targets[2].percent = '80';
        app.adjustTpPercentages(2);

        const targets = get(tradeStore).targets;
        expect(targets[0].percent).toBe('50'); // Locked, unchanged
        expect(targets[1].percent).toBe('0');  // Reduced to 0
        expect(targets[2].percent).toBe('50'); // Capped
    });

    it('should cap the edited value if other unlocked targets are zero', () => {
        updateTradeStore(state => ({
            ...state,
            targets: [
                { price: '100', percent: '70', isLocked: true },
                { price: '110', percent: '0', isLocked: false },
                { price: '120', percent: '0', isLocked: false },
            ]
        }));
        // User tries to change TP3 to 50. State becomes [70, 0, 50]. Sum = 120. Excess = 20.
        // TP2 is unlocked but at 0. Cannot be reduced.
        // So, TP3's value must be capped. The excess of 20 is subtracted from it.
        // New TP3 = 50 - 20 = 30.
        get(tradeStore).targets[2].percent = '50';
        app.adjustTpPercentages(2);

        const targets = get(tradeStore).targets;
        expect(targets[0].percent).toBe('70'); // Locked
        expect(targets[1].percent).toBe('0');
        expect(targets[2].percent).toBe('30'); // Capped at the max possible value
    });

    it('should handle rounding and floating point issues gracefully with decimal.js', () => {
        updateTradeStore(state => ({
            ...state,
            targets: [
                { price: '100', percent: '33', isLocked: false },
                { price: '110', percent: '33', isLocked: false },
                { price: '120', percent: '33', isLocked: false },
            ]
        }));
        // User changes TP1 to 50. State is [50, 33, 33]. Sum = 116. Excess = 16.
        // Others sum = 66.
        // TP2 reduction = 16 * (33/66) = 8. New TP2 = 25.
        // TP3 reduction = 16 * (33/66) = 8. New TP3 = 25.
        // Final state: [50, 25, 25].
        get(tradeStore).targets[0].percent = '50';
        app.adjustTpPercentages(0);

        const targets = get(tradeStore).targets;
        expect(targets[0].percent).toBe('50');
        expect(targets[1].percent).toBe('25');
        expect(targets[2].percent).toBe('25');
    });
});
