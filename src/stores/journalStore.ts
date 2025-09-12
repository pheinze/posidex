import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { Decimal } from 'decimal.js';
import { CONSTANTS } from '../lib/constants';
import type { JournalEntry } from './types';

/**
 * Loads journal entries from the browser's Local Storage.
 * This function only runs on the client-side. It reads the raw JSON data,
 * parses it, and converts numeric fields that require precision into `Decimal` objects.
 * @returns An array of `JournalEntry` objects. Returns an empty array if
 * not in a browser, if no data exists, or if an error occurs.
 */
function loadJournalFromLocalStorage(): JournalEntry[] {
    if (!browser) return [];
    try {
        const d = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_JOURNAL_KEY) || '[]';
        const parsedData = JSON.parse(d);
        if (!Array.isArray(parsedData)) return [];
        return parsedData.map(trade => {
            const newTrade = { ...trade };
            Object.keys(newTrade).forEach(key => {
                if (['accountSize', 'riskPercentage', 'entryPrice', 'stopLossPrice', 'leverage', 'fees', 'atrValue', 'atrMultiplier', 'totalRR', 'totalNetProfit', 'netLoss', 'riskAmount', 'totalFees', 'maxPotentialProfit', 'positionSize', 'realizedPnl'].includes(key)) {
                    // Ensure nulls are not converted to Decimal(0)
                    if (newTrade[key] !== null && newTrade[key] !== undefined) {
                        newTrade[key] = new Decimal(newTrade[key] || 0);
                    }
                }
            });
            if (newTrade.targets && Array.isArray(newTrade.targets)) {
                newTrade.targets = newTrade.targets.map((tp: {price: string | number; percent: string | number}) => ({ ...tp, price: new Decimal(tp.price || 0), percent: new Decimal(tp.percent || 0) }));
            }
            return newTrade as JournalEntry;
        });
    } catch (e) {
        console.warn("Could not load journal from localStorage.", e);
        // showError("Journal konnte nicht geladen werden."); // This would cause dependency cycle
        return [];
    }
}

/**
 * A Svelte `writable` store that manages the list of trade journal entries.
 * The store is initialized with data loaded from Local Storage.
 * Any changes to the store are automatically written back to Local Storage
 * to ensure data persistence across sessions.
 */
export const journalStore = writable<JournalEntry[]>(loadJournalFromLocalStorage());

journalStore.subscribe(value => {
    if (browser) {
        try {
            localStorage.setItem(CONSTANTS.LOCAL_STORAGE_JOURNAL_KEY, JSON.stringify(value));
        } catch (e) {
            console.warn("Could not save journal to localStorage.", e);
        }
    }
});
