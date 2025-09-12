<script lang="ts">
    /**
     * @component JournalView
     *
     * This component renders the entire trade journal interface, including stats,
     * filtering controls, and the list of trades. It is displayed inside a modal,
     * controlled by the `uiStore`.
     *
     * It features a responsive design, showing a detailed table on desktop and
     * a card-based layout on mobile.
     *
     * Key functionalities include:
     * - Subscribing to `journalStore` and `tradeStore` to display and filter trades.
     * - Allowing in-place editing of a trade's status and realized P/L.
     * - Handling CSV import/export functionality.
     * - Displaying performance statistics via the `JournalStats` component.
     * - All business logic is delegated to the `app` service.
     */
    import Decimal from 'decimal.js';
    import { tradeStore } from '../../stores/tradeStore';
    import { journalStore } from '../../stores/journalStore';
    import { uiStore } from '../../stores/uiStore';
    import { app } from '../../services/app';
    import { _, locale } from '../../locales/i18n';
    import { icons, CONSTANTS } from '../../lib/constants';
    import { browser } from '$app/environment';
    import { numberInput } from '../../utils/inputUtils';
    import { tick } from 'svelte';
    import JournalStats from '../results/JournalStats.svelte';

    let editingTradeId: number | null = null;

    $: filteredTrades = $journalStore.filter(trade =>
        trade.symbol.toLowerCase().includes($tradeStore.journalSearchQuery.toLowerCase()) &&
        ($tradeStore.journalFilterStatus === 'all' || trade.status === $tradeStore.journalFilterStatus)
    );

    function handleImportCsv(event: Event) {
        if (browser) {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
                app.importFromCSV(file);
            }
        }
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
        // Fallback for primitive numbers from older storage formats
        return Number(pnl).toFixed(2);
    }
</script>

<div
    id="journal-modal"
    class="modal-overlay"
    class:visible={$uiStore.showJournalModal}
    class:opacity-100={$uiStore.showJournalModal}
    on:click={(e) => { if (e.target === e.currentTarget) uiStore.toggleJournalModal(false) }}
    on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { if (e.target === e.currentTarget) uiStore.toggleJournalModal(false) } }}
    role="button"
    tabindex="0"
