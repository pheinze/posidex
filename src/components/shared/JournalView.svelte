<script lang="ts">
    import { tradeStore } from '../../stores/tradeStore';
    import { journalStore } from '../../stores/journalStore';
    import { uiStore } from '../../stores/uiStore';
    import { app } from '../../services/app';
    import { _ } from '../../locales/i18n';
    import { icons, CONSTANTS } from '../../lib/constants';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { uiManager } from '../../services/uiManager';
    import { get } from 'svelte/store';
    import { loadInstruction } from '../../services/markdownLoader';

    let currentAppState = $tradeStore;
    let unsubscribe: () => void;

    onMount(() => {
        unsubscribe = tradeStore.subscribe(s => currentAppState = s);
        return () => unsubscribe();
    });

    $: filteredTrades = $journalStore.filter(trade =>
        trade.symbol.toLowerCase().includes(currentAppState.journalSearchQuery.toLowerCase()) &&
        (currentAppState.journalFilterStatus === 'all' || trade.status === currentAppState.journalFilterStatus)
    );

    function handleImportCsv(event: Event) {
        if (browser) { // Added browser check
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
                app.importFromCSV(file);
            }
        }
    }

    async function showJournalInstructions() {
        uiManager.showReadme('journal');
    }
</script>

<div class="modal-content w-full h-full max-w-6xl">
     <div class="flex justify-between items-center mb-4"><h2 class="text-2xl font-bold">{$_('journal.title')}</h2><button id="close-journal-btn" class="text-3xl" aria-label="{$_('journal.closeJournalAriaLabel')}" on:click={() => uiStore.toggleJournalModal(false)}>&times;</button></div>
     <div id="journal-stats" class="journal-stats"></div>
     <div class="flex gap-4 my-4"><input type="text" id="journal-search" class="input-field w-full px-3 py-2 rounded-md" placeholder="{$_('journal.searchSymbolPlaceholder')}" bind:value={currentAppState.journalSearchQuery}><select id="journal-filter" class="input-field px-3 py-2 rounded-md" bind:value={currentAppState.journalFilterStatus}><option value="all">{$_('journal.filterAll')}</option><option value="Open">{$_('journal.filterOpen')}</option><option value="Won">{$_('journal.filterWon')}</option><option value="Lost">{$_('journal.filterLost')}</option></select></div>
    <div class="max-h-[calc(100vh-20rem)] overflow-auto">
        <!-- Desktop Table -->
        <div class="hidden md:block">
            <table class="journal-table w-full">
                <thead><tr><th>{$_('journal.date')}</th><th>{$_('journal.symbol')}</th><th>{$_('journal.type')}</th><th>{$_('journal.entry')}</th><th>{$_('journal.sl')}</th><th>P/L</th><th>{$_('journal.rr')}</th><th>{$_('journal.status')}</th><th>{$_('journal.notes')}</th><th>{$_('journal.action')}</th></tr></thead>
                <tbody>
                    <!-- Desktop Rows -->
                    {#each filteredTrades as trade}
                        <tr>
                            <td>{new Date(trade.date).toLocaleString('de-DE', {day:'2-digit', month: '2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit'})}</td>
                            <td>{trade.symbol || '-'}</td>
                            <td class="{trade.tradeType === CONSTANTS.TRADE_TYPE_LONG ? 'text-green-400' : 'text-red-400'}">{trade.tradeType.charAt(0).toUpperCase() + trade.tradeType.slice(1)}</td>
                            <td>{trade.entryPrice.toFixed(4)}</td>
                            <td>{trade.stopLossPrice.toFixed(4)}</td>
                            <td class="{trade.totalNetProfit.gt(0) ? 'text-green-400' : trade.totalNetProfit.lt(0) ? 'text-red-400' : ''}">{trade.totalNetProfit.toFixed(2)}</td>
                            <td class="{trade.totalRR.gte(2) ? 'text-green-400' : trade.totalRR.gte(1.5) ? 'text-yellow-400' : ''}">{trade.totalRR.toFixed(2)}</td>
                            <td>
                                <select class="status-select input-field p-1" data-id="{trade.id}" on:change={(e) => app.updateTradeStatus(trade.id, (e.target as HTMLSelectElement).value)}>
                                    <option value="Open" selected={trade.status === 'Open'}>{$_('journal.filterOpen')}</option>
                                    <option value="Won" selected={trade.status === 'Won'}>{$_('journal.filterWon')}</option>
                                    <option value="Lost" selected={trade.status === 'Lost'}>{$_('journal.filterLost')}</option>
                                </select>
                            </td>
                            <td class="notes-cell" title="{$_('journal.clickToExpand')}" on:click={(e) => (e.target as HTMLElement).classList.toggle('expanded')}>{trade.notes || ''}</td>
                            <td class="text-center"><button class="delete-trade-btn text-red-500 hover:text-red-400 p-1 rounded-full cursor-pointer" data-id="{trade.id}" title="{$_('journal.delete')}" on:click={() => app.deleteTrade(trade.id)}>{@html icons.delete}</button></td>
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
                <div class="bg-slate-800 p-4 rounded-lg shadow-md border border-slate-700">
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="text-lg font-bold">{trade.symbol || '-'}</div>
                            <div class="text-sm {trade.tradeType === CONSTANTS.TRADE_TYPE_LONG ? 'text-green-400' : 'text-red-400'}">{trade.tradeType.charAt(0).toUpperCase() + trade.tradeType.slice(1)}</div>
                        </div>
                        <div class="text-right">
                            <div class="text-lg font-bold {trade.totalNetProfit.gt(0) ? 'text-green-400' : trade.totalNetProfit.lt(0) ? 'text-red-400' : ''}">
                                {trade.totalNetProfit.toFixed(2)}
                            </div>
                            <div class="text-xs text-slate-400">P/L</div>
                        </div>
                    </div>
                    <div class="mt-4 flex justify-between items-center">
                        <div>
                            <div class="text-sm">Status</div>
                            <select class="status-select input-field p-1 mt-1" data-id="{trade.id}" on:change={(e) => app.updateTradeStatus(trade.id, (e.target as HTMLSelectElement).value)}>
                                <option value="Open" selected={trade.status === 'Open'}>{$_('journal.filterOpen')}</option>
                                <option value="Won" selected={trade.status === 'Won'}>{$_('journal.filterWon')}</option>
                                <option value="Lost" selected={trade.status === 'Lost'}>{$_('journal.filterLost')}</option>
                            </select>
                        </div>
                        <div class="text-right">
                            <div class="text-sm text-slate-400">{new Date(trade.date).toLocaleString('de-DE', {day:'2-digit', month: '2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit'})}</div>
                            <button class="delete-trade-btn text-red-500 hover:text-red-400 p-1 rounded-full cursor-pointer mt-1" data-id="{trade.id}" title="{$_('journal.delete')}" on:click={() => app.deleteTrade(trade.id)}>{@html icons.delete}</button>
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
            <thead><tr><th>{$_('journal.symbol')}</th><th>{$_('journal.trades')}</th><th>{$_('journal.profitPercent')}</th><th>{$_('journal.totalPL')}</th></tr></thead>
            <tbody>
                {#each Object.entries(app.calculator.calculateSymbolPerformance($journalStore)) as [symbol, data]}
                    <tr>
                        <td>{symbol}</td>
                        <td>{data.totalTrades}</td>
                        <td>{(data.totalTrades > 0 ? (data.wonTrades / data.totalTrades) * 100 : 0).toFixed(1)}%</td>
                        <td class="{data.totalProfitLoss.gt(0) ? 'text-green-400' : data.totalProfitLoss.lt(0) ? 'text-red-400' : ''}">{data.totalProfitLoss.toFixed(2)}</td>
                    </tr>
                {/each}
                {#if Object.keys(app.calculator.calculateSymbolPerformance($journalStore)).length === 0}
                    <tr><td colspan="4" class="text-center text-slate-500 py-4">{$_('journal.noData')}</td></tr>
                {/if}
            </tbody>
        </table>
    </div>
     <div class="flex items-center flex-wrap gap-4 mt-4">
        <button id="export-csv-btn" class="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2" title="{$_('journal.exportCsvTitle')}" on:click={app.exportToCSV}>{@html icons.export}<span>{$_('journal.export')}</span></button>
        <input type="file" id="import-csv-input" accept=".csv" class="hidden" on:change={handleImportCsv}/>
        <button id="import-csv-btn" class="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2" on:click={() => document.getElementById('import-csv-input')?.click()}>{@html icons.import}<span>{$_('journal.import')}</span></button>
        <button id="clear-journal-btn" class="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2" title="{$_('journal.clearJournalTitle')}" on:click={() => { if (browser) app.clearJournal(); }}>{@html icons.delete}<span>{$_('journal.clearAll')}</span></button>
         <button id="show-journal-readme-btn" class="bg-slate-600 hover:bg-slate-500 text-white font-bold p-2.5 rounded-lg" title="{$_('journal.showJournalInstructionsTitle')}" aria-label="{$_('journal.showJournalInstructionsAriaLabel')}" on:click={showJournalInstructions}>{@html icons.book}</button>
    </div>
</div>