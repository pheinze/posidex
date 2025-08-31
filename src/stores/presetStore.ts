import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { CONSTANTS } from '../lib/constants';
import { modalManager } from '../services/modalManager';
import { uiStore } from './uiStore';
import { get } from 'svelte/store';
import { tradeStore, resetAllInputs, updateTradeStore } from './tradeStore';
import { app } from '../services/app';
import type { AppState } from './types';

interface PresetState {
    availablePresets: string[];
    selectedPreset: string;
}

const initialPresetState: PresetState = {
    availablePresets: [],
    selectedPreset: '',
};

const { subscribe, set, update } = writable<PresetState>(initialPresetState);

const getInputsAsObject = () => {
    const currentTradeState = get(tradeStore);
    return {
        accountSize: currentTradeState.accountSize,
        riskPercentage: currentTradeState.riskPercentage,
        leverage: currentTradeState.leverage,
        fees: currentTradeState.fees,
        tradeType: currentTradeState.tradeType,
        useAtrSl: currentTradeState.useAtrSl,
        atrMultiplier: currentTradeState.atrMultiplier,
        symbol: currentTradeState.symbol,
        targets: currentTradeState.targets,
    };
};

const presets = {
    subscribe,
    set,
    update,

    loadPresets: () => {
        if (!browser) return;
        try {
            const storedPresets = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY);
            const presets = storedPresets ? JSON.parse(storedPresets) : {};
            const presetNames = Object.keys(presets);
            update(state => ({ ...state, availablePresets: presetNames }));
        } catch (e) {
            console.warn("Could not populate presets from localStorage.", e);
            update(state => ({ ...state, availablePresets: [] }));
        }
    },

    saveCurrentPreset: async () => {
        if (!browser) return;
        const presetName = await modalManager.show("Preset speichern", "Geben Sie einen Namen für Ihr Preset ein:", "prompt");
        if (!presetName) return;

        try {
            const storedPresets = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY);
            const presets = storedPresets ? JSON.parse(storedPresets) : {};

            if (presets[presetName] && !(await modalManager.show("Überschreiben?", `Preset \"${presetName}\" existiert bereits. Möchten Sie es überschreiben?`, "confirm"))) {
                return;
            }

            presets[presetName] = getInputsAsObject();
            localStorage.setItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY, JSON.stringify(presets));

            uiStore.showFeedback('save');
            presets.loadPresets(); // Reload the list from the source of truth
            update(state => ({...state, selectedPreset: presetName }));

        } catch (e) {
            console.error("Fehler beim Speichern des Presets:", e);
            uiStore.showError("Preset konnte nicht gespeichert werden.");
        }
    },

    deleteSelectedPreset: async () => {
        if (!browser) return;
        const selectedPreset = get(presets).selectedPreset;
        if (!selectedPreset) return;

        if (!(await modalManager.show("Preset löschen", `Preset \"${selectedPreset}\" wirklich löschen?`, "confirm"))) {
            return;
        }

        try {
            const storedPresets = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY);
            const presetsData = storedPresets ? JSON.parse(storedPresets) : {};
            delete presetsData[selectedPreset];
            localStorage.setItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY, JSON.stringify(presetsData));

            presets.loadPresets(); // Reload the list
            update(state => ({...state, selectedPreset: '' }));
        } catch (e) {
            uiStore.showError("Preset konnte nicht gelöscht werden.");
        }
    },

    loadPreset: (presetName: string) => {
        if (!browser || !presetName) {
            if (!presetName) {
                resetAllInputs();
                update(state => ({ ...state, selectedPreset: '' }));
            }
            return;
        };

        try {
            const storedPresets = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY);
            const presets = storedPresets ? JSON.parse(storedPresets) : {};
            const presetData = presets[presetName];

            if (presetData) {
                resetAllInputs(); // Resets the tradeStore to its initial state
                // Now update the tradeStore with the loaded preset data
                updateTradeStore(state => ({
                    ...state,
                    accountSize: presetData.accountSize || '',
                    riskPercentage: presetData.riskPercentage || '',
                    leverage: presetData.leverage || CONSTANTS.DEFAULT_LEVERAGE,
                    fees: presetData.fees || CONSTANTS.DEFAULT_FEES,
                    symbol: presetData.symbol || '',
                    useAtrSl: presetData.useAtrSl || false,
                    atrMultiplier: presetData.atrMultiplier || CONSTANTS.DEFAULT_ATR_MULTIPLIER,
                    tradeType: presetData.tradeType || CONSTANTS.TRADE_TYPE_LONG,
                    targets: presetData.targets || CONSTANTS.DEFAULT_TARGETS,
                }));
                // Update the selected preset in our own store
                update(state => ({ ...state, selectedPreset: presetName }));
            }
        } catch (e) {
            console.error("Fehler beim Laden des Presets:", e);
            uiStore.showError("Preset konnte nicht geladen werden.");
        }
    }
};

export const presetStore = presets;
