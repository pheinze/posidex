import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tradeStore, updateTradeStore, initialTradeState, toggleAtrInputs } from '../stores/tradeStore';
import { resultsStore, initialResultsState } from '../stores/resultsStore';
import { app } from './app';
import { get } from 'svelte/store';
import { Decimal } from 'decimal.js';
import { apiService } from './apiService';
import type { Kline } from './apiService';
import type { AppState } from '../stores/types';

// Mock the uiStore to prevent errors during tests
vi.mock('../stores/uiStore', () => ({
    uiStore: { showError: vi.fn(), showFeedback: vi.fn(), update: vi.fn(), hideError: vi.fn() }
}));

// Mock the apiService to prevent actual network calls
vi.mock('./apiService', () => ({
    apiService: {
        fetchKlines: vi.fn(),
        fetchBinancePrice: vi.fn()
    }
}));

describe('app service - adjustTpPercentages (Pivot Logic)', () => {

    beforeEach(() => {
        // Deep copy and set initial state for each test to ensure isolation
        const state: AppState = JSON.parse(JSON.stringify(initialTradeState));
        tradeStore.set(state);
        // Set up a standard 3-target scenario
        updateTradeStore(state => ({
            ...state,
            targets: [
                { id: 0, price: new Decimal(110), percent: new Decimal(50), isLocked: false },
                { id: 1, price: new Decimal(120), percent: new Decimal(30), isLocked: false },
                { id: 2, price: new Decimal(130), percent: new Decimal(20), isLocked: false },
            ]
        }));
    });

    it('should pivot and adjust others when a TP is decreased', () => {
        // Action: User changes TP2 from 30% to 20%
        app.updateTakeProfitPercent(1, '20'); // This calls adjustTpPercentages(1) internally

        const targets = get(tradeStore).targets;
        // Expectation: TP2 is fixed at 20. Remaining 80 is split proportionally between TP1 (50) and TP3 (20).
        // Their sum is 70. Scaling factor = 80/70.
        // New TP1 = 50 * (80/70) = 57.14 -> 57
        // New TP3 = 20 * (80/70) = 22.85 -> 23 (remainder)
        expect(targets[0].percent!.equals(new Decimal(57))).toBe(true);
        expect(targets[1].percent!.equals(new Decimal(20))).toBe(true); // Pivot is respected
        expect(targets[2].percent!.equals(new Decimal(23))).toBe(true);
    });

    it('should pivot and adjust other unlocked TPs when one is locked', () => {
        // Action: Lock TP1 at 50%. Then change TP3 from 20% to 10%.
        app.toggleTakeProfitLock(0);
        app.updateTakeProfitPercent(2, '10');

        const targets = get(tradeStore).targets;
        // Expectation: TP1 is 50 (locked), TP3 is 10 (pivot). Remaining 40% must go to TP2.
        expect(targets[0].percent!.equals(new Decimal(50))).toBe(true); // Locked
        expect(targets[1].percent!.equals(new Decimal(40))).toBe(true);
        expect(targets[2].percent!.equals(new Decimal(10))).toBe(true); // Pivot is respected
    });

    it('should pivot and adjust others when a TP is increased', () => {
        // Action: User changes TP1 from 50% to 70%.
        app.updateTakeProfitPercent(0, '70');

        const targets = get(tradeStore).targets;
        // Expectation: TP1 is 70 (pivot). Remaining 30% is split between TP2 (30) and TP3 (20).
        // Their sum is 50. Scaling factor = 30/50 = 0.6.
        // New TP2 = 30 * 0.6 = 18
        // New TP3 = 20 * 0.6 = 12
        expect(targets[0].percent!.equals(new Decimal(70))).toBe(true); // Pivot
        expect(targets[1].percent!.equals(new Decimal(18))).toBe(true);
        expect(targets[2].percent!.equals(new Decimal(12))).toBe(true);
    });

    it('should scale all unlocked if pivot input is too high', () => {
        // Action: Lock TP1 at 50%. Change TP2 from 30% to 60% (invalid, total > 100).
        app.toggleTakeProfitLock(0);
        app.updateTakeProfitPercent(1, '60');

        const targets = get(tradeStore).targets;
        // Expectation: Since pivot (60) + locked (50) > 100, the pivot logic is skipped.
        // Instead, all unlocked targets (TP2 at 60, TP3 at 20) are scaled to fit the remaining 50%.
        // Their sum is 80. Scaling factor = 50/80 = 0.625.
        // New TP2 = 60 * 0.625 = 37.5 -> 38
        // New TP3 = 20 * 0.625 = 12.5 -> 12
        expect(targets[0].percent!.equals(new Decimal(50))).toBe(true); // Locked
        expect(targets[1].percent!.equals(new Decimal(38))).toBe(true);
        expect(targets[2].percent!.equals(new Decimal(12))).toBe(true);
    });


    it('should set single unlocked TP to remainder', () => {
        // Action: Lock TP1 (50) and TP2 (30). Then change TP3.
        app.toggleTakeProfitLock(0);
        app.toggleTakeProfitLock(1);
        app.updateTakeProfitPercent(2, '99'); // User enters a new value

        const targets = get(tradeStore).targets;
        // Expectation: TP1 and TP2 are locked (80%). Remaining 20% must go to TP3.
        expect(targets[0].percent!.equals(new Decimal(50))).toBe(true);
        expect(targets[1].percent!.equals(new Decimal(30))).toBe(true);
        expect(targets[2].percent!.equals(new Decimal(20))).toBe(true);
    });

    it('should not adjust other TPs if the changed TP is locked', () => {
        // Action: Lock TP1. Then try to change its value.
        app.toggleTakeProfitLock(0);
        app.updateTakeProfitPercent(0, '99');

        const targets = get(tradeStore).targets;
        // Expectation: The change is ignored because the field is locked. Nothing is adjusted.
        // Note: The UI should prevent this, but the logic should be robust.
        expect(targets[0].percent!.equals(new Decimal(50))).toBe(true);
        expect(targets[1].percent!.equals(new Decimal(30))).toBe(true);
        expect(targets[2].percent!.equals(new Decimal(20))).toBe(true);
    });

    it('should re-balance all unlocked when a lock is released', () => {
        // Setup an invalid state created by locking
        updateTradeStore(state => ({
            ...state,
            targets: [
                { id: 0, price: new Decimal(110), percent: new Decimal(60), isLocked: true },
                { id: 1, price: new Decimal(120), percent: new Decimal(60), isLocked: true },
                { id: 2, price: new Decimal(130), percent: new Decimal(0), isLocked: false },
            ]
        }));

        // Action: User unlocks TP2. `adjustTpPercentages` is called without a specific changedIndex
        // in the real app, but we simulate it by passing the index of the unlocked field.
        app.toggleTakeProfitLock(1); // This calls adjustTpPercentages(1) internally

        const targets = get(tradeStore).targets;
        const total = targets.reduce((sum, t) => sum.plus(t.percent || 0), new Decimal(0));
        // Expectation: The change was to a lock, so the "pivot" logic is skipped.
        // All unlocked TPs (TP2 at 60, TP3 at 0) are scaled to fit the remaining 40%.
        // Their sum is 60. Scaling factor = 40/60.
        // New TP2 = 60 * (40/60) = 40.
        // New TP3 = 0 * (40/60) = 0.
        expect(total.equals(new Decimal(100))).toBe(true);
        expect(targets[0].percent!.equals(new Decimal(60))).toBe(true); // Locked, unchanged
        expect(targets[1].percent!.equals(new Decimal(40))).toBe(true);
        expect(targets[2].percent!.equals(new Decimal(0))).toBe(true);
    });
});

