import { describe, it, expect, beforeEach } from 'vitest';
import { tradeStore, updateTradeStore, initialTradeState } from '../stores/tradeStore';
import { resultsStore, initialResultsState } from '../stores/resultsStore';
import { app } from './app';
import { get } from 'svelte/store';

describe('Integration Test: Trade Calculation Flow', () => {

    beforeEach(() => {
        // Reset stores to their initial state before each test
        tradeStore.set(JSON.parse(JSON.stringify(initialTradeState)));
        resultsStore.set(JSON.parse(JSON.stringify(initialResultsState)));
    });

    it('should update resultsStore correctly when tradeStore is changed and calculateAndDisplay is called', () => {
        // 1. Set up initial data in tradeStore
        updateTradeStore(state => ({
            ...state,
            accountSize: 10000,
            riskPercentage: 2,
            entryPrice: 50000,
            stopLossPrice: 49000,
            tradeType: 'long',
            leverage: 10,
            fees: 0.1,
            targets: [
                { price: 51000, percent: 50, isLocked: false },
                { price: 52000, percent: 50, isLocked: false },
            ]
        }));

        // 2. Call the orchestrating function
        app.calculateAndDisplay();

        // 3. Get the final state from resultsStore
        const finalResults = get(resultsStore);

        // 4. Assert that the values in resultsStore are updated correctly
        // Based on the inputs: riskAmount = 200, riskPerUnit = 1000
        // positionSize = 200 / 1000 = 0.2
        expect(finalResults.positionSize).toBe('0.2');

        // requiredMargin = (0.2 * 50000) / 10 = 1000
        expect(finalResults.requiredMargin).toBe('1000');

        // netLoss = riskAmount (200) + entryFee (0.2*50000*0.001=10) + slExitFee (0.2*49000*0.001=9.8) = 219.8
        expect(finalResults.netLoss).toBe('-219.8');

        // Check total metrics
        expect(finalResults.showTotalMetricsGroup).toBe(true);
        expect(finalResults.totalRR).not.toBe('-');
        expect(finalResults.totalNetProfit).not.toBe('-');

        // A simple check to ensure TP calculations ran
        expect(finalResults.calculatedTpDetails.length).toBe(2);
    });

    it('should clear results when inputs are incomplete', () => {
        // Set up valid initial state
        updateTradeStore(state => ({
            ...state,
            accountSize: 10000,
            riskPercentage: 2,
            entryPrice: 50000,
            stopLossPrice: 49000,
        }));

        app.calculateAndDisplay();

        // Ensure results are calculated initially
        expect(get(resultsStore).positionSize).not.toBe('-');

        // Now, make the inputs incomplete
        updateTradeStore(state => ({
            ...state,
            entryPrice: null,
        }));

        app.calculateAndDisplay();

        // Assert that results are cleared
        const finalResults = get(resultsStore);
        expect(finalResults.positionSize).toBe('-');
        expect(finalResults.requiredMargin).toBe('-');
        expect(finalResults.showTotalMetricsGroup).toBe(false);
    });
});
