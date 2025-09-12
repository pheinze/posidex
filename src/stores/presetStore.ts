import { writable } from 'svelte/store';

/**
 * Defines the structure for the state of user-defined presets.
 */
export interface PresetState {
    /** A list of the names of all available presets. */
    availablePresets: string[];
    /** The name of the currently selected preset. */
    selectedPreset: string;
}

/**
 * The initial state for the `presetStore`.
 */
const initialPresetState: PresetState = {
    availablePresets: [],
    selectedPreset: '',
};

/**
 * A Svelte `writable` store for managing the state of user presets.
 * Includes the list of available presets and the currently selected one.
 */
export const presetStore = writable<PresetState>(initialPresetState);

/**
 * Updates the `presetStore` using an updater function.
 * @param updater - A function that receives the current preset state and returns the new state.
 */
export const updatePresetStore = (updater: (state: PresetState) => PresetState) => {
    presetStore.update(updater);
};
