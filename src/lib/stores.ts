import { writable } from 'svelte/store';
import { Decimal } from 'decimal.js';
import { CONSTANTS } from './constants';
import { browser } from '$app/environment';


interface TradeValues {
    accountSize: Decimal;
    riskPercentage: Decimal;
    entryPrice: Decimal;
    leverage: Decimal;
    fees: Decimal;
    symbol: string;
    useAtrSl: boolean;
    atrValue: Decimal;
    atrMultiplier: Decimal;
    stopLossPrice: Decimal;
    targets: Array<{ price: Decimal; percent: Decimal; }>;
    totalPercentSold: Decimal;
}

interface BaseMetrics {
    positionSize: Decimal;
    requiredMargin: Decimal;
    netLoss: Decimal;
    breakEvenPrice: Decimal;
    liquidationPrice: Decimal;
    entryFee: Decimal;
    riskAmount: Decimal;
}

interface IndividualTpResult {
    netProfit: Decimal;
    riskRewardRatio: Decimal;
    priceChangePercent: Decimal;
    returnOnCapital: Decimal;
    partialVolume: Decimal;
}

interface TotalMetrics {
    totalNetProfit: Decimal;
    totalRR: Decimal;
    totalFees: Decimal;
    maxPotentialProfit: Decimal;
    riskAmount: Decimal;
}

export interface AppState {
    // Inputs
    tradeType: string;
    accountSize: string;
    riskPercentage: string;
    entryPrice: string;
    stopLossPrice: string;
    leverage: string;
    fees: string;
    symbol: string;
    atrValue: string;
    atrMultiplier: string;
    useAtrSl: boolean;
    tradeNotes: string;
    targets: Array<{ price: string; percent: string; isLocked: boolean }>;

    // Calculated Results
    positionSize: string;
    requiredMargin: string;
    netLoss: string;
    liquidationPrice: string;
    breakEvenPrice: string;
    totalRR: string;
    totalNetProfit: string;
    totalPercentSold: string;
    riskAmountCurrency: string;
    totalFees: string;
    maxPotentialProfit: string;
    calculatedTpDetails: IndividualTpResult[];

    // UI State
    isPositionSizeLocked: boolean;
    lockedPositionSize: Decimal | null;
    errorMessage: string;
    showErrorMessage: boolean;
    showTotalMetricsGroup: boolean;
    showAtrFormulaDisplay: boolean;
    atrFormulaText: string;
    isPriceFetching: boolean;
    showCopyFeedback: boolean;
    showSaveFeedback: boolean;
    currentTheme: string;
    symbolSuggestions: string[];
    showSymbolSuggestions: boolean;
    showJournalModal: boolean;
    showChangelogModal: boolean; // Added for changelog modal
    availablePresets: string[];
    selectedPreset: string;
    journalSearchQuery: string;
    journalFilterStatus: string;
    currentTradeData: any; // This needs a more specific interface
}

export interface JournalEntry {
    id: number;
    date: string;
    symbol: string;
    tradeType: string;
    status: string;
    accountSize: Decimal;
    riskPercentage: Decimal;
    leverage: Decimal;
    fees: Decimal;
    entryPrice: Decimal;
    stopLossPrice: Decimal;
    totalRR: Decimal;
    totalNetProfit: Decimal;
    riskAmount: Decimal;
    totalFees: Decimal;
    maxPotentialProfit: Decimal;
    notes: string;
    targets: Array<{ price: Decimal; percent: Decimal; isLocked: boolean }>;
    calculatedTpDetails: IndividualTpResult[];
}

function loadJournalFromLocalStorage(): JournalEntry[] {
    if (!browser) return [];
    try {
        const d = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_JOURNAL_KEY) || '[]';
        const parsedData = JSON.parse(d);
        if (!Array.isArray(parsedData)) return [];
        return parsedData.map(trade => {
            const newTrade = { ...trade };
            Object.keys(newTrade).forEach(key => {
                if (['accountSize', 'riskPercentage', 'entryPrice', 'stopLossPrice', 'leverage', 'fees', 'atrValue', 'atrMultiplier', 'totalRR', 'totalNetProfit', 'netLoss', 'riskAmount', 'totalFees', 'maxPotentialProfit', 'positionSize'].includes(key)) {
                    newTrade[key] = new Decimal(newTrade[key] || 0);
                }
            });
            if (newTrade.targets && Array.isArray(newTrade.targets)) {
                newTrade.targets = newTrade.targets.map((tp: any) => ({ ...tp, price: new Decimal(tp.price || 0), percent: new Decimal(tp.percent || 0) }));
            }
            return newTrade as JournalEntry;
        });
    } catch (e) {
        console.warn("Could not load journal from localStorage.", e);
        // showError("Journal konnte nicht geladen werden."); // Cannot call showError here due to circular dependency
        return [];
    }
}

