import { Decimal } from 'decimal.js';
import { CONSTANTS } from './constants';
import type { TradeValues, BaseMetrics, IndividualTpResult, TotalMetrics, JournalEntry } from '../stores/types';
import type { Kline } from '../services/apiService';

/**
 * An object that encapsulates all core calculation functions for the trading application.
 */
export const calculator = {
    /**
     * Calculates basic trading metrics based on user inputs.
     * @param values - An object containing the input values for the trade (account size, risk, prices, etc.).
     * @param tradeType - The type of trade ('long' or 'short').
     * @returns An object with the calculated base metrics, or null if the risk per unit is zero.
     */
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
        let breakEvenPrice;
        if (tradeType === CONSTANTS.TRADE_TYPE_LONG) {
            const denominator = new Decimal(1).minus(feeFactor);
            breakEvenPrice = denominator.isZero() ? new Decimal(Infinity) : values.entryPrice.times(feeFactor.plus(1)).div(denominator);
        } else {
            breakEvenPrice = values.entryPrice.times(new Decimal(1).minus(feeFactor)).div(feeFactor.plus(1));
        }

        const estimatedLiquidationPrice = values.leverage.gt(0) ? (tradeType === CONSTANTS.TRADE_TYPE_LONG
            ? values.entryPrice.times(new Decimal(1).minus(new Decimal(1).div(values.leverage)))
            : values.entryPrice.times(new Decimal(1).plus(new Decimal(1).div(values.leverage)))) : new Decimal(0);
        
        return { positionSize, requiredMargin, netLoss, breakEvenPrice, estimatedLiquidationPrice, entryFee, riskAmount };
    },

    /**
     * Calculates the Average True Range (ATR) from a series of candlestick data.
     * Uses Wilder's Smoothing Method.
     * @param klines - An array of candlestick objects (Kline).
     * @param period - The period for the ATR calculation (default is 14).
     * @returns The calculated ATR value as a Decimal. Returns 0 if there is not enough data.
     */
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

    /**
     * Calculates the metrics for a single Take-Profit target.
     * @param tpPrice - The price of the take-profit target.
     * @param currentTpPercent - The percentage of the position to be sold at this target.
     * @param baseMetrics - The previously calculated base metrics.
     * @param values - The original input values of the trade.
     * @param index - The index of the target.
     * @param tradeType - The type of trade ('long' or 'short').
     * @returns An object with the calculated metrics for this TP target.
     */
    calculateIndividualTp(tpPrice: Decimal, currentTpPercent: Decimal, baseMetrics: BaseMetrics, values: TradeValues, index: number, tradeType: string): IndividualTpResult {
        const { positionSize, requiredMargin } = baseMetrics;
        const gainPerUnit = tpPrice.minus(values.entryPrice).abs();
        const positionPart = positionSize.times(currentTpPercent.div(100));
        const grossProfitPart = gainPerUnit.times(positionPart);
        const exitFee = positionPart.times(tpPrice).times(values.fees.div(100));
        const entryFeePart = positionPart.times(values.entryPrice).times(values.fees.div(100));
        const netProfit = grossProfitPart.minus(entryFeePart).minus(exitFee);

        // --- STANDARD GROSS RRR (NEW LOGIC) ---
        const riskPerUnit = values.entryPrice.minus(values.stopLossPrice).abs();
        const riskRewardRatio = riskPerUnit.gt(0) ? gainPerUnit.div(riskPerUnit) : new Decimal(0);

        let priceChangePercent = new Decimal(0);
        if (values.entryPrice.gt(0)) {
            if (tradeType === CONSTANTS.TRADE_TYPE_LONG) {
                priceChangePercent = tpPrice.minus(values.entryPrice).div(values.entryPrice).times(100);
            } else {
                priceChangePercent = values.entryPrice.minus(tpPrice).div(values.entryPrice).times(100);
            }
        }

        const partialROC = requiredMargin.gt(0) ? netProfit.div(requiredMargin).times(100) : new Decimal(0);
        return { netProfit, riskRewardRatio, priceChangePercent, partialROC, partialVolume: positionPart, exitFee, index: index, percentSold: currentTpPercent };
    },

    /**
     * Calculates the total metrics for a trade with multiple take-profit targets.
     * It considers the profit from TPs and the loss from the remaining part of the position hitting the stop-loss.
     * @param targets - An array of take-profit targets (price and percentage).
     * @param baseMetrics - The previously calculated base metrics.
     * @param values - The original input values of the trade.
     * @param tradeType - The type of trade ('long' or 'short').
     * @returns An object with the aggregated total metrics for the entire trade.
     */
    calculateTotalMetrics(targets: Array<{ price: Decimal; percent: Decimal; }>, baseMetrics: BaseMetrics, values: TradeValues, tradeType: string): TotalMetrics {
        const { positionSize, entryFee, riskAmount, requiredMargin } = baseMetrics;
        let totalNetProfit = new Decimal(0);
        let totalFees = entryFee; // Start with the full entry fee
        let totalPercentSoldAtTp = new Decimal(0);

        // Calculate profit and exit fees from TPs
        targets.forEach((tp, index) => {
            if (tp.price.gt(0) && tp.percent.gt(0) && totalPercentSoldAtTp.lt(100)) {
                const remainingPercent = new Decimal(100).minus(totalPercentSoldAtTp);
                const percentToProcess = Decimal.min(tp.percent, remainingPercent);

                const individualResult = this.calculateIndividualTp(tp.price, percentToProcess, baseMetrics, values, index, tradeType);
                totalNetProfit = totalNetProfit.plus(individualResult.netProfit);
                totalFees = totalFees.plus(individualResult.exitFee);
                totalPercentSoldAtTp = totalPercentSoldAtTp.plus(percentToProcess);
            }
        });

        // Account for the part of the position that hits the Stop Loss
        const percentHittingSl = new Decimal(100).minus(totalPercentSoldAtTp);
        if (percentHittingSl.gt(0)) {
            const positionPartHittingSl = positionSize.times(percentHittingSl.div(100));

            // Calculate loss for the SL part
            const riskPerUnit = values.entryPrice.minus(values.stopLossPrice).abs();
            const grossLossOnSlPart = riskPerUnit.times(positionPartHittingSl);

            // Calculate fees for the SL part. Entry fee for this part is already included in the total `entryFee`.
            const entryFeeOnSlPart = positionPartHittingSl.times(values.entryPrice).times(values.fees.div(100));
            const exitFeeOnSlPart = positionPartHittingSl.times(values.stopLossPrice).times(values.fees.div(100));

            // Add exit fee for SL part to total fees
            totalFees = totalFees.plus(exitFeeOnSlPart);

            // Subtract the net loss of the SL part from the totalNetProfit
            const netLossOnSlPart = grossLossOnSlPart.plus(entryFeeOnSlPart).plus(exitFeeOnSlPart);
            totalNetProfit = totalNetProfit.minus(netLossOnSlPart);
        }

        const totalRR = baseMetrics.netLoss.gt(0) ? totalNetProfit.div(baseMetrics.netLoss) : new Decimal(0);
        const totalROC = requiredMargin.gt(0) ? totalNetProfit.div(requiredMargin).times(100) : new Decimal(0);
        return { totalNetProfit, totalRR, totalFees, riskAmount, totalROC };
    },

    /**
     * Calculates comprehensive performance statistics from journal data.
     * @param journalData - An array of completed trade journal entries.
     * @returns An object with various performance metrics (e.g., win rate, profit factor, drawdown), or null if there are no valid trades.
     */
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
        const lostTrades = tradesWithPnl.filter(t => t.realizedPnlValue.lt(0));
        const totalTrades = tradesWithPnl.length; // Includes breakeven trades for a more accurate win rate
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
            } else if (trade.realizedPnlValue.lt(0)) {
                currentLosingStreak++;
                currentWinningStreak = 0;
            } else { // Break-even
                currentWinningStreak = 0;
                currentLosingStreak = 0;
            }
            if (currentWinningStreak > longestWinningStreak) longestWinningStreak = currentWinningStreak;
            if (currentLosingStreak > longestLosingStreak) longestLosingStreak = currentLosingStreak;
        });

        if (tradesWithPnl.length > 0) {
            const lastTrade = tradesWithPnl[tradesWithPnl.length - 1];
            let currentStreak = 0;

            if (lastTrade.realizedPnlValue.gt(0)) {
                for (let i = tradesWithPnl.length - 1; i >= 0; i--) {
                    if (tradesWithPnl[i].realizedPnlValue.gt(0)) currentStreak++;
                    else break;
                }
                currentStreakText = `W${currentStreak}`;
            } else if (lastTrade.realizedPnlValue.lt(0)) {
                for (let i = tradesWithPnl.length - 1; i >= 0; i--) {
                    if (tradesWithPnl[i].realizedPnlValue.lt(0)) currentStreak++;
                    else break;
                }
                currentStreakText = `L${currentStreak}`;
            } else { // Break-even
                 for (let i = tradesWithPnl.length - 1; i >= 0; i--) {
                    if (tradesWithPnl[i].realizedPnlValue.isZero()) currentStreak++;
                    else break;
                }
                currentStreakText = `B/E ${currentStreak}`;
            }
        }

        return { totalTrades, winRate, profitFactor, expectancy, avgRMultiple, avgWin, avgLossOnly, winLossRatio, largestProfit, largestLoss, maxDrawdown, recoveryFactor, currentStreakText, longestWinningStreak, longestLosingStreak, totalProfitLong, totalLossLong, totalProfitShort, totalLossShort };
    },

    /**
     * Aggregates trading performance by trading symbol.
     * @param journalData - An array of completed trade journal entries.
     * @returns An object that maps each symbol to its performance metrics (total trades, wins, total P/L).
     */
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

                // Only count trades with a non-zero P/L for win rate calculation
                if (!realizedPnl.isZero()) {
                    symbolPerformance[trade.symbol].totalTrades++;
                    if (realizedPnl.gt(0)) {
                        symbolPerformance[trade.symbol].wonTrades++;
                    }
                }
            }
        });

        return symbolPerformance;
    }
};