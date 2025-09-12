import type { AppState } from './types';
import type { Decimal } from 'decimal.js';

// This defines the structure for the results part of the app state.
// Note that UI-formatted strings are no longer stored here.
// The store holds raw Decimal/boolean/null values, and formatting is done in the components.
export type ResultsState = Pick<AppState,
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
>;

/**
 * Defines the initial state for the display of calculation results.
 * All calculable fields are initialized to null.
 */
export const initialResultsState: ResultsState = {
    positionSize: null,
    requiredMargin: null,
    netLoss: null,
    entryFee: null,
    estimatedLiquidationPrice: null,
    breakEvenPrice: null,
    totalRR: null,
    totalNetProfit: null,
    totalPercentSold: null,
    riskAmountCurrency: null,
    totalFees: null,
    calculatedTpDetails: [],
    totalROC: null,
    showTotalMetricsGroup: false,
    showAtrFormulaDisplay: false,
    atrFormulaText: '',
    isAtrSlInvalid: false,
};
