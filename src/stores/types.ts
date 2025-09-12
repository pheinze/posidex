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
    estimatedLiquidationPrice: Decimal;
    entryFee: Decimal;
    riskAmount: Decimal;
}

export interface IndividualTpResult {
    netProfit: Decimal;
    riskRewardRatio: Decimal;
    priceChangePercent: Decimal;
    partialROC: Decimal;
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
    totalROC: Decimal;
}

export interface CalculatedTradeData extends TradeValues, BaseMetrics, TotalMetrics {
    tradeType: string;
    status: string;
    calculatedTpDetails: IndividualTpResult[];
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
    symbol: string;
    atrValue: Decimal | null;
    atrMultiplier: Decimal | null;
    useAtrSl: boolean;
    atrMode: 'manual' | 'auto';
    atrTimeframe: string;
    tradeNotes: string;
    targets: Array<{ price: Decimal | null; percent: Decimal | null; isLocked: boolean }>;

    // Calculated Results
    positionSize: Decimal | null;
    requiredMargin: Decimal | null;
    netLoss: Decimal | null;
    entryFee: Decimal | null;
    estimatedLiquidationPrice: Decimal | null;
    breakEvenPrice: Decimal | null;
    totalRR: Decimal | null;
    totalNetProfit: Decimal | null;
    totalPercentSold: Decimal | null;
    riskAmountCurrency: Decimal | null;
    totalFees: Decimal | null;
    totalROC: Decimal | null;
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
    showChangelogModal: boolean;
    journalSearchQuery: string;
    journalFilterStatus: string;
    currentTradeData: CalculatedTradeData | null;
}

export interface JournalEntry extends CalculatedTradeData {
    id: number;
    date: string;
    notes: string;
    realizedPnl: Decimal | null;
}
