import { Decimal } from 'decimal.js';

export interface TradeValues {
    accountSize: Decimal;
    riskPercentage: Decimal;
    entryPrice: Decimal;
    leverage: Decimal;
    fees: Decimal;
    symbol: string;
    useAtrSl: boolean;
    atrValue: Decimal;
    atrMultiplier: Decimal;
    stopLossPrice: Decimal;
    targets: Array<{ price: Decimal; percent: Decimal; isLocked: boolean; }>;
    totalPercentSold: Decimal;
}

export interface BaseMetrics {
    positionSize: Decimal;
    requiredMargin: Decimal;
    netLoss: Decimal;
    breakEvenPrice: Decimal;
    liquidationPrice: Decimal;
    entryFee: Decimal;
    riskAmount: Decimal;
}

export interface IndividualTpResult {
    netProfit: Decimal;
    riskRewardRatio: Decimal;
    priceChangePercent: Decimal;
    returnOnCapital: Decimal;
    partialVolume: Decimal;
    exitFee: Decimal;
    index: number;
    percentSold: Decimal;
}

export interface TotalMetrics {
    totalNetProfit: Decimal;
    totalRR: Decimal;
    totalFees: Decimal;
    maxPotentialProfit: Decimal;
    riskAmount: Decimal;
}

export interface AppState {
    // Inputs
    tradeType: string;
    accountSize: number | null;
    riskPercentage: number | null;
    entryPrice: number | null;
    stopLossPrice: number | null;
    leverage: number | null;
    fees: number | null;
    symbol: string;
    atrValue: number | null;
    atrMultiplier: number | null;
    useAtrSl: boolean;
    atrMode: 'manual' | 'auto';
    atrTimeframe: string;
    tradeNotes: string;
    targets: Array<{ price: number | null; percent: number | null; isLocked: boolean }>;

    // Calculated Results
    positionSize: string;
    requiredMargin: string;
    netLoss: string;
    entryFee: string;
    liquidationPrice: string;
    breakEvenPrice: string;
    totalRR: string;
    totalNetProfit: string;
    totalPercentSold: string;
    riskAmountCurrency: string;
    totalFees: string;
    maxPotentialProfit: string;
    calculatedTpDetails: IndividualTpResult[];

    // UI State
    isPositionSizeLocked: boolean;
    lockedPositionSize: Decimal | null;
    isRiskAmountLocked: boolean;
    riskAmount: number | null;
    errorMessage: string;
    showErrorMessage: boolean;
    showTotalMetricsGroup: boolean;
    showAtrFormulaDisplay: boolean;
    atrFormulaText: string;
    isAtrSlInvalid: boolean;
    isPriceFetching: boolean;
    showCopyFeedback: boolean;
    showSaveFeedback: boolean;
    currentTheme: string;
    symbolSuggestions: string[];
    showSymbolSuggestions: boolean;
    showJournalModal: boolean;
    showChangelogModal: boolean; // Added for changelog modal
    journalSearchQuery: string;
    journalFilterStatus: string;
    currentTradeData: any; // This needs a more specific interface
}

export interface JournalEntry {
    id: number;
    date: string;
    symbol: string;
    tradeType: string;
    status: string;
    accountSize: Decimal;
    riskPercentage: Decimal;
    leverage: Decimal;
    fees: Decimal;
    entryPrice: Decimal;
    stopLossPrice: Decimal;
    totalRR: Decimal;
    totalNetProfit: Decimal;
    riskAmount: Decimal;
    totalFees: Decimal;
    maxPotentialProfit: Decimal;
    notes: string;
    targets: Array<{ price: Decimal; percent: Decimal; isLocked: boolean }>;
    calculatedTpDetails: IndividualTpResult[];
}
