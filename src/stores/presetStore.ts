import { writable, get } from 'svelte/store';
import { tradeStore, updateTradeStore, resetAllInputs } from './tradeStore';
import { CONSTANTS } from '../lib/constants';

// This interface defines which parts of the application state are saved in a preset.
export interface PresetState {
    accountSize: string;
    riskPercentage: string;
    leverage: string;
    fees: string;
    tradeType: string;
    useAtrSl: boolean;
    atrMultiplier: string;
    symbol: string;
    targets: Array<{ price: string; percent: string; isLocked: boolean }>;
}

export interface Preset {
    name: string;
    state: PresetState;
}

function getPresetsFromStorage(): Preset[] {
    if (typeof window === 'undefined') {
        return [];
    }
    const presets = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY);
    return presets ? JSON.parse(presets) : [];
}

function savePresetsToStorage(presets: Preset[]) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY, JSON.stringify(presets));
    }
}

export const availablePresets = writable<string[]>([]);
export const selectedPreset = writable<string>('');

export function updateAvailablePresets() {
    const presets = getPresetsFromStorage();
    availablePresets.set(presets.map(p => p.name));
}

export function savePreset(name: string) {
    const currentTradeState = get(tradeStore);
    const stateToSave: PresetState = {
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

    const presets = getPresetsFromStorage();
    const presetToSave = { name, state: stateToSave };

    const existingIndex = presets.findIndex(p => p.name === name);
    if (existingIndex > -1) {
        presets[existingIndex] = presetToSave;
    } else {
        presets.push(presetToSave);
    }

    savePresetsToStorage(presets);
    updateAvailablePresets();
    selectedPreset.set(name);
}

export function deletePreset(name: string) {
    let presets = getPresetsFromStorage();
    presets = presets.filter(p => p.name !== name);
    savePresetsToStorage(presets);

    selectedPreset.set('');
    updateAvailablePresets();
}

export function loadPreset(name: string) {
    if (!name) {
        // If the selected preset is cleared, reset the form.
        resetAllInputs();
        return;
    };

    const presets = getPresetsFromStorage();
    const preset = presets.find(p => p.name === name);

    if (preset) {
        // Resetting all inputs first ensures a clean slate before loading preset values.
        resetAllInputs();
        updateTradeStore(s => ({ ...s, ...preset.state }));
    }
    // The selectedPreset store is updated automatically via `bind:value` in the UI.
    // Manually setting it here could cause issues if the load is triggered from other places.
}

// Initialize on load
if (typeof window !== 'undefined') {
    updateAvailablePresets();
}
