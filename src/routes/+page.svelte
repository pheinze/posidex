<script lang="ts">
    import GeneralInputs from '../components/inputs/GeneralInputs.svelte';
    import PortfolioInputs from '../components/inputs/PortfolioInputs.svelte';
    import TradeSetupInputs from '../components/inputs/TradeSetupInputs.svelte';
    import TakeProfitTargets from '../components/inputs/TakeProfitTargets.svelte';
    import ConfirmModal from '../components/shared/ConfirmModal.svelte';
    import PromptModal from '../components/shared/PromptModal.svelte';
    import VisualBar from '../components/shared/VisualBar.svelte';
    import { CONSTANTS } from '../lib/constants';
    import { app } from '../services/app';
    import { tradeStore, updateTradeStore, toggleAtrInputs, calculationInputs } from '../stores/tradeStore';
    import { resultsStore } from '../stores/resultsStore';
    import { uiStore } from '../stores/uiStore';
    import { confirmService } from '../services/confirmService';
    import { onMount } from 'svelte';
    import { _, locale } from '../locales/i18n'; // Import locale
    import { get } from 'svelte/store'; // Import get
    import { loadInstruction } from '../services/markdownLoader';
    import { formatDynamicDecimal } from '../utils/utils';
    import { trackCustomEvent } from '../services/trackingService';
    import { createBackup, restoreFromBackup } from '../services/backupService';
    import { Decimal } from 'decimal.js';
    
    import type { IndividualTpResult } from '../stores/types';
    import SummaryResults from '../components/results/SummaryResults.svelte';
    import LanguageSwitcher from '../components/shared/LanguageSwitcher.svelte';
    import Tooltip from '../components/shared/Tooltip.svelte';
    import JournalView from '../components/shared/JournalView.svelte';
    import Header from '../components/layout/Header.svelte';
    import Modal from '../components/shared/Modal.svelte';

    let fileInput: HTMLInputElement;
    let changelogContent = '';
    let guideContent = '';

    let contentModalState = {
        isOpen: false,
        title: '',
        content: ''
    };

    async function showContentModal(type: 'dashboard' | 'journal') {
        const instruction = await loadInstruction(type);
        let titleKey = type === 'dashboard' ? 'dashboard.instructionsTitle' : 'journal.showJournalInstructionsTitle';

        contentModalState = {
            isOpen: true,
            title: $_(titleKey),
            content: instruction.html
        };
    }

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

    // Load guide content when modal is opened
    $: if ($uiStore.showGuideModal && guideContent === '') {
        loadInstruction('guide').then(content => {
            guideContent = content.html;
        });
    }

    // Reset content when locale changes to force refetch
    $: if ($locale) {
        guideContent = '';
        changelogContent = '';
    }

    // When the derived store for calculation inputs changes, trigger a recalculation.
    $: if ($calculationInputs) {
        // The check for undefined is still useful to prevent calculation on initial mount
        // before the store is fully populated from localStorage.
        if (Object.values($calculationInputs).every(val => val !== undefined)) {
            app.calculateAndDisplay();
        }
    }

    function handleTradeSetupError(e: CustomEvent<string>) {
        uiStore.showError(e.detail);
    }

    function handleTargetsChange(event: CustomEvent<Array<{ price: Decimal | null; percent: Decimal | null; isLocked: boolean }>>) {
        updateTradeStore(s => ({ ...s, targets: event.detail }));
    }

    function handleTpRemove(event: CustomEvent<number>) {
        const index = event.detail;
        const newTargets = $tradeStore.targets.filter((_, i) => i !== index);
        updateTradeStore(s => ({ ...s, targets: newTargets }));
        app.adjustTpPercentages(null); // Pass null to signify a removal
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event && event.key && event.key.toLowerCase() === 'escape') {
            event.preventDefault();
            // The new generic Modal component handles its own closing on Escape.
            // We just need to manage the flags that control it.
            if ($uiStore.showJournalModal) uiStore.toggleJournalModal(false);
            if ($uiStore.showGuideModal) uiStore.toggleGuideModal(false);
            if ($uiStore.showChangelogModal) uiStore.toggleChangelogModal(false);
            if (contentModalState.isOpen) contentModalState.isOpen = false;
            return;
        }

        if (event && event.key && event.altKey) {
            switch (event.key.toLowerCase()) {
                case 'l':
                    event.preventDefault();
                    updateTradeStore(s => ({ ...s, tradeType: CONSTANTS.TRADE_TYPE_LONG }));
                    break;
                case 's':
                    event.preventDefault();
                    updateTradeStore(s => ({ ...s, tradeType: CONSTANTS.TRADE_TYPE_SHORT }));
                    break;
                case 'j':
                    event.preventDefault();
                    uiStore.toggleJournalModal(true);
                    break;
            }
        }
    }

    function handleBackupClick() {
        createBackup();
        trackCustomEvent('Backup', 'Click', 'CreateBackup');
    }

    function handleRestoreClick() {
        fileInput.click();
    }

    function handleFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target?.result as string;

            const confirmed = await confirmService.show(
                $_('app.restoreConfirmTitle'),
                $_('app.restoreConfirmMessage')
            );

            if (confirmed) {
                const result = restoreFromBackup(content);
                if (result.success) {
                    // Now that restoreFromBackup updates the stores,
                    // we just need to re-load the settings into the tradeStore
                    // and the UI will be reactive.
                    app.loadSettings();
                    uiStore.showFeedback('save');
                } else {
                    uiStore.showError(result.message);
                }
            }
            // Reset file input so the same file can be selected again
            input.value = '';
        };
        reader.onerror = () => {
            uiStore.showError('app.fileReadError');
        };
        reader.readAsText(file);

        trackCustomEvent('Backup', 'Click', 'RestoreBackup');
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<input type="file" class="hidden" bind:this={fileInput} on:change={handleFileSelected} accept=".json,application/json" />

