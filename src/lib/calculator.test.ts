import { describe, it, expect } from 'vitest';
import { calculator } from './calculator';
import { Decimal } from 'decimal.js';
import { CONSTANTS } from './constants';
import type { BaseMetrics, JournalEntry, TradeValues } from '../stores/types';

describe('calculator', () => {

  // Test für calculateBaseMetrics
  it('should correctly calculate base metrics for a LONG trade', () => {
    const values = {
      accountSize: new Decimal(1000),
      riskPercentage: new Decimal(1),
      entryPrice: new Decimal(100),
      leverage: new Decimal(10),
      fees: new Decimal(0.1),
      symbol: 'BTCUSDT',
      useAtrSl: false,
      atrValue: new Decimal(0),
      atrMultiplier: new Decimal(0),
      stopLossPrice: new Decimal(99),
      targets: [],
      totalPercentSold: new Decimal(0),
      isLocked: false,
    };
    const tradeType = CONSTANTS.TRADE_TYPE_LONG;

    const result = calculator.calculateBaseMetrics(values, tradeType);

    expect(result).not.toBeNull();
    expect(result?.positionSize.equals(new Decimal('10.00'))).toBe(true);
    expect(result?.requiredMargin.equals(new Decimal('100.00'))).toBe(true);
    expect(result?.netLoss.equals(new Decimal('11.99'))).toBe(true);
    // entryFee (1) + slExitFee (0.99) + risk (10) = 11.99
    expect(result?.breakEvenPrice.toDP(2).equals(new Decimal('100.20'))).toBe(true);
    expect(result?.estimatedLiquidationPrice.equals(new Decimal('90.00'))).toBe(true);
  });

  it('should correctly calculate base metrics for a SHORT trade', () => {
    const values = {
      accountSize: new Decimal(1000),
      riskPercentage: new Decimal(1),
      entryPrice: new Decimal(100),
      leverage: new Decimal(10),
      fees: new Decimal(0.1),
      symbol: 'BTCUSDT',
      useAtrSl: false,
      atrValue: new Decimal(0),
      atrMultiplier: new Decimal(0),
      stopLossPrice: new Decimal(101),
      targets: [],
      totalPercentSold: new Decimal(0),
      isLocked: false,
    };
    const tradeType = CONSTANTS.TRADE_TYPE_SHORT;

    const result = calculator.calculateBaseMetrics(values, tradeType);

    expect(result).not.toBeNull();
    expect(result?.positionSize.equals(new Decimal('10.00'))).toBe(true);
    expect(result?.requiredMargin.equals(new Decimal('100.00'))).toBe(true);
    expect(result?.netLoss.equals(new Decimal('12.01'))).toBe(true);
    expect(result?.breakEvenPrice.toDP(2).equals(new Decimal('99.80'))).toBe(true);
    expect(result?.estimatedLiquidationPrice.equals(new Decimal('110.00'))).toBe(true);
  });

  // Test für calculateIndividualTp
  it('should correctly calculate individual TP metrics for a LONG trade', () => {
    const baseMetrics = {
      positionSize: new Decimal(10),
      requiredMargin: new Decimal(100),
      netLoss: new Decimal(10),
      breakEvenPrice: new Decimal(100.20),
      estimatedLiquidationPrice: new Decimal(90),
      entryFee: new Decimal(1),
      riskAmount: new Decimal(10),
    };
    const values = {
      accountSize: new Decimal(1000),
      riskPercentage: new Decimal(1),
      entryPrice: new Decimal(100),
      leverage: new Decimal(10),
      fees: new Decimal(0.1),
      symbol: 'BTCUSDT',
      useAtrSl: false,
      atrValue: new Decimal(0),
      atrMultiplier: new Decimal(0),
      stopLossPrice: new Decimal(99),
      targets: [{ price: new Decimal(105), percent: new Decimal(50), isLocked: false }], // Only the percent is used from here
      totalPercentSold: new Decimal(0),
    };
    const tpPrice = new Decimal(105);
    const currentTpPercent = new Decimal(50);

    const result = calculator.calculateIndividualTp(tpPrice, currentTpPercent, baseMetrics, values, 0, CONSTANTS.TRADE_TYPE_LONG);

    expect(result.netProfit.toDP(2).equals(new Decimal('23.98'))).toBe(true);
    expect(result.feeAdjustedRRR.toDP(2).equals(new Decimal('4.00'))).toBe(true);
    expect(result.riskRewardRatio.toDP(2).equals(new Decimal('5.00'))).toBe(true);
    expect(result.priceChangePercent.toDP(2).equals(new Decimal('5.00'))).toBe(true);
    expect(result.partialROC.toDP(2).equals(new Decimal('47.95'))).toBe(true);
    expect(result.partialVolume.toDP(2).equals(new Decimal('5.00'))).toBe(true);
  });

  it('should correctly calculate priceChangePercent for a SHORT trade', () => {
    const baseMetrics = {
      positionSize: new Decimal(10),
      requiredMargin: new Decimal(100),
      netLoss: new Decimal(10),
      breakEvenPrice: new Decimal(99.80),
      estimatedLiquidationPrice: new Decimal(110),
      entryFee: new Decimal(1),
      riskAmount: new Decimal(10),
    };
    const values = {
      accountSize: new Decimal(1000),
      riskPercentage: new Decimal(1),
      entryPrice: new Decimal(100),
      stopLossPrice: new Decimal(101),
      leverage: new Decimal(10),
      fees: new Decimal(0.1),
      symbol: 'BTCUSDT',
      useAtrSl: false,
      atrValue: new Decimal(0),
      atrMultiplier: new Decimal(0),
      targets: [],
      totalPercentSold: new Decimal(0),
    };
    const tpPrice = new Decimal(95);
    const currentTpPercent = new Decimal(100);

    const result = calculator.calculateIndividualTp(tpPrice, currentTpPercent, baseMetrics, values, 0, CONSTANTS.TRADE_TYPE_SHORT);

    expect(result.priceChangePercent.toDP(2).equals(new Decimal('5.00'))).toBe(true);
    expect(result.riskRewardRatio.toDP(2).equals(new Decimal('5.00'))).toBe(true);
  });

  // Test für calculateTotalMetrics
  it('should correctly calculate total metrics when all TPs are hit', () => {
    const baseMetrics = {
      positionSize: new Decimal(10),
      entryFee: new Decimal(1), // 10 * 100 * 0.001
      riskAmount: new Decimal(10),
      requiredMargin: new Decimal(100),
      netLoss: new Decimal(10),
      breakEvenPrice: new Decimal(100.20),
      estimatedLiquidationPrice: new Decimal(90),
    };
    const values = {
      accountSize: new Decimal(1000),
      riskPercentage: new Decimal(1),
      entryPrice: new Decimal(100),
      leverage: new Decimal(10),
      fees: new Decimal(0.1),
      symbol: 'BTCUSDT',
      useAtrSl: false,
      atrValue: new Decimal(0),
      atrMultiplier: new Decimal(0),
      stopLossPrice: new Decimal(99),
      targets: [
        { price: new Decimal(105), percent: new Decimal(50), isLocked: false },
        { price: new Decimal(110), percent: new Decimal(50), isLocked: false },
      ],
      totalPercentSold: new Decimal(100),
    };
    const tradeType = CONSTANTS.TRADE_TYPE_LONG;

    const result = calculator.calculateTotalMetrics(values.targets, baseMetrics, values, tradeType);

    expect(result.totalNetProfit.toDP(2).equals(new Decimal('72.93'))).toBe(true);
    expect(result.totalRR.toDP(2).equals(new Decimal('7.29'))).toBe(true);
    expect(result.totalFees.toDP(2).equals(new Decimal('2.08'))).toBe(true);
    expect(result.riskAmount.toDP(2).equals(new Decimal('10.00'))).toBe(true);
  });

  it('should correctly calculate total metrics with partial TPs and partial SL', () => {
    const baseMetrics = {
      positionSize: new Decimal(10),
      entryFee: new Decimal(1), // 10 * 100 * 0.001
      riskAmount: new Decimal(10),
      requiredMargin: new Decimal(100),
      netLoss: new Decimal(10),
      breakEvenPrice: new Decimal(100.20),
      estimatedLiquidationPrice: new Decimal(90),
    };
    const values = {
      accountSize: new Decimal(1000),
      riskPercentage: new Decimal(1),
      entryPrice: new Decimal(100),
      leverage: new Decimal(10),
      fees: new Decimal(0.1),
      symbol: 'BTCUSDT',
      useAtrSl: false,
      atrValue: new Decimal(0),
      atrMultiplier: new Decimal(0),
      stopLossPrice: new Decimal(99),
      targets: [
        // 50% of position goes to TP
        { price: new Decimal(105), percent: new Decimal(50), isLocked: false },
        // The other 50% will hit the Stop Loss
      ],
      totalPercentSold: new Decimal(50),
    };
    const tradeType = CONSTANTS.TRADE_TYPE_LONG;

    const result = calculator.calculateTotalMetrics(values.targets, baseMetrics, values, tradeType);

    expect(result.totalNetProfit.toDP(2).equals(new Decimal('17.98'))).toBe(true);
    expect(result.totalRR.toDP(2).equals(new Decimal('1.80'))).toBe(true);
    expect(result.totalFees.toDP(2).equals(new Decimal('2.02'))).toBe(true);
    expect(result.riskAmount.toDP(2).equals(new Decimal('10.00'))).toBe(true);
  });

  // Test für calculatePerformanceStats (Grundlagen)
  it('should calculate performance stats correctly using realizedPnl', () => {
    const journalData = [
      // This trade should be ignored as it has no realizedPnl
      { id: 1, date: '2024-01-01T10:00:00Z', status: 'Won', realizedPnl: null, totalNetProfit: new Decimal(50), riskAmount: new Decimal(10), netLoss: new Decimal(11.99), totalRR: new Decimal(5), tradeType: CONSTANTS.TRADE_TYPE_LONG, symbol: 'BTCUSDT', accountSize: new Decimal(1000), riskPercentage: new Decimal(1), leverage: new Decimal(10), fees: new Decimal(0.1), entryPrice: new Decimal(100), stopLossPrice: new Decimal(90), notes: '', targets: [], calculatedTpDetails: [], totalFees: new Decimal(1) },
      // This is a loss of 10
      { id: 2, date: '2024-01-02T10:00:00Z', status: 'Lost', realizedPnl: new Decimal(-10), totalNetProfit: new Decimal(0), riskAmount: new Decimal(10), netLoss: new Decimal(12.01), totalRR: new Decimal(-1), tradeType: CONSTANTS.TRADE_TYPE_SHORT, symbol: 'BTCUSDT', accountSize: new Decimal(1000), riskPercentage: new Decimal(1), leverage: new Decimal(10), fees: new Decimal(0.1), entryPrice: new Decimal(100), stopLossPrice: new Decimal(101), notes: '', targets: [], calculatedTpDetails: [], totalFees: new Decimal(1) },
      // This is a win of 35
      { id: 3, date: '2024-01-03T10:00:00Z', status: 'Won', realizedPnl: new Decimal(35), totalNetProfit: new Decimal(30), riskAmount: new Decimal(10), netLoss: new Decimal(11.99), totalRR: new Decimal(3), tradeType: CONSTANTS.TRADE_TYPE_LONG, symbol: 'BTCUSDT', accountSize: new Decimal(1000), riskPercentage: new Decimal(1), leverage: new Decimal(10), fees: new Decimal(0.1), entryPrice: new Decimal(100), stopLossPrice: new Decimal(90), notes: '', targets: [], calculatedTpDetails: [], totalFees: new Decimal(1) },
    ];

    const stats = calculator.calculatePerformanceStats(journalData);

    expect(stats).not.toBeNull();
    if (!stats) return; // Type guard
    expect(stats.totalTrades).toBe(2); // Ignores the first trade
    expect(stats.winRate.toDP(2).equals(new Decimal('50.00'))).toBe(true);
    expect(stats.profitFactor?.toDP(2).equals(new Decimal('3.50'))).toBe(true);
    expect(stats.avgRMultiple.toDP(2).equals(new Decimal('1.25'))).toBe(true);
    expect(stats.maxDrawdown.toDP(2).equals(new Decimal('10.00'))).toBe(true);
  });

  // Test für calculateSymbolPerformance
  it('should calculate symbol performance correctly using realizedPnl', () => {
    const journalData = [
      // Valid BTC win: +50
      { id: 1, symbol: 'BTCUSDT', status: 'Won', realizedPnl: new Decimal(50), date: '2024-01-01T10:00:00Z', tradeType: 'long', accountSize: new Decimal(1000), riskPercentage: new Decimal(1), leverage: new Decimal(10), fees: new Decimal(0.1), entryPrice: new Decimal(100), stopLossPrice: new Decimal(90), totalRR: new Decimal(5), totalNetProfit: new Decimal(50), riskAmount: new Decimal(10), netLoss: new Decimal(12), notes: '', targets: [], calculatedTpDetails: [], totalFees: new Decimal(1) },
      // Invalid ETH loss (no realizedPnl) -> Should be ignored
      { id: 2, symbol: 'ETHUSDT', status: 'Lost', realizedPnl: null, date: '2024-01-02T10:00:00Z', tradeType: 'short', accountSize: new Decimal(1000), riskPercentage: new Decimal(1), leverage: new Decimal(10), fees: new Decimal(0.1), entryPrice: new Decimal(2000), stopLossPrice: new Decimal(2020), totalRR: new Decimal(-1), totalNetProfit: new Decimal(0), riskAmount: new Decimal(10), netLoss: new Decimal(12), notes: '', targets: [], calculatedTpDetails: [], totalFees: new Decimal(2) },
      // Valid BTC loss: -20
      { id: 3, symbol: 'BTCUSDT', status: 'Lost', realizedPnl: new Decimal(-20), date: '2024-01-03T10:00:00Z', tradeType: 'long', accountSize: new Decimal(1000), riskPercentage: new Decimal(1), leverage: new Decimal(10), fees: new Decimal(0.1), entryPrice: new Decimal(110), stopLossPrice: new Decimal(99), totalRR: new Decimal(3), totalNetProfit: new Decimal(30), riskAmount: new Decimal(10), netLoss: new Decimal(12), notes: '', targets: [], calculatedTpDetails: [], totalFees: new Decimal(1.5) },
      // Valid ETH win: +40
      { id: 4, symbol: 'ETHUSDT', status: 'Won', realizedPnl: new Decimal(40), date: '2024-01-04T10:00:00Z', tradeType: 'long', accountSize: new Decimal(1000), riskPercentage: new Decimal(0.5), leverage: new Decimal(10), fees: new Decimal(0.1), entryPrice: new Decimal(2000), stopLossPrice: new Decimal(1990), totalRR: new Decimal(4), totalNetProfit: new Decimal(20), riskAmount: new Decimal(5), netLoss: new Decimal(6), notes: '', targets: [], calculatedTpDetails: [], totalFees: new Decimal(1) },
    ];

    const symbolStats = calculator.calculateSymbolPerformance(journalData);

    // BTC: 1 win, 1 loss. Total P/L = 50 - 20 = 30
    expect(symbolStats['BTCUSDT']).not.toBeUndefined();
    expect(symbolStats['BTCUSDT'].totalTrades).toBe(2);
    expect(symbolStats['BTCUSDT'].wonTrades).toBe(1);
    expect(symbolStats['BTCUSDT'].totalProfitLoss.toDP(2).equals(new Decimal('30.00'))).toBe(true);

    // ETH: 1 win, 0 losses (one trade ignored). Total P/L = 40
    expect(symbolStats['ETHUSDT']).not.toBeUndefined();
    expect(symbolStats['ETHUSDT'].totalTrades).toBe(1);
    expect(symbolStats['ETHUSDT'].wonTrades).toBe(1);
    expect(symbolStats['BTCUSDT'].totalProfitLoss.toDP(2).equals(new Decimal('30.00'))).toBe(true);
    expect(symbolStats['ETHUSDT'].totalProfitLoss.toDP(2).equals(new Decimal('40.00'))).toBe(true);
  });

  it('should calculate ATR using Wilder`s Smoothing method', () => {
    // We will test with a period of 5 to keep it simple.
    // The first ATR is a simple average. Subsequent ATRs are smoothed.
    // Formula: Current ATR = ((Prior ATR * (period - 1)) + Current TR) / period
    const klines = [
      { open: new Decimal(10), high: new Decimal(10),  low: new Decimal(10), close: new Decimal(10) },    // 0: Base candle
      { open: new Decimal(11), high: new Decimal(11.5), low: new Decimal(10.5), close: new Decimal(11) }, // 1: TR = 1.5
      { open: new Decimal(12), high: new Decimal(12.5), low: new Decimal(11.5), close: new Decimal(12) }, // 2: TR = 1.5
      { open: new Decimal(13), high: new Decimal(13.5), low: new Decimal(12.5), close: new Decimal(13) }, // 3: TR = 1.5
      { open: new Decimal(14), high: new Decimal(14.5), low: new Decimal(13.5), close: new Decimal(14) }, // 4: TR = 1.5
      { open: new Decimal(15), high: new Decimal(15.5), low: new Decimal(14.5), close: new Decimal(15) }, // 5: TR = 1.5
      // First ATR (SMA of first 5 TRs): (1.5 * 5) / 5 = 1.5

      { open: new Decimal(16), high: new Decimal(16.8), low: new Decimal(15.2), close: new Decimal(16) }, // 6: TR = 1.8
      // Smoothed ATR: ((1.5 * 4) + 1.8) / 5 = (6 + 1.8) / 5 = 7.8 / 5 = 1.56

      { open: new Decimal(17), high: new Decimal(17.7), low: new Decimal(16.3), close: new Decimal(17) }, // 7: TR = 1.7
      // Smoothed ATR: ((1.56 * 4) + 1.7) / 5 = (6.24 + 1.7) / 5 = 7.94 / 5 = 1.588
    ];

    // The test expects the correctly smoothed value based on the kline data provided.
    const result = calculator.calculateATR(klines, 5);
    expect(result.toDP(3).equals(new Decimal('1.588'))).toBe(true);
  });
});

