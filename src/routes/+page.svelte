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
    import { formatDynamicDecimal } from '../utils/utils';
    
    import type { IndividualTpResult } from '../stores/types';
    import SummaryResults from '../components/results/SummaryResults.svelte';
    import LanguageSwitcher from '../components/shared/LanguageSwitcher.svelte';
    import Tooltip from '../components/shared/Tooltip.svelte';
    import JournalView from '../components/shared/JournalView.svelte';

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

</script>

<main class="my-8 w-full max-w-4xl mx-auto calculator-wrapper rounded-2xl shadow-2xl p-6 sm:p-8 fade-in">

    <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div class="flex justify-between items-center w-full md:w-auto">
            <h1 class="text-2xl sm:text-3xl font-bold">{$_('app.title')}</h1>
            <button id="view-journal-btn-mobile" class="text-sm md:hidden bg-[var(--btn-accent-bg)] hover:bg-[var(--btn-accent-hover-bg)] text-[var(--btn-accent-text)] font-bold py-2 px-4 rounded-lg" title="{$_('app.journalButtonTitle')}" on:click={() => uiStore.toggleJournalModal(true)}>{$_('app.journalButton')}</button>
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
            <button id="view-journal-btn-desktop" class="hidden md:inline-block text-sm bg-[var(--btn-accent-bg)] hover:bg-[var(--btn-accent-hover-bg)] text-[var(--btn-accent-text)] font-bold py-2 px-4 rounded-lg md:order-2" title="{$_('app.journalButtonTitle')}" on:click={() => uiStore.toggleJournalModal(true)}>{$_('app.journalButton')}</button>
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
                entryFee={$tradeStore.entryFee}
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
                    <div class="result-item"><span class="result-label">{$_('dashboard.maxPotentialProfit')}<Tooltip text={$_('dashboard.maxPotentialProfitTooltip')} /></span><span id="maxPotentialProfit" class="result-value text-[var(--success-color)]">{$tradeStore.maxPotentialProfit}</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.weightedRR')}<Tooltip text={$_('dashboard.weightedRRTooltip')} /></span><span id="totalRR" class="result-value">{$tradeStore.totalRR}</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.totalNetProfit')}<Tooltip text={$_('dashboard.totalNetProfitTooltip')} /></span><span id="totalNetProfit" class="result-value text-[var(--success-color)]">{$tradeStore.totalNetProfit}</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.soldPosition')}<Tooltip text={$_('dashboard.soldPositionTooltip')} /></span><span id="totalPercentSold" class="result-value">{$tradeStore.totalPercentSold}</span></div>
                </div>
            {/if}
        </div>
        <div id="tp-results-container">
            {#each $tradeStore.calculatedTpDetails as tpDetail: IndividualTpResult}
                <div class="result-group !mt-0 md:!mt-6">
                    <h2 class="section-header">{$_('dashboard.takeProfit')} {(tpDetail as IndividualTpResult).index + 1} ({(tpDetail as IndividualTpResult).percentSold.toFixed(0)}%)</h2>
                    <div class="result-item"><span class="result-label">{$_('dashboard.riskRewardRatio')}</span><span class="result-value {tpDetail.riskRewardRatio.gte(2) ? 'text-[var(--success-color)]' : tpDetail.riskRewardRatio.gte(1.5) ? 'text-[var(--warning-color)]' : 'text-[var(--danger-color)]'}">{formatDynamicDecimal(tpDetail.riskRewardRatio, 2)}</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.netProfit')}<Tooltip text={$_('dashboard.netProfitTooltip')} /></span><span class="result-value text-[var(--success-color)]">+{formatDynamicDecimal(tpDetail.netProfit, 2)}</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.priceChange')}<Tooltip text={$_('dashboard.priceChangeTooltip')} /></span><span class="result-value {tpDetail.priceChangePercent.gt(0) ? 'text-[var(--success-color)]' : tpDetail.priceChangePercent.lt(0) ? 'text-[var(--danger-color)]' : ''}">{formatDynamicDecimal(tpDetail.priceChangePercent, 2)}%</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.returnOnCapital')}<Tooltip text={$_('dashboard.returnOnCapitalTooltip')} /></span><span class="result-value {tpDetail.returnOnCapital.gt(0) ? 'text-[var(--success-color)]' : tpDetail.returnOnCapital.lt(0) ? 'text-[var(--danger-color)]' : ''}">{formatDynamicDecimal(tpDetail.returnOnCapital, 2)}%</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.partialVolume')}<Tooltip text={$_('dashboard.partialVolumeTooltip')} /></span><span class="result-value">{formatDynamicDecimal(tpDetail.partialVolume, 4)}</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.exitFeeLabel')}</span><span class="result-value">{formatDynamicDecimal(tpDetail.exitFee, 4)}</span></div>
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

<JournalView />

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