>
    <div class="modal-content w-full h-full max-w-6xl">
         <div class="flex justify-between items-center mb-4"><h2 class="text-2xl font-bold">{$_('journal.title')}</h2><button id="close-journal-btn" class="text-3xl" aria-label="{$_('journal.closeJournalAriaLabel')}" on:click={() => uiStore.toggleJournalModal(false)}>&times;</button></div>
         <div id="journal-stats" class="journal-stats">
            <JournalStats journalData={$journalStore} />
         </div>
         <div class="flex gap-4 my-4"><input type="text" id="journal-search" class="input-field w-full px-3 py-2 rounded-md" placeholder="{$_('journal.searchSymbolPlaceholder')}" bind:value={$tradeStore.journalSearchQuery}><select id="journal-filter" class="input-field px-3 py-2 rounded-md" bind:value={$tradeStore.journalFilterStatus}><option value="all">{$_('journal.filterAll')}</option><option value="Open">{$_('journal.filterOpen')}</option><option value="Won">{$_('journal.filterWon')}</option><option value="Lost">{$_('journal.filterLost')}</option></select></div>
        <div class="max-h-[calc(100vh-20rem)] overflow-auto">
            <!-- Desktop Table -->
            <div class="hidden md:block">
                <table class="journal-table w-full">
                    <thead><tr><th>{$_('journal.date')}</th><th>{$_('journal.symbol')}</th><th>{$_('journal.type')}</th><th>{$_('journal.entry')}</th><th>{$_('journal.sl')}</th><th>{$_('journal.plannedPnl')}</th><th>{$_('journal.realizedPnl')}</th><th>{$_('journal.rr')}</th><th>{$_('journal.status')}</th><th>{$_('journal.notes')}</th><th>{$_('journal.action')}</th></tr></thead>
                    <tbody>
                        {#each filteredTrades as trade}
                            <tr>
                                <td>{new Date(trade.date).toLocaleString($locale || undefined, {day:'2-digit', month: '2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit'})}</td>
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
                                            value={trade.realizedPnl}
                                            use:numberInput={{ maxDecimalPlaces: 4 }}
                                            use:focus
                                            on:blur={(e) => { app.updateRealizedPnl(trade.id, (e.target as HTMLInputElement).value); editingTradeId = null; }}
                                            on:keydown={(e) => { if (e.key === 'Enter') { (e.target as HTMLInputElement).blur(); } else if (e.key === 'Escape') { editingTradeId = null; } }}
                                        />
                                    {:else}
                                        <button type="button" class="input-field-placeholder text-left w-full h-full min-h-[34px] px-2 py-1" on:click={() => editingTradeId = trade.id}>
                                            {formatPnl(trade.realizedPnl)}
                                        </button>
                                    {/if}
                                </td>
                                <td class="{trade.totalRR.gte(2) ? 'text-[var(--success-color)]' : trade.totalRR.gte(1.5) ? 'text-[var(--warning-color)]' : 'text-[var(--danger-color)]'}">{trade.totalRR.toFixed(2)}</td>
                                <td>
                                    <select class="status-select input-field p-1" data-id="{trade.id}" on:change={(e) => app.updateTradeStatus(trade.id, (e.target as HTMLSelectElement).value)}>
                                        <option value="Open" selected={trade.status === 'Open'}>{$_('journal.filterOpen')}</option>
                                        <option value="Won" selected={trade.status === 'Won'}>{$_('journal.filterWon')}</option>
                                        <option value="Lost" selected={trade.status === 'Lost'}>{$_('journal.filterLost')}</option>
                                    </select>
                                </td>
                                <td class="notes-cell" title="{$_('journal.clickToExpand')}" on:click={(e) => (e.target as HTMLElement).classList.toggle('expanded')}>{trade.notes || ''}</td>
                                <td class="text-center"><button class="delete-trade-btn text-[var(--danger-color)] hover:opacity-80 p-1 rounded-full" data-id="{trade.id}" title="{$_('journal.delete')}" on:click={() => app.deleteTrade(trade.id)}>{@html icons.delete}</button></td>
                            </tr>
                        {/each}
                        {#if filteredTrades.length === 0}
                            <tr><td colspan="10" class="text-center text-slate-500 py-8">{$_('journal.noTradesYet')}</td></tr>
                        {/if}
                    </tbody>
                </table>
            </div>

            <!-- Mobile Card Layout -->
            <div class="md:hidden space-y-4">
                {#each filteredTrades as trade}
                    <div class="bg-[var(--bg-primary)] p-4 rounded-lg shadow-md border border-[var(--border-color)]">
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
                                <select class="status-select input-field p-1 mt-1 w-full" data-id="{trade.id}" on:change={(e) => app.updateTradeStatus(trade.id, (e.target as HTMLSelectElement).value)}>
                                    <option value="Open" selected={trade.status === 'Open'}>{$_('journal.filterOpen')}</option>
                                    <option value="Won" selected={trade.status === 'Won'}>{$_('journal.filterWon')}</option>
                                    <option value="Lost" selected={trade.status === 'Lost'}>{$_('journal.filterLost')}</option>
                                </select>
                            </div>
                            <div>
                                <div class="text-sm">Realized P/L</div>
                                {#if editingTradeId === trade.id}
                                    <input
                                        type="text"
                                        class="input-field w-full px-2 py-1 mt-1"
                                        value={trade.realizedPnl}
                                        use:numberInput={{ maxDecimalPlaces: 4 }}
                                        use:focus
                                        on:blur={(e) => { app.updateRealizedPnl(trade.id, (e.target as HTMLInputElement).value); editingTradeId = null; }}
                                        on:keydown={(e) => { if (e.key === 'Enter') { (e.target as HTMLInputElement).blur(); } else if (e.key === 'Escape') { editingTradeId = null; } }}
                                    />
                                {:else}
                                    <button type="button" class="input-field-placeholder mt-1 text-left w-full" on:click={() => editingTradeId = trade.id}>
                                        {formatPnl(trade.realizedPnl)}
                                    </button>
                                {/if}
                            </div>
                        </div>
                        <div class="mt-4 flex justify-between items-center">
                            <div class="text-right">
                                <div class="text-sm text-slate-400">{new Date(trade.date).toLocaleString('de-DE', {day:'2-digit', month: '2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit'})}</div>
                                <button class="delete-trade-btn text-[var(--danger-color)] hover:opacity-80 p-1 rounded-full cursor-pointer mt-1" data-id="{trade.id}" title="{$_('journal.delete')}" on:click={() => app.deleteTrade(trade.id)}>{@html icons.delete}</button>
                            </div>
                        </div>
                    </div>
                {/each}
                {#if filteredTrades.length === 0}
                    <div class="text-center text-slate-500 py-8">{$_('journal.noTradesYet')}</div>
                {/if}
            </div>
        </div>
        <h3 class="text-xl font-bold mt-6 mb-4">{$_('journal.performancePerSymbol')}</h3>
        <div id="symbol-performance-stats" class="max-h-48 overflow-y-auto border border-[var(--border-color)] rounded-md p-2">
            <table class="journal-table w-full">
                <thead><tr><th>{$_('journal.symbol')}</th><th>{$_('journal.trades')}</th><th>{$_('journal.winRate')}</th><th>{$_('journal.realizedPnl')}</th></tr></thead>
                <tbody id="symbol-performance-table-body">
                    {#each Object.entries(app.calculator.calculateSymbolPerformance($journalStore)) as [symbol, data]}
                        <tr>
                            <td>{symbol}</td>
                            <td>{data.totalTrades}</td>
                            <td>{(data.totalTrades > 0 ? (data.wonTrades / data.totalTrades) * 100 : 0).toFixed(1)}%</td>
                            <td class="{data.totalProfitLoss.gt(0) ? 'text-[var(--success-color)]' : data.totalProfitLoss.lt(0) ? 'text-[var(--danger-color)]' : ''}">{data.totalProfitLoss.toFixed(2)}</td>
                        </tr>
                    {/each}
                    {#if Object.keys(app.calculator.calculateSymbolPerformance($journalStore)).length === 0}
                        <tr><td colspan="4" class="text-center text-slate-500 py-4">{$_('journal.noData')}</td></tr>
                    {/if}
                </tbody>
            </table>
        </div>
         <div class="flex flex-wrap items-center gap-4 mt-4">
            <button id="export-csv-btn" class="font-bold py-2 px-4 rounded-lg flex items-center gap-2 bg-[var(--btn-success-bg)] hover:bg-[var(--btn-success-hover-bg)] text-[var(--btn-success-text)]" title="{$_('journal.exportCsvTitle')}" on:click={app.exportToCSV}>{@html icons.export}<span class="hidden sm:inline">{$_('journal.export')}</span></button>
            <input type="file" id="import-csv-input" accept=".csv" class="hidden" on:change={handleImportCsv}/>
            <button id="import-csv-btn" class="font-bold py-2 px-4 rounded-lg flex items-center gap-2 bg-[var(--btn-accent-bg)] hover:bg-[var(--btn-accent-hover-bg)] text-[var(--btn-accent-text)]" title="{$_('journal.importCsvTitle')}" on:click={() => document.getElementById('import-csv-input')?.click()}>{@html icons.import}<span class="hidden sm:inline">{$_('journal.import')}</span></button>
            <button id="clear-journal-btn" class="font-bold py-2 px-4 rounded-lg flex items-center gap-2 bg-[var(--btn-danger-bg)] hover:bg-[var(--btn-danger-hover-bg)] text-[var(--btn-danger-text)]" title="{$_('journal.clearJournalTitle')}" on:click={app.clearJournal}>{@html icons.delete}<span class="hidden sm:inline">{$_('journal.clearAll')}</span></button>
             <button id="show-journal-readme-btn" class="font-bold p-2.5 rounded-lg bg-[var(--btn-default-bg)] hover:bg-[var(--btn-default-hover-bg)] text-[var(--btn-default-text)]" title="{$_('journal.showJournalInstructionsTitle')}" aria-label="{$_('journal.showJournalInstructionsAriaLabel')}" on:click={() => app.uiManager.showReadme('journal')}>{@html icons.book}</button>
        </div>
    </div>
</div>

<style>
    .input-field-placeholder {
        @apply w-full px-2 py-1 h-[34px] border border-transparent rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700;
        line-height: 1.5; /* Adjust to vertically center text if needed */
    }
</style>
