import { writable } from 'svelte/store';
import type { AppState } from './types';

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
    'maxPotentialProfit' |
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
    maxPotentialProfit: '-',
    calculatedTpDetails: [],
    totalROC: '-',
    showTotalMetricsGroup: false,
    showAtrFormulaDisplay: false,
    atrFormulaText: '',
    isAtrSlInvalid: false,
};

export const resultsStore = writable(initialResultsState);
