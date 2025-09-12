import { get } from 'svelte/store';
import { parseDecimal, formatDynamicDecimal, parseGermanDate, robustJsonParse } from '../utils/utils';
import { CONSTANTS } from '../lib/constants';
import { apiService } from './apiService';
import { modalManager } from './modalManager';
import { uiManager } from './uiManager';
import { calculator } from '../lib/calculator';
import { tradeStore, updateTradeStore, resetAllInputs, toggleAtrInputs } from '../stores/tradeStore';
import { presetStore, updatePresetStore } from '../stores/presetStore';
import { journalStore } from '../stores/journalStore';
import { uiStore } from '../stores/uiStore';
import type { JournalEntry, AppState, CalculatedTradeData } from '../stores/types';
import { Decimal } from 'decimal.js';
import { browser } from '$app/environment';
import { trackCustomEvent } from './trackingService';
import { onboardingService } from './onboardingService';
import superjson from '$lib/superjson';

type TakeProfitTarget = AppState['targets'][number];

// Re-declaring this interface here to avoid circular dependency with backupService
interface CSVTradeEntry {
    [key: string]: string | undefined;
}

export function getInputsAsObject() {
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
}

export const app = {
    calculator: calculator,
    uiManager: uiManager,

    init: () => {
        if (browser) {
            app.loadSettings();
            app.populatePresetLoader();
            journalStore.set(app.getJournal());
        }
    },

    getJournal: (): JournalEntry[] => {
        if (!browser) return [];
        try {
            const d = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_JOURNAL_KEY);
            return robustJsonParse<JournalEntry[]>(d) || [];
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

    addTrade: (tradeData: CalculatedTradeData | null) => {
        if (!tradeData || tradeData.positionSize.lte(0)) {
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
        };

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

    saveSettings: () => {
        if (!browser) return;
        try {
            localStorage.setItem(CONSTANTS.LOCAL_STORAGE_SETTINGS_KEY, superjson.stringify(getInputsAsObject()));
        } catch (e) {
            console.warn("Could not save settings to localStorage.", e);
        }
    },

    loadSettings: () => {
        if (!browser) return;
        try {
            const settingsJSON = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_SETTINGS_KEY);
            const settings = robustJsonParse<ReturnType<typeof getInputsAsObject>>(settingsJSON);
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
                const presets = robustJsonParse<Record<string, ReturnType<typeof getInputsAsObject>>>(presetsJSON) || {};
                if (presets[presetName] && !(await modalManager.show({ title: "Overwrite?", message: `Preset "${presetName}" already exists. Do you want to overwrite it?`, type: 'confirm' }))) return;
                presets[presetName] = getInputsAsObject();
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
            const presetsJSON = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY);
            const presets = robustJsonParse<Record<string, any>>(presetsJSON) || {};
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
            const presetsJSON = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY);
            const presets = robustJsonParse<Record<string, ReturnType<typeof getInputsAsObject>>>(presetsJSON);
            const preset = presets?.[presetName];
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
            const presetsJSON = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY);
            const presets = robustJsonParse<Record<string, any>>(presetsJSON) || {};
            updatePresetStore(state => ({ ...state, availablePresets: Object.keys(presets) }));
        } catch {
            console.warn("Could not populate presets from localStorage.");
            updatePresetStore(state => ({ ...state, availablePresets: [] }));
        }
    },

    exportToCSV: () => {
        if (!browser) return;
        const journalData = get(journalStore);
        if (journalData.length === 0) { uiStore.showError("Journal is empty."); return; }
        trackCustomEvent('Journal', 'Export', 'CSV', journalData.length);
        const headers = ['ID', 'Datum', 'Uhrzeit', 'Symbol', 'Typ', 'Status', 'Konto Guthaben', 'Risiko %', 'Hebel', 'Gebuehren %', 'Einstieg', 'Stop Loss', 'Gewichtetes R/R', 'Gesamt Netto-Gewinn', 'Risiko pro Trade (Waehrung)', 'Gesamte Gebuehren', 'Notizen', ...Array.from({length: 5}, (_, i) => [`TP${i+1} Preis`, `TP${i+1} %`]).flat()];
        const rows = journalData.map(trade => {
            const date = new Date(trade.date);
            const notes = trade.notes ? `"${trade.notes.replace(/"/g, '""').replace(/\n/g, ' ')}"` : '';
            const tpData = Array.from({length: 5}, (_, i) => [ (trade.targets[i]?.price || new Decimal(0)).toFixed(4), (trade.targets[i]?.percent || new Decimal(0)).toFixed(2) ]).flat();
            return [ trade.id, date.toLocaleDateString('de-DE'), date.toLocaleTimeString('de-DE'), trade.symbol, trade.tradeType, trade.status,
                (trade.accountSize || new Decimal(0)).toFixed(2), (trade.riskPercentage || new Decimal(0)).toFixed(2), (trade.leverage || new Decimal(0)).toFixed(2), (trade.fees || new Decimal(0)).toFixed(2), (trade.entryPrice || new Decimal(0)).toFixed(4), (trade.stopLossPrice || new Decimal(0)).toFixed(4),
                (trade.totalRR || new Decimal(0)).toFixed(2), (trade.totalNetProfit || new Decimal(0)).toFixed(2), (trade.riskAmount || new Decimal(0)).toFixed(2), (trade.totalFees || new Decimal(0)).toFixed(2), notes, ...tpData ].join(',');
        });
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.join("\n");
        const link = document.createElement("a");
        link.href = encodeURI(csvContent);
        link.download = "TradeJournal.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    importFromCSV: (file: File) => {
        if (!browser) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim() !== '');
            if (lines.length < 2) {
                uiStore.showError("CSV is empty or has only a header line.");
                return;
            }

            const headers = lines[0].split(',').map(h => h.trim());
            const requiredHeaders = ['ID', 'Datum', 'Uhrzeit', 'Symbol', 'Typ', 'Status', 'Einstieg', 'Stop Loss'];
            const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

            if (missingHeaders.length > 0) {
                uiStore.showError(`CSV file is missing required columns: ${missingHeaders.join(', ')}`);
                return;
            }

            const entries = lines.slice(1).map(line => {
                const values = line.split(',');
                const entry: CSVTradeEntry = headers.reduce((obj: Partial<CSVTradeEntry>, header, index) => {
                    (obj as any)[header as keyof CSVTradeEntry] = values[index] ? values[index].trim() : '';
                    return obj;
                }, {}) as CSVTradeEntry;

                try {
                    const targets = [];
                    for (let j = 1; j <= 5; j++) {
                        const priceKey = `TP${j} Preis`;
                        const percentKey = `TP${j} %`;
                        if (entry[priceKey] && entry[percentKey]) {
                            targets.push({
                                price: parseDecimal(entry[priceKey] as string),
                                percent: parseDecimal(entry[percentKey] as string),
                                isLocked: false
                            });
                        }
                    }

                    const typedEntry = entry as any;
                    return {
                        id: parseInt(typedEntry.ID, 10),
                        date: parseGermanDate(typedEntry.Datum, typedEntry.Uhrzeit),
                        symbol: typedEntry.Symbol,
                        tradeType: typedEntry.Typ.toLowerCase(),
                        status: typedEntry.Status,
                        accountSize: parseDecimal(typedEntry['Konto Guthaben'] || '0'),
                        riskPercentage: parseDecimal(typedEntry['Risiko %'] || '0'),
                        leverage: parseDecimal(typedEntry.Hebel || '1'),
                        fees: parseDecimal(typedEntry['Gebuehren %'] || '0.1'),
                        entryPrice: parseDecimal(typedEntry.Einstieg),
                        stopLossPrice: parseDecimal(typedEntry['Stop Loss']),
                        totalRR: parseDecimal(typedEntry['Gewichtetes R/R'] || '0'),
                        totalNetProfit: parseDecimal(typedEntry['Gesamt Netto-Gewinn'] || '0'),
                        riskAmount: parseDecimal(typedEntry['Risiko pro Trade (Waehrung)'] || '0'),
                        totalFees: parseDecimal(typedEntry['Gesamte Gebuehren'] || '0'),
                        notes: typedEntry.Notizen ? typedEntry.Notizen.replace(/""/g, '"').slice(1, -1) : '',
                        targets: targets,
                        realizedPnl: null
                    } as JournalEntry;
                } catch (err: unknown) {
                    console.warn("Error processing a row:", entry, err);
                    return null;
                }
            }).filter((entry): entry is JournalEntry => entry !== null);

            if (entries.length > 0) {
                const currentJournal = get(journalStore);
                const combined = [...currentJournal, ...entries];
                const unique = Array.from(new Map(combined.map(trade => [trade.id, trade])).values());

                if (await modalManager.show({title: "Confirm Import", message: `You are about to import ${entries.length} trades. Existing trades with the same ID will be overwritten. Continue?`, type: "confirm"})) {
                    journalStore.set(unique);
                    trackCustomEvent('Journal', 'Import', 'CSV', entries.length);
                    uiStore.showFeedback('save', 2000);
                }
            } else {
                uiStore.showError("No valid entries found in the CSV file.");
            }
        };
        reader.readAsText(file);
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

    updateSymbolSuggestions: (query: string) => {
        const upperQuery = query.toUpperCase().replace('/', '');
        let filtered: string[] = [];
        if (upperQuery) {
            filtered = CONSTANTS.SUGGESTED_SYMBOLS.filter(s => s.startsWith(upperQuery));
        }
        uiStore.update(s => ({ ...s, symbolSuggestions: filtered, showSymbolSuggestions: filtered.length > 0 }));
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
