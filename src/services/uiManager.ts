import { CONSTANTS } from '../lib/constants';
import { parseDecimal } from '../utils/utils';
import { modalManager } from './modalManager';
import { Decimal } from 'decimal.js';
import { loadInstruction } from './markdownLoader';
import { _ } from '../locales/i18n';
import { get } from 'svelte/store';
import type { IndividualTpResult } from '../stores/types';

/**
 * Represents a colored segment (gain or loss zone) in the visual bar.
 */
interface VisualBarContentItem {
    /** The type of zone, e.g., 'gain-zone' or 'loss-zone'. */
    type: string;
    /** The CSS styles (left position and width) for the segment. */
    style: { left: string; width: string; };
}

/**
 * Represents a marker for a specific price point (SL, Entry, TP) on the visual bar.
 */
interface VisualBarMarker {
    /** The position of the marker as a percentage from the left. */
    pos: Decimal;
    /** The text label for the marker (e.g., 'SL', 'Entry'). */
    label:string;
    /** Whether this marker represents the entry price. */
    isEntry: boolean;
    /** The index of the Take-Profit target, if applicable. */
    index?: number;
    /** The Risk/Reward ratio for the Take-Profit target, if applicable. */
    rr?: Decimal;
}

/**
 * The complete data structure required to render the visual bar component.
 */
export interface VisualBarData {
    /** An array of colored segments for the bar's background. */
    visualBarContent: VisualBarContentItem[];
    /** An array of markers to be placed on the bar. */
    markers: VisualBarMarker[];
}

/**
 * A service for managing complex UI interactions.
 */
export const uiManager = {
    /**
     * Loads instructional content and displays it in a modal dialog.
     * @param type - The type of content to display ('dashboard', 'journal', 'changelog').
     */
    showReadme: async (type: 'dashboard' | 'journal' | 'changelog' | 'guide') => {
        const instruction = await loadInstruction(type);
        let titleKey: string;
        if (type === 'dashboard') {
            titleKey = 'dashboard.instructionsTitle';
        } else if (type === 'journal') {
            titleKey = 'journal.showJournalInstructionsTitle';
        } else if (type === 'guide') {
            titleKey = 'guide.title';
        } else { // type === 'changelog'
            titleKey = 'app.changelogTitle';
        }
        const translatedTitle = get(_)(titleKey);
        modalManager.show(translatedTitle, instruction.html, 'alert');
    }
};

/**
 * Calculates the positions and data needed to render the visual risk/reward bar.
 * @param values - An object containing the entry price, stop-loss price, and trade type.
 * @param targets - An array of the user's take-profit targets.
 * @param calculatedTpDetails - An array of detailed calculation results for each TP.
 * @returns A `VisualBarData` object used by the `VisualBar` component.
 */
export function updateVisualBar(
    values: { entryPrice: Decimal | null; stopLossPrice: Decimal | null; tradeType: string },
    targets: Array<{ price: Decimal | null; percent: Decimal | null; isLocked: boolean }>,
    calculatedTpDetails: IndividualTpResult[]
): VisualBarData {
    const visualBarContent: { type: string; style: { left: string; width: string; }; }[] = [];
    const markers: VisualBarMarker[] = [];

    const validTargetPrices = targets.map(t => parseDecimal(t.price)).filter(p => p.gt(0));
    const allPrices = [parseDecimal(values.entryPrice), parseDecimal(values.stopLossPrice), ...validTargetPrices];
    if (allPrices.some(p => p.lte(0))) return { visualBarContent, markers };

    const highestPrice = Decimal.max(...allPrices);
    const lowestPrice = Decimal.min(...allPrices);
    const totalRange = highestPrice.minus(lowestPrice);
    if (totalRange.lte(0)) return { visualBarContent, markers };

    const slPos = parseDecimal(values.stopLossPrice).minus(lowestPrice).dividedBy(totalRange).times(100);
    const entryPos = parseDecimal(values.entryPrice).minus(lowestPrice).dividedBy(totalRange).times(100);

    if (values.tradeType === CONSTANTS.TRADE_TYPE_LONG) {
        visualBarContent.push({ type: 'loss-zone', style: { left: `${slPos}%`, width: `${entryPos.minus(slPos)}%` } });
        visualBarContent.push({ type: 'gain-zone', style: { left: `${entryPos}%`, width: `${new Decimal(100).minus(entryPos)}%` } });
    } else {
        visualBarContent.push({ type: 'gain-zone', style: { left: '0', width: `${entryPos}%` } });
        visualBarContent.push({ type: 'loss-zone', style: { left: `${entryPos}%`, width: `${slPos.minus(entryPos)}%` } });
    }

    markers.push({ pos: slPos, label: 'SL', isEntry: false });
    markers.push({ pos: entryPos, label: 'Entry', isEntry: true });

    calculatedTpDetails.forEach(tpDetail => {
        const tpPrice = parseDecimal(targets[tpDetail.index].price);
        const tpPos = tpPrice.minus(lowestPrice).dividedBy(totalRange).times(100);
        markers.push({
            pos: tpPos,
            label: `TP${tpDetail.index + 1}`,
            isEntry: false,
            index: tpDetail.index,
            rr: tpDetail.riskRewardRatio
        });
    });

    return { visualBarContent, markers };
}