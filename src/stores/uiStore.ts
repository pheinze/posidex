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
    isInitializing: boolean;
}

// Function to load theme from localStorage or cookie
function loadTheme(): string {
    if (browser) {
        try {
            const storedTheme = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_THEME_KEY);
            if (storedTheme) return storedTheme;
        } catch (e) {
            console.warn("Could not load theme from localStorage.", e);
        }
        const cookieTheme = document.cookie.split('; ').find(row => row.startsWith(`${CONSTANTS.LOCAL_STORAGE_THEME_KEY}=`))?.split('=')[1];
        if (cookieTheme) return cookieTheme;
    }
    return 'dark'; // Default theme
}


const initialUiState: UiState = {
    currentTheme: loadTheme(),
    showJournalModal: false,
    showChangelogModal: false,
    showCopyFeedback: false,
    showSaveFeedback: false,
    errorMessage: '',
    showErrorMessage: false,
    isInitializing: true,
};

function createUiStore() {
    const { subscribe, update } = writable<UiState>(initialUiState);

    // Apply theme on initial load
    if (browser) {
        document.body.classList.forEach(className => {
            if (className.startsWith('theme-')) {
                document.body.classList.remove(className);
            }
        });
        if (initialUiState.currentTheme !== 'dark') {
            document.body.classList.add(`theme-${initialUiState.currentTheme}`);
        }
    }

    return {
        subscribe,
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
        setInitializing: (initializing: boolean) => update(state => ({ ...state, isInitializing: initializing })),
    };
}

export const uiStore = createUiStore();
