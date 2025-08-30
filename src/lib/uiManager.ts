import { CONSTANTS, themes, themeIcons } from './constants';
import { parseDecimal } from './utils';
import { modalManager } from './modalManager';
import { calculator } from './calculator';
import { Decimal } from 'decimal.js';
import { loadInstruction } from './markdownLoader';
import { _ } from './i18n';
import { get } from 'svelte/store';

interface VisualBarContentItem {
    type: string;
    style: { left: string; width: string; };
}

interface VisualBarMarker {
    pos: Decimal;
    label: string;
    isEntry: boolean;
    index?: number;
}

export interface VisualBarData {
    visualBarContent: VisualBarContentItem[];
    markers: VisualBarMarker[];
}

export const uiManager = {
    showReadme: async (type: 'dashboard' | 'journal' | 'changelog') => {
        const instruction = await loadInstruction(type);
        let titleKey: string;
        if (type === 'dashboard') {
            titleKey = 'dashboard.instructionsTitle';
        } else if (type === 'journal') {
            titleKey = 'journal.showJournalInstructionsTitle';
        } else { // type === 'changelog'
            titleKey = 'app.changelogTitle';
        }
        const translatedTitle = get(_)(titleKey);
        modalManager.show(translatedTitle, instruction.html, 'alert');
    }
};

export function updateVisualBar(values: any, targets: any[]): VisualBarData {
    const visualBarContent: { type: string; style: { left: string; width: string; }; }[] = [];
    const markers: { pos: Decimal; label: string; isEntry: boolean; index?: number; }[] = [];

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
    markers.push({ pos: entryPos, label: 'Einstieg', isEntry: true });
    
    targets.forEach((tp, i) => {
        if ((values.tradeType === CONSTANTS.TRADE_TYPE_LONG && parseDecimal(tp.price).gt(parseDecimal(values.entryPrice))) || (values.tradeType === CONSTANTS.TRADE_TYPE_SHORT && parseDecimal(tp.price).lt(parseDecimal(values.entryPrice)))) {
            const tpPos = parseDecimal(tp.price).minus(lowestPrice).dividedBy(totalRange).times(100);
            markers.push({ pos: tpPos, label: `TP${i+1}`, isEntry: false, index: i });
        }
    });

    return { visualBarContent, markers };
}