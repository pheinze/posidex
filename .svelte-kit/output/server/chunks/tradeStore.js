import { w as writable } from "./index.js";
import "decimal.js";
import { C as CONSTANTS } from "./constants.js";
import { u as uiStore } from "./uiStore.js";
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
  showTotalMetricsGroup: false,
  showAtrFormulaDisplay: false,
  atrFormulaText: "",
  isPriceFetching: false,
  symbolSuggestions: [],
  showSymbolSuggestions: false,
  availablePresets: [],
  selectedPreset: "",
  journalSearchQuery: "",
  journalFilterStatus: "all",
  currentTradeData: {}
};
const tradeStore = writable(initialAppState);
const updateTradeStore = (updater) => {
  tradeStore.update(updater);
};
const clearResults = (showGuidance = false) => {
  updateTradeStore((state) => ({
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
    atrFormulaText: ""
  }));
  if (showGuidance) {
    uiStore.showError("dashboard.promptForData");
  } else {
    uiStore.hideError();
  }
};
export {
  clearResults as c,
  initialAppState as i,
  tradeStore as t,
  updateTradeStore as u
};
