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
    slippage: Decimal;
    targets: Array<{ price: Decimal; percent: Decimal; isLocked: boolean; }>;
    totalPercentSold: Decimal;
}

export interface BaseMetrics {
    positionSize: Decimal;
    requiredMargin: Decimal;
    netLoss: Decimal;
    breakEvenPrice: Decimal;
    estimatedLiquidationPrice: Decimal;
    entryFee: Decimal;
    riskAmount: Decimal;
}

export interface IndividualTpResult {
    netProfit: Decimal;
    feeAdjustedRRR: Decimal; // Renamed from riskRewardRatio
    riskRewardRatio: Decimal; // The new, standard RRR
    priceChangePercent: Decimal;
    partialROC: Decimal; // Renamed from returnOnCapital
    partialVolume: Decimal;
    exitFee: Decimal;
    index: number;
    percentSold: Decimal;
}

export interface TotalMetrics {
    totalNetProfit: Decimal;
    totalRR: Decimal;
    totalFees: Decimal;
    riskAmount: Decimal;
    totalROC: Decimal; // The new, total Return on Capital
}

export interface AppState {
    // Inputs
    tradeType: string;
    accountSize: Decimal | null;
    riskPercentage: Decimal | null;
    entryPrice: Decimal | null;
    stopLossPrice: Decimal | null;
    leverage: Decimal | null;
    fees: Decimal | null;
    slippage: Decimal | null;
    symbol: string;
    atrValue: Decimal | null;
    atrMultiplier: Decimal | null;
    useAtrSl: boolean;
    atrMode: 'manual' | 'auto';
    atrTimeframe: string;
    tradeNotes: string;
    targets: Array<{ price: Decimal | null; percent: Decimal | null; isLocked: boolean }>;

    // Calculated Results
    positionSize: string;
    requiredMargin: string;
    netLoss: string;
    entryFee: string;
    estimatedLiquidationPrice: string;
    breakEvenPrice: string;
    totalRR: string;
    totalNetProfit: string;
    totalPercentSold: string;
    riskAmountCurrency: string;
    totalFees: string;
    totalROC: string;
    calculatedTpDetails: IndividualTpResult[];

    // UI State
    isPositionSizeLocked: boolean;
    lockedPositionSize: Decimal | null;
    isRiskAmountLocked: boolean;
    riskAmount: Decimal | null;
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
    currentTradeData: CurrentTradeData | null;
}

export interface CurrentTradeData extends TradeValues, BaseMetrics, TotalMetrics {
    tradeType: string;
    status: string;
    calculatedTpDetails: IndividualTpResult[];
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
    realizedPnl: Decimal | null;
    riskAmount: Decimal;
    netLoss: Decimal;
    totalFees: Decimal;
    notes: string;
    targets: Array<{ price: Decimal; percent: Decimal; isLocked: boolean }>;
    calculatedTpDetails: IndividualTpResult[];
}
