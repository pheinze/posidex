import { w as writable } from "./index.js";
import "decimal.js";
import { C as CONSTANTS } from "./constants.js";
function loadJournalFromLocalStorage() {
  return [];
}
const initialAppState = {
  tradeType: CONSTANTS.TRADE_TYPE_LONG,
  accountSize: "",
  riskPercentage: "",
  entryPrice: "",
  stopLossPrice: "",
  leverage: CONSTANTS.DEFAULT_LEVERAGE,
  fees: CONSTANTS.DEFAULT_FEES,
  symbol: "",
  atrValue: "",
  atrMultiplier: CONSTANTS.DEFAULT_ATR_MULTIPLIER,
  useAtrSl: false,
  tradeNotes: "",
  targets: [
    { price: "", percent: "", isLocked: false },
    { price: "", percent: "", isLocked: false },
    { price: "", percent: "", isLocked: false }
  ],
  positionSize: "-",
  requiredMargin: "-",
  netLoss: "-",
  liquidationPrice: "-",
  breakEvenPrice: "-",
  totalRR: "-",
  totalNetProfit: "-",
  totalPercentSold: "-",
  riskAmountCurrency: "-",
  totalFees: "-",
  maxPotentialProfit: "-",
  calculatedTpDetails: [],
  isPositionSizeLocked: false,
  lockedPositionSize: null,
  errorMessage: "",
  showErrorMessage: false,
  showTotalMetricsGroup: false,
  showAtrFormulaDisplay: false,
  atrFormulaText: "",
  isPriceFetching: false,
  showCopyFeedback: false,
  showSaveFeedback: false,
  currentTheme: "dark",
  // Default theme
  symbolSuggestions: [],
  showSymbolSuggestions: false,
  showJournalModal: false,
  availablePresets: [],
  selectedPreset: "",
  journalSearchQuery: "",
  journalFilterStatus: "all",
  currentTradeData: {},
  showChangelogModal: false
  // Added to satisfy AppState type
};
const appStore = writable(initialAppState);
const journalStore = writable(loadJournalFromLocalStorage());
const updateStore = (updater) => {
  appStore.update(updater);
};
const clearResults = (showGuidance = false) => {
  updateStore((state) => ({
    ...state,
    positionSize: "-",
    requiredMargin: "-",
    netLoss: "-",
    liquidationPrice: "-",
    breakEvenPrice: "-",
    totalRR: "-",
    totalNetProfit: "-",
    totalPercentSold: "-",
    riskAmountCurrency: "-",
    totalFees: "-",
    maxPotentialProfit: "-",
    calculatedTpDetails: [],
    showTotalMetricsGroup: false,
    showAtrFormulaDisplay: false,
    atrFormulaText: "",
    errorMessage: showGuidance ? "dashboard.promptForData" : "",
    showErrorMessage: showGuidance
  }));
};
const showError = (message) => {
  updateStore((state) => ({
    ...state,
    errorMessage: message,
    showErrorMessage: true
  }));
};
const hideError = () => {
  updateStore((state) => ({
    ...state,
    errorMessage: "",
    showErrorMessage: false
  }));
};
const showFeedback = (type, duration = 2e3, message = "Gespeichert!") => {
  if (type === "copy") {
    updateStore((state) => ({ ...state, showCopyFeedback: true }));
    setTimeout(() => updateStore((state) => ({ ...state, showCopyFeedback: false })), duration);
  } else if (type === "save") {
    updateStore((state) => ({ ...state, showSaveFeedback: true }));
    setTimeout(() => updateStore((state) => ({ ...state, showSaveFeedback: false })), duration);
  }
};
export {
  showFeedback as a,
  appStore as b,
  clearResults as c,
  hideError as h,
  initialAppState as i,
  journalStore as j,
  showError as s,
  updateStore as u
};
