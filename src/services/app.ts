import { get } from 'svelte/store';
import { parseDecimal, formatDynamicDecimal, parseGermanDate } from '../utils/utils';
import { CONSTANTS } from '../lib/constants';
import { apiService } from './apiService';
import { modalManager } from './modalManager';
import { uiManager } from './uiManager';
import { calculator } from '../lib/calculator';
import { tradeStore, updateTradeStore, resetAllInputs, toggleAtrInputs } from '../stores/tradeStore';
import { presetStore, updatePresetStore } from '../stores/presetStore';
import { journalStore } from '../stores/journalStore';
import { uiStore } from '../stores/uiStore';
import type { JournalEntry, AppState } from '../stores/types';
import { Decimal } from 'decimal.js';
import { browser } from '$app/environment';
import { trackCustomEvent } from './trackingService';
import { onboardingService } from './onboardingService';
import superjson from '$lib/superjson';

type TakeProfitTarget = AppState['targets'][number];

export const app = {
    calculator: calculator,
    uiManager: uiManager,

    init: () => {
        if (browser) {
            app.loadSettings();
            app.populatePresetLoader();
        }
    },

    getJournal: (): JournalEntry[] => {
        if (!browser) return [];
        try {
            const d = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_JOURNAL_KEY);
            if (!d) return [];
            return superjson.parse<JournalEntry[]>(d) || [];
        } catch {
            console.warn("Could not load journal from localStorage.");
            uiStore.showError("Could not load journal.");
            return [];
        }
    },

    saveJournal: (d: JournalEntry[]) => {
        if (!browser) return;
        try {
            localStorage.setItem(CONSTANTS.LOCAL_STORAGE_JOURNAL_KEY, superjson.stringify(d));
        } catch {
            uiStore.showError("Error saving journal. Local storage may be full or blocked.");
        }
    },

    addTrade: (tradeData: Partial<JournalEntry> | null) => {
        if (!tradeData || !tradeData.positionSize || tradeData.positionSize.lte(0)) {
            uiStore.showError("Cannot save an invalid trade.");
            return;
        }
        const currentNotes = get(tradeStore).tradeNotes;
        const journalData = app.getJournal();
        const newTrade: JournalEntry = {
            ...tradeData,
            notes: currentNotes,
            id: Date.now(),
            date: new Date().toISOString(),
            realizedPnl: null
        } as JournalEntry;

        journalData.push(newTrade);
        app.saveJournal(journalData);
        journalStore.set(journalData);
        onboardingService.trackFirstJournalSave();
        uiStore.showFeedback('save');
    },

    updateTradeStatus: (id: number, newStatus: string) => {
        const journalData = app.getJournal();
        const tradeIndex = journalData.findIndex(t => t.id == id);
        if (tradeIndex !== -1) {
            const trade = journalData[tradeIndex];
            trade.status = newStatus;

            if ((newStatus === 'Won' || newStatus === 'Lost') && (trade.realizedPnl === null || trade.realizedPnl === undefined)) {
                if (newStatus === 'Won' && trade.totalNetProfit) {
                    trade.realizedPnl = new Decimal(trade.totalNetProfit);
                } else if (newStatus === 'Lost' && trade.netLoss) {
                    trade.realizedPnl = new Decimal(trade.netLoss).negated();
                }
            }

            app.saveJournal(journalData);
            journalStore.set([...journalData]);
            trackCustomEvent('Journal', 'UpdateStatus', newStatus);
        }
    },

    updateRealizedPnl: (id: number, pnl: string | null) => {
        const journalData = app.getJournal();
        const tradeIndex = journalData.findIndex(t => t.id == id);
        if (tradeIndex === -1) return;

        try {
            journalData[tradeIndex].realizedPnl = (pnl === null || pnl.trim() === '') ? null : new Decimal(pnl);
            app.saveJournal(journalData);
            journalStore.set([...journalData]);
            trackCustomEvent('Journal', 'UpdatePnl');
        } catch (_error) {
            uiStore.showError("Invalid number entered for P/L.");
            journalStore.set([...journalData]);
        }
    },

    deleteTrade: (id: number) => {
        const d = app.getJournal().filter(t => t.id != id);
        app.saveJournal(d);
        journalStore.set(d);
    },

    async clearJournal() {
        const journal = app.getJournal();
        if (journal.length === 0) {
            uiStore.showError("The journal is already empty.");
            return;
        }
        if (await modalManager.show({ title: "Clear Journal", message: "Are you sure you want to permanently delete the entire journal?", type: 'confirm' })) {
            app.saveJournal([]);
            journalStore.set([]);
            uiStore.showFeedback('save', 2000);
        }
    },

    getInputsAsObject: () => {
        const currentAppState = get(tradeStore);
        return {
            accountSize: currentAppState.accountSize,
            riskPercentage: currentAppState.riskPercentage,
            leverage: currentAppState.leverage,
            fees: currentAppState.fees,
            tradeType: currentAppState.tradeType,
            useAtrSl: currentAppState.useAtrSl,
            atrMultiplier: currentAppState.atrMultiplier,
            symbol: currentAppState.symbol,
            targets: currentAppState.targets,
        };
    },

    saveSettings: () => {
        if (!browser) return;
        try {
            localStorage.setItem(CONSTANTS.LOCAL_STORAGE_SETTINGS_KEY, superjson.stringify(app.getInputsAsObject()));
        } catch (e) {
            console.warn("Could not save settings to localStorage.", e);
        }
    },

    loadSettings: () => {
        if (!browser) return;
        try {
            const settingsJSON = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_SETTINGS_KEY);
            if (!settingsJSON) return;
            const settings = superjson.parse<ReturnType<typeof app.getInputsAsObject>>(settingsJSON);
            if (settings) {
                updateTradeStore(state => ({
                    ...state,
                    ...settings,
                }));
                toggleAtrInputs(settings.useAtrSl || false);
            }
        } catch {
            console.warn("Could not load settings from localStorage.");
        }
    },

    savePreset: async () => {
        if (!browser) return;
        const presetName = await modalManager.show({ title: "Save Preset", message: "Enter a name for your preset:", type: 'prompt' });
        if (typeof presetName === 'string' && presetName) {
            try {
                const presetsJSON = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY) || '{}';
                const presets = superjson.parse<Record<string, ReturnType<typeof app.getInputsAsObject>>>(presetsJSON);
                if (presets[presetName] && !(await modalManager.show({ title: "Overwrite?", message: `Preset "${presetName}" already exists. Do you want to overwrite it?`, type: 'confirm' }))) return;
                presets[presetName] = app.getInputsAsObject();
                localStorage.setItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY, superjson.stringify(presets));
                uiStore.showFeedback('save');
                app.populatePresetLoader();
                updatePresetStore(state => ({ ...state, selectedPreset: presetName }));
            } catch {
                uiStore.showError("Could not save preset. Local storage may be full or blocked.");
            }
        }
    },

    deletePreset: async () => {
        if (!browser) return;
        const presetName = get(presetStore).selectedPreset;
        if (!presetName) return;
        if (!(await modalManager.show({ title: "Delete Preset", message: `Really delete preset "${presetName}"?`, type: 'confirm' }))) return;
        try {
            const presetsJSON = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY) || '{}';
            const presets = superjson.parse<Record<string, any>>(presetsJSON);
            delete presets[presetName];
            localStorage.setItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY, superjson.stringify(presets));
            app.populatePresetLoader();
            updatePresetStore(state => ({ ...state, selectedPreset: '' }));
        } catch { uiStore.showError("Could not delete preset."); }
    },

    loadPreset: (presetName: string) => {
        if (!browser || !presetName) return;
        trackCustomEvent('Preset', 'Load', presetName);
        try {
            const presetsJSON = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY) || '{}';
            const presets = superjson.parse<Record<string, ReturnType<typeof app.getInputsAsObject>>>(presetsJSON);
            const preset = presets[presetName];
            if (preset) {
                resetAllInputs();
                updateTradeStore(state => ({
                    ...state,
                    ...preset
                }));
                updatePresetStore(state => ({ ...state, selectedPreset: presetName }));
                toggleAtrInputs(preset.useAtrSl || false);
            }
        } catch (error) {
            console.error("Error loading preset:", error);
            uiStore.showError("Could not load preset.");
        }
    },

    populatePresetLoader: () => {
        if (!browser) return;
        try {
            const presetsJSON = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY) || '{}';
            const presets = superjson.parse<Record<string, any>>(presetsJSON);
            updatePresetStore(state => ({ ...state, availablePresets: Object.keys(presets) }));
        } catch {
            console.warn("Could not populate presets from localStorage.");
            updatePresetStore(state => ({ ...state, availablePresets: [] }));
        }
    },

    handleFetchPrice: async () => {
        const symbol = get(tradeStore).symbol.toUpperCase().replace('/', '');
        if (!symbol) {
            uiStore.showError("Please enter a symbol.");
            return;
        }
        uiStore.update(state => ({ ...state, isPriceFetching: true }));
        try {
            const price = await apiService.fetchBinancePrice(symbol);
            updateTradeStore(state => ({ ...state, entryPrice: price.toDP(4) }));
            uiStore.showFeedback('copy', 700);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            uiStore.showError(message);
        } finally {
            uiStore.update(state => ({ ...state, isPriceFetching: false }));
        }
    },

    setAtrMode: (mode: 'manual' | 'auto') => {
        updateTradeStore(state => ({ ...state, atrMode: mode, atrValue: mode === 'auto' ? null : state.atrValue }));
    },

    setAtrTimeframe: (timeframe: string) => {
        updateTradeStore(state => ({ ...state, atrTimeframe: timeframe }));
        if (get(tradeStore).atrMode === 'auto') app.fetchAtr();
    },

    fetchAtr: async () => {
        const currentTradeState = get(tradeStore);
        const symbol = currentTradeState.symbol.toUpperCase().replace('/', '');
        if (!symbol) {
            uiStore.showError("Please enter a symbol.");
            return;
        }
        uiStore.update(state => ({ ...state, isPriceFetching: true }));
        try {
            const klines = await apiService.fetchKlines(symbol, currentTradeState.atrTimeframe);
            const atr = calculator.calculateATR(klines);
            updateTradeStore(state => ({ ...state, atrValue: atr.toDP(4) }));
            uiStore.showFeedback('copy', 700);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            uiStore.showError(message);
        } finally {
            uiStore.update(state => ({ ...state, isPriceFetching: false }));
        }
    },

    selectSymbolSuggestion: (symbol: string) => {
        updateTradeStore(s => ({ ...s, symbol: symbol }));
        uiStore.update(s => ({ ...s, showSymbolSuggestions: false, symbolSuggestions: [] }));
        app.handleFetchPrice();
    },

    togglePositionSizeLock: (forceState?: boolean) => {
        const state = get(tradeStore);
        const shouldBeLocked = forceState !== undefined ? forceState : !state.isPositionSizeLocked;

        if (shouldBeLocked) {
            const { entryPrice, stopLossPrice, lockedPositionSize, accountSize } = state;
            if (!lockedPositionSize || lockedPositionSize.lte(0)) {
                uiStore.showError("Position size must be calculated before it can be locked.");
                return;
            }
            const riskPerUnit = parseDecimal(entryPrice).minus(parseDecimal(stopLossPrice)).abs();
            if (riskPerUnit.lte(0)) {
                uiStore.showError("Stop-Loss must have a valid distance from Entry Price.");
                return;
            }
            const riskAmount = riskPerUnit.times(lockedPositionSize);
            const riskPercentage = parseDecimal(accountSize).isZero() ? new Decimal(0) : riskAmount.div(parseDecimal(accountSize)).times(100);

            updateTradeStore(s => ({ ...s, isPositionSizeLocked: true, isRiskAmountLocked: false, riskAmount, riskPercentage }));
        } else {
            updateTradeStore(s => ({ ...s, isPositionSizeLocked: false, lockedPositionSize: null }));
        }
    },

    toggleRiskAmountLock: (forceState?: boolean) => {
        const state = get(tradeStore);
        const shouldBeLocked = forceState !== undefined ? forceState : !state.isRiskAmountLocked;

        if (shouldBeLocked) {
            const { riskAmount, accountSize } = state;
            if (parseDecimal(riskAmount).lte(0)) {
                uiStore.showError("Risk amount cannot be locked while it is invalid.");
                return;
            }
            const riskPercentage = parseDecimal(accountSize).isZero() ? new Decimal(0) : parseDecimal(riskAmount).div(parseDecimal(accountSize)).times(100);
            updateTradeStore(s => ({ ...s, isRiskAmountLocked: true, isPositionSizeLocked: false, lockedPositionSize: null, riskPercentage }));
        } else {
            updateTradeStore(s => ({ ...s, isRiskAmountLocked: false }));
        }
    },

    addTakeProfitRow: (price: number | null = null, percent: number | null = null, isLocked = false) => {
        updateTradeStore(state => ({
            ...state,
            targets: [...state.targets, { price: price !== null ? new Decimal(price) : null, percent: percent !== null ? new Decimal(percent) : null, isLocked }]
        }));
    },

    adjustTpPercentages: (changedIndex: number | null) => {
        const targets = get(tradeStore).targets;
        if (changedIndex !== null && targets[changedIndex]?.isLocked) return;

        const decTargets = targets.map(t => ({ ...t, percent: parseDecimal(t.percent) }));
        const lockedSum = decTargets.filter(t => t.isLocked).reduce((sum, t) => sum.plus(t.percent), new Decimal(0));
        if (lockedSum.gte(100)) return;

        const unlockedTargets = decTargets.filter(t => !t.isLocked);
        if (unlockedTargets.length === 0) return;

        const unlockedTargetSum = new Decimal(100).minus(lockedSum);
        const unlockedCurrentSum = unlockedTargets.reduce((sum, t) => sum.plus(t.percent), new Decimal(0));

        if (unlockedCurrentSum.isZero()) {
            if (unlockedTargetSum.gt(0)) {
                const share = unlockedTargetSum.div(unlockedTargets.length);
                unlockedTargets.forEach(t => t.percent = share);
            }
        } else {
            const scalingFactor = unlockedTargetSum.div(unlockedCurrentSum);
            unlockedTargets.forEach(t => t.percent = t.percent.times(scalingFactor));
        }

        let roundedSum = new Decimal(0);
        for (let i = 0; i < unlockedTargets.length - 1; i++) {
            const rounded = unlockedTargets[i].percent.toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
            unlockedTargets[i].percent = rounded;
            roundedSum = roundedSum.plus(rounded);
        }

        if (unlockedTargets.length > 0) {
            unlockedTargets[unlockedTargets.length - 1].percent = unlockedTargetSum.minus(roundedSum).toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
        }

        const finalTargets = decTargets.map(t => ({ ...t, price: t.price, percent: t.percent, isLocked: t.isLocked }));
        if (JSON.stringify(targets) !== JSON.stringify(finalTargets)) {
            updateTradeStore(state => ({ ...state, targets: finalTargets }));
        }
    },
};
