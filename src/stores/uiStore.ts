import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { CONSTANTS } from '../lib/constants';

/**
 * Defines the structure for the state of the user interface (UI).
 */
interface UiState {
    /** The currently active color theme (e.g., 'dark', 'light'). */
    currentTheme: string;
    /** Controls the visibility of the journal modal. */
    showJournalModal: boolean;
    /** Controls the visibility of the changelog modal. */
    showChangelogModal: boolean;
    /** Controls the visibility of the guide modal. */
    showGuideModal: boolean;
    /** Shows a brief confirmation after copying content. */
    showCopyFeedback: boolean;
    /** Shows a brief confirmation after saving. */
    showSaveFeedback: boolean;
    /** The error message to be displayed. */
    errorMessage: string;
    /** Controls the visibility of the error banner. */
    showErrorMessage: boolean;
    /** Indicates if a price is currently being fetched from the API. */
    isPriceFetching: boolean;
    /** A list of symbol suggestions for the input. */
    symbolSuggestions: string[];
    /** Controls the visibility of the symbol suggestions. */
    showSymbolSuggestions: boolean;
}

const initialUiState: UiState = {
    currentTheme: 'dark', // Always default to 'dark' to prevent hydration mismatch
    showJournalModal: false,
    showChangelogModal: false,
    showGuideModal: false,
    showCopyFeedback: false,
    showSaveFeedback: false,
    errorMessage: '',
    showErrorMessage: false,
    isPriceFetching: false,
    symbolSuggestions: [],
    showSymbolSuggestions: false,
};

/**
 * Creates a custom Svelte store for managing UI state.
 * This pattern allows encapsulating custom logic (e.g., `setTheme`) alongside
 * the standard store methods (`subscribe`, `update`, `set`).
 * @returns An object with store methods and custom actions.
 */
function createUiStore() {
    const { subscribe, update, set } = writable<UiState>(initialUiState);
    let feedbackTimeoutId: number | null = null;

    return {
        subscribe,
        update,
        set,
        /**
         * Sets the color theme for the application.
         * Updates the body tag, and saves the setting to Local Storage and cookies.
         * @param themeName - The name of the theme to activate.
         */
        setTheme: (themeName: string) => {
            update(state => ({ ...state, currentTheme: themeName }));
            if (browser) {
                document.body.classList.forEach(className => {
                    if (className.startsWith('theme-')) {
                        document.body.classList.remove(className);
                    }
                });
                if (themeName !== 'dark') {
                    document.body.classList.add(`theme-${themeName}`);
                }
                try {
                    localStorage.setItem(CONSTANTS.LOCAL_STORAGE_THEME_KEY, themeName);
                    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString(); // 1 year
                    document.cookie = `${CONSTANTS.LOCAL_STORAGE_THEME_KEY}=${themeName}; expires=${expires}; path=/; SameSite=Lax`;
                } catch (e) {
                    console.warn("Could not save theme.", e);
                }
            }
        },
        /** Toggles the visibility of the journal modal. */
        toggleJournalModal: (show: boolean) => update(state => ({ ...state, showJournalModal: show })),
        /** Toggles the visibility of the changelog modal. */
        toggleChangelogModal: (show: boolean) => update(state => ({ ...state, showChangelogModal: show })),
        /** Toggles the visibility of the guide modal. */
        toggleGuideModal: (show: boolean) => update(state => ({ ...state, showGuideModal: show })),
        /**
         * Shows a brief feedback banner (e.g., for "Copied" or "Saved").
         * @param type - The type of feedback ('copy' or 'save').
         * @param duration - The display duration in milliseconds.
         */
        showFeedback: (type: 'copy' | 'save', duration = 2000) => {
            const key = type === 'copy' ? 'showCopyFeedback' : 'showSaveFeedback';

            // BUGFIX: Clear any existing timeout to prevent premature closing of the new feedback.
            if (feedbackTimeoutId) {
                clearTimeout(feedbackTimeoutId);
            }

            update(state => ({ ...state, [key]: true }));

            feedbackTimeoutId = window.setTimeout(() => {
                update(state => ({ ...state, [key]: false }));
                feedbackTimeoutId = null;
            }, duration);
        },
        /** Displays an error message. */
        showError: (message: string) => update(state => ({ ...state, errorMessage: message, showErrorMessage: true })),
        /** Hides the current error message. */
        hideError: () => update(state => ({ ...state, errorMessage: '', showErrorMessage: false })),
    };
}

/**
 * The Svelte store for managing the global UI state.
 * Contains logic for controlling modals, themes, feedback, and error messages.
 */
export const uiStore = createUiStore();
