<script lang="ts">
    import GeneralInputs from '../components/inputs/GeneralInputs.svelte';
    import PortfolioInputs from '../components/inputs/PortfolioInputs.svelte';
    import TradeSetupInputs from '../components/inputs/TradeSetupInputs.svelte';
    import TakeProfitTargets from '../components/inputs/TakeProfitTargets.svelte';
    import VisualBar from '../components/shared/VisualBar.svelte';
    import { CONSTANTS, themes } from '../lib/constants';
    import { app } from '../services/app';
    import { tradeStore, updateTradeStore, resetAllInputs, toggleAtrInputs } from '../stores/tradeStore';
    import { calculationStore } from '../stores/calculationStore';
    import { presetStore } from '../stores/presetStore';
    import { uiStore } from '../stores/uiStore';
    import { modalManager } from '../services/modalManager';
    import { onMount } from 'svelte';
    import { _, locale } from '../locales/i18n';
    import { get } from 'svelte/store';
    import { loadInstruction } from '../services/markdownLoader';
    import { formatDynamicDecimal } from '../utils/utils';
    import { trackClick } from '../lib/actions';
    import { createBackup, restoreFromBackup } from '../services/backupService';
    import { Decimal } from 'decimal.js';
    
    import type { IndividualTpResult } from '../stores/types';
    import SummaryResults from '../components/results/SummaryResults.svelte';
    import LanguageSwitcher from '../components/shared/LanguageSwitcher.svelte';
    import Tooltip from '../components/shared/Tooltip.svelte';
    import JournalView from '../components/shared/JournalView.svelte';
    import Header from '../components/layout/Header.svelte';
    import CachyIcon from '../components/shared/CachyIcon.svelte';

    let fileInput: HTMLInputElement;

    onMount(() => {
        app.init();
    });

    async function showGuide() {
        const content = await loadInstruction('guide');
        modalManager.show({
            title: $_('app.guideTitle'),
            message: content.html,
            type: 'alert',
            size: 'large'
        });
    }

    async function showChangelog() {
        const content = await loadInstruction('changelog');
        modalManager.show({
            title: $_('app.changelogTitle'),
            message: content.html,
            type: 'alert',
            size: 'large'
        });
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
        app.adjustTpPercentages(null);
    }

    function handleThemeSwitch() {
        const currentIndex = themes.indexOf($uiStore.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        uiStore.setTheme(themes[nextIndex]);
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key.toLowerCase() === 'escape') {
            event.preventDefault();
            if ($uiStore.showJournalModal) uiStore.toggleJournalModal(false);
            if (get(modalManager).isOpen) modalManager._handleModalConfirm(false);
            return;
        }

        if (event.altKey) {
            switch (event.key.toLowerCase()) {
                case 'l': event.preventDefault(); updateTradeStore(s => ({ ...s, tradeType: CONSTANTS.TRADE_TYPE_LONG })); break;
                case 's': event.preventDefault(); updateTradeStore(s => ({ ...s, tradeType: CONSTANTS.TRADE_TYPE_SHORT })); break;
                case 'r': event.preventDefault(); resetAllInputs(); break;
                case 'j': event.preventDefault(); uiStore.toggleJournalModal(true); break;
            }
        }
    }

    function handleBackupClick() {
        createBackup();
        trackClick({ category: 'Backup', action: 'Click', name: 'CreateBackup' });
    }

    function handleRestoreClick() {
        fileInput.click();
    }

    function handleFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;

            modalManager.show({
                title: $_('app.restoreConfirmTitle'),
                message: $_('app.restoreConfirmMessage'),
                type: 'confirm'
            }).then((confirmed) => {
                if (confirmed) {
                    const result = restoreFromBackup(content);
                    if (result.success && result.data) {
                        tradeStore.set(result.data.settings);
                        journalStore.set(result.data.journal);
                        presetStore.update(s => ({...s, availablePresets: Object.keys(result.data.presets)}));
                        uiStore.showFeedback('save');
                    } else {
                        uiStore.showError(result.message);
                    }
                }
                input.value = '';
            });
        };
        reader.onerror = () => uiStore.showError('app.fileReadError');
        reader.readAsText(file);
        trackClick({ category: 'Backup', action: 'Click', name: 'RestoreBackup' });
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<input type="file" class="hidden" bind:this={fileInput} on:change={handleFileSelected} accept=".json,application/json" />

