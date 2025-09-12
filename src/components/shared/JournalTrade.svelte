<script lang="ts">
    import type { JournalEntry } from "../../stores/types";
    import { _, locale } from '../../locales/i18n';
    import { app } from '../../services/app';
    import { icons, CONSTANTS } from '../../lib/constants';
    import { formatDate } from '../../utils/utils';
    import { numberInput } from '../../utils/inputUtils';
    import { tick } from 'svelte';
    import Decimal from "decimal.js";

    export let trade: JournalEntry;
    export let viewMode: 'table' | 'card';
    export let editingTradeId: number | null;

    let editingPnlValue: string = '';
    let isDeleting = false;

    function startEditing() {
        editingPnlValue = trade.realizedPnl ? trade.realizedPnl.toString() : '';
        editingTradeId = trade.id;
    }

    function cancelEditing() {
        editingTradeId = null;
    }

    function saveEditing() {
        // Only update if the value has actually changed to avoid unnecessary store writes
        const originalValue = trade.realizedPnl ? trade.realizedPnl.toString() : '';
        if (editingPnlValue !== originalValue) {
            app.updateRealizedPnl(trade.id, editingPnlValue);
        }
        editingTradeId = null;
    }

    function focus(node: HTMLInputElement) {
        tick().then(() => {
            node.focus();
            node.select();
        });
    }

    function formatPnl(pnl: Decimal | null | undefined): string {
        if (pnl === null || pnl === undefined) {
            return '-';
        }
        if (pnl instanceof Decimal) {
            return pnl.toFixed(2);
        }
        return Number(pnl).toFixed(2);
    }
</script>

