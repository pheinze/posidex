import { get } from 'svelte/store';
import { parseDecimal, formatDynamicDecimal, parseGermanDate, formatDate } from '../utils/utils';
import { CONSTANTS } from '../lib/constants';
import { locale } from '../locales/i18n';
import { apiService } from './apiService';
import { modalManager } from './modalManager';
import { uiManager } from './uiManager';
import { calculator } from '../lib/calculator';
import { tradeStore, updateTradeStore, resetAllInputs, toggleAtrInputs } from '../stores/tradeStore';
import { resultsStore, initialResultsState } from '../stores/resultsStore';
import { presetStore, updatePresetStore } from '../stores/presetStore';
import { journalStore } from '../stores/journalStore';
import { uiStore } from '../stores/uiStore';
import type { JournalEntry, TradeValues, IndividualTpResult, BaseMetrics, AppState } from '../stores/types';
import { Decimal } from 'decimal.js';
import { browser } from '$app/environment';
import { trackCustomEvent } from './trackingService';
import { onboardingService } from './onboardingService';

// Type alias for Take Profit Target from AppState for cleaner usage
type TakeProfitTarget = AppState['targets'][number];

interface CSVTradeEntry {
    'ID': string;
    'Datum': string;
    'Uhrzeit': string;
    'Symbol': string;
    'Typ': string;
    'Status': string;
    'Konto Guthaben': string;
    'Risiko %': string;
    'Hebel': string;
    'Gebuehren %': string;
    'Einstieg': string;
    'Stop Loss': string;
    'Gewichtetes R/R': string;
    'Gesamt Netto-Gewinn': string;
    'Risiko pro Trade (Waehrung)': string;
    'Gesamte Gebuehren': string;
    'Max. potenzieller Gewinn': string;
    'Notizen': string;
    'TP1 Preis'?: string;
    'TP1 %'?: string;
    'TP2 Preis'?: string;
    'TP2 %'?: string;
    'TP3 Preis'?: string;
    'TP3 %'?: string;
    'TP4 Preis'?: string;
    'TP4 %'?: string;
    'TP5 Preis'?: string;
    'TP5 %'?: string;
    [key: string]: string | undefined;
}

/**
 * The `app` object serves as the central orchestrator for the application logic.
 * It connects UI actions, state management (stores), and backend services (like the calculator).
 * It is designed as a singleton and is used throughout the application.
 */