export const initialAppState: AppState = {
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
    errorMessage: '',
    showErrorMessage: false,
    showTotalMetricsGroup: false,
    showAtrFormulaDisplay: false,
    atrFormulaText: '',
    isPriceFetching: false,
    showCopyFeedback: false,
    showSaveFeedback: false,
    currentTheme: 'dark', // Default theme
    symbolSuggestions: [],
    showSymbolSuggestions: false,
    showJournalModal: false,
    availablePresets: [],
    selectedPreset: '',
    journalSearchQuery: '',
    journalFilterStatus: 'all', 
    currentTradeData: {},
    showChangelogModal: false, // Added to satisfy AppState type
};

export const appStore = writable<AppState>(initialAppState);
export const journalStore = writable<JournalEntry[]>(loadJournalFromLocalStorage());

// Helper function to update parts of the store
export const updateStore = (updater: (state: AppState) => AppState) => {
    appStore.update(updater);
};

// Helper function to reset results
export const clearResults = (showGuidance = false) => {
    updateStore(state => ({
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
        errorMessage: showGuidance ? 'dashboard.promptForData' : '',
        showErrorMessage: showGuidance,
    }));
};

// Helper function to show/hide error messages
export const showError = (message: string) => {
    updateStore(state => ({
        ...state,
        errorMessage: message,
        showErrorMessage: true,
    }));
};

export const hideError = () => {
    updateStore(state => ({
        ...state,
        errorMessage: '',
        showErrorMessage: false,
    }));
};

// Helper function to show feedback (e.g., "Copied!")
export const showFeedback = (type: 'copy' | 'save', duration = 2000, message = "Gespeichert!") => {
    if (type === 'copy') {
        updateStore(state => ({ ...state, showCopyFeedback: true }));
        setTimeout(() => updateStore(state => ({ ...state, showCopyFeedback: false })), duration);
    } else if (type === 'save') {
        updateStore(state => ({ ...state, showSaveFeedback: true }));
        setTimeout(() => updateStore(state => ({ ...state, showSaveFeedback: false })), duration);
    }
};

// Helper function to set theme
export const setTheme = (themeName: string) => {
    updateStore(state => ({ ...state, currentTheme: themeName }));
    if (browser) {
        document.body.classList.forEach(className => {
            if (className.startsWith('theme-')) {
                document.body.classList.remove(className);
            }
        });
        if (themeName !== 'dark') {
            document.body.classList.add(`theme-${themeName}`);
        }
        try {
            localStorage.setItem(CONSTANTS.LOCAL_STORAGE_THEME_KEY, themeName);
            // Also set a cookie for SSR
            const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString(); // 1 year
            document.cookie = `${CONSTANTS.LOCAL_STORAGE_THEME_KEY}=${themeName}; expires=${expires}; path=/; SameSite=Lax`;
        } catch (e) {
            console.warn("Could not save theme.", e);
        }
    }
};

// Helper function to update symbol suggestions
export const updateSymbolSuggestions = (suggestions: string[]) => {
    updateStore(state => ({
        ...state,
        symbolSuggestions: suggestions,
        showSymbolSuggestions: suggestions.length > 0,
    }));
};

// Helper function to toggle ATR inputs visibility
export const toggleAtrInputs = (useAtrSl: boolean) => {
    updateStore(state => ({
        ...state,
        useAtrSl: useAtrSl,
        stopLossPrice: useAtrSl ? '' : state.stopLossPrice, // Clear manual SL if ATR is enabled
    }));
};

// Helper function to reset all inputs
export const resetAllInputs = () => {
    updateStore(state => ({
        ...initialAppState,
        currentTheme: state.currentTheme, // Keep current theme
    }));
    clearResults(true);
};

// Helper function to toggle journal modal visibility
export const toggleJournalModal = (show: boolean) => {
    updateStore(state => ({ ...state, showJournalModal: show }));
};

// Helper function to toggle changelog modal visibility
export const toggleChangelogModal = (show: boolean) => {
    updateStore(state => ({ ...state, showChangelogModal: show }));
};