describe('Bugfix Verification Tests', () => {
  it('should calculate totalRR based on net loss (Net/Net R:R)', () => {
    const baseMetrics = {
      positionSize: new Decimal(1),
      entryFee: new Decimal(1),
      riskAmount: new Decimal(100), // Gross risk
      netLoss: new Decimal(102),     // Net risk (includes fees)
      requiredMargin: new Decimal(1000),
      breakEvenPrice: new Decimal(100.20),
      estimatedLiquidationPrice: new Decimal(90),
    };
    const values = {
      entryPrice: new Decimal(10000),
      stopLossPrice: new Decimal(9900),
      fees: new Decimal(0.1),
      // Other values are not relevant for this specific test
    } as TradeValues;
    const targets = [{ price: new Decimal(10204), percent: new Decimal(100) }];

    // Let's trace the calculation for this test.
    // grossProfit = (10204 - 10000) * 1 = 204
    // entryFeePart = 10000 * 1 * 0.001 = 10
    // exitFee = 10204 * 1 * 0.001 = 10.204
    // totalNetProfit = 204 - 10 - 10.204 = 183.796
    // netLoss from baseMetrics is 102.
    // totalRR = 183.796 / 102 = 1.8019...
    const result = calculator.calculateTotalMetrics(targets, baseMetrics, values, CONSTANTS.TRADE_TYPE_LONG);
    expect(result.totalNetProfit.toDP(3).equals(new Decimal('183.796'))).toBe(true);
    expect(result.totalRR.toDP(2).equals(new Decimal('1.80'))).toBe(true);
  });

  it('should exclude breakeven trades from win rate calculation', () => {
    const journalData: Partial<JournalEntry>[] = [
      { status: 'Won', realizedPnl: new Decimal(100) },
      { status: 'Lost', realizedPnl: new Decimal(-50) },
      { status: 'Lost', realizedPnl: new Decimal(0) }, // Breakeven trade
    ];

    const stats = calculator.calculatePerformanceStats(journalData as JournalEntry[]);
    expect(stats).not.toBeNull();
    if (!stats) return;
    // Total trades for winrate are wins + losses. Breakeven is excluded.
    expect(stats.totalTrades).toBe(2);
    // Winrate is 1 win / 2 trades = 50%
    expect(stats.winRate.toDP(2).equals(new Decimal('50.00'))).toBe(true);
  });

  it('should cap profit calculation at 100% of the position', () => {
    const baseMetrics = {
      positionSize: new Decimal(10),
      entryFee: new Decimal(1),
      riskAmount: new Decimal(10),
      requiredMargin: new Decimal(100),
      netLoss: new Decimal(12),
    } as BaseMetrics;
    const values = {
      entryPrice: new Decimal(100),
      stopLossPrice: new Decimal(99),
      fees: new Decimal(0.1),
    } as TradeValues;
    // Targets sum to 120%. The calculation should ignore the last 20%.
    const targets = [
      { price: new Decimal(110), percent: new Decimal(60) },
      { price: new Decimal(120), percent: new Decimal(60) },
    ];

    // Manually calculate expected profit for 100%
    // Part 1: 60% at price 110. Position part = 6. Profit = (110-100)*6 = 60. EntryFeePart=0.6, ExitFee=0.66. Net=58.74
    // Part 2: 40% at price 120. Position part = 4. Profit = (120-100)*4 = 80. EntryFeePart=0.4, ExitFee=0.48. Net=79.12
    // Total Net Profit = 58.74 + 79.12 = 137.86
    const result = calculator.calculateTotalMetrics(targets, baseMetrics, values, CONSTANTS.TRADE_TYPE_LONG);
    expect(result.totalNetProfit.toDP(2).equals(new Decimal('137.86'))).toBe(true);
  });

  it('should handle 100% fees without division by zero', () => {
    const values = {
      accountSize: new Decimal(1000),
      riskPercentage: new Decimal(1),
      entryPrice: new Decimal(100),
      stopLossPrice: new Decimal(99),
      leverage: new Decimal(1),
      fees: new Decimal(100), // 100% fees
    } as TradeValues;

    const result = calculator.calculateBaseMetrics(values, CONSTANTS.TRADE_TYPE_LONG);
    expect(result).not.toBeNull();
    // With 100% fees, the break-even price for a long trade is infinite.
    expect(result?.breakEvenPrice.isFinite()).toBe(false);
  });

  it('should correctly calculate streaks including breakeven trades', () => {
    const journalData = [
      { status: 'Won', realizedPnl: new Decimal(100), date: '2023-01-01' },   // W
      { status: 'Won', realizedPnl: new Decimal(150), date: '2023-01-02' },   // W -> longest W is 2
      { status: 'Lost', realizedPnl: new Decimal(-50), date: '2023-01-03' },  // L -> longest L is 1
      { status: 'Lost', realizedPnl: new Decimal(0), date: '2023-01-04' },    // B -> streaks reset
      { status: 'Won', realizedPnl: new Decimal(100), date: '2023-01-05' },   // W -> current streak is W1
    ] as JournalEntry[];

    const stats = calculator.calculatePerformanceStats(journalData);
    expect(stats).not.toBeNull();
    expect(stats?.longestWinningStreak).toBe(2);
    expect(stats?.longestLosingStreak).toBe(1);
    expect(stats?.currentStreakText).toBe('W1');
  });
});


