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

describe('app service - adjustTpPercentages (Prioritized Logic)', () => {

    beforeEach(() => {
        // Deep copy and set initial state for each test to ensure isolation
        const state: AppState = JSON.parse(JSON.stringify(initialTradeState));
        tradeStore.set(state);
        // Set up a standard 3-target scenario
        updateTradeStore(state => ({
            ...state,
            targets: [
                { price: 110, percent: 50, isLocked: false },
                { price: 120, percent: 30, isLocked: false },
                { price: 130, percent: 20, isLocked: false },
            ]
        }));
    });

    // --- DECREASE SCENARIOS ---
    it('should distribute surplus evenly when another TP is decreased', () => {
        // User decreases TP2 from 30 to 20. Surplus of 10 is distributed
        // between the other unlocked targets (TP1 and TP3).
        updateTradeStore(s => {
            if (s.targets[1]) s.targets[1].percent = 20;
            return s;
        });
        app.adjustTpPercentages(1);

        const targets = get(tradeStore).targets;
        expect(targets[0]?.percent).toBe(55); // 50 + 5
        expect(targets[1]?.percent).toBe(20); // The edited one
        expect(targets[2]?.percent).toBe(25); // 20 + 5
    });

    it('should distribute surplus to other unlocked TPs if one is locked', () => {
        updateTradeStore(s => {
            if (s.targets[0]) s.targets[0].isLocked = true;
            if (s.targets[2]) s.targets[2].percent = 10;
            return s;
        });
        app.adjustTpPercentages(2);

        const targets = get(tradeStore).targets;
        expect(targets[0]?.percent).toBe(50); // Locked
        expect(targets[1]?.percent).toBe(40); // 30 + 10
        expect(targets[2]?.percent).toBe(10);
    });

    // --- INCREASE SCENARIOS ---
    it('should take deficit from other TPs in reverse order (T3 then T2)', () => {
        // User increases TP1 from 50 to 70. Deficit of 20.
        // Should be taken from T3 first. T3 has 20, so it becomes 0.
        updateTradeStore(s => {
            if (s.targets[0]) s.targets[0].percent = 70;
            return s;
        });
        app.adjustTpPercentages(0);

        const targets = get(tradeStore).targets;
        expect(targets[0]?.percent).toBe(70);
        expect(targets[1]?.percent).toBe(30);
        expect(targets[2]?.percent).toBe(0);
    });

    it('should take deficit from T3, then T2 if T3 is depleted', () => {
        // User increases TP1 from 50 to 80. Deficit of 30.
        // T3 has 20, so it becomes 0. Remaining deficit is 10.
        // The remaining 10 is taken from T2 (30 -> 20).
        updateTradeStore(s => {
            if (s.targets[0]) s.targets[0].percent = 80;
            return s;
        });
        app.adjustTpPercentages(0);

        const targets = get(tradeStore).targets;
        expect(targets[0]?.percent).toBe(80);
        expect(targets[1]?.percent).toBe(20);
        expect(targets[2]?.percent).toBe(0);
    });

    it('should not take deficit from locked TPs', () => {
        updateTradeStore(s => {
            if (s.targets[2]) s.targets[2].isLocked = true;
            if (s.targets[0]) s.targets[0].percent = 75;
            return s;
        });
        app.adjustTpPercentages(0);

        const targets = get(tradeStore).targets;
        expect(targets[0]?.percent).toBe(75);
        expect(targets[1]?.percent).toBe(5);
        expect(targets[2]?.percent).toBe(20); // Locked
    });

    // --- EDGE CASE TESTS ---
    it('should revert change if only one unlocked TP is edited (increase)', () => {
        updateTradeStore(state => ({
            ...state,
            targets: [
                { price: 110, percent: 50, isLocked: true },
                { price: 120, percent: 30, isLocked: true },
                { price: 130, percent: 20, isLocked: false },
            ]
        }));
        updateTradeStore(s => {
            if (s.targets[2]) s.targets[2].percent = 30;
            return s;
        });
        app.adjustTpPercentages(2);

        const targets = get(tradeStore).targets;
        expect(targets[2]?.percent).toBe(20);
    });

    it('should revert change if only one unlocked TP is edited (decrease)', () => {
        updateTradeStore(state => ({
            ...state,
            targets: [
                { price: 110, percent: 50, isLocked: true },
                { price: 120, percent: 30, isLocked: true },
                { price: 130, percent: 20, isLocked: false },
            ]
        }));
        updateTradeStore(s => {
            if (s.targets[2]) s.targets[2].percent = 10;
            return s;
        });
        app.adjustTpPercentages(2);

        const targets = get(tradeStore).targets;
        expect(targets[2]?.percent).toBe(20);
    });

    it('should ignore changes to a locked field', () => {
        updateTradeStore(state => {
            if (state.targets[0]) {
                state.targets[0].isLocked = true;
                state.targets[0].percent = 99;
            }
            return state;
        });
        app.adjustTpPercentages(0);

        const targets = get(tradeStore).targets;
        expect(targets[0]?.percent).toBe(99);
        expect(targets[1]?.percent).toBe(30); // Unchanged
        expect(targets[2]?.percent).toBe(20); // Unchanged
    });

    it('should re-balance correctly when a lock is released', () => {
        updateTradeStore(state => ({
            ...state,
            targets: [
                { price: 110, percent: 60, isLocked: true },
                { price: 120, percent: 60, isLocked: true },
                { price: 130, percent: 0, isLocked: false },
            ]
        }));
        updateTradeStore(s => {
            if (s.targets[1]) s.targets[1].isLocked = false;
            return s;
        });
        app.adjustTpPercentages(1);

        const targets = get(tradeStore).targets;
        const total = targets.reduce((sum, t) => sum + (t?.percent || 0), 0);
        expect(total).toBe(100);
        expect(targets[0]?.percent).toBe(60); // Locked, unchanged
        expect(targets[1]?.percent).toBe(40);
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
        updateTradeStore(state => ({ ...state, riskAmount: 100 }));
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
            riskAmount: 100
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
            accountSize: 10000,
            riskAmount: 200, // User wants to risk 200
            isRiskAmountLocked: true,
            entryPrice: 100,
            stopLossPrice: 90,
        });

        // Act
        app.calculateAndDisplay();

        // Assert
        const store = get(tradeStore);
        // 200 is 2% of 10000
        expect(store.riskPercentage).not.toBeNull();
        expect(new Decimal(store.riskPercentage!).toFixed(2)).toBe('2.00');
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
