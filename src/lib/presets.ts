import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { appStore, updateStore, clearResults, type AppState } from '$lib/stores';
import { CONSTANTS } from '$lib/constants';

/**
 * Loads all presets from localStorage.
 * @returns A record of preset names to preset data.
 */
export const loadPresets = (): Record<string, AppState> => {
	if (!browser) return {};
	try {
		const presets = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY);
		return presets ? JSON.parse(presets) : {};
	} catch (e) {
		console.warn('Could not load presets from localStorage.', e);
		return {};
	}
};

/**
 * Saves a preset to localStorage.
 * @param name The name of the preset.
 * @param data The preset data to save.
 */
export const savePreset = (name: string, data: AppState) => {
	if (!browser) return;
	const presets = loadPresets();
	presets[name] = data; // Assuming `data` is already an AppState object
	try {
		localStorage.setItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY, JSON.stringify(presets));
		updateStore((store) => ({
			...store,
			availablePresets: Object.keys(presets),
			selectedPreset: name
		}));
	} catch (e) {
		console.warn('Could not save preset to localStorage.', e);
	}
};

/**
 * Deletes a preset from localStorage.
 * @param name The name of the preset to delete.
 */
export const deletePreset = (name: string) => {
	if (!browser) return;
	const presets = loadPresets();
	delete presets[name];
	try {
		localStorage.setItem(CONSTANTS.LOCAL_STORAGE_PRESETS_KEY, JSON.stringify(presets));
		updateStore((store) => ({
			...store,
			availablePresets: Object.keys(presets), // Update available presets
			selectedPreset: get(appStore).selectedPreset === name ? '' : get(appStore).selectedPreset // Clear selected if deleted
		}));
	} catch (e) {
		console.warn('Could not delete preset from localStorage.', e);
	}
};

/**
 * Applies a preset to the current application state.
 * @param name The name of the preset to apply.
 */
export const applyPreset = (name: string) => {
	if (!browser) return;
	const presets = loadPresets();
	const preset = presets[name];

	if (preset) {
		updateStore((store) => ({ // Use updateStore from $lib/stores
			...store,
			...preset,
			selectedPreset: name
		}));
		clearResults(true); // Clear results and show guidance after applying preset
	}
};