describe('Correct RRR and Stats Calculation', () => {

  it('should calculate standard RRR and fee-adjusted RRR correctly', () => {
    // Setup a simple trade: Entry 100, SL 90, TP 120. Risk per unit is 10, Gain per unit is 20. Gross R/R is 2.0.
    const baseMetrics = {
      positionSize: new Decimal(10),
      requiredMargin: new Decimal(100),
      netLoss: new Decimal(102.1),
      breakEvenPrice: new Decimal(100.20),
      estimatedLiquidationPrice: new Decimal(90),
      entryFee: new Decimal(1),
      riskAmount: new Decimal(100),
    };
    const values = {
      accountSize: new Decimal(10000),
      riskPercentage: new Decimal(1),
      entryPrice: new Decimal(100),
      stopLossPrice: new Decimal(90),
      leverage: new Decimal(10),
      fees: new Decimal(0.1),
      symbol: 'BTCUSDT',
      useAtrSl: false,
      atrValue: new Decimal(0),
      atrMultiplier: new Decimal(0),
      targets: [],
      totalPercentSold: new Decimal(0),
    };
    const tpPrice = new Decimal(120);
    const currentTpPercent = new Decimal(50);

    const result = calculator.calculateIndividualTp(tpPrice, currentTpPercent, baseMetrics, values, 0, CONSTANTS.TRADE_TYPE_LONG);

    expect(result.riskRewardRatio.toDP(3).equals(new Decimal('2.000'))).toBe(true);
    expect(result.feeAdjustedRRR.toDP(3).equals(new Decimal('1.941'))).toBe(true);
  });

  it('should return null if no trades with realizedPnl are found', () => {
    const journalData = [
        // These trades should be ignored because they lack realizedPnl
      { id: 1, status: 'Won', realizedPnl: null, totalNetProfit: new Decimal(50), riskAmount: new Decimal(10), netLoss: new Decimal(12), date: '2024-01-01', tradeType: 'long', symbol: 'BTC' },
      { id: 2, status: 'Won', realizedPnl: undefined, totalNetProfit: new Decimal(30), riskAmount: new Decimal(10), netLoss: new Decimal(12), date: '2024-01-03', tradeType: 'long', symbol: 'BTC' },
    ];

    // @ts-expect-error - Testing invalid data shape
    const stats = calculator.calculatePerformanceStats(journalData as JournalEntry[]);

    // With no valid trades, the entire stats object should be null.
    expect(stats).toBeNull();
  });

});