describe('app service - ATR and Locking Logic', () => {
    beforeEach(() => {
        // Reset stores and mocks before each test
        tradeStore.set(JSON.parse(JSON.stringify(initialTradeState)));
        vi.clearAllMocks();
    });

    it('should fetch ATR and update the trade store', async () => {
        // Arrange
        const mockKlines: Kline[] = Array(15).fill(0).map((_, i) => ({
            high: new Decimal(102 + i * 0.1),
            low: new Decimal(98 - i * 0.1),
            close: new Decimal(100 + i * 0.2),
        }));
        vi.mocked(apiService.fetchKlines).mockResolvedValue(mockKlines);
        updateTradeStore(state => ({ ...state, symbol: 'BTCUSDT', atrTimeframe: '1h' }));

        // Act
        await app.fetchAtr();

        // Assert
        const store = get(tradeStore);
        expect(apiService.fetchKlines).toHaveBeenCalledWith('BTCUSDT', '1h');
        expect(store.atrValue).not.toBe(null);
        expect(new Decimal(store.atrValue!).isFinite()).toBe(true);
    });

    it('should toggle risk amount lock', () => {
        // Arrange
        updateTradeStore(state => ({ ...state, riskAmount: new Decimal(100) }));
        expect(get(tradeStore).isRiskAmountLocked).toBe(false);

        // Act
        app.toggleRiskAmountLock();

        // Assert
        expect(get(tradeStore).isRiskAmountLocked).toBe(true);

        // Act again to toggle off
        app.toggleRiskAmountLock();
        expect(get(tradeStore).isRiskAmountLocked).toBe(false);
    });

    it('should enforce mutual exclusion: locking risk amount unlocks position size', () => {
        // Arrange
        updateTradeStore(state => ({
            ...state,
            isPositionSizeLocked: true,
            lockedPositionSize: new Decimal(10),
            riskAmount: new Decimal(100)
        }));

        // Act
        app.toggleRiskAmountLock();

        // Assert
        const store = get(tradeStore);
        expect(store.isRiskAmountLocked).toBe(true);
        expect(store.isPositionSizeLocked).toBe(false);
        expect(store.lockedPositionSize).toBe(null);
    });

    it('should enforce mutual exclusion: locking position size unlocks risk amount', () => {
        // Arrange
        updateTradeStore(state => ({
            ...state,
            isRiskAmountLocked: true,
            isPositionSizeLocked: false, // initial state
        }));
        // Set a valid position size in the results store so the lock can be engaged
        resultsStore.set({ ...initialResultsState, positionSize: '1.23' });

        // Act
        app.togglePositionSizeLock();

        // Assert
        const store = get(tradeStore);
        expect(store.isPositionSizeLocked).toBe(true);
        expect(store.isRiskAmountLocked).toBe(false);
    });

    it('should backward-calculate risk percentage when risk amount is locked', () => {
        // Arrange
        tradeStore.set({
            ...initialTradeState,
            accountSize: new Decimal(10000),
            riskAmount: new Decimal(200), // User wants to risk 200
            isRiskAmountLocked: true,
            entryPrice: new Decimal(100),
            stopLossPrice: new Decimal(90),
        });

        // Act
        app.calculateAndDisplay();

        // Assert
        const store = get(tradeStore);
        // 200 is 2% of 10000
        expect(store.riskPercentage).not.toBeNull();
        expect(store.riskPercentage!.toDP(2).equals(new Decimal('2.00'))).toBe(true);
    });

    it('should set atrMode to auto when useAtrSl is toggled on', () => {
        // initial state has useAtrSl: false, atrMode: 'manual'
        let state = get(tradeStore);
        expect(state.useAtrSl).toBe(false);
        expect(state.atrMode).toBe('manual');

        toggleAtrInputs(true);

        state = get(tradeStore);
        expect(state.useAtrSl).toBe(true);
        expect(state.atrMode).toBe('auto');

        // Toggle back off, should retain atrMode
        toggleAtrInputs(false);
        state = get(tradeStore);
        expect(state.useAtrSl).toBe(false);
        expect(state.atrMode).toBe('auto');

        // set to manual and toggle off and on
        updateTradeStore(s => ({...s, atrMode: 'manual'}));
        toggleAtrInputs(true);
        state = get(tradeStore);
        expect(state.atrMode).toBe('auto');
    });
});
