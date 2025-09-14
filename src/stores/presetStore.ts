import { writable, derived } from 'svelte/store';
import { tradeStore } from './tradeStore';
import type { AppState } from './types';

// The subset of the app state that is saved in a preset
export type PresetInputs = Pick<AppState,
    'accountSize' |
    'riskPercentage' |
    'leverage' |
    'fees' |
    'tradeType' |
    'useAtrSl' |
    'atrMultiplier' |
    'symbol' |
    'targets' |
    'tradeNotes'
>;

export interface PresetState {
    availablePresets: string[];
    selectedPreset: string;
    savedState: PresetInputs | null;
}

const initialPresetState: PresetState = {
    availablePresets: [],
    selectedPreset: '',
    savedState: null,
};

export const presetStore = writable<PresetState>(initialPresetState);

export const updatePresetStore = (updater: (state: PresetState) => PresetState) => {
    presetStore.update(updater);
};

export const isDirty = derived(
    [tradeStore, presetStore],
    ([$tradeStore, $presetStore]) => {
        if (!$presetStore.savedState) {
            // If there's no saved state, any input is a change.
            // This handles the initial state of the app.
            return true;
        }

        // Create a representation of the current inputs
        const currentState: PresetInputs = {
            accountSize: $tradeStore.accountSize,
            riskPercentage: $tradeStore.riskPercentage,
            leverage: $tradeStore.leverage,
            fees: $tradeStore.fees,
            tradeType: $tradeStore.tradeType,
            useAtrSl: $tradeStore.useAtrSl,
            atrMultiplier: $tradeStore.atrMultiplier,
            symbol: $tradeStore.symbol,
            targets: $tradeStore.targets,
            tradeNotes: $tradeStore.tradeNotes
        };

        // Deep comparison
        return JSON.stringify(currentState) !== JSON.stringify($presetStore.savedState);
    }
);
