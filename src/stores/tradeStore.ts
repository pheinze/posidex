import { writable } from 'svelte/store';
import { CONSTANTS } from '../lib/constants';
import type { AppState } from './types';
import { resultsStore, initialResultsState } from './resultsStore';
import { uiStore } from './uiStore';
import { Decimal } from 'decimal.js';

/**
 * Defines the initial state for the trade and input parameters.
 * This object is used to initialize and reset the `tradeStore`.
 */
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

/**
 * A Svelte `writable` store that manages the state of the current trade inputs and parameters.
 */
export const tradeStore = writable(initialTradeState);

/**
 * Updates the `tradeStore` using an updater function.
 * Provides a type-safe way to modify parts of the store's state.
 * @param updater - A function that receives the current state and returns the new state.
 */
export const updateTradeStore = (updater: (state: typeof initialTradeState) => typeof initialTradeState) => {
    tradeStore.update(updater);
};

/**
 * Toggles the visibility and mode of ATR-related input fields.
 * @param useAtrSl - A boolean indicating whether the ATR Stop-Loss feature is enabled.
 */
export const toggleAtrInputs = (useAtrSl: boolean) => {
    updateTradeStore(state => ({
        ...state,
        useAtrSl: useAtrSl,
        atrMode: useAtrSl ? 'auto' : state.atrMode,
    }));
};

/**
 * Resets all input fields and calculation results to their initial values.
 * Affects `tradeStore` and `resultsStore`.
 */
export const resetAllInputs = () => {
    tradeStore.set(initialTradeState);
    resultsStore.set(initialResultsState);
};
