<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { icons } from '../../lib/constants';
    import Tooltip from '../shared/Tooltip.svelte';
    import { _ } from '../../locales/i18n';
    import { trackCustomEvent } from '../../services/trackingService';
    import { formatDynamicDecimal } from '../../utils/utils';
    import type { Decimal } from 'decimal.js';

    const dispatch = createEventDispatcher();

    export let isPositionSizeLocked: boolean;
    export let showCopyFeedback: boolean;
    export let positionSize: Decimal | null;
    export let netLoss: Decimal | null;
    export let requiredMargin: Decimal | null;
    export let entryFee: Decimal | null;
    export let estimatedLiquidationPrice: Decimal | null;
    export let breakEvenPrice: Decimal | null;

    function handleCopy() {
        if (!positionSize) return;
        trackCustomEvent('Result', 'Copy', 'PositionSize');
        navigator.clipboard.writeText(positionSize.toString());
        dispatch('copy');
    }

    function handleToggleLock() {
        trackCustomEvent('Result', 'ToggleLock', !isPositionSizeLocked ? 'On' : 'Off');
        dispatch('toggleLock');
    }

    $: formattedLoss = netLoss ? `-${formatDynamicDecimal(netLoss, 2)}` : '-';
</script>

<div class="result-group">
    <h2 class="section-header">{$_('dashboard.summaryResults.header')}</h2>
    <div class="result-item">
        <div class="result-label">
            {$_('dashboard.summaryResults.positionSizeLabel')}
            <button id="lock-position-size-btn" class="copy-btn ml-2" title="{$_('dashboard.summaryResults.lockPositionSizeTitle')}" aria-label="{$_('dashboard.summaryResults.lockPositionSizeAriaLabel')}" on:click={handleToggleLock}>
                {#if isPositionSizeLocked}
                    {@html icons.lockClosed}
                {:else}
                    {@html icons.lockOpen}
                {/if}
            </button>
            <button id="copy-btn" class="copy-btn" aria-label="{$_('dashboard.summaryResults.copyPositionSizeAriaLabel')}" on:click={handleCopy} disabled={!positionSize}>
                {@html icons.copy}
            </button>
            {#if showCopyFeedback}<span id="copy-feedback" class="copy-feedback visible">{$_('dashboard.summaryResults.copiedFeedback')}</span>{/if}
        </div>
        <span id="positionSize" class="result-value text-lg" style:color="var(--success-color)">{formatDynamicDecimal(positionSize, 4)}</span>
    </div>
    <div class="result-item"><div class="result-label">{$_('dashboard.summaryResults.maxNetLossLabel')}<Tooltip text={$_('dashboard.summaryResults.maxNetLossTooltip')} /></div><span id="netLoss" class="result-value" style:color="var(--danger-color)">{formattedLoss}</span></div>
    <div class="result-item"><div class="result-label">{$_('dashboard.summaryResults.requiredMarginLabel')}<Tooltip text={$_('dashboard.summaryResults.requiredMarginTooltip')} /></div><span id="requiredMargin" class="result-value">{formatDynamicDecimal(requiredMargin, 2)}</span></div>
    <div class="result-item"><div class="result-label">{$_('dashboard.summaryResults.entryFeeLabel')}</div><span id="entryFee" class="result-value">{formatDynamicDecimal(entryFee, 4)}</span></div>
    <div class="result-item">
        <span class="result-label">{$_('dashboard.summaryResults.estimatedLiquidationPriceLabel')}<Tooltip text={$_('dashboard.summaryResults.estimatedLiquidationPriceTooltip')} /></span>
        <span id="liquidationPrice" class="result-value">{formatDynamicDecimal(estimatedLiquidationPrice, 2) || 'N/A'}</span>
    </div>
    <div class="result-item"><span class="result-label">{$_('dashboard.summaryResults.breakEvenPriceLabel')}<Tooltip text={$_('dashboard.summaryResults.breakEvenPriceTooltip')} /></span><span id="breakEvenPrice" class="result-value" style:color="var(--warning-color)">{formatDynamicDecimal(breakEvenPrice, 2)}</span></div>
</div>