<main class="my-8 w-full max-w-4xl mx-auto calculator-wrapper rounded-2xl shadow-2xl p-6 sm:p-8 fade-in">

    <Header />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div>
            <GeneralInputs bind:tradeType={$tradeStore.tradeType} bind:leverage={$tradeStore.leverage} bind:fees={$tradeStore.fees} bind:slippage={$tradeStore.slippage} />

            <PortfolioInputs
                bind:accountSize={$tradeStore.accountSize}
                bind:riskPercentage={$tradeStore.riskPercentage}
                bind:riskAmount={$tradeStore.riskAmount}
                isRiskAmountLocked={$tradeStore.isRiskAmountLocked}
                isPositionSizeLocked={$tradeStore.isPositionSizeLocked}
                on:toggleRiskAmountLock={() => app.toggleRiskAmountLock()}
            />

        </div>

        <TradeSetupInputs
            bind:symbol={$tradeStore.symbol}
            bind:entryPrice={$tradeStore.entryPrice}
            bind:useAtrSl={$tradeStore.useAtrSl}
            bind:atrValue={$tradeStore.atrValue}
            bind:atrMultiplier={$tradeStore.atrMultiplier}
            bind:stopLossPrice={$tradeStore.stopLossPrice}
            bind:atrMode={$tradeStore.atrMode}
            bind:atrTimeframe={$tradeStore.atrTimeframe}

            on:showError={handleTradeSetupError}
            
            on:fetchPrice={() => app.handleFetchPrice()}
            on:toggleAtrInputs={(e) => toggleAtrInputs(e.detail)}
            on:selectSymbolSuggestion={(e) => app.selectSymbolSuggestion(e.detail)}
            on:setAtrMode={(e) => app.setAtrMode(e.detail)}
            on:setAtrTimeframe={(e) => app.setAtrTimeframe(e.detail)}
            on:fetchAtr={() => app.fetchAtr()}

            atrFormulaDisplay={$resultsStore.atrFormulaText}
            showAtrFormulaDisplay={$resultsStore.showAtrFormulaDisplay}
            isAtrSlInvalid={$resultsStore.isAtrSlInvalid}
            isPriceFetching={$uiStore.isPriceFetching}
            symbolSuggestions={$uiStore.symbolSuggestions}
            showSymbolSuggestions={$uiStore.showSymbolSuggestions}
        />
    </div>

    <TakeProfitTargets bind:targets={$tradeStore.targets} on:change={handleTargetsChange} on:remove={handleTpRemove} calculatedTpDetails={$resultsStore.calculatedTpDetails} />

    {#if $uiStore.showErrorMessage}
        <div id="error-message" class="text-center text-sm font-medium mt-4 md:col-span-2" style:color="var(--danger-color)">{$_($uiStore.errorMessage)}</div>
    {/if}

    <section id="results" class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8">
        <div>
            <SummaryResults
                isPositionSizeLocked={$tradeStore.isPositionSizeLocked}
                showCopyFeedback={$uiStore.showCopyFeedback}
                positionSize={$resultsStore.positionSize}
                netLoss={$resultsStore.netLoss}
                requiredMargin={$resultsStore.requiredMargin}
                entryFee={$resultsStore.entryFee}
                estimatedLiquidationPrice={$resultsStore.estimatedLiquidationPrice}
                breakEvenPrice={$resultsStore.breakEvenPrice}
                on:toggleLock={() => app.togglePositionSizeLock()}
                on:copy={() => uiStore.showFeedback('copy')}
            />
            {#if $resultsStore.showTotalMetricsGroup}
                <div id="total-metrics-group" class="result-group">
                    <h2 class="section-header">{$_('dashboard.totalTradeMetrics')}<Tooltip text={$_('dashboard.totalTradeMetricsTooltip')} /></h2>
                    <div class="result-item"><span class="result-label">{$_('dashboard.riskPerTradeCurrency')}<Tooltip text={$_('dashboard.riskPerTradeCurrencyTooltip')} /></span><span id="riskAmountCurrency" class="result-value" style:color="var(--danger-color)">{$resultsStore.riskAmountCurrency}</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.totalFees')}<Tooltip text={$_('dashboard.totalFeesTooltip')} /></span><span id="totalFees" class="result-value">{$resultsStore.totalFees}</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.weightedRR')}<Tooltip text={$_('dashboard.weightedRRTooltip')} /></span><span id="totalRR" class="result-value">{$resultsStore.totalRR}</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.totalNetProfit')}<Tooltip text={$_('dashboard.totalNetProfitTooltip')} /></span><span id="totalNetProfit" class="result-value" style:color="var(--success-color)">{$resultsStore.totalNetProfit}</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.totalReturnOnCapital')}<Tooltip text={$_('dashboard.returnOnCapitalTooltip')} /></span><span id="totalROC" class="result-value" style:color="var(--success-color)">{$resultsStore.totalROC}%</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.soldPosition')}<Tooltip text={$_('dashboard.soldPositionTooltip')} /></span><span id="totalPercentSold" class="result-value">{$resultsStore.totalPercentSold}</span></div>
                </div>
            {/if}
        </div>
        <div id="tp-results-container">
            {#each $resultsStore.calculatedTpDetails as tpDetail: IndividualTpResult}
                <div class="result-group !mt-0 md:!mt-6">
                    <h2 class="section-header">{$_('dashboard.takeProfit')} {(tpDetail as IndividualTpResult).index + 1} ({(tpDetail as IndividualTpResult).percentSold.toFixed(0)}%)</h2>
                    <div class="result-item"><span class="result-label">{$_('dashboard.riskRewardRatio')}</span><span class="result-value" style:color={tpDetail.riskRewardRatio.gte(2) ? 'var(--success-color)' : tpDetail.riskRewardRatio.gte(1.5) ? 'var(--warning-color)' : 'var(--danger-color)'}>{formatDynamicDecimal(tpDetail.riskRewardRatio, 2)}</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.netProfit')}<Tooltip text={$_('dashboard.netProfitTooltip')} /></span><span class="result-value" style:color="var(--success-color)">+{formatDynamicDecimal(tpDetail.netProfit, 2)}</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.priceChange')}<Tooltip text={$_('dashboard.priceChangeTooltip')} /></span><span class="result-value" style:color={tpDetail.priceChangePercent.gt(0) ? 'var(--success-color)' : 'var(--danger-color)'}>{formatDynamicDecimal(tpDetail.priceChangePercent, 2)}%</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.returnOnCapital')}<Tooltip text={$_('dashboard.returnOnCapitalTooltip')} /></span><span class="result-value" style:color={tpDetail.partialROC.gt(0) ? 'var(--success-color)' : 'var(--danger-color)'}>{formatDynamicDecimal(tpDetail.partialROC, 2)}%</span></div>
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
            calculatedTpDetails={$resultsStore.calculatedTpDetails}
        />
        <footer class="md:col-span-2">
            <textarea id="tradeNotes" class="input-field w-full px-4 py-2 rounded-md mb-4" rows="2" placeholder="{$_('dashboard.tradeNotesPlaceholder')}" bind:value={$tradeStore.tradeNotes}></textarea>
            <div class="flex items-center gap-4">
                <button id="save-journal-btn" class="w-full font-bold py-3 px-4 rounded-lg btn-primary-action" on:click={app.addTrade} disabled={$resultsStore.positionSize === '-'} use:trackClick={{ category: 'Journal', action: 'Click', name: 'SaveTrade' }}>{$_('dashboard.addTradeToJournal')}</button>
                <button id="show-dashboard-readme-btn" class="font-bold p-3 rounded-lg btn-secondary-action" title="{$_('dashboard.showInstructionsTitle')}" aria-label="{$_('dashboard.showInstructionsAriaLabel')}" on:click={() => showContentModal('dashboard')}>{@html icons.book}</button>
                {#if $uiStore.showSaveFeedback}<span id="save-feedback" class="save-feedback" class:visible={$uiStore.showSaveFeedback}>{$_('dashboard.savedFeedback')}</span>{/if}
            </div>
            <div class="mt-4 flex justify-between items-center">
                <LanguageSwitcher />
                <div class="flex items-center gap-2">
                    <button id="backup-btn" class="text-sm bg-[var(--btn-default-bg)] hover:bg-[var(--btn-default-hover-bg)] text-[var(--btn-default-text)] font-bold py-2.5 px-2.5 rounded-lg" title="{$_('app.backupButtonTitle')}" aria-label="{$_('app.backupButtonAriaLabel')}" on:click={handleBackupClick}>
                        {@html icons.export}
                    </button>
                    <button id="restore-btn" class="text-sm bg-[var(--btn-default-bg)] hover:bg-[var(--btn-default-hover-bg)] text-[var(--btn-default-text)] font-bold py-2.5 px-2.5 rounded-lg" title="{$_('app.restoreButtonTitle')}" aria-label="{$_('app.restoreButtonAriaLabel')}" on:click={handleRestoreClick}>
                        {@html icons.import}
                    </button>
                </div>
            </div>
        </footer>
    </section>
</main>

<footer class="w-full max-w-4xl mx-auto text-center py-4 text-sm text-gray-500">
    Version 0.92b1 - <button class="text-link" on:click={() => uiStore.toggleGuideModal(true)} use:trackClick={{ category: 'Navigation', action: 'Click', name: 'ShowGuide' }}>{$_('app.guideButton')}</button> | <button class="text-link" on:click={() => uiStore.toggleChangelogModal(true)} use:trackClick={{ category: 'Navigation', action: 'Click', name: 'ShowChangelog' }}>Changelog</button>
</footer>

<JournalView on:showreadme={() => showContentModal('journal')} />

<ConfirmModal />
<PromptModal />

<Modal bind:isOpen={$uiStore.showChangelogModal} title={$_('app.changelogTitle')}>
    <div class="prose dark:prose-invert max-h-[calc(70vh)] overflow-y-auto">
        {@html changelogContent}
    </div>
</Modal>

<Modal bind:isOpen={$uiStore.showGuideModal} title={$_('app.guideTitle')}>
    <div class="prose dark:prose-invert max-h-[calc(70vh)] overflow-y-auto">
        {@html guideContent}
    </div>
</Modal>

<Modal bind:isOpen={contentModalState.isOpen} title={contentModalState.title}>
    <div class="prose dark:prose-invert max-h-[calc(70vh)] overflow-y-auto">
        {@html contentModalState.content}
    </div>
</Modal>