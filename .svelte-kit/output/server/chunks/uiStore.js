import { w as writable } from "./index.js";
function loadTheme() {
  return "dark";
}
const initialUiState = {
  currentTheme: loadTheme(),
  showJournalModal: false,
  showChangelogModal: false,
  showCopyFeedback: false,
  showSaveFeedback: false,
  errorMessage: "",
  showErrorMessage: false,
  isInitializing: true
};
function createUiStore() {
  const { subscribe, update } = writable(initialUiState);
  return {
    subscribe,
    setTheme: (themeName) => {
      update((state) => ({ ...state, currentTheme: themeName }));
    },
    toggleJournalModal: (show) => update((state) => ({ ...state, showJournalModal: show })),
    toggleChangelogModal: (show) => update((state) => ({ ...state, showChangelogModal: show })),
    showFeedback: (type, duration = 2e3) => {
      const key = type === "copy" ? "showCopyFeedback" : "showSaveFeedback";
      update((state) => ({ ...state, [key]: true }));
      setTimeout(() => update((state) => ({ ...state, [key]: false })), duration);
    },
    showError: (message) => update((state) => ({ ...state, errorMessage: message, showErrorMessage: true })),
    hideError: () => update((state) => ({ ...state, errorMessage: "", showErrorMessage: false })),
    setInitializing: (initializing) => update((state) => ({ ...state, isInitializing: initializing }))
  };
}
const uiStore = createUiStore();
export {
  uiStore as u
};