{#if viewMode === 'table'}
    <tr>
        <td>{formatDate(trade.date, $locale)}</td>
        <td>{trade.symbol || '-'}</td>
        <td class="{trade.tradeType === CONSTANTS.TRADE_TYPE_LONG ? 'text-[var(--success-color)]' : 'text-[var(--danger-color)]'}">{trade.tradeType.charAt(0).toUpperCase() + trade.tradeType.slice(1)}</td>
        <td>{trade.entryPrice.toFixed(4)}</td>
        <td>{trade.stopLossPrice.toFixed(4)}</td>
        <td class="{trade.totalNetProfit.gt(0) ? 'text-[var(--success-color)]' : trade.totalNetProfit.lt(0) ? 'text-[var(--danger-color)]' : ''}">{trade.totalNetProfit.toFixed(2)}</td>
        <td class="p-2">
            {#if editingTradeId === trade.id}
                <input
                    type="text"
                    class="input-field w-24 px-2 py-1"
                    bind:value={editingPnlValue}
                    use:numberInput={{ maxDecimalPlaces: 4 }}
                    use:focus
                    on:blur={() => { if (!isDeleting) saveEditing(); }}
                    on:keydown={(e) => { if (e.key === 'Enter') saveEditing(); else if (e.key === 'Escape') cancelEditing(); }}
                />
            {:else}
                <button type="button" class="input-field-placeholder text-left w-full h-full min-h-[34px] px-2 py-1" on:click={startEditing}>
                    {formatPnl(trade.realizedPnl)}
                </button>
            {/if}
        </td>
        <td class="{trade.totalRR.gte(2) ? 'text-[var(--success-color)]' : trade.totalRR.gte(1.5) ? 'text-[var(--warning-color)]' : 'text-[var(--danger-color)]'}">{trade.totalRR.toFixed(2)}</td>
        <td>
            <select class="status-select input-field p-1" value={trade.status} on:change={(e) => app.updateTradeStatus(trade.id, (e.target as HTMLSelectElement).value)}>
                <option value="Open">{$_('journal.filterOpen')}</option>
                <option value="Won">{$_('journal.filterWon')}</option>
                <option value="Lost">{$_('journal.filterLost')}</option>
            </select>
        </td>
        <td class="notes-cell" title="{$_('journal.clickToExpand')}" on:click={(e) => (e.target as HTMLElement).classList.toggle('expanded')}>{trade.notes || ''}</td>
        <td class="text-center">
            <button class="delete-trade-btn text-[var(--danger-color)] hover:opacity-80 p-1 rounded-full" title="{$_('journal.delete')}" on:mousedown={() => isDeleting = true} on:click={() => app.deleteTrade(trade.id)}>{@html icons.delete}</button>
        </td>
    </tr>
{:else}
    <div class="bg-[var(--bg-primary)] p-4 rounded-lg shadow-md border border-[var(--border-color)]"
         class:status-won={trade.status === 'Won'}
         class:status-lost={trade.status === 'Lost'}
    >
        <div class="flex justify-between items-start">
            <div>
                <div class="text-lg font-bold text-[var(--text-primary)]">{trade.symbol || '-'}</div>
                <div class="text-sm {trade.tradeType === CONSTANTS.TRADE_TYPE_LONG ? 'text-[var(--success-color)]' : 'text-[var(--danger-color)]'}">{trade.tradeType.charAt(0).toUpperCase() + trade.tradeType.slice(1)}</div>
            </div>
            <div class="text-right">
                <div class="text-lg font-bold {trade.totalNetProfit.gt(0) ? 'text-[var(--success-color)]' : trade.totalNetProfit.lt(0) ? 'text-[var(--danger-color)]' : ''}">
                    {trade.totalNetProfit.toFixed(2)}
                </div>
                <div class="text-xs text-[var(--text-secondary)]">P/L</div>
            </div>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-4">
            <div>
                <div class="text-sm">Status</div>
                <select class="status-select input-field p-1 mt-1 w-full" value={trade.status} on:change={(e) => app.updateTradeStatus(trade.id, (e.target as HTMLSelectElement).value)}>
                    <option value="Open">{$_('journal.filterOpen')}</option>
                    <option value="Won">{$_('journal.filterWon')}</option>
                    <option value="Lost">{$_('journal.filterLost')}</option>
                </select>
            </div>
            <div>
                <div class="text-sm">Realized P/L</div>
                {#if editingTradeId === trade.id}
                    <input
                        type="text"
                        class="input-field w-full px-2 py-1 mt-1"
                        bind:value={editingPnlValue}
                        use:numberInput={{ maxDecimalPlaces: 4 }}
                        use:focus
                        on:blur={() => { if (!isDeleting) saveEditing(); }}
                        on:keydown={(e) => { if (e.key === 'Enter') saveEditing(); else if (e.key === 'Escape') cancelEditing(); }}
                    />
                {:else}
                    <button type="button" class="input-field-placeholder mt-1 text-left w-full" on:click={startEditing}>
                        {formatPnl(trade.realizedPnl)}
                    </button>
                {/if}
            </div>
        </div>
        <div class="mt-4 flex justify-between items-center">
            <div class="text-sm text-slate-400">{formatDate(trade.date, $locale)}</div>
            <button class="delete-trade-btn text-[var(--danger-color)] hover:opacity-80 p-1 rounded-full cursor-pointer" title="{$_('journal.delete')}" on:mousedown={() => isDeleting = true} on:click={() => app.deleteTrade(trade.id)}>{@html icons.delete}</button>
        </div>
    </div>
{/if}

<style>
    .input-field-placeholder {
        @apply w-full px-2 py-1 h-[34px] border border-transparent rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700;
        line-height: 1.5; /* Adjust to vertically center text if needed */
    }
    .status-won {
        background-color: color-mix(in srgb, var(--success-color) 10%, var(--bg-primary));
        border-left: 4px solid var(--success-color);
    }
    .status-lost {
        background-color: color-mix(in srgb, var(--danger-color) 10%, var(--bg-primary));
        border-left: 4px solid var(--danger-color);
    }
</style>
