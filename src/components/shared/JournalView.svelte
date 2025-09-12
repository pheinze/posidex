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
    import { formatDate } from '../../utils/utils';
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

    import JournalTrade from "./JournalTrade.svelte";
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
                    <thead><tr><th>{$_('journal.date')}</th><th>{$_('journal.symbol')}</th><th>{$_('journal.type')}</th><th>{$_('journal.entry')}</th><th>{$_('journal.sl')}</th><th>Planned P/L</th><th>Realized P/L</th><th>{$_('journal.rr')}</th><th>{$_('journal.status')}</th><th>{$_('journal.notes')}</th><th>{$_('journal.action')}</th></tr></thead>
                    <tbody>
                        {#each filteredTrades as trade (trade.id)}
                            <JournalTrade trade={trade} viewMode="table" bind:editingTradeId />
                        {:else}
                            <tr>
                                <td colspan="11" class="text-center py-12">
                                    <p class="text-lg font-semibold text-[var(--text-primary)] mb-2">{$_('journal.emptyState.title')}</p>
                                    <p class="text-[var(--text-secondary)]">{$_('journal.emptyState.description')}</p>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <!-- Mobile Card Layout -->
            <div class="md:hidden space-y-4">
                {#each filteredTrades as trade (trade.id)}
                    <JournalTrade trade={trade} viewMode="card" bind:editingTradeId />
                {:else}
                    <div class="text-center text-slate-500 py-12">
                        <p class="text-lg font-semibold text-[var(--text-primary)] mb-2">{$_('journal.emptyState.title')}</p>
                        <p class="text-[var(--text-secondary)]">{$_('journal.emptyState.description')}</p>
                    </div>
                {/each}
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
            <button id="clear-journal-btn" class="font-bold py-2 px-4 rounded-lg flex items-center gap-2 bg-[var(--btn-danger-bg)] hover:bg-[var(--btn-danger-hover-bg)] text-[var(--btn-danger-text)]" title="{$_('journal.clearJournalTitle')}" on:click={() => { if (browser) app.clearJournal() }}>{@html icons.delete}<span class="hidden sm:inline">{$_('journal.clearAll')}</span></button>
             <button id="show-journal-readme-btn" class="font-bold p-2.5 rounded-lg bg-[var(--btn-default-bg)] hover:bg-[var(--btn-default-hover-bg)] text-[var(--btn-default-text)]" title="{$_('journal.showJournalInstructionsTitle')}" aria-label="{$_('journal.showJournalInstructionsAriaLabel')}" on:click={() => app.uiManager.showReadme('journal')}>{@html icons.book}</button>
        </div>
    </div>
</div>

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
