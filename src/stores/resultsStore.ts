import { writable } from 'svelte/store';
import type { AppState } from './types';

/**
 * Defines the initial state for the display of calculation results.
 * Most fields are initialized with a dash ('-') to indicate that
 * no calculation has been performed yet.
 */
export const initialResultsState: Pick<AppState,
    'positionSize' |
    'requiredMargin' |
    'netLoss' |
    'entryFee' |
    'estimatedLiquidationPrice' |
    'breakEvenPrice' |
    'totalRR' |
    'totalNetProfit' |
    'totalPercentSold' |
    'riskAmountCurrency' |
    'totalFees' |
    'calculatedTpDetails' |
    'totalROC' |
    'showTotalMetricsGroup' |
    'showAtrFormulaDisplay' |
    'atrFormulaText' |
    'isAtrSlInvalid'
> = {
    positionSize: '-',
    requiredMargin: '-',
    netLoss: '-',
    entryFee: '-',
    estimatedLiquidationPrice: '-',
    breakEvenPrice: '-',
    totalRR: '-',
    totalNetProfit: '-',
    totalPercentSold: '-',
    riskAmountCurrency: '-',
    totalFees: '-',
    calculatedTpDetails: [],
    totalROC: '-',
    showTotalMetricsGroup: false,
    showAtrFormulaDisplay: false,
    atrFormulaText: '',
    isAtrSlInvalid: false,
};

/**
 * A Svelte `writable` store that manages the results of the trade calculations.
 * This store is subscribed to by the UI to display the calculated metrics.
 */
export const resultsStore = writable(initialResultsState);
