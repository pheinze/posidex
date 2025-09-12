import { derived } from 'svelte/store';
import { tradeStore } from './tradeStore';
import { calculator } from '../lib/calculator';
import { CONSTANTS } from '../lib/constants';
import { parseDecimal } from '../utils/utils';
import { initialResultsState } from './resultsStore';
import type { TradeValues, BaseMetrics, IndividualTpResult, JournalEntry } from './types';
import { Decimal } from 'decimal.js';

export interface CalculationResult {
    results: typeof initialResultsState;
    error: string | null;
    currentTradeData: Partial<JournalEntry> | null;
}

export const calculationStore = derived(tradeStore, ($tradeStore): CalculationResult => {
    const newResults = { ...initialResultsState };

    const getAndValidateInputs = (): { status: string; message?: string; fields?: string[]; data?: TradeValues } => {
        const values: TradeValues = {
            accountSize: parseDecimal($tradeStore.accountSize),
            riskPercentage: parseDecimal($tradeStore.riskPercentage),
            entryPrice: parseDecimal($tradeStore.entryPrice),
            leverage: parseDecimal($tradeStore.leverage || CONSTANTS.DEFAULT_LEVERAGE),
            fees: parseDecimal($tradeStore.fees || CONSTANTS.DEFAULT_FEES),
            symbol: $tradeStore.symbol || '',
            useAtrSl: $tradeStore.useAtrSl,
            atrValue: parseDecimal($tradeStore.atrValue),
            atrMultiplier: parseDecimal($tradeStore.atrMultiplier || CONSTANTS.DEFAULT_ATR_MULTIPLIER),
            stopLossPrice: parseDecimal($tradeStore.stopLossPrice),
            targets: $tradeStore.targets.map(t => ({ price: parseDecimal(t.price), percent: parseDecimal(t.percent), isLocked: t.isLocked })),
            totalPercentSold: new Decimal(0)
        };

        const requiredFieldMap: { [key: string]: Decimal } = {
            accountSize: values.accountSize,
            riskPercentage: values.riskPercentage,
            entryPrice: values.entryPrice,
        };

        if (values.useAtrSl) {
            requiredFieldMap.atrValue = values.atrValue;
        } else {
            requiredFieldMap.stopLossPrice = values.stopLossPrice;
        }

        const emptyFields = Object.keys(requiredFieldMap).filter(field => !requiredFieldMap[field as keyof typeof requiredFieldMap] || requiredFieldMap[field as keyof typeof requiredFieldMap].isZero());
        if (emptyFields.length > 0) return { status: CONSTANTS.STATUS_INCOMPLETE };

        if (values.useAtrSl) {
            if (values.entryPrice.gt(0) && values.atrValue.gt(0) && values.atrMultiplier.gt(0)) {
                const operator = $tradeStore.tradeType === CONSTANTS.TRADE_TYPE_LONG ? '-' : '+';
                values.stopLossPrice = $tradeStore.tradeType === CONSTANTS.TRADE_TYPE_LONG
                    ? values.entryPrice.minus(values.atrValue.times(values.atrMultiplier))
                    : values.entryPrice.plus(values.atrValue.times(values.atrMultiplier));
                newResults.showAtrFormulaDisplay = true;
                newResults.atrFormulaText = `SL = ${values.entryPrice.toDP(4)} ${operator} (${values.atrValue.toDP(4)} × ${values.atrMultiplier}) = ${values.stopLossPrice.toDP(4)}`;
            } else if (values.atrValue.gt(0) && values.atrMultiplier.gt(0)) {
                return { status: CONSTANTS.STATUS_INCOMPLETE };
            }
        }

        newResults.isAtrSlInvalid = values.useAtrSl && values.stopLossPrice.lte(0);
        if (values.stopLossPrice.lte(0)) return { status: CONSTANTS.STATUS_INCOMPLETE };

        if ($tradeStore.tradeType === CONSTANTS.TRADE_TYPE_LONG && values.entryPrice.lte(values.stopLossPrice)) return { status: CONSTANTS.STATUS_INVALID, message: "Long: Stop-Loss must be below Entry Price." };
        if ($tradeStore.tradeType === CONSTANTS.TRADE_TYPE_SHORT && values.entryPrice.gte(values.stopLossPrice)) return { status: CONSTANTS.STATUS_INVALID, message: "Short: Stop-Loss must be above Entry Price." };

        values.totalPercentSold = values.targets.reduce((sum: Decimal, t) => sum.plus(t.percent), new Decimal(0));
        if (values.totalPercentSold.gt(100)) return { status: CONSTANTS.STATUS_INVALID, message: `The sum of TP percentages (${values.totalPercentSold.toFixed(0)}%) cannot exceed 100%.` };

        return { status: CONSTANTS.STATUS_VALID, data: values };
    };

    const validationResult = getAndValidateInputs();

    const returnError = (message: string): CalculationResult => ({ results: initialResultsState, error: message, currentTradeData: null });

    if (validationResult.status === CONSTANTS.STATUS_INCOMPLETE) return returnError('dashboard.promptForData');
    if (validationResult.status === CONSTANTS.STATUS_INVALID) return returnError(validationResult.message!);
    if (!validationResult.data) return returnError('An unknown validation error occurred.');

    const values = validationResult.data;
    const baseMetrics: BaseMetrics | null = calculator.calculateBaseMetrics(values, $tradeStore.tradeType);

    if (!baseMetrics || baseMetrics.positionSize.lte(0)) return returnError("Invalid trade parameters. Position size is zero or negative.");


    newResults.positionSize = baseMetrics.positionSize;
    newResults.requiredMargin = baseMetrics.requiredMargin;
    newResults.netLoss = baseMetrics.netLoss.negated();
    newResults.estimatedLiquidationPrice = values.leverage.gt(1) ? baseMetrics.estimatedLiquidationPrice : null;
    newResults.breakEvenPrice = baseMetrics.breakEvenPrice;
    newResults.entryFee = baseMetrics.entryFee;
    newResults.isAtrSlInvalid = newResults.isAtrSlInvalid;
    newResults.showAtrFormulaDisplay = newResults.showAtrFormulaDisplay;
    newResults.atrFormulaText = newResults.atrFormulaText;

    const calculatedTpDetails: IndividualTpResult[] = [];
    values.targets.forEach((tp, index) => {
        if (tp.price.gt(0) && tp.percent.gt(0)) {
            const details = calculator.calculateIndividualTp(tp.price, tp.percent, baseMetrics!, values, index, $tradeStore.tradeType);
            calculatedTpDetails.push(details);
        }
    });
    newResults.calculatedTpDetails = calculatedTpDetails;

    const totalMetrics = calculator.calculateTotalMetrics(values.targets, baseMetrics, values, $tradeStore.tradeType);
    if (values.totalPercentSold.gt(0)) {
        newResults.totalRR = totalMetrics.totalRR;
        newResults.totalNetProfit = totalMetrics.totalNetProfit;
        newResults.totalPercentSold = values.totalPercentSold;
        newResults.riskAmountCurrency = totalMetrics.riskAmount.negated();
        newResults.totalFees = totalMetrics.totalFees;
        newResults.totalROC = totalMetrics.totalROC;
        newResults.showTotalMetricsGroup = true;
    }

    const currentTradeData: Partial<JournalEntry> = { ...values, ...baseMetrics, ...totalMetrics, tradeType: $tradeStore.tradeType, status: 'Open', calculatedTpDetails };

    return {
        results: newResults,
        error: null,
        currentTradeData: currentTradeData
    };
});
