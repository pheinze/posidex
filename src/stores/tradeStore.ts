import { writable } from 'svelte/store';
import { CONSTANTS } from '../lib/constants';
import type { AppState } from './types';
import { resultsStore, initialResultsState } from './resultsStore';
import { uiStore } from './uiStore';
import { Decimal } from 'decimal.js';

export const initialTradeState: Pick<AppState,
    'tradeType' |
    'accountSize' |
    'riskPercentage' |
    'entryPrice' |
    'stopLossPrice' |
    'leverage' |
    'fees' |
    'symbol' |
    'atrValue' |
    'atrMultiplier' |
    'useAtrSl' |
    'atrMode' |
    'atrTimeframe' |
    'tradeNotes' |
    'targets' |
    'isPositionSizeLocked' |
    'lockedPositionSize' |
    'isRiskAmountLocked' |
    'riskAmount' |
    'journalSearchQuery' |
    'journalFilterStatus' |
    'currentTradeData'
> = {
    tradeType: CONSTANTS.TRADE_TYPE_LONG,
    accountSize: new Decimal(1000),
    riskPercentage: new Decimal(1),
    entryPrice: null,
    stopLossPrice: null,
    leverage: new Decimal(CONSTANTS.DEFAULT_LEVERAGE),
    fees: new Decimal(CONSTANTS.DEFAULT_FEES),
    symbol: '',
    atrValue: null,
    atrMultiplier: new Decimal(CONSTANTS.DEFAULT_ATR_MULTIPLIER),
    useAtrSl: false,
    atrMode: 'manual',
    atrTimeframe: '1d',
    tradeNotes: '',
    targets: [
        { price: null, percent: new Decimal(50), isLocked: false },
        { price: null, percent: new Decimal(25), isLocked: false },
        { price: null, percent: new Decimal(25), isLocked: false }
    ],
    isPositionSizeLocked: false,
    lockedPositionSize: null,
    isRiskAmountLocked: false,
    riskAmount: null,
    journalSearchQuery: '',
    journalFilterStatus: 'all',
    currentTradeData: null,
};

export const tradeStore = writable(initialTradeState);

// Helper function to update parts of the store
export const updateTradeStore = (updater: (state: typeof initialTradeState) => typeof initialTradeState) => {
    tradeStore.update(updater);
};

// Helper function to toggle ATR inputs visibility
export const toggleAtrInputs = (useAtrSl: boolean) => {
    updateTradeStore(state => ({
        ...state,
        useAtrSl: useAtrSl,
        atrMode: useAtrSl ? 'auto' : state.atrMode,
    }));
};

// Helper function to reset all inputs
export const resetAllInputs = () => {
    tradeStore.set(initialTradeState);
    resultsStore.set(initialResultsState);
    uiStore.showError('dashboard.promptForData');
};
