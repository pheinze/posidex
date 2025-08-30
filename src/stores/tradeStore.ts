import { writable } from 'svelte/store';
import { Decimal } from 'decimal.js';
import { CONSTANTS } from '../lib/constants';
import type { AppState } from './types';
import { uiStore } from './uiStore';

export const initialAppState: Omit<AppState, 'currentTheme' | 'showJournalModal' | 'showChangelogModal' | 'showCopyFeedback' | 'showSaveFeedback' | 'errorMessage' | 'showErrorMessage'> = {
    tradeType: CONSTANTS.TRADE_TYPE_LONG,
    accountSize: '',
    riskPercentage: '',
    entryPrice: '',
    stopLossPrice: '',
    leverage: CONSTANTS.DEFAULT_LEVERAGE,
    fees: CONSTANTS.DEFAULT_FEES,
    symbol: '',
    atrValue: '',
    atrMultiplier: CONSTANTS.DEFAULT_ATR_MULTIPLIER,
    useAtrSl: false,
    tradeNotes: '',
    targets: [
        { price: '', percent: '', isLocked: false },
        { price: '', percent: '', isLocked: false },
        { price: '', percent: '', isLocked: false }
    ],

    positionSize: '-',
    requiredMargin: '-',
    netLoss: '-',
    liquidationPrice: '-',
    breakEvenPrice: '-',
    totalRR: '-',
    totalNetProfit: '-',
    totalPercentSold: '-',
    riskAmountCurrency: '-',
    totalFees: '-',
    maxPotentialProfit: '-',
    calculatedTpDetails: [],

    isPositionSizeLocked: false,
    lockedPositionSize: null,
    showTotalMetricsGroup: false,
    showAtrFormulaDisplay: false,
    atrFormulaText: '',
    isPriceFetching: false,
    symbolSuggestions: [],
    showSymbolSuggestions: false,
    availablePresets: [],
    selectedPreset: '',
    journalSearchQuery: '',
    journalFilterStatus: 'all',
    currentTradeData: {},
};

export const tradeStore = writable(initialAppState);

// Helper function to update parts of the store
export const updateTradeStore = (updater: (state: typeof initialAppState) => typeof initialAppState) => {
    tradeStore.update(updater);
};

// Helper function to reset results
export const clearResults = (showGuidance = false) => {
    updateTradeStore(state => ({
        ...state,
        positionSize: '-',
        requiredMargin: '-',
        netLoss: '-',
        liquidationPrice: '-',
        breakEvenPrice: '-',
        totalRR: '-',
        totalNetProfit: '-',
        totalPercentSold: '-',
        riskAmountCurrency: '-',
        totalFees: '-',
        maxPotentialProfit: '-',
        calculatedTpDetails: [],
        showTotalMetricsGroup: false,
        showAtrFormulaDisplay: false,
        atrFormulaText: '',
    }));
    if (showGuidance) {
        uiStore.showError('dashboard.promptForData');
    } else {
        uiStore.hideError();
    }
};

// Helper function to update symbol suggestions
export const updateSymbolSuggestions = (suggestions: string[]) => {
    updateTradeStore(state => ({
        ...state,
        symbolSuggestions: suggestions,
        showSymbolSuggestions: suggestions.length > 0,
    }));
};

// Helper function to toggle ATR inputs visibility
export const toggleAtrInputs = (useAtrSl: boolean) => {
    updateTradeStore(state => ({
        ...state,
        useAtrSl: useAtrSl,
        stopLossPrice: useAtrSl ? '' : state.stopLossPrice, // Clear manual SL if ATR is enabled
    }));
};

// Helper function to reset all inputs
export const resetAllInputs = () => {
    tradeStore.set(initialAppState);
    clearResults(true);
};
