import { Decimal } from 'decimal.js';
import { CONSTANTS } from './constants';
import type { TradeValues, BaseMetrics, IndividualTpResult, TotalMetrics, JournalEntry } from '../stores/types';
import type { Kline } from '../services/apiService';

export const calculator = {
    calculateBaseMetrics(values: TradeValues, tradeType: string): BaseMetrics | null {
        const riskAmount = values.accountSize.times(values.riskPercentage.div(100));
        const riskPerUnit = values.entryPrice.minus(values.stopLossPrice).abs();
        if (riskPerUnit.isZero()) return null;

        const positionSize = riskAmount.div(riskPerUnit);
        const orderVolume = positionSize.times(values.entryPrice);
        const requiredMargin = values.leverage.gt(0) ? orderVolume.div(values.leverage) : orderVolume;
        const entryFee = orderVolume.times(values.fees.div(100));
        const slExitFee = positionSize.times(values.stopLossPrice).times(values.fees.div(100));
        const netLoss = riskAmount.plus(entryFee).plus(slExitFee);
        
        const feeFactor = values.fees.div(100);
        const breakEvenPrice = tradeType === CONSTANTS.TRADE_TYPE_LONG
            ? values.entryPrice.times(feeFactor.plus(1)).div(new Decimal(1).minus(feeFactor))
            : values.entryPrice.times(new Decimal(1).minus(feeFactor)).div(feeFactor.plus(1));

        const estimatedLiquidationPrice = values.leverage.gt(0) ? (tradeType === CONSTANTS.TRADE_TYPE_LONG
            ? values.entryPrice.times(new Decimal(1).minus(new Decimal(1).div(values.leverage)))
            : values.entryPrice.times(new Decimal(1).plus(new Decimal(1).div(values.leverage)))) : new Decimal(0);
        
        return { positionSize, requiredMargin, netLoss, breakEvenPrice, estimatedLiquidationPrice, entryFee, riskAmount };
    },

    calculateATR(klines: Kline[], period: number = 14): Decimal {
        if (klines.length < period + 1) {
            return new Decimal(0); // Not enough data to calculate ATR.
        }

        // 1. Calculate all True Ranges
        const trueRanges: Decimal[] = [];
        for (let i = 1; i < klines.length; i++) {
            const kline = klines[i];
            const prevKline = klines[i - 1];
            const highLow = kline.high.minus(kline.low);
            const highPrevClose = kline.high.minus(prevKline.close).abs();
            const lowPrevClose = kline.low.minus(prevKline.close).abs();
            const trueRange = Decimal.max(highLow, highPrevClose, lowPrevClose);
            trueRanges.push(trueRange);
        }

        if (trueRanges.length < period) {
            return new Decimal(0); // Not enough True Ranges for a full period.
        }

        // 2. Calculate the initial ATR as the SMA of the first 'period' TRs
        let atr = trueRanges.slice(0, period).reduce((sum, val) => sum.plus(val), new Decimal(0)).div(period);

        // 3. Apply Wilder's Smoothing for the rest of the TRs
        for (let i = period; i < trueRanges.length; i++) {
            const currentTR = trueRanges[i];
            atr = atr.times(period - 1).plus(currentTR).div(period);
        }

        return atr;
    },

    calculateIndividualTp(tpPrice: Decimal, currentTpPercent: Decimal, baseMetrics: BaseMetrics, values: TradeValues, index: number): IndividualTpResult {
        const { positionSize, requiredMargin } = baseMetrics;
        const gainPerUnit = tpPrice.minus(values.entryPrice).abs();
        const positionPart = positionSize.times(currentTpPercent.div(100));
        const grossProfitPart = gainPerUnit.times(positionPart);
        const exitFee = positionPart.times(tpPrice).times(values.fees.div(100));
        const entryFeePart = positionPart.times(values.entryPrice).times(values.fees.div(100));
        const netProfit = grossProfitPart.minus(entryFeePart).minus(exitFee);

        // --- FEE-ADJUSTED RRR (OLD LOGIC) ---
        const riskPerUnit = values.entryPrice.minus(values.stopLossPrice).abs();
        const grossRiskOnPart = riskPerUnit.times(positionPart);
        const slExitFeeOnPart = positionPart.times(values.stopLossPrice).times(values.fees.div(100));
        const netRiskOnPart = grossRiskOnPart.plus(entryFeePart).plus(slExitFeeOnPart);
        const feeAdjustedRRR = netRiskOnPart.gt(0) ? netProfit.div(netRiskOnPart) : new Decimal(0);

        // --- STANDARD GROSS RRR (NEW LOGIC) ---
        const riskRewardRatio = riskPerUnit.gt(0) ? gainPerUnit.div(riskPerUnit) : new Decimal(0);

        const priceChangePercent = values.entryPrice.gt(0) ? tpPrice.minus(values.entryPrice).div(values.entryPrice).times(100) : new Decimal(0);
        const partialROC = requiredMargin.gt(0) && currentTpPercent.gt(0) ? netProfit.div(requiredMargin.times(currentTpPercent.div(100))).times(100) : new Decimal(0);
        return { netProfit, feeAdjustedRRR, riskRewardRatio, priceChangePercent, partialROC, partialVolume: positionPart, exitFee, index: index, percentSold: currentTpPercent };
    },
    calculateTotalMetrics(targets: Array<{ price: Decimal; percent: Decimal; }>, baseMetrics: BaseMetrics, values: TradeValues, tradeType: string): TotalMetrics {
        const { positionSize, entryFee, riskAmount, requiredMargin } = baseMetrics;
        let totalNetProfit = new Decimal(0);
        let totalFees = new Decimal(0);

        targets.forEach((tp, index) => {
            if (tp.price.gt(0) && tp.percent.gt(0)) {
                const { netProfit } = this.calculateIndividualTp(tp.price, tp.percent, baseMetrics, values, index);
                totalNetProfit = totalNetProfit.plus(netProfit);
                const entryFeePart = positionSize.times(tp.percent.div(100)).times(values.entryPrice).times(values.fees.div(100));
                const exitFeePart = positionSize.times(tp.percent.div(100)).times(tp.price).times(values.fees.div(100));
                totalFees = totalFees.plus(entryFeePart).plus(exitFeePart);
            }
        });

        const totalRR = riskAmount.gt(0) ? totalNetProfit.div(riskAmount) : new Decimal(0);
        const totalROC = requiredMargin.gt(0) ? totalNetProfit.div(requiredMargin).times(100) : new Decimal(0);
        return { totalNetProfit, totalRR, totalFees, riskAmount, totalROC };
    },
    calculatePerformanceStats(journalData: JournalEntry[]) {
        // Filter for closed trades that have a realized P/L value. Old trades without it are ignored.
        const validTrades = journalData.filter(t =>
            (t.status === 'Won' || t.status === 'Lost') &&
            t.realizedPnl !== null &&
            t.realizedPnl !== undefined
        );

        if (validTrades.length === 0) return null;

        const sortedTrades = [...validTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Use a definitive P/L for all calculations
        const tradesWithPnl = sortedTrades.map(trade => ({
            ...trade,
            realizedPnlValue: new Decimal(trade.realizedPnl!)
        }));

        const wonTrades = tradesWithPnl.filter(t => t.realizedPnlValue.gt(0));
        const lostTrades = tradesWithPnl.filter(t => t.realizedPnlValue.lte(0));
        const totalTrades = tradesWithPnl.length;
        const winRate = totalTrades > 0 ? (wonTrades.length / totalTrades) * 100 : 0;
        
        const totalProfit = wonTrades.reduce((sum, t) => sum.plus(t.realizedPnlValue), new Decimal(0));
        const totalLoss = lostTrades.reduce((sum, t) => sum.plus(t.realizedPnlValue.abs()), new Decimal(0));
        const profitFactor = totalLoss.gt(0) ? totalProfit.dividedBy(totalLoss) : null;
        
        const avgWin = wonTrades.length > 0 ? totalProfit.dividedBy(wonTrades.length) : new Decimal(0);
        const avgLossOnly = lostTrades.length > 0 ? totalLoss.dividedBy(lostTrades.length) : new Decimal(0);
        const winLossRatio = avgLossOnly.gt(0) ? avgWin.dividedBy(avgLossOnly) : null;

        const largestProfit = wonTrades.length > 0 ? Decimal.max(0, ...wonTrades.map(t => t.realizedPnlValue)) : new Decimal(0);
        const largestLoss = lostTrades.length > 0 ? Decimal.max(0, ...lostTrades.map(t => t.realizedPnlValue.abs())) : new Decimal(0);

        let totalRMultiples = new Decimal(0);
        let tradesWithRisk = 0;
        tradesWithPnl.forEach(trade => {
            if (trade.riskAmount && new Decimal(trade.riskAmount).gt(0)) {
                const rMultiple = trade.realizedPnlValue.dividedBy(new Decimal(trade.riskAmount));
                totalRMultiples = totalRMultiples.plus(rMultiple);
                tradesWithRisk++;
            }
        });
        const avgRMultiple = tradesWithRisk > 0 ? totalRMultiples.dividedBy(tradesWithRisk) : new Decimal(0);

        let cumulativeProfit = new Decimal(0), peakEquity = new Decimal(0), maxDrawdown = new Decimal(0);
        tradesWithPnl.forEach(trade => {
            cumulativeProfit = cumulativeProfit.plus(trade.realizedPnlValue);
            if (cumulativeProfit.gt(peakEquity)) peakEquity = cumulativeProfit;
            const drawdown = peakEquity.minus(cumulativeProfit);
            if (drawdown.gt(maxDrawdown)) maxDrawdown = drawdown;
        });

        const recoveryFactor = maxDrawdown.gt(0) ? cumulativeProfit.dividedBy(maxDrawdown) : new Decimal(0);
        const lossRate = totalTrades > 0 ? (lostTrades.length / totalTrades) * 100 : 0;
        const expectancy = (new Decimal(winRate/100).times(avgWin)).minus(new Decimal(lossRate/100).times(avgLossOnly));

        let totalProfitLong = new Decimal(0), totalLossLong = new Decimal(0), totalProfitShort = new Decimal(0), totalLossShort = new Decimal(0);
        tradesWithPnl.forEach(trade => {
            if (trade.tradeType === CONSTANTS.TRADE_TYPE_LONG) {
                if (trade.realizedPnlValue.gt(0)) totalProfitLong = totalProfitLong.plus(trade.realizedPnlValue);
                else totalLossLong = totalLossLong.plus(trade.realizedPnlValue.abs());
            } else {
                if (trade.realizedPnlValue.gt(0)) totalProfitShort = totalProfitShort.plus(trade.realizedPnlValue);
                else totalLossShort = totalLossShort.plus(trade.realizedPnlValue.abs());
            }
        });

        let longestWinningStreak = 0, currentWinningStreak = 0, longestLosingStreak = 0, currentLosingStreak = 0, currentStreakText = 'N/A';
        tradesWithPnl.forEach(trade => {
            if (trade.realizedPnlValue.gt(0)) {
                currentWinningStreak++;
                currentLosingStreak = 0;
                if (currentWinningStreak > longestWinningStreak) longestWinningStreak = currentWinningStreak;
            } else {
                currentLosingStreak++;
                currentWinningStreak = 0;
                if (currentLosingStreak > longestLosingStreak) longestLosingStreak = currentLosingStreak;
            }
        });
        if (tradesWithPnl.length > 0) {
            const lastIsWin = tradesWithPnl[tradesWithPnl.length - 1].realizedPnlValue.gt(0);
            let streak = 0;
            for (let i = tradesWithPnl.length - 1; i >= 0; i--) {
                if ((lastIsWin && tradesWithPnl[i].realizedPnlValue.gt(0)) || (!lastIsWin && tradesWithPnl[i].realizedPnlValue.lte(0))) streak++;
                else break;
            }
            currentStreakText = `${lastIsWin ? 'W' : 'L'}${streak}`;
        }

        return { totalTrades, winRate, profitFactor, expectancy, avgRMultiple, avgWin, avgLossOnly, winLossRatio, largestProfit, largestLoss, maxDrawdown, recoveryFactor, currentStreakText, longestWinningStreak, longestLosingStreak, totalProfitLong, totalLossLong, totalProfitShort, totalLossShort };
    },
    calculateSymbolPerformance(journalData: JournalEntry[]) {
        const closedTrades = journalData.filter(t => t.status === 'Won' || t.status === 'Lost');
        const symbolPerformance: { [key: string]: { totalTrades: number; wonTrades: number; totalProfitLoss: Decimal; totalPlannedProfitLoss: Decimal; } } = {};

        closedTrades.forEach(trade => {
            if (!trade.symbol) return;
            if (!symbolPerformance[trade.symbol]) {
                symbolPerformance[trade.symbol] = { totalTrades: 0, wonTrades: 0, totalProfitLoss: new Decimal(0), totalPlannedProfitLoss: new Decimal(0) };
            }

            // Calculate planned P/L (old logic)
            const plannedPnl = trade.status === 'Won'
                ? new Decimal(trade.totalNetProfit || 0)
                : new Decimal(trade.netLoss || 0).negated();
            symbolPerformance[trade.symbol].totalPlannedProfitLoss = symbolPerformance[trade.symbol].totalPlannedProfitLoss.plus(plannedPnl);

            // Calculate realized P/L (new logic)
            if (trade.realizedPnl !== null && trade.realizedPnl !== undefined) {
                const realizedPnl = new Decimal(trade.realizedPnl);
                symbolPerformance[trade.symbol].totalProfitLoss = symbolPerformance[trade.symbol].totalProfitLoss.plus(realizedPnl);

                // Only count trades with realizedPnl for win rate and total trades
                symbolPerformance[trade.symbol].totalTrades++;
                if (realizedPnl.gt(0)) {
                    symbolPerformance[trade.symbol].wonTrades++;
                }
            }
        });

        return symbolPerformance;
    }
};