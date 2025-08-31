<script lang="ts">
    import GeneralInputs from '../components/inputs/GeneralInputs.svelte';
    import PortfolioInputs from '../components/inputs/PortfolioInputs.svelte';
    import TradeSetupInputs from '../components/inputs/TradeSetupInputs.svelte';
    import TakeProfitTargets from '../components/inputs/TakeProfitTargets.svelte';
    import CustomModal from '../components/shared/CustomModal.svelte';
    import VisualBar from '../components/shared/VisualBar.svelte';
    import { CONSTANTS, themes, themeIcons, icons } from '../lib/constants';
    import { app } from '../services/app';
    import { tradeStore, updateTradeStore, resetAllInputs, toggleAtrInputs } from '../stores/tradeStore';
    import { presetStore } from '../stores/presetStore';
    import { journalStore } from '../stores/journalStore';
    import { uiStore } from '../stores/uiStore';
    import { onMount } from 'svelte';
    import { _, locale } from '../locales/i18n'; // Import locale
    import { get } from 'svelte/store'; // Import get
    import { loadInstruction } from '../services/markdownLoader';
    
    import type { IndividualTpResult } from '../lib/calculator';
    import SummaryResults from '../components/results/SummaryResults.svelte';
    import LanguageSwitcher from '../components/shared/LanguageSwitcher.svelte';
    import Tooltip from '../components/shared/Tooltip.svelte';

    let changelogContent = '';

    // Initialisierung der App-Logik, sobald die Komponente gemountet ist
    onMount(() => {
        app.init();
    });

    // Load changelog content when modal is opened
    $: if ($uiStore.showChangelogModal && changelogContent === '') {
        loadInstruction('changelog').then(content => {
            changelogContent = content.html;
        });
    }

    // Reactive statement to trigger app.calculateAndDisplay() when relevant inputs change
    $: {
        // Trigger calculation when any of these inputs change
        $tradeStore.accountSize,
        $tradeStore.riskPercentage,
        $tradeStore.entryPrice,
        $tradeStore.stopLossPrice,
        $tradeStore.leverage,
        $tradeStore.fees,
        $tradeStore.symbol,
        $tradeStore.atrValue,
        $tradeStore.atrMultiplier,
        $tradeStore.useAtrSl,
        $tradeStore.tradeType,
        $tradeStore.targets;

        // Only trigger if all necessary inputs are defined (not null/undefined from initial load)
        // and not during initial setup where values might be empty
        if ($tradeStore.accountSize !== undefined && $tradeStore.riskPercentage !== undefined &&
            $tradeStore.entryPrice !== undefined && $tradeStore.leverage !== undefined &&
            $tradeStore.fees !== undefined && $tradeStore.symbol !== undefined &&
            $tradeStore.atrValue !== undefined && $tradeStore.atrMultiplier !== undefined &&
            $tradeStore.useAtrSl !== undefined && $tradeStore.tradeType !== undefined &&
            $tradeStore.targets !== undefined) {
            
            app.calculateAndDisplay();
        }
    }

    function handleTradeSetupError(e: CustomEvent<string>) {
        uiStore.showError(e.detail);
    }

    function handleTradeSetupSetLoading(e: CustomEvent<boolean>) {
        updateTradeStore(s => ({ ...s, isPriceFetching: e.detail }));
    }

    

    function handleTargetsChange(event: CustomEvent<Array<{ price: string; percent: string; isLocked: boolean }>>) {
        updateTradeStore(s => ({ ...s, targets: event.detail }));
    }

    function handleTpRemove(event: CustomEvent<number>) {
        const index = event.detail;
        const newTargets = $tradeStore.targets.filter((_, i) => i !== index);
        updateTradeStore(s => ({ ...s, targets: newTargets }));
        app.adjustTpPercentages(null); // Pass null to signify a removal
    }

    function handleThemeSwitch() {
        const currentIndex = themes.indexOf($uiStore.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        uiStore.setTheme(themes[nextIndex]);
    }

    // Diese reaktive Variable formatiert den Theme-Namen benutzerfreundlich.
    // z.B. 'solarized-light' wird zu 'Solarized Light'
    $: themeTitle = $uiStore.currentTheme
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    function handlePresetLoad(event: Event) {
        const selectedPreset = (event.target as HTMLSelectElement).value;
        app.loadPreset(selectedPreset);
    }

    function handleImportCsv(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            app.importFromCSV(file);
        }
    }

</script>

