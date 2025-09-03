import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { CONSTANTS } from '../lib/constants';

interface UiState {
    currentTheme: string;
    showJournalModal: boolean;
    showChangelogModal: boolean;
    showCopyFeedback: boolean;
    showSaveFeedback: boolean;
    errorMessage: string;
    showErrorMessage: boolean;
    isPriceFetching: boolean;
    symbolSuggestions: string[];
    showSymbolSuggestions: boolean;
}

const initialUiState: UiState = {
    currentTheme: 'dark', // Always default to 'dark' to prevent hydration mismatch
    showJournalModal: false,
    showChangelogModal: false,
    showCopyFeedback: false,
    showSaveFeedback: false,
    errorMessage: '',
    showErrorMessage: false,
    isPriceFetching: false,
    symbolSuggestions: [],
    showSymbolSuggestions: false,
};

function createUiStore() {
    const { subscribe, update, set } = writable<UiState>(initialUiState);

    return {
        subscribe,
        update,
        set,
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
        toggleJournalModal: (show: boolean) => update(state => ({ ...state, showJournalModal: show })),
        toggleChangelogModal: (show: boolean) => update(state => ({ ...state, showChangelogModal: show })),
        showFeedback: (type: 'copy' | 'save', duration = 2000) => {
            const key = type === 'copy' ? 'showCopyFeedback' : 'showSaveFeedback';
            update(state => ({ ...state, [key]: true }));
            setTimeout(() => update(state => ({ ...state, [key]: false })), duration);
        },
        showError: (message: string) => update(state => ({ ...state, errorMessage: message, showErrorMessage: true })),
        hideError: () => update(state => ({ ...state, errorMessage: '', showErrorMessage: false })),
    };
}

export const uiStore = createUiStore();