<main class="my-8 w-full max-w-4xl mx-auto calculator-wrapper rounded-2xl shadow-2xl p-6 sm:p-8 fade-in">

    <Header
        on:presetLoad={(e) => app.loadPreset(e.detail)}
        on:savePreset={() => app.savePreset()}
        on:deletePreset={() => app.deletePreset()}
        on:resetAll={resetAllInputs}
        on:switchTheme={handleThemeSwitch}
        on:viewJournal={() => uiStore.toggleJournalModal(true)}
    />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div>
            <GeneralInputs bind:tradeType={$tradeStore.tradeType} bind:leverage={$tradeStore.leverage} bind:fees={$tradeStore.fees} />

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
            atrFormulaDisplay={$calculationStore.results.atrFormulaText}
            showAtrFormulaDisplay={$calculationStore.results.showAtrFormulaDisplay}
            isAtrSlInvalid={$calculationStore.results.isAtrSlInvalid}
            isPriceFetching={$uiStore.isPriceFetching}
            symbolSuggestions={$uiStore.symbolSuggestions}
            showSymbolSuggestions={$uiStore.showSymbolSuggestions}
        />
    </div>

    <TakeProfitTargets bind:targets={$tradeStore.targets} on:change={handleTargetsChange} on:remove={handleTpRemove} calculatedTpDetails={$calculationStore.results.calculatedTpDetails} />

    {#if $calculationStore.error}
        <div id="error-message" class="text-center text-sm font-medium mt-4 md:col-span-2" style:color="var(--danger-color)">{$_($calculationStore.error)}</div>
    {/if}

    <section id="results" class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8">
        <div>
            <SummaryResults
                isPositionSizeLocked={$tradeStore.isPositionSizeLocked}
                showCopyFeedback={$uiStore.showCopyFeedback}
                positionSize={$calculationStore.results.positionSize}
                netLoss={$calculationStore.results.netLoss}
                requiredMargin={$calculationStore.results.requiredMargin}
                entryFee={$calculationStore.results.entryFee}
                estimatedLiquidationPrice={$calculationStore.results.estimatedLiquidationPrice}
                breakEvenPrice={$calculationStore.results.breakEvenPrice}
                on:toggleLock={() => app.togglePositionSizeLock()}
                on:copy={() => uiStore.showFeedback('copy')}
            />
            {#if $calculationStore.results.showTotalMetricsGroup}
                <div id="total-metrics-group" class="result-group">
                    <h2 class="section-header">{$_('dashboard.totalTradeMetrics')}<Tooltip text={$_('dashboard.totalTradeMetricsTooltip')} /></h2>
                    <div class="result-item"><span class="result-label">{$_('dashboard.riskPerTradeCurrency')}<Tooltip text={$_('dashboard.riskPerTradeCurrencyTooltip')} /></span><span id="riskAmountCurrency" class="result-value" style:color="var(--danger-color)">{formatDynamicDecimal($calculationStore.results.riskAmountCurrency, 2)}</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.totalFees')}<Tooltip text={$_('dashboard.totalFeesTooltip')} /></span><span id="totalFees" class="result-value">{formatDynamicDecimal($calculationStore.results.totalFees, 2)}</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.weightedRR')}<Tooltip text={$_('dashboard.weightedRRTooltip')} /></span><span id="totalRR" class="result-value">{formatDynamicDecimal($calculationStore.results.totalRR, 2)}</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.totalNetProfit')}<Tooltip text={$_('dashboard.totalNetProfitTooltip')} /></span><span id="totalNetProfit" class="result-value" style:color="var(--success-color)">+{formatDynamicDecimal($calculationStore.results.totalNetProfit, 2)}</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.totalReturnOnCapital')}<Tooltip text={$_('dashboard.returnOnCapitalTooltip')} /></span><span id="totalROC" class="result-value" style:color="var(--success-color)">{formatDynamicDecimal($calculationStore.results.totalROC, 2)}%</span></div>
                    <div class="result-item"><span class="result-label">{$_('dashboard.soldPosition')}<Tooltip text={$_('dashboard.soldPositionTooltip')} /></span><span id="totalPercentSold" class="result-value">{formatDynamicDecimal($calculationStore.results.totalPercentSold, 0)}%</span></div>
                </div>
            {/if}
        </div>
        <div id="tp-results-container">
            {#each $calculationStore.results.calculatedTpDetails as tpDetail: IndividualTpResult}
                <div class="result-group !mt-0 md:!mt-6">
                    <h2 class="section-header">{$_('dashboard.takeProfit')} {tpDetail.index + 1} ({tpDetail.percentSold.toFixed(0)}%)</h2>
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
            calculatedTpDetails={$calculationStore.results.calculatedTpDetails}
        />
        <footer class="md:col-span-2">
            <textarea id="tradeNotes" class="input-field w-full px-4 py-2 rounded-md mb-4" rows="2" placeholder="{$_('dashboard.tradeNotesPlaceholder')}" bind:value={$tradeStore.tradeNotes}></textarea>
            <div class="flex items-center gap-4">
                <button id="save-journal-btn" class="w-full font-bold py-3 px-4 rounded-lg btn-primary-action" on:click={() => app.addTrade($calculationStore.currentTradeData)} disabled={!$calculationStore.currentTradeData} use:trackClick={{ category: 'Journal', action: 'Click', name: 'SaveTrade' }}>{$_('dashboard.addTradeToJournal')}</button>
                <button id="show-dashboard-readme-btn" class="font-bold p-3 rounded-lg btn-secondary-action" title="{$_('dashboard.showInstructionsTitle')}" aria-label="{$_('dashboard.showInstructionsAriaLabel')}" on:click={() => app.uiManager.showReadme('dashboard')} use:trackClick={{ category: 'Navigation', action: 'Click', name: 'ShowInstructions' }}>{@html icons.book}</button>
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
    Version 0.92b1 - <button class="text-link" on:click={showGuide} use:trackClick={{ category: 'Navigation', action: 'Click', name: 'ShowGuide' }}>{$_('app.guideButton')}</button> | <button class="text-link" on:click={showChangelog} use:trackClick={{ category: 'Navigation', action: 'Click', name: 'ShowChangelog' }}>Changelog</button>
</footer>

<JournalView />