<main class="my-8 w-full max-w-4xl mx-auto calculator-wrapper rounded-2xl shadow-2xl p-6 sm:p-8 fade-in">

    <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div class="flex justify-between items-center w-full md:w-auto">
            <h1 class="text-2xl sm:text-3xl font-bold">{$_('app.title')}</h1>
            <button id="view-journal-btn-mobile" class="text-sm md:hidden bg-[var(--btn-accent-bg)] hover:bg-[var(--btn-accent-hover)] text-[var(--btn-accent-text)] font-bold py-2 px-4 rounded-lg" title="{$_('app.journalButtonTitle')}" on:click={() => uiStore.toggleJournalModal(true)}>{$_('app.journalButton')}</button>
        </div>
        <div class="flex items-center flex-wrap justify-end gap-2 w-full md:w-auto">
            <div class="flex items-center flex-wrap justify-end gap-2 md:order-1">
                <select id="preset-loader" class="input-field px-3 py-2 rounded-md text-sm" on:change={handlePresetLoad} bind:value={$presetStore.selectedPreset}>
                    <option value="">{$_('dashboard.presetLoad')}</option>
                    {#each $presetStore.availablePresets as presetName}
                        <option value={presetName}>{presetName}</option>
                    {/each}
                </select>
                <button id="save-preset-btn" class="text-sm bg-[var(--btn-default-bg)] hover:bg-[var(--btn-default-hover-bg)] text-[var(--btn-default-text)] font-bold py-2.5 px-2.5 rounded-lg" title="{$_('dashboard.savePresetTitle')}" aria-label="{$_('dashboard.savePresetAriaLabel')}" on:click={app.savePreset}>{@html icons.save}</button>
                <button id="delete-preset-btn" class="text-sm bg-[var(--btn-danger-bg)] hover:bg-[var(--btn-danger-hover-bg)] text-[var(--btn-danger-text)] font-bold py-2.5 px-2.5 rounded-lg disabled:cursor-not-allowed" title="{$_('dashboard.deletePresetTitle')}" disabled={!$presetStore.selectedPreset} on:click={app.deletePreset}>{@html icons.delete}</button>
                <button id="reset-btn" class="text-sm bg-[var(--btn-default-bg)] hover:bg-[var(--btn-default-hover-bg)] text-[var(--btn-default-text)] font-bold py-2.5 px-2.5 rounded-lg flex items-center gap-2" title="{$_('dashboard.resetButtonTitle')}" on:click={resetAllInputs}>{@html icons.broom}</button>
                <button
                    id="theme-switcher"
                    class="text-sm bg-[var(--btn-default-bg)] hover:bg-[var(--btn-default-hover-bg)] text-[var(--btn-default-text)] font-bold py-2 px-2.5 rounded-lg"
                    aria-label="{$_('dashboard.themeSwitcherAriaLabel')}"
                    on:click={handleThemeSwitch}
                    title={themeTitle}>{@html themeIcons[$uiStore.currentTheme as keyof typeof themeIcons]}</button>
            </div>
            <button id="view-journal-btn-desktop" class="hidden md:inline-block text-sm bg-[var(--btn-accent-bg)] hover:bg-[var(--btn-accent-hover)] text-[var(--btn-accent-text)] font-bold py-2 px-4 rounded-lg md:order-2" title="{$_('app.journalButtonTitle')}" on:click={() => uiStore.toggleJournalModal(true)}>{$_('app.journalButton')}</button>
        </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div>
            <GeneralInputs bind:tradeType={$tradeStore.tradeType} bind:leverage={$tradeStore.leverage} bind:fees={$tradeStore.fees} />

            <PortfolioInputs bind:accountSize={$tradeStore.accountSize} bind:riskPercentage={$tradeStore.riskPercentage} />

        </div>

        <TradeSetupInputs
            bind:symbol={$tradeStore.symbol}
            bind:entryPrice={$tradeStore.entryPrice}
            bind:useAtrSl={$tradeStore.useAtrSl}
            bind:atrValue={$tradeStore.atrValue}
            bind:atrMultiplier={$tradeStore.atrMultiplier}
            bind:stopLossPrice={$tradeStore.stopLossPrice}

            on:showError={handleTradeSetupError}
            on:setLoading={handleTradeSetupSetLoading}
            
            on:fetchPrice={() => app.handleFetchPrice()}
            on:toggleAtrInputs={(e) => toggleAtrInputs(e.detail)}
            on:updateSymbolSuggestions={(e) => updateTradeStore(s => ({ ...s, symbolSuggestions: e.detail, showSymbolSuggestions: e.detail.length > 0 }))}
            on:selectSymbolSuggestion={(e) => {
                updateTradeStore(s => ({ ...s, symbol: e.detail, showSymbolSuggestions: false }));
                app.handleFetchPrice();
            }}
            atrFormulaDisplay={$tradeStore.atrFormulaText}
            showAtrFormulaDisplay={$tradeStore.showAtrFormulaDisplay}
            isPriceFetching={$tradeStore.isPriceFetching}
            symbolSuggestions={$tradeStore.symbolSuggestions}
            showSymbolSuggestions={$tradeStore.showSymbolSuggestions}
        />
    </div>

    <TakeProfitTargets bind:targets={$tradeStore.targets} on:change={handleTargetsChange} on:remove={handleTpRemove} calculatedTpDetails={$tradeStore.calculatedTpDetails} />

    {#if $uiStore.showErrorMessage}
        <div id="error-message" class="text-[var(--danger-color)] text-center text-sm font-medium mt-4 md:col-span-2">{$_($uiStore.errorMessage)}</div>
    {/if}

    <section id="results" class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8">
        <div>
            <SummaryResults
                isPositionSizeLocked={$tradeStore.isPositionSizeLocked}
                showCopyFeedback={$uiStore.showCopyFeedback}
                positionSize={$tradeStore.positionSize}
                netLoss={$tradeStore.netLoss}
                requiredMargin={$tradeStore.requiredMargin}
                liquidationPrice={$tradeStore.liquidationPrice}
                breakEvenPrice={$tradeStore.breakEvenPrice}
                on:toggleLock={() => app.togglePositionSizeLock()}
                on:copy={() => uiStore.showFeedback('copy')}
            />
            {#if $tradeStore.showTotalMetricsGroup}
                <div id="total-metrics-group" class="result-group">
                    <h2 class="section-header">{$_('dashboard.totalTradeMetrics')}<Tooltip text={$_('dashboard.totalTradeMetricsTooltip')} /></h2>
                    <div class="result-item"><span class="result-label">{$_('dashboard.riskPerTradeCurrency')}<Tooltip text={$_('dashboard.riskPerTradeCurrencyTooltip')} /></span><span id="riskAmountCurrency" class="result-value text-[var(--danger-color)]">{$tradeStore.riskAmountCurrency}</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.totalFees')}<Tooltip text={$_('dashboard.totalFeesTooltip')} /></span><span id="totalFees" class="result-value">{$tradeStore.totalFees}</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.maxPotentialProfit')}<Tooltip text={$_('dashboard.maxPotentialProfitTooltip')} /></span><span id="maxPotentialProfit" class="result-value text-green-400">{$tradeStore.maxPotentialProfit}</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.weightedRR')}<Tooltip text={$_('dashboard.weightedRRTooltip')} /></span><span id="totalRR" class="result-value">{$tradeStore.totalRR}</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.totalNetProfit')}<Tooltip text={$_('dashboard.totalNetProfitTooltip')} /></span><span id="totalNetProfit" class="result-value text-green-400">{$tradeStore.totalNetProfit}</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.soldPosition')}<Tooltip text={$_('dashboard.soldPositionTooltip')} /></span><span id="totalPercentSold" class="result-value">{$tradeStore.totalPercentSold}</span></div>
                </div>
            {/if}
        </div>
        <div id="tp-results-container">
            {#each $tradeStore.calculatedTpDetails as tpDetail: IndividualTpResult}
                <div class="result-group !mt-0 md:!mt-6">
                    <h2 class="section-header">{$_('dashboard.takeProfit')} {(tpDetail as IndividualTpResult).index + 1} ({(tpDetail as IndividualTpResult).percentSold.toFixed(0)}%)</h2>
                    <div class="result-item"><span class="result-label">{$_('dashboard.riskRewardRatio')}</span><span class="result-value {tpDetail.riskRewardRatio.gte(2) ? 'text-green-400' : tpDetail.riskRewardRatio.gte(1.5) ? 'text-yellow-400' : 'text-red-400'}">{tpDetail.riskRewardRatio.toFixed(2)}</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.netProfit')}<Tooltip text={$_('dashboard.netProfitTooltip')} /></span><span class="result-value text-green-400">+{tpDetail.netProfit.toFixed(2)}</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.priceChange')}<Tooltip text={$_('dashboard.priceChangeTooltip')} /></span><span class="result-value {tpDetail.priceChangePercent.gt(0) ? 'text-green-400' : tpDetail.priceChangePercent.lt(0) ? 'text-red-400' : ''}">{tpDetail.priceChangePercent.toFixed(2)}%</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.returnOnCapital')}<Tooltip text={$_('dashboard.returnOnCapitalTooltip')} /></span><span class="result-value {tpDetail.returnOnCapital.gt(0) ? 'text-green-400' : tpDetail.returnOnCapital.lt(0) ? 'text-red-400' : ''}">{tpDetail.returnOnCapital.toFixed(2)}%</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.partialVolume')}<Tooltip text={$_('dashboard.partialVolumeTooltip')} /></span><span class="result-value">{tpDetail.partialVolume.toFixed(4)}</span></div>
                </div>
            {/each}
        </div>
        <VisualBar 
            entryPrice={$tradeStore.entryPrice}
            stopLossPrice={$tradeStore.stopLossPrice}
            tradeType={$tradeStore.tradeType}
            targets={$tradeStore.targets}
            calculatedTpDetails={$tradeStore.calculatedTpDetails}
        />
        <footer class="md:col-span-2">
            <textarea id="tradeNotes" class="input-field w-full px-4 py-2 rounded-md mb-4" rows="2" placeholder="{$_('dashboard.tradeNotesPlaceholder')}" bind:value={$tradeStore.tradeNotes}></textarea>
            <div class="flex items-center gap-4">
                <button id="save-journal-btn" class="w-full font-bold py-3 px-4 rounded-lg btn-primary-action" on:click={app.addTrade} disabled={$tradeStore.positionSize === '-'}>{$_('dashboard.addTradeToJournal')}</button>
                <button id="show-dashboard-readme-btn" class="font-bold p-3 rounded-lg btn-secondary-action" title="{$_('dashboard.showInstructionsTitle')}" aria-label="{$_('dashboard.showInstructionsAriaLabel')}" on:click={() => app.uiManager.showReadme('dashboard')}>{@html icons.book}</button>
                {#if $uiStore.showSaveFeedback}<span id="save-feedback" class="save-feedback" class:visible={$uiStore.showSaveFeedback}>{$_('dashboard.savedFeedback')}</span>{/if}
            </div>
            <div class="mt-4">
                <LanguageSwitcher />
            </div>
        </footer>
    </section>
</main>

<footer class="w-full max-w-4xl mx-auto text-center py-4 text-sm text-gray-500">
    Version 0.92b - <button class="text-link" on:click={() => uiStore.toggleChangelogModal(true)}>Changelog</button>
</footer>

<div id="journal-modal" class="modal-overlay" class:visible={$uiStore.showJournalModal} class:opacity-100={$uiStore.showJournalModal}>
    <div class="modal-content w-full h-full max-w-6xl">
         <div class="flex justify-between items-center mb-4"><h2 class="text-2xl font-bold">{$_('journal.title')}</h2><button id="close-journal-btn" class="text-3xl" aria-label="{$_('journal.closeJournalAriaLabel')}" on:click={() => uiStore.toggleJournalModal(false)}>&times;</button></div>
         <div id="journal-stats" class="journal-stats"></div>
         <div class="flex gap-4 my-4"><input type="text" id="journal-search" class="input-field w-full px-3 py-2 rounded-md" placeholder="{$_('journal.searchSymbolPlaceholder')}" bind:value={$tradeStore.journalSearchQuery}><select id="journal-filter" class="input-field px-3 py-2 rounded-md" bind:value={$tradeStore.journalFilterStatus}><option value="all">{$_('journal.filterAll')}</option><option value="Open">{$_('journal.filterOpen')}</option><option value="Won">{$_('journal.filterWon')}</option><option value="Lost">{$_('journal.filterLost')}</option></select></div>
        <div class="max-h-[calc(100vh-20rem)] overflow-auto">
            <table class="journal-table">
                <thead><tr><th>{$_('journal.date')}</th><th>{$_('journal.symbol')}</th><th>{$_('journal.type')}</th><th>{$_('journal.entry')}</th><th>{$_('journal.sl')}</th><th>{$_('journal.rr')}</th><th>{$_('journal.status')}</th><th>{$_('journal.notes')}</th><th>{$_('journal.action')}</th></tr></thead>
                <tbody>
                    {#each $journalStore.filter(trade => trade.symbol.toLowerCase().includes($tradeStore.journalSearchQuery.toLowerCase()) && ($tradeStore.journalFilterStatus === 'all' || trade.status === $tradeStore.journalFilterStatus)) as trade}
                        <tr>
                            <td>{new Date(trade.date).toLocaleString($locale || undefined, {day:'2-digit', month: '2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit'})}</td>
                            <td>{trade.symbol || '-'}</td>
                            <td class="{trade.tradeType === CONSTANTS.TRADE_TYPE_LONG ? 'text-green-400' : 'text-red-400'}">{trade.tradeType.charAt(0).toUpperCase() + trade.tradeType.slice(1)}</td>
                            <td>{trade.entryPrice.toFixed(4)}</td>
                            <td>{trade.stopLossPrice.toFixed(4)}</td>
                            <td class="{trade.totalRR.gte(2) ? 'text-green-400' : trade.totalRR.gte(1.5) ? 'text-yellow-400' : 'text-red-400'}">{trade.totalRR.toFixed(2)}</td>
                            <td>
                                <select class="status-select input-field p-1" data-id="{trade.id}" on:change={(e) => app.updateTradeStatus(trade.id, (e.target as HTMLSelectElement).value)}>
                                    <option value="Open" selected={trade.status === 'Open'}>{$_('journal.filterOpen')}</option>
                                    <option value="Won" selected={trade.status === 'Won'}>{$_('journal.filterWon')}</option>
                                    <option value="Lost" selected={trade.status === 'Lost'}>{$_('journal.filterLost')}</option>
                                </select>
                            </td>
                            <td class="notes-cell" title="{$_('journal.clickToExpand')}" on:click={(e) => (e.target as HTMLElement).classList.toggle('expanded')}>{trade.notes || ''}</td>
                            <td class="text-center"><button class="delete-trade-btn text-red-500 hover:text-red-400 p-1 rounded-full" data-id="{trade.id}" title="{$_('journal.delete')}" on:click={() => app.deleteTrade(trade.id)}>{@html icons.delete}</button></td>
                        </tr>
                    {/each}
                    {#if $journalStore.filter(trade => trade.symbol.toLowerCase().includes($tradeStore.journalSearchQuery.toLowerCase()) && ($tradeStore.journalFilterStatus === 'all' || trade.status === $tradeStore.journalFilterStatus)).length === 0}
                        <tr><td colspan="9" class="text-center text-slate-500 py-8">{$_('journal.noTradesYet')}</td></tr>
                    {/if}
                </tbody>
            </table>
        </div>
        <h3 class="text-xl font-bold mt-6 mb-4">{$_('journal.performancePerSymbol')}</h3>
        <div id="symbol-performance-stats" class="max-h-48 overflow-y-auto border border-[var(--border-color)] rounded-md p-2">
            <table class="journal-table w-full">
                <thead><tr><th>{$_('journal.symbol')}</th><th>{$_('journal.trades')}</th><th>{$_('journal.profitPercent')}</th><th>{$_('journal.totalPL')}</th></tr></thead>
                <tbody id="symbol-performance-table-body">
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
         <div class="flex items-center gap-4 mt-4">
            <button id="export-csv-btn" class="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2" title="{$_('journal.exportCsvTitle')}" on:click={app.exportToCSV}>{@html icons.export}<span>{$_('journal.export')}</span></button>
            <input type="file" id="import-csv-input" accept=".csv" class="hidden" on:change={handleImportCsv}/>
            <button id="import-csv-btn" class="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2" on:click={() => document.getElementById('import-csv-input')?.click()}>{@html icons.import}<span>{$_('journal.import')}</span></button>
            <button id="clear-journal-btn" class="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2" title="{$_('journal.clearJournalTitle')}" on:click={app.clearJournal}>{@html icons.delete}<span>{$_('journal.clearAll')}</span></button>
             <button id="show-journal-readme-btn" class="bg-slate-600 hover:bg-slate-500 text-white font-bold p-2.5 rounded-lg" title="{$_('journal.showJournalInstructionsTitle')}" aria-label="{$_('journal.showJournalInstructionsAriaLabel')}" on:click={() => app.uiManager.showReadme('journal')}>{@html icons.book}</button>
        </div>
    </div>
</div>

<CustomModal />

<div id="changelog-modal" class="modal-overlay" class:visible={$uiStore.showChangelogModal} class:opacity-100={$uiStore.showChangelogModal}>
    <div class="modal-content w-full h-full max-w-6xl">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold">{$_('app.changelogTitle')}</h2>
            <button id="close-changelog-btn" class="text-3xl" aria-label="{$_('app.closeChangelogAriaLabel')}" on:click={() => uiStore.toggleChangelogModal(false)}>&times;</button>
        </div>
        <div id="changelog-content" class="prose dark:prose-invert max-h-[calc(100vh-10rem)] overflow-y-auto">
            {@html changelogContent}
        </div>
    </div>
</div>