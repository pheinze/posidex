import { get } from 'svelte/store';
import { debounce, parseDecimal, formatDynamicDecimal } from '../utils/utils';
import { CONSTANTS, themes } from '../lib/constants';
import { apiService } from './apiService';
import { modalManager } from './modalManager';
import { uiManager } from './uiManager';
import { calculator } from '../lib/calculator';
import { tradeStore, updateTradeStore, resetAllInputs, toggleAtrInputs } from '../stores/tradeStore';
import { resultsStore, initialResultsState } from '../stores/resultsStore';
import { presetStore, updatePresetStore } from '../stores/presetStore';
import { journalStore } from '../stores/journalStore';
import { uiStore } from '../stores/uiStore';
import type { AppState, JournalEntry, TradeValues, IndividualTpResult } from '../stores/types';
import { Decimal } from 'decimal.js';
import { browser } from '$app/environment';

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
    [key: string]: string | undefined; // For dynamic access to TP keys
}

export const app = {
    calculator: calculator, // Expose calculator for use in Svelte components
    uiManager: uiManager,


    init: () => {
        if (browser) {
            // The theme is now handled by SSR in +layout.server.ts and +layout.svelte
            // No need to re-apply it client-side on init, as it would cause a flash.
            // The setTheme function is still used when the user explicitly changes the theme via UI.
            app.loadSettings();
            app.populatePresetLoader();
            app.calculateAndDisplay();
        }
    },

    calculateAndDisplay: () => {
        uiStore.hideError();
        const currentTradeState = get(tradeStore);
        const newResults = { ...initialResultsState };

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

            if (values.accountSize.lte(0) || values.riskPercentage.lte(0) || values.entryPrice.lte(0) || values.stopLossPrice.lte(0)) {
                return { status: CONSTANTS.STATUS_INCOMPLETE };
            }

            if (currentTradeState.tradeType === CONSTANTS.TRADE_TYPE_LONG && values.entryPrice.lte(values.stopLossPrice)) {
                return { status: CONSTANTS.STATUS_INVALID, message: "Long: Stop-Loss muss unter dem Kaufpreis liegen.", fields: ['stopLossPrice', 'entryPrice'] };
            }
            if (currentTradeState.tradeType === CONSTANTS.TRADE_TYPE_SHORT && values.entryPrice.gte(values.stopLossPrice)) {
                return { status: CONSTANTS.STATUS_INVALID, message: "Short: Stop-Loss muss über dem Verkaufspreis liegen.", fields: ['stopLossPrice', 'entryPrice'] };
            }

            for (const tp of values.targets) {
                if (tp.price.gt(0)) {
                    if (currentTradeState.tradeType === CONSTANTS.TRADE_TYPE_LONG) {
                        if (tp.price.lte(values.stopLossPrice)) return { status: CONSTANTS.STATUS_INVALID, message: `Long: Take-Profit Ziel ${tp.price.toFixed(4)} muss über dem Stop-Loss liegen.`, fields: ['targets'] };
                        if (tp.price.lte(values.entryPrice)) return { status: CONSTANTS.STATUS_INVALID, message: `Long: Take-Profit Ziel ${tp.price.toFixed(4)} muss über dem Einstiegspreis liegen.`, fields: ['targets'] };
                    } else {
                        if (tp.price.gte(values.stopLossPrice)) return { status: CONSTANTS.STATUS_INVALID, message: `Short: Take-Profit Ziel ${tp.price.toFixed(4)} muss unter dem Stop-Loss liegen.`, fields: ['targets'] };
                        if (tp.price.gte(values.entryPrice)) return { status: CONSTANTS.STATUS_INVALID, message: `Short: Take-Profit Ziel ${tp.price.toFixed(4)} muss unter dem Einstiegspreis liegen.`, fields: ['targets'] };
                    }
                }
            }

            values.totalPercentSold = values.targets.reduce((sum: Decimal, t) => sum.plus(t.percent), new Decimal(0));
            if (values.totalPercentSold.gt(100)) {
                return { status: CONSTANTS.STATUS_INVALID, message: `Die Summe der Verkaufsprozente (${values.totalPercentSold.toFixed(0)}%) darf 100% nicht überschreiten.`, fields: [] };
            }

            return { status: CONSTANTS.STATUS_VALID, data: values };
        };

        const validationResult = getAndValidateInputs();

        if (validationResult.status === CONSTANTS.STATUS_INVALID) {
            uiStore.showError(validationResult.message || "");
            app.clearResults();
            return;
        }

        if (validationResult.status === CONSTANTS.STATUS_INCOMPLETE) {
            app.clearResults(true);
            return;
        }

        let values = validationResult.data as TradeValues;
        let baseMetrics;

        if (currentTradeState.isPositionSizeLocked && currentTradeState.lockedPositionSize && currentTradeState.lockedPositionSize.gt(0)) {
            const riskPerUnit = values.entryPrice.minus(values.stopLossPrice).abs();
            if (riskPerUnit.lte(0)) {
                uiStore.showError("Stop-Loss muss einen gültigen Abstand zum Einstiegspreis haben.");
                app.clearResults();
                return;
            }
            const riskAmount = riskPerUnit.times(currentTradeState.lockedPositionSize);
            const newRiskPercentage = values.accountSize.isZero() ? new Decimal(0) : riskAmount.div(values.accountSize).times(100);

            updateTradeStore(state => ({ ...state, riskPercentage: newRiskPercentage.toFixed(2) }));
            values.riskPercentage = newRiskPercentage;

            baseMetrics = calculator.calculateBaseMetrics(values, currentTradeState.tradeType);
            if (baseMetrics) baseMetrics.positionSize = currentTradeState.lockedPositionSize;
        } else {
            baseMetrics = calculator.calculateBaseMetrics(values, currentTradeState.tradeType);
        }

        if (!baseMetrics || baseMetrics.positionSize.lte(0)) {
            app.clearResults();
            if (currentTradeState.isPositionSizeLocked) app.togglePositionSizeLock(false);
            return;
        }

        newResults.positionSize = formatDynamicDecimal(baseMetrics.positionSize, 4);
        newResults.requiredMargin = formatDynamicDecimal(baseMetrics.requiredMargin, 2);
        newResults.netLoss = `-${formatDynamicDecimal(baseMetrics.netLoss, 2)}`;
        newResults.liquidationPrice = values.leverage.gt(1) ? formatDynamicDecimal(baseMetrics.liquidationPrice) : 'N/A';
        newResults.breakEvenPrice = formatDynamicDecimal(baseMetrics.breakEvenPrice);
        newResults.entryFee = formatDynamicDecimal(baseMetrics.entryFee, 4);

        const calculatedTpDetails: IndividualTpResult[] = [];
        values.targets.forEach((tp, index) => {
            if (tp.price.gt(0) && tp.percent.gt(0)) {
                const details = calculator.calculateIndividualTp(tp.price, tp.percent, baseMetrics, values, index);
                if ((currentTradeState.tradeType === 'long' && tp.price.gt(values.entryPrice)) || (currentTradeState.tradeType === 'short' && tp.price.lt(values.entryPrice))) {
                   calculatedTpDetails.push(details);
                }
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
            newResults.maxPotentialProfit = `+${formatDynamicDecimal(totalMetrics.maxPotentialProfit, 2)}`;
            newResults.showTotalMetricsGroup = true;
        } else {
            newResults.showTotalMetricsGroup = false;
        }

        resultsStore.set(newResults);

        updateTradeStore(state => ({ ...state, currentTradeData: { ...values, ...baseMetrics, ...totalMetrics, tradeType: currentTradeState.tradeType, status: 'Open', calculatedTpDetails } }));
        app.saveSettings();
    },

    clearResults: (showGuidance = false) => {
        resultsStore.set(initialResultsState);
        if (showGuidance) {
            uiStore.showError('dashboard.promptForData');
        } else {
            uiStore.hideError();
        }
    },

    getJournal: (): JournalEntry[] => {
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
            uiStore.showError("Journal konnte nicht geladen werden.");
            return [];
        }
    },
    saveJournal: (d: JournalEntry[]) => {
        if (!browser) return;
        try {
            localStorage.setItem(CONSTANTS.LOCAL_STORAGE_JOURNAL_KEY, JSON.stringify(d));
        } catch (e) {
            console.warn("Could not save journal to localStorage.", e);
            uiStore.showError("Fehler beim Speichern des Journals. Der lokale Speicher ist möglicherweise voll oder blockiert.");
        }
    },
    addTrade: () => {
        const currentAppState = get(tradeStore);
        if (!currentAppState.currentTradeData.positionSize || currentAppState.currentTradeData.positionSize.lte(0)) { uiStore.showError("Kann keinen ungültigen Trade speichern."); return; }
        const journalData = app.getJournal();
        journalData.push({ ...currentAppState.currentTradeData, notes: currentAppState.tradeNotes, id: Date.now(), date: new Date().toISOString() } as JournalEntry);
        app.saveJournal(journalData);
        journalStore.set(journalData);
        uiStore.showFeedback('save');
    },
    updateTradeStatus: (id: number, newStatus: string) => {
        const journalData = app.getJournal();
        const tradeIndex = journalData.findIndex(t => t.id == id);
        if (tradeIndex !== -1) {
            journalData[tradeIndex].status = newStatus;
            app.saveJournal(journalData);
            journalStore.set(journalData);
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
            uiStore.showError("Das Journal ist bereits leer.");
            return;
        }
        if (await modalManager.show("Journal leeren", "Möchten Sie wirklich das gesamte Journal unwiderruflich löschen?", "confirm")) {
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
            localStorage.setItem(CONSTANTS.LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(app.getInputsAsObject()));
        } catch (e) {
            console.warn("Could not save settings to localStorage.", e);
        }
    },
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
                    accountSize: settings.accountSize || '',
                    riskPercentage: settings.riskPercentage || '',
                    leverage: settings.leverage || CONSTANTS.DEFAULT_LEVERAGE,
                    fees: settings.fees || CONSTANTS.DEFAULT_FEES,
                    symbol: settings.symbol || '',
                    atrValue: settings.atrValue || '',
                    atrMultiplier: settings.atrMultiplier || CONSTANTS.DEFAULT_ATR_MULTIPLIER,
                    useAtrSl: settings.useAtrSl || false,
                    tradeType: settings.tradeType || CONSTANTS.TRADE_TYPE_LONG,
                    targets: settings.targets || [
                        { price: '', percent: '', isLocked: false },
                        { price: '', percent: '', isLocked: false },
                        { price: '', percent: '', isLocked: false }
                    ],
                    // selectedPreset: presetName, // THIS LINE IS REMOVED
                }));
                toggleAtrInputs(settings.useAtrSl || false);
                return;
            }
        } catch (e) {
            console.warn("Could not load settings from localStorage.", e);
        }
    },
    savePreset: async () => {
        if (!browser) return;
        const presetName = await modalManager.show("Preset speichern", "Geben Sie einen Namen für Ihr Preset ein:", "prompt");
        if (!presetName) return;
        try {
            const presets = JSON.parse(localStorage.getItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY) || '{}');
            if (presets[presetName] && !(await modalManager.show("Überschreiben?", `Preset \"${presetName}\" existiert bereits. Möchten Sie es überschreiben?`, "confirm"))) return;
            presets[presetName] = app.getInputsAsObject();
            localStorage.setItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY, JSON.stringify(presets));
            uiStore.showFeedback('save');
            app.populatePresetLoader();
            updatePresetStore(state => ({ ...state, selectedPreset: presetName }));
        } catch (e) {
            console.error("Fehler beim Speichern des Presets:", e);
            uiStore.showError("Preset konnte nicht gespeichert werden. Der lokale Speicher ist möglicherweise voll oder blockiert.");
        }
    },
    deletePreset: async () => {
        if (!browser) return;
        const presetName = get(presetStore).selectedPreset;
        if (!presetName) return;
        if (!(await modalManager.show("Preset löschen", `Preset \"${presetName}\" wirklich löschen?`, "confirm"))) return;
        try {
            const presets = JSON.parse(localStorage.getItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY) || '{}');
            delete presets[presetName];
            localStorage.setItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY, JSON.stringify(presets));
            app.populatePresetLoader();
            updatePresetStore(state => ({ ...state, selectedPreset: '' }));
        } catch (e) { uiStore.showError("Preset konnte nicht gelöscht werden."); }
    },
    loadPreset: (presetName: string) => {
        if (!browser) return;
        if (!presetName) return;
        try {
            const presets = JSON.parse(localStorage.getItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY) || '{}');
            const preset = presets[presetName];
            if (preset) {
                resetAllInputs();
                updateTradeStore(state => ({
                    ...state,
                    accountSize: preset.accountSize || '',
                    riskPercentage: preset.riskPercentage || '',
                    leverage: preset.leverage || CONSTANTS.DEFAULT_LEVERAGE,
                    fees: preset.fees || CONSTANTS.DEFAULT_FEES,
                    symbol: preset.symbol || '',
                    atrValue: preset.atrValue || '',
                    atrMultiplier: preset.atrMultiplier || CONSTANTS.DEFAULT_ATR_MULTIPLIER,
                    useAtrSl: preset.useAtrSl || false,
                    tradeType: preset.tradeType || CONSTANTS.TRADE_TYPE_LONG,
                    targets: preset.targets || [
                        { price: '', percent: '', isLocked: false },
                        { price: '', percent: '', isLocked: false },
                        { price: '', percent: '', isLocked: false }
                    ],
                }));
                updatePresetStore(state => ({ ...state, selectedPreset: presetName }));
                toggleAtrInputs(preset.useAtrSl || false);
                return;
            }
        } catch (e) {
            console.error("Fehler beim Laden des Presets:", e);
            uiStore.showError("Preset konnte nicht geladen werden.");
        }
    },
    populatePresetLoader: () => {
        if (!browser) return;
        try {
            const presets = JSON.parse(localStorage.getItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY) || '{}');
            const presetNames = Object.keys(presets);
            updatePresetStore(state => ({ ...state, availablePresets: presetNames }));
        } catch (e) {
            console.warn("Could not populate presets from localStorage.", e);
            updatePresetStore(state => ({ ...state, availablePresets: [] }));
        }
    },
    exportToCSV: () => {
        if (!browser) return;
        const journalData = get(journalStore);
        if (journalData.length === 0) { uiStore.showError("Journal ist leer."); return; }
        const headers = ['ID', 'Datum', 'Uhrzeit', 'Symbol', 'Typ', 'Status', 'Konto Guthaben', 'Risiko %', 'Hebel', 'Gebuehren %', 'Einstieg', 'Stop Loss', 'Gewichtetes R/R', 'Gesamt Netto-Gewinn', 'Risiko pro Trade (Waehrung)', 'Gesamte Gebuehren', 'Max. potenzieller Gewinn', 'Notizen', ...Array.from({length: 5}, (_, i) => [`TP${i+1} Preis`, `TP${i+1} %`]).flat()];
        const rows = journalData.map(trade => {
            const date = new Date(trade.date);
            const notes = trade.notes ? `"${trade.notes.replace(/"/g, '""').replace(/\n/g, ' ')}"` : '';
            const tpData = Array.from({length: 5}, (_, i) => [ (trade.targets[i]?.price || new Decimal(0)).toFixed(4), (trade.targets[i]?.percent || new Decimal(0)).toFixed(2) ]).flat();
            return [ trade.id, date.toLocaleDateString('de-DE'), date.toLocaleTimeString('de-DE'), trade.symbol, trade.tradeType, trade.status,
                (trade.accountSize || new Decimal(0)).toFixed(2), (trade.riskPercentage || new Decimal(0)).toFixed(2), (trade.leverage || new Decimal(0)).toFixed(2), (trade.fees || new Decimal(0)).toFixed(2), (trade.entryPrice || new Decimal(0)).toFixed(4), (trade.stopLossPrice || new Decimal(0)).toFixed(4),
                (trade.totalRR || new Decimal(0)).toFixed(2), (trade.totalNetProfit || new Decimal(0)).toFixed(2), (trade.riskAmount || new Decimal(0)).toFixed(2), (trade.totalFees || new Decimal(0)).toFixed(2), (trade.maxPotentialProfit || new Decimal(0)).toFixed(2), notes, ...tpData ].join(',');
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
                uiStore.showError("CSV ist leer oder hat nur eine Kopfzeile.");
                return;
            }

            const headers = lines[0].split(',').map(h => h.trim());
            const requiredHeaders = ['ID', 'Datum', 'Uhrzeit', 'Symbol', 'Typ', 'Status', 'Einstieg', 'Stop Loss'];
            const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

            if (missingHeaders.length > 0) {
                uiStore.showError(`CSV-Datei fehlen benötigte Spalten: ${missingHeaders.join(', ')}`);
                return;
            }

            const entries = lines.slice(1).map(line => {
                const values = line.split(',');
                const entry: CSVTradeEntry = headers.reduce((obj: Partial<CSVTradeEntry>, header, index) => {
                    obj[header as keyof CSVTradeEntry] = values[index] ? values[index].trim() : '';
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

                    const typedEntry = entry as CSVTradeEntry;
                    return {
                        id: parseInt(typedEntry.ID, 10),
                        date: new Date(`${typedEntry.Datum} ${typedEntry.Uhrzeit}`).toISOString(),
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
                        maxPotentialProfit: parseDecimal(typedEntry['Max. potenzieller Gewinn'] || '0'),
                        notes: typedEntry.Notizen ? typedEntry.Notizen.replace(/""/g, '"').slice(1, -1) : '',
                        targets: targets
                    } as JournalEntry;
                } catch (err) {
                    console.warn("Fehler beim Verarbeiten einer Zeile:", entry, err);
                    return null;
                }
            }).filter(Boolean) as JournalEntry[];

            if (entries.length > 0) {
                const currentJournal = get(journalStore);
                const combined = [...currentJournal, ...entries];
                const unique = Array.from(new Map(combined.map(trade => [trade.id, trade])).values());

                if (await modalManager.show("Import bestätigen", `Sie sind dabei, ${entries.length} Trades zu importieren. Bestehende Trades mit derselben ID werden überschrieben. Fortfahren?`, "confirm")) {
                    journalStore.set(unique);
                    uiStore.showFeedback('save', 2000);
                }
            } else {
                uiStore.showError("Keine gültigen Einträge in der CSV-Datei gefunden.");
            }
        };
        reader.readAsText(file);
    },

    handleFetchPrice: async () => {
        const currentTradeState = get(tradeStore);
        const symbol = currentTradeState.symbol.toUpperCase().replace('/', '');
        if (!symbol) {
            uiStore.showError("Bitte geben Sie ein Symbol ein.");
            return;
        }
        uiStore.update(state => ({ ...state, isPriceFetching: true }));
        try {
            const price = await apiService.fetchBinancePrice(symbol);
            updateTradeStore(state => ({ ...state, entryPrice: price.toDP(4).toString() }));
            uiStore.showFeedback('copy', 700); // Reusing copy feedback for price loaded animation
            app.calculateAndDisplay();
        } catch (error: any) {
            uiStore.showError(error.message);
        } finally {
            uiStore.update(state => ({ ...state, isPriceFetching: false }));
        }
    },

    selectSymbolSuggestion: (symbol: string) => {
        updateTradeStore(s => ({ ...s, symbol: symbol }));
        uiStore.update(s => ({ ...s, showSymbolSuggestions: false, symbolSuggestions: [] }));
        app.handleFetchPrice();
    },

    updateSymbolSuggestions: (query: string) => {
        const upperQuery = query.toUpperCase().replace('/', '');
        let filtered: string[] = [];
        if (upperQuery) {
            filtered = CONSTANTS.SUGGESTED_SYMBOLS.filter(s => s.startsWith(upperQuery));
        }
        uiStore.update(s => ({ ...s, symbolSuggestions: filtered, showSymbolSuggestions: filtered.length > 0 }));
    },
    togglePositionSizeLock: (forceState?: boolean) => {
        const currentTradeState = get(tradeStore);
        const currentResultsState = get(resultsStore);
        const shouldBeLocked = forceState !== undefined ? forceState : !currentTradeState.isPositionSizeLocked;

        if (shouldBeLocked && (!currentResultsState.positionSize || parseDecimal(currentResultsState.positionSize).lte(0))) {
            uiStore.showError("Positionsgröße kann nicht gesperrt werden, solange sie ungültig ist.");
            return;
        }

        updateTradeStore(state => ({
            ...state,
            isPositionSizeLocked: shouldBeLocked,
            lockedPositionSize: shouldBeLocked ? parseDecimal(currentResultsState.positionSize) : null
        }));

        app.calculateAndDisplay();
    },
    addTakeProfitRow: (price: string = '', percent: string = '', isLocked = false) => {
        updateTradeStore(state => ({
            ...state,
            targets: [...state.targets, { price, percent, isLocked }]
        }));
    },
    adjustTpPercentages: (changedIndex: number | null) => {
        const currentAppState = get(tradeStore);

        // Guard clause: If the target that triggered the change is locked, do nothing.
        if (changedIndex !== null && currentAppState.targets[changedIndex].isLocked) {
            return;
        }

        const targets = JSON.parse(JSON.stringify(currentAppState.targets));
        const ONE_HUNDRED = new Decimal(100);
        const ZERO = new Decimal(0);

        const decTargets = targets.map((t: any, i: number) => ({
            ...t,
            percent: parseDecimal(t.percent),
            originalIndex: i
        }));

        const totalSum = decTargets.reduce((sum: Decimal, t: any) => sum.plus(t.percent), ZERO);
        const diff = ONE_HUNDRED.minus(totalSum);

        if (diff.isZero()) return;

        const otherUnlocked = decTargets.filter((t: any) => !t.isLocked && t.originalIndex !== changedIndex);

        // Edge Case: No other fields to adjust, so revert the change on the current field.
        if (otherUnlocked.length === 0) {
            if (changedIndex !== null) {
                decTargets[changedIndex].percent = decTargets[changedIndex].percent.plus(diff);
            }
        }
        // --- Handle Surplus (diff > 0): A value was decreased or a TP was removed ---
        else if (diff.gt(ZERO)) {
            if (otherUnlocked.length > 0) {
                const share = diff.div(otherUnlocked.length);
                otherUnlocked.forEach((t: any) => {
                    decTargets[t.originalIndex].percent = decTargets[t.originalIndex].percent.plus(share);
                });
            }
        }
        // --- Handle Deficit (diff < 0): A value was increased ---
        else {
            let deficit = diff.abs();
            for (let i = otherUnlocked.length - 1; i >= 0; i--) {
                if (deficit.isZero()) break;
                const target = otherUnlocked[i];
                const originalTarget = decTargets[target.originalIndex];
                const reduction = Decimal.min(deficit, originalTarget.percent);

                originalTarget.percent = originalTarget.percent.minus(reduction);
                deficit = deficit.minus(reduction);
            }
        }

        // --- Final Rounding and Store Update ---
        let finalTargets = decTargets.map((t: any) => ({
            ...t,
            percent: t.percent.toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toFixed(0)
        }));

        let finalSum = finalTargets.reduce((sum: Decimal, t: any) => sum.plus(parseDecimal(t.percent)), ZERO);
        let roundingDiff = ONE_HUNDRED.minus(finalSum);

        if (!roundingDiff.isZero()) {
            // Adjust the first available unlocked target that is not the one the user just changed
            let targetToAdjust = finalTargets.find((t: any, i: number) => !t.isLocked && i !== changedIndex && parseDecimal(t.percent).plus(roundingDiff).gte(0));
            // If none found, try the one the user changed (as a last resort)
            if (!targetToAdjust) {
                targetToAdjust = finalTargets.find((t: any, i: number) => !t.isLocked && parseDecimal(t.percent).plus(roundingDiff).gte(0));
            }
            if (targetToAdjust) {
                targetToAdjust.percent = parseDecimal(targetToAdjust.percent).plus(roundingDiff).toFixed(0);
            }
        }

        updateTradeStore(state => ({ ...state, targets: finalTargets.map((t: { price: string; percent: string; isLocked: boolean; }) => ({price: t.price, percent: t.percent, isLocked: t.isLocked})) }));
    },
};