export const app = {
    calculator: calculator,
    uiManager: uiManager,

    /**
     * Initializes the application in the browser.
     * Loads user settings and presets from Local Storage and performs an initial calculation.
     */
    init: () => {
        if (browser) {
            app.loadSettings();
            app.populatePresetLoader();
            app.calculateAndDisplay();
        }
    },

    /**
     * Main function for calculations.
     * It gathers and validates all inputs, calls the `calculator` service,
     * and updates the `resultsStore` and `tradeStore` with the new data.
     * It also handles errors and incomplete inputs.
     */
    calculateAndDisplay: () => {
        uiStore.hideError();
        const currentTradeState = get(tradeStore);
        const newResults = { ...initialResultsState };

        /**
         * Internal helper function to gather and validate all inputs relevant for the calculation.
         * @returns An object containing the validation status and the collected data.
         */
        const getAndValidateInputs = (): { status: string; message?: string; fields?: string[]; data?: TradeValues } => {
            const values: TradeValues = {
                accountSize: parseDecimal(currentTradeState.accountSize),
                riskPercentage: parseDecimal(currentTradeState.riskPercentage),
                entryPrice: parseDecimal(currentTradeState.entryPrice),
                leverage: parseDecimal(currentTradeState.leverage || CONSTANTS.DEFAULT_LEVERAGE),
                fees: parseDecimal(currentTradeState.fees || CONSTANTS.DEFAULT_FEES),
                symbol: currentTradeState.symbol || '',
                useAtrSl: currentTradeState.useAtrSl,
                atrValue: parseDecimal(currentTradeState.atrValue),
                atrMultiplier: parseDecimal(currentTradeState.atrMultiplier || CONSTANTS.DEFAULT_ATR_MULTIPLIER),
                stopLossPrice: parseDecimal(currentTradeState.stopLossPrice),
                targets: currentTradeState.targets.map(t => ({ price: parseDecimal(t.price), percent: parseDecimal(t.percent), isLocked: t.isLocked })),
                totalPercentSold: new Decimal(0)
            };

            const requiredFieldMap: { [key: string]: Decimal } = {
                accountSize: values.accountSize,
                riskPercentage: values.riskPercentage,
                entryPrice: values.entryPrice,
            };

            if (values.useAtrSl) {
                requiredFieldMap.atrValue = values.atrValue;
                requiredFieldMap.atrMultiplier = values.atrMultiplier;
            } else {
                requiredFieldMap.stopLossPrice = values.stopLossPrice;
            }

            const emptyFields = Object.keys(requiredFieldMap).filter(field => requiredFieldMap[field as keyof typeof requiredFieldMap].isZero());

            if (emptyFields.length > 0) {
                return { status: CONSTANTS.STATUS_INCOMPLETE };
            }

            if (values.useAtrSl) {
                if (values.entryPrice.gt(0) && values.atrValue.gt(0) && values.atrMultiplier.gt(0)) {
                    const operator = currentTradeState.tradeType === CONSTANTS.TRADE_TYPE_LONG ? '-' : '+';
                    values.stopLossPrice = currentTradeState.tradeType === CONSTANTS.TRADE_TYPE_LONG
                        ? values.entryPrice.minus(values.atrValue.times(values.atrMultiplier))
                        : values.entryPrice.plus(values.atrValue.times(values.atrMultiplier));

                    newResults.showAtrFormulaDisplay = true;
                    newResults.atrFormulaText = `SL = ${values.entryPrice.toFixed(4)} ${operator} (${values.atrValue} × ${values.atrMultiplier}) = ${values.stopLossPrice.toFixed(4)}`;
                } else if (values.atrValue.gt(0) && values.atrMultiplier.gt(0)) {
                    return { status: CONSTANTS.STATUS_INCOMPLETE };
                }
            } else {
                newResults.showAtrFormulaDisplay = false;
                newResults.atrFormulaText = '';
            }

            newResults.isAtrSlInvalid = values.useAtrSl && values.stopLossPrice.lte(0);

            if (values.stopLossPrice.lte(0) && !newResults.isAtrSlInvalid) {
                return { status: CONSTANTS.STATUS_INCOMPLETE };
            }

            if (currentTradeState.tradeType === CONSTANTS.TRADE_TYPE_LONG && values.entryPrice.lte(values.stopLossPrice)) {
                return { status: CONSTANTS.STATUS_INVALID, message: "Long: Stop-Loss must be below Entry Price.", fields: ['stopLossPrice', 'entryPrice'] };
            }
            if (currentTradeState.tradeType === CONSTANTS.TRADE_TYPE_SHORT && values.entryPrice.gte(values.stopLossPrice)) {
                return { status: CONSTANTS.STATUS_INVALID, message: "Short: Stop-Loss must be above Entry Price.", fields: ['stopLossPrice', 'entryPrice'] };
            }

            for (const tp of values.targets) {
                if (tp.price.gt(0)) {
                    if (currentTradeState.tradeType === CONSTANTS.TRADE_TYPE_LONG) {
                        if (tp.price.lte(values.stopLossPrice)) return { status: CONSTANTS.STATUS_INVALID, message: `Long: Take-Profit Target ${tp.price.toFixed(4)} must be above Stop-Loss.`, fields: ['targets'] };
                        if (tp.price.lte(values.entryPrice)) return { status: CONSTANTS.STATUS_INVALID, message: `Long: Take-Profit Target ${tp.price.toFixed(4)} must be above Entry Price.`, fields: ['targets'] };
                    } else {
                        if (tp.price.gte(values.stopLossPrice)) return { status: CONSTANTS.STATUS_INVALID, message: `Short: Take-Profit Target ${tp.price.toFixed(4)} must be below Stop-Loss.`, fields: ['targets'] };
                        if (tp.price.gte(values.entryPrice)) return { status: CONSTANTS.STATUS_INVALID, message: `Short: Take-Profit Target ${tp.price.toFixed(4)} must be below Entry Price.`, fields: ['targets'] };
                    }
                }
            }

            values.totalPercentSold = values.targets.reduce((sum: Decimal, t) => sum.plus(t.percent), new Decimal(0));
            if (values.totalPercentSold.gt(100)) {
                return { status: CONSTANTS.STATUS_INVALID, message: `The sum of TP percentages (${values.totalPercentSold.toFixed(0)}%) cannot exceed 100%.`, fields: [] };
            }

            return { status: CONSTANTS.STATUS_VALID, data: values };
        };

        const validationResult = getAndValidateInputs();

        if (newResults.isAtrSlInvalid) {
            resultsStore.set({
                ...initialResultsState,
                showAtrFormulaDisplay: newResults.showAtrFormulaDisplay,
                atrFormulaText: newResults.atrFormulaText,
                isAtrSlInvalid: true,
            });
            return;
        }

        if (validationResult.status === CONSTANTS.STATUS_INVALID) {
            trackCustomEvent('Calculation', 'Error', validationResult.message);
            uiStore.showError(validationResult.message || "");
            app.clearResults();
            return;
        }

        if (validationResult.status === CONSTANTS.STATUS_INCOMPLETE) {
            app.clearResults(true);
            return;
        }

        let values = validationResult.data as TradeValues;
        let baseMetrics: BaseMetrics | null;

        if (currentTradeState.isRiskAmountLocked) {
            const riskAmount = parseDecimal(currentTradeState.riskAmount);
            if (riskAmount.gt(0) && values.accountSize.gt(0)) {
                const newRiskPercentage = riskAmount.div(values.accountSize).times(100);
                updateTradeStore(state => ({ ...state, riskPercentage: newRiskPercentage }));
                values.riskPercentage = newRiskPercentage;
            }
            baseMetrics = calculator.calculateBaseMetrics(values, currentTradeState.tradeType);

        } else if (currentTradeState.isPositionSizeLocked && currentTradeState.lockedPositionSize && currentTradeState.lockedPositionSize.gt(0)) {
            const riskPerUnit = values.entryPrice.minus(values.stopLossPrice).abs();
            if (riskPerUnit.lte(0)) {
                uiStore.showError("Stop-Loss must have a valid distance from Entry Price.");
                app.clearResults();
                return;
            }
            const riskAmount = riskPerUnit.times(currentTradeState.lockedPositionSize);
            const newRiskPercentage = values.accountSize.isZero() ? new Decimal(0) : riskAmount.div(values.accountSize).times(100);

            updateTradeStore(state => ({ ...state, riskPercentage: newRiskPercentage, riskAmount: riskAmount }));
            values.riskPercentage = newRiskPercentage;

            baseMetrics = calculator.calculateBaseMetrics(values, currentTradeState.tradeType);
            if (baseMetrics) baseMetrics.positionSize = currentTradeState.lockedPositionSize;

        } else {
            baseMetrics = calculator.calculateBaseMetrics(values, currentTradeState.tradeType);
            if (baseMetrics) {
                const finalMetrics = baseMetrics;
                updateTradeStore(state => ({ ...state, riskAmount: finalMetrics.riskAmount }));
            }
        }

        if (!baseMetrics || baseMetrics.positionSize.lte(0)) {
            app.clearResults();
            if (currentTradeState.isPositionSizeLocked) app.togglePositionSizeLock(false);
            return;
        }

        newResults.positionSize = formatDynamicDecimal(baseMetrics.positionSize, 4);
        newResults.requiredMargin = formatDynamicDecimal(baseMetrics.requiredMargin, 2);
        newResults.netLoss = `-${formatDynamicDecimal(baseMetrics.netLoss, 2)}`;
        newResults.estimatedLiquidationPrice = values.leverage.gt(1) ? formatDynamicDecimal(baseMetrics.estimatedLiquidationPrice) : 'N/A';
        newResults.breakEvenPrice = formatDynamicDecimal(baseMetrics.breakEvenPrice);
        newResults.entryFee = formatDynamicDecimal(baseMetrics.entryFee, 4);

        const calculatedTpDetails: IndividualTpResult[] = [];
        values.targets.forEach((tp, index) => {
            if (tp.price.gt(0) && tp.percent.gt(0)) {
                const details = calculator.calculateIndividualTp(tp.price, tp.percent, baseMetrics, values, index, currentTradeState.tradeType);
                calculatedTpDetails.push(details);
            }
        });
        newResults.calculatedTpDetails = calculatedTpDetails;

        const totalMetrics = calculator.calculateTotalMetrics(values.targets, baseMetrics, values, currentTradeState.tradeType);
        if (values.totalPercentSold.gt(0)) {
            newResults.totalRR = formatDynamicDecimal(totalMetrics.totalRR, 2);
            newResults.totalNetProfit = `+${formatDynamicDecimal(totalMetrics.totalNetProfit, 2)}`;
            newResults.totalPercentSold = `${formatDynamicDecimal(values.totalPercentSold, 0)}%`;
            newResults.riskAmountCurrency = `-${formatDynamicDecimal(totalMetrics.riskAmount, 2)}`;
            newResults.totalFees = formatDynamicDecimal(totalMetrics.totalFees, 2);
            newResults.totalROC = formatDynamicDecimal(totalMetrics.totalROC, 2);
            newResults.showTotalMetricsGroup = true;
        } else {
            newResults.showTotalMetricsGroup = false;
        }

        resultsStore.set(newResults);

        const activeTargets = values.targets.filter(t => t.price.gt(0) && t.percent.gt(0)).length;
        trackCustomEvent('Calculation', 'Success', currentTradeState.tradeType, activeTargets);
        onboardingService.trackFirstCalculation();

        updateTradeStore(state => ({
            ...state,
            currentTradeData: { ...values, ...baseMetrics, ...totalMetrics, tradeType: currentTradeState.tradeType, status: 'Open', calculatedTpDetails },
            stopLossPrice: values.stopLossPrice
        }));
        app.saveSettings();
    },

    /**
     * Resets the calculation results in the UI.
     * @param showGuidance - If true, a prompt to enter data is shown.
     */
    clearResults: (showGuidance = false) => {
        resultsStore.set(initialResultsState);
        if (showGuidance) {
            uiStore.showError('dashboard.promptForData');
        } else {
            uiStore.hideError();
        }
    },

    /**
     * Retrieves the journal data from the central journal store.
     * @returns An array of `JournalEntry` objects.
     */
    getJournal: (): JournalEntry[] => {
        if (!browser) return [];
        return get(journalStore);
    },

    /**
     * Adds the currently calculated trade to the journal.
     */
    addTrade: () => {
        const currentAppState = get(tradeStore);
        if (!currentAppState.currentTradeData || !currentAppState.currentTradeData.positionSize || currentAppState.currentTradeData.positionSize.lte(0)) { uiStore.showError("Cannot save an invalid trade."); return; }
        const journalData = app.getJournal();
        const newTrade: JournalEntry = {
            ...currentAppState.currentTradeData,
            notes: currentAppState.tradeNotes,
            id: Date.now(),
            date: new Date().toISOString(),
            realizedPnl: null
        };
        journalStore.set([...journalData, newTrade]);
        onboardingService.trackFirstJournalSave();
        uiStore.showFeedback('save');
    },

    /**
     * Updates the status of a specific trade in the journal.
     * @param id - The ID of the trade to update.
     * @param newStatus - The new status ('Won', 'Lost', 'Open', etc.).
     */
    updateTradeStatus: (id: number, newStatus: string) => {
        const journalData = app.getJournal();
        const tradeIndex = journalData.findIndex(t => t.id == id);
        if (tradeIndex !== -1) {
            const updatedJournal = [...journalData];
            const trade = { ...updatedJournal[tradeIndex] };
            trade.status = newStatus;

            // Automatically set realizedPnl if it's not already set
            if ((newStatus === 'Won' || newStatus === 'Lost') && (trade.realizedPnl === null || trade.realizedPnl === undefined)) {
                if (newStatus === 'Won' && trade.totalNetProfit) {
                    trade.realizedPnl = new Decimal(trade.totalNetProfit);
                } else if (newStatus === 'Lost' && trade.netLoss) {
                    trade.realizedPnl = new Decimal(trade.netLoss).negated();
                }
            }
            updatedJournal[tradeIndex] = trade;
            journalStore.set(updatedJournal);
            trackCustomEvent('Journal', 'UpdateStatus', newStatus);
        }
    },

    /**
     * Updates the realized Profit/Loss (P/L) for a trade.
     * @param id - The ID of the trade to update.
     * @param pnl - The new P/L value as a string, or null.
     */
    updateRealizedPnl: (id: number, pnl: string | null) => {
        const journalData = app.getJournal();
        const tradeIndex = journalData.findIndex(t => t.id == id);
        if (tradeIndex === -1) return;

        const updatedJournal = [...journalData];
        const tradeToUpdate = { ...updatedJournal[tradeIndex] };

        try {
            // If input is empty or null, set realizedPnl to null. Otherwise, create a new Decimal.
            // The Decimal constructor will throw an error for invalid numbers (e.g., "--" or "1.2.3").
            tradeToUpdate.realizedPnl = (pnl === null || pnl.trim() === '') ? null : new Decimal(pnl);
            updatedJournal[tradeIndex] = tradeToUpdate;

            journalStore.set(updatedJournal);
            trackCustomEvent('Journal', 'UpdatePnl');
        } catch (_error) {
            uiStore.showError("Invalid number entered for P/L.");
            // Revert the store to the original state to undo the visual change in the input
            journalStore.set([...journalData]);
        }
    },

    /**
     * Deletes a trade from the journal after user confirmation.
     * @param id - The ID of the trade to delete.
     */
    deleteTrade: async (id: number) => {
        if (await modalManager.show("Delete Trade", "Are you sure you want to permanently delete this trade?", "confirm")) {
            const journal = app.getJournal();
            const updatedJournal = journal.filter(t => t.id != id);
            journalStore.set(updatedJournal);
            trackCustomEvent('Journal', 'DeleteTrade');
        }
    },

    /**
     * Clears all entries from the journal after user confirmation.
     */
    async clearJournal() {
        const journal = app.getJournal();
        if (journal.length === 0) {
            uiStore.showError("The journal is already empty.");
            return;
        }
        if (await modalManager.show("Clear Journal", "Are you sure you want to permanently delete the entire journal?", "confirm")) {
            journalStore.set([]);
            uiStore.showFeedback('save', 2000);
        }
    },

    /**
     * Gathers the current input settings into an object.
     * @returns An object containing the current input settings.
     */
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

    /**
     * Saves the current input settings to Local Storage.
     */
    saveSettings: () => {
        if (!browser) return;
        try {
            localStorage.setItem(CONSTANTS.LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(app.getInputsAsObject()));
        } catch (e) {
            console.warn("Could not save settings to localStorage.", e);
        }
    },

    /**
     * Loads and applies user settings from Local Storage.
     */
    loadSettings: () => {
        if (!browser) return;
        try {
            const settingsJSON = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_SETTINGS_KEY);
            if (!settingsJSON) {
                return;
            }
            const settings = JSON.parse(settingsJSON);
            if (settings) {
                updateTradeStore(state => ({
                    ...state,
                    accountSize: parseDecimal(settings.accountSize),
                    riskPercentage: parseDecimal(settings.riskPercentage),
                    leverage: parseDecimal(settings.leverage || CONSTANTS.DEFAULT_LEVERAGE),
                    fees: parseDecimal(settings.fees || CONSTANTS.DEFAULT_FEES),
                    symbol: settings.symbol || '',
                    atrValue: parseDecimal(settings.atrValue),
                    atrMultiplier: parseDecimal(settings.atrMultiplier || CONSTANTS.DEFAULT_ATR_MULTIPLIER),
                    useAtrSl: settings.useAtrSl || false,
                    tradeType: settings.tradeType || CONSTANTS.TRADE_TYPE_LONG,
                    targets: (settings.targets || []).map((t: TakeProfitTarget) => ({
                        price: parseDecimal(t.price),
                        percent: parseDecimal(t.percent),
                        isLocked: t.isLocked
                    })),
                }));
                toggleAtrInputs(settings.useAtrSl || false);
                return;
            }
        } catch {
            console.warn("Could not load settings from localStorage.");
        }
    },

    /**
     * Saves the current inputs as a named preset.
     */
    savePreset: async () => {
        if (!browser) return;
        const presetName = await modalManager.show("Save Preset", "Enter a name for your preset:", "prompt");
        if (typeof presetName === 'string' && presetName) {
            try {
                const presets = JSON.parse(localStorage.getItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY) || '{}');
                if (presets[presetName] && !(await modalManager.show("Overwrite?", `Preset "${presetName}" already exists. Do you want to overwrite it?`, "confirm"))) return;
                presets[presetName] = app.getInputsAsObject();
                localStorage.setItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY, JSON.stringify(presets));
                uiStore.showFeedback('save');
                app.populatePresetLoader();
                updatePresetStore(state => ({ ...state, selectedPreset: presetName }));
            } catch {
                uiStore.showError("Could not save preset. Local storage may be full or blocked.");
            }
        }
    },

    /**
     * Deletes the currently selected preset.
     */
    deletePreset: async () => {
        if (!browser) return;
        const presetName = get(presetStore).selectedPreset;
        if (!presetName) return;
        if (!(await modalManager.show("Delete Preset", `Really delete preset "${presetName}"?`, "confirm"))) return;
        try {
            const presets = JSON.parse(localStorage.getItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY) || '{}');
            delete presets[presetName];
            localStorage.setItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY, JSON.stringify(presets));
            app.populatePresetLoader();
            updatePresetStore(state => ({ ...state, selectedPreset: '' }));
        } catch { uiStore.showError("Could not delete preset."); }
    },

    /**
     * Loads a named preset and applies its settings.
     * @param presetName - The name of the preset to load.
     */
    loadPreset: (presetName: string) => {
        if (!browser) return;
        if (!presetName) return;
        trackCustomEvent('Preset', 'Load', presetName);
        try {
            const presets = JSON.parse(localStorage.getItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY) || '{}');
            const preset = presets[presetName];
            if (preset) {
                resetAllInputs();
                updateTradeStore(state => ({
                    ...state,
                    accountSize: parseDecimal(preset.accountSize),
                    riskPercentage: parseDecimal(preset.riskPercentage),
                    leverage: parseDecimal(preset.leverage || CONSTANTS.DEFAULT_LEVERAGE),
                    fees: parseDecimal(preset.fees || CONSTANTS.DEFAULT_FEES),
                    symbol: preset.symbol || '',
                    atrValue: parseDecimal(preset.atrValue),
                    atrMultiplier: parseDecimal(preset.atrMultiplier || CONSTANTS.DEFAULT_ATR_MULTIPLIER),
                    useAtrSl: preset.useAtrSl || false,
                    tradeType: preset.tradeType || CONSTANTS.TRADE_TYPE_LONG,
                    targets: (preset.targets || []).map((t: TakeProfitTarget) => ({
                        price: parseDecimal(t.price),
                        percent: parseDecimal(t.percent),
                        isLocked: t.isLocked
                    })),
                }));
                updatePresetStore(state => ({ ...state, selectedPreset: presetName }));
                toggleAtrInputs(preset.useAtrSl || false);
                return;
            }
        } catch (error) {
            console.error("Error loading preset:", error);
            uiStore.showError("Could not load preset.");
        }
    },

    /**
     * Loads the list of available presets into the `presetStore`.
     */
    populatePresetLoader: () => {
        if (!browser) return;
        try {
            const presets = JSON.parse(localStorage.getItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY) || '{}');
            const presetNames = Object.keys(presets);
            updatePresetStore(state => ({ ...state, availablePresets: presetNames }));
        } catch {
            console.warn("Could not populate presets from localStorage.");
            updatePresetStore(state => ({ ...state, availablePresets: [] }));
        }
    },

    /**
     * Exports the current journal data to a CSV file.
     */
    exportToCSV: () => {
        if (!browser) return;
        const journalData = get(journalStore);
        if (journalData.length === 0) { uiStore.showError("Journal is empty."); return; }
        trackCustomEvent('Journal', 'Export', 'CSV', journalData.length);
        const headers = ['ID', 'Datum', 'Uhrzeit', 'Symbol', 'Typ', 'Status', 'Konto Guthaben', 'Risiko %', 'Hebel', 'Gebuehren %', 'Einstieg', 'Stop Loss', 'Gewichtetes R/R', 'Gesamt Netto-Gewinn', 'Realisierter G/V', 'Risiko pro Trade (Waehrung)', 'Gesamte Gebuehren', 'Notizen', ...Array.from({length: 5}, (_, i) => [`TP${i+1} Preis`, `TP${i+1} %`]).flat()];
        const rows = journalData.map(trade => {
            const formattedDate = formatDate(trade.date, get(locale)).split(', ');
            const date = formattedDate[0];
            const time = formattedDate.length > 1 ? formattedDate[1] : '';
            const notes = trade.notes ? `"${trade.notes.replace(/"/g, '""').replace(/\n/g, ' ')}"` : '';
            const tpData = Array.from({length: 5}, (_, i) => [ (trade.targets[i]?.price || new Decimal(0)).toFixed(4), (trade.targets[i]?.percent || new Decimal(0)).toFixed(2) ]).flat();
            const realizedPnl = trade.realizedPnl ? trade.realizedPnl.toFixed(2) : '';
            return [ trade.id, date, time, trade.symbol, trade.tradeType, trade.status,
                (trade.accountSize || new Decimal(0)).toFixed(2), (trade.riskPercentage || new Decimal(0)).toFixed(2), (trade.leverage || new Decimal(0)).toFixed(2), (trade.fees || new Decimal(0)).toFixed(2), (trade.entryPrice || new Decimal(0)).toFixed(4), (trade.stopLossPrice || new Decimal(0)).toFixed(4),
                (trade.totalRR || new Decimal(0)).toFixed(2), (trade.totalNetProfit || new Decimal(0)).toFixed(2), realizedPnl, (trade.riskAmount || new Decimal(0)).toFixed(2), (trade.totalFees || new Decimal(0)).toFixed(2), notes, ...tpData ].join(',');
        });
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.join("\n");
        const link = document.createElement("a");
        link.href = encodeURI(csvContent);
        link.download = "TradeJournal.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    /**
     * Imports journal data from a CSV file with flexible header mapping.
     * @param file - The CSV file to import.
     */
    importFromCSV: (file: File) => {
        if (!browser) return;

        const headerMapping: { [key: string]: string[] } = {
            id: ['id'],
            date: ['datum', 'date'],
            time: ['uhrzeit', 'time'],
            symbol: ['symbol'],
            tradeType: ['typ', 'type'],
            status: ['status'],
            accountSize: ['konto guthaben', 'account balance', 'account size'],
            riskPercentage: ['risiko %', 'risk %', 'risk percentage'],
            leverage: ['hebel', 'leverage'],
            fees: ['gebuehren %', 'fees %', 'fees percentage'],
            entryPrice: ['einstieg', 'entry', 'entry price'],
            stopLossPrice: ['stop loss', 'sl'],
            totalRR: ['gewichtetes r/r', 'weighted r/r', 'rr'],
            totalNetProfit: ['gesamt netto-gewinn', 'total net profit'],
            realizedPnl: ['realisierter g/v', 'realized p/l', 'realized pnl'],
            riskAmount: ['risiko pro trade (waehrung)', 'risk amount'],
            totalFees: ['gesamte gebuehren', 'total fees'],
            notes: ['notizen', 'notes'],
        };

        const findHeader = (header: string, headers: string[]): string | undefined => {
            const normalizedHeader = header.toLowerCase();
            const aliases = headerMapping[header as keyof typeof headerMapping];
            if (!aliases) return undefined;
            return headers.find(h => aliases.includes(h.toLowerCase()));
        };

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim() !== '');
            if (lines.length < 2) {
                uiStore.showError("CSV is empty or has only a header line.");
                return;
            }

            const rawHeaders = lines[0].split(',').map(h => h.trim());
            const requiredFields = ['id', 'date', 'time', 'symbol', 'tradeType', 'status', 'entryPrice', 'stopLossPrice'];
            const missingHeaders = requiredFields.filter(field => !findHeader(field, rawHeaders));

            if (missingHeaders.length > 0) {
                uiStore.showError(`CSV file is missing required columns: ${missingHeaders.join(', ')}`);
                return;
            }

            const entries = lines.slice(1).map(line => {
                const values = line.split(',');
                const entry: { [key: string]: string } = rawHeaders.reduce((obj: { [key: string]: string }, header, index) => {
                    obj[header.toLowerCase()] = values[index] ? values[index].trim() : '';
                    return obj;
                }, {});

                const getValue = (field: string) => entry[findHeader(field, rawHeaders)?.toLowerCase() || ''];

                try {
                    const targets = [];
                    for (let j = 1; j <= 5; j++) {
                        const priceHeader = rawHeaders.find(h => h.toLowerCase() === `tp${j} preis` || h.toLowerCase() === `tp${j} price`);
                        const percentHeader = rawHeaders.find(h => h.toLowerCase() === `tp${j} %` || h.toLowerCase() === `tp${j} percent`);
                        if (priceHeader && percentHeader && entry[priceHeader.toLowerCase()] && entry[percentHeader.toLowerCase()]) {
                            targets.push({
                                price: parseDecimal(entry[priceHeader.toLowerCase()]),
                                percent: parseDecimal(entry[percentHeader.toLowerCase()]),
                                isLocked: false
                            });
                        }
                    }

                    const realizedPnlValue = getValue('realizedPnl');

                    return {
                        id: parseInt(getValue('id'), 10),
                        date: parseGermanDate(getValue('date'), getValue('time')),
                        symbol: getValue('symbol'),
                        tradeType: getValue('tradeType').toLowerCase(),
                        status: getValue('status'),
                        accountSize: parseDecimal(getValue('accountSize') || '0'),
                        riskPercentage: parseDecimal(getValue('riskPercentage') || '0'),
                        leverage: parseDecimal(getValue('leverage') || '1'),
                        fees: parseDecimal(getValue('fees') || '0.1'),
                        entryPrice: parseDecimal(getValue('entryPrice')),
                        stopLossPrice: parseDecimal(getValue('stopLossPrice')),
                        totalRR: parseDecimal(getValue('totalRR') || '0'),
                        totalNetProfit: parseDecimal(getValue('totalNetProfit') || '0'),
                        riskAmount: parseDecimal(getValue('riskAmount') || '0'),
                        totalFees: parseDecimal(getValue('totalFees') || '0'),
                        notes: getValue('notes').replace(/""/g, '"').slice(1, -1),
                        targets: targets,
                        realizedPnl: realizedPnlValue ? parseDecimal(realizedPnlValue) : null
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

                if (await modalManager.show("Confirm Import", `You are about to import ${entries.length} trades. Existing trades with the same ID will be overwritten. Continue?`, "confirm")) {
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

    /**
     * Fetches the current price for a symbol from the Binance API and updates the entry price.
     */
    handleFetchPrice: async () => {
        const currentTradeState = get(tradeStore);
        const symbol = currentTradeState.symbol.toUpperCase().replace('/', '');
        if (!symbol) {
            uiStore.showError("Please enter a symbol.");
            return;
        }
        uiStore.update(state => ({ ...state, isPriceFetching: true }));
        try {
            const price = await apiService.fetchBinancePrice(symbol);
            updateTradeStore(state => ({ ...state, entryPrice: price.toDP(4) }));
            uiStore.showFeedback('copy', 700);
            app.calculateAndDisplay();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            uiStore.showError(message);
        } finally {
            uiStore.update(state => ({ ...state, isPriceFetching: false }));
        }
    },

    /**
     * Sets the mode for ATR-based Stop-Loss calculation.
     * @param mode - The mode ('manual' or 'auto').
     */
    setAtrMode: (mode: 'manual' | 'auto') => {
        updateTradeStore(state => ({
            ...state,
            atrMode: mode,
            atrValue: mode === 'auto' ? null : state.atrValue
        }));
        app.calculateAndDisplay();
    },

    /**
     * Sets the timeframe for ATR calculation.
     * @param timeframe - The timeframe (e.g., '1d', '4h').
     */
    setAtrTimeframe: (timeframe: string) => {
        updateTradeStore(state => ({
            ...state,
            atrTimeframe: timeframe
        }));
        if (get(tradeStore).atrMode === 'auto') {
            app.fetchAtr();
        }
    },

    /**
     * Fetches the ATR value from the Binance API and updates the `tradeStore`.
     */
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
            if (atr.lte(0)) {
                throw new Error("Could not calculate ATR. Check the symbol or timeframe.");
            }
            updateTradeStore(state => ({ ...state, atrValue: atr.toDP(4) }));
            app.calculateAndDisplay();
            uiStore.showFeedback('copy', 700);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            uiStore.showError(message);
        } finally {
            uiStore.update(state => ({ ...state, isPriceFetching: false }));
        }
    },

    /**
     * Selects a symbol suggestion, updates the store, and fetches the price.
     * @param symbol - The selected trading symbol.
     */
    selectSymbolSuggestion: (symbol: string) => {
        updateTradeStore(s => ({ ...s, symbol: symbol }));
        uiStore.update(s => ({ ...s, showSymbolSuggestions: false, symbolSuggestions: [] }));
        app.handleFetchPrice();
    },

    /**
     * Updates the list of symbol suggestions based on user input.
     * @param query - The current input in the symbol field.
     */
    updateSymbolSuggestions: (query: string) => {
        const upperQuery = query.toUpperCase().replace('/', '');
        let filtered: string[] = [];
        if (upperQuery) {
            filtered = CONSTANTS.SUGGESTED_SYMBOLS.filter(s => s.startsWith(upperQuery));
        }
        uiStore.update(s => ({ ...s, symbolSuggestions: filtered, showSymbolSuggestions: filtered.length > 0 }));
    },

    /**
     * Toggles the lock for the position size.
     * When enabled, the position size is maintained while other parameters are changed.
     * @param forceState - Optional. A boolean to set the state directly.
     */
    togglePositionSizeLock: (forceState?: boolean) => {
        const currentTradeState = get(tradeStore);
        const currentResultsState = get(resultsStore);
        const shouldBeLocked = forceState !== undefined ? forceState : !currentTradeState.isPositionSizeLocked;

        if (shouldBeLocked && (!currentResultsState.positionSize || parseDecimal(currentResultsState.positionSize).lte(0))) {
            uiStore.showError("Position size cannot be locked while it is invalid.");
            return;
        }

        updateTradeStore(state => ({
            ...state,
            isPositionSizeLocked: shouldBeLocked,
            lockedPositionSize: shouldBeLocked ? parseDecimal(currentResultsState.positionSize) : null,
            isRiskAmountLocked: false,
        }));

        app.calculateAndDisplay();
    },

    /**
     * Toggles the lock for the risk amount.
     * When enabled, the risk amount in the account currency is maintained.
     * @param forceState - Optional. A boolean to set the state directly.
     */
    toggleRiskAmountLock: (forceState?: boolean) => {
        const currentTradeState = get(tradeStore);
        const shouldBeLocked = forceState !== undefined ? forceState : !currentTradeState.isRiskAmountLocked;

        if (shouldBeLocked && parseDecimal(currentTradeState.riskAmount).lte(0)) {
            uiStore.showError("Risk amount cannot be locked while it is invalid.");
            return;
        }

        updateTradeStore(state => ({
            ...state,
            isRiskAmountLocked: shouldBeLocked,
            isPositionSizeLocked: false,
            lockedPositionSize: null,
        }));

        app.calculateAndDisplay();
    },

    /**
     * Adds a new (empty) row for a Take-Profit target.
     */
    addTakeProfitRow: (price: number | null = null, percent: number | null = null, isLocked = false) => {
        updateTradeStore(state => ({
            ...state,
            targets: [...state.targets, { price: price !== null ? new Decimal(price) : null, percent: percent !== null ? new Decimal(percent) : null, isLocked }]
        }));
    },

    /**
     * Automatically adjusts the percentages of unlocked Take-Profit targets
     * so that the total sum (including locked targets) equals 100%.
     * @param changedIndex - The index of the target that was last changed.
     */
    adjustTpPercentages: (changedIndex: number | null) => {
        const currentAppState = get(tradeStore);
        const originalTargets = currentAppState.targets;

        if (changedIndex !== null && originalTargets[changedIndex]?.isLocked) {
            return;
        }

        const targets = JSON.parse(JSON.stringify(originalTargets));
        const ONE_HUNDRED = new Decimal(100);
        const ZERO = new Decimal(0);

        const decTargets = targets.map((t: TakeProfitTarget) => ({
            price: t.price,
            percent: parseDecimal(t.percent),
            isLocked: t.isLocked,
        }));

        const lockedSum = decTargets
            .filter((t: TakeProfitTarget) => t.isLocked)
            .reduce((sum: Decimal, t: {percent: Decimal}) => sum.plus(t.percent), ZERO);

        if (lockedSum.gt(ONE_HUNDRED)) return;

        const unlockedTargets = decTargets.filter((t: TakeProfitTarget) => !t.isLocked);
        if (unlockedTargets.length === 0) return;

        const unlockedTargetSum = ONE_HUNDRED.minus(lockedSum);
        const unlockedCurrentSum = unlockedTargets.reduce((sum: Decimal, t: {percent: Decimal}) => sum.plus(t.percent), ZERO);

        if (unlockedCurrentSum.equals(unlockedTargetSum) && unlockedTargets.every((t: {percent: Decimal}) => t.percent.isInteger())) {
            return;
        }

        if (unlockedCurrentSum.isZero()) {
            if (unlockedTargetSum.gt(0)) {
                const share = unlockedTargetSum.div(unlockedTargets.length);
                unlockedTargets.forEach((t: {percent: Decimal}) => t.percent = share);
            }
        } else {
            const scalingFactor = unlockedTargetSum.div(unlockedCurrentSum);
            unlockedTargets.forEach((t: {percent: Decimal}) => t.percent = t.percent.times(scalingFactor));
        }

        let roundedSum = ZERO;
        for (let i = 0; i < unlockedTargets.length - 1; i++) {
            const rounded = unlockedTargets[i].percent.toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
            unlockedTargets[i].percent = rounded;
            roundedSum = roundedSum.plus(rounded);
        }

        if (unlockedTargets.length > 0) {
            const lastTarget = unlockedTargets[unlockedTargets.length - 1];
            lastTarget.percent = unlockedTargetSum.minus(roundedSum).toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
        }

        const finalTargets = decTargets.map((t: TakeProfitTarget) => ({
            price: t.price,
            percent: t.percent, // Keep as Decimal
            isLocked: t.isLocked
        }));

        const hasChanged = originalTargets.length !== finalTargets.length || originalTargets.some((original, index) => {
            const final = finalTargets[index];
            const originalPercent = original.percent ?? new Decimal(0);
            const finalPercent = final.percent ?? new Decimal(0);
            return !originalPercent.equals(finalPercent) || original.isLocked !== final.isLocked;
        });

        if (hasChanged) {
            updateTradeStore(state => ({ ...state, targets: finalTargets }));
        }
    },
};
