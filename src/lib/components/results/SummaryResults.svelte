<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { icons } from '$lib/constants';
    import { _ } from '$lib/i18n';

    const dispatch = createEventDispatcher();

    export let isPositionSizeLocked: boolean;
    export let showCopyFeedback: boolean;
    export let positionSize: string;
    export let netLoss: string;
    export let requiredMargin: string;
    export let liquidationPrice: string;
    export let breakEvenPrice: string;

    function handleCopy() {
        navigator.clipboard.writeText(positionSize);
        dispatch('copy');
    }
</script>

<div class="result-group">
    <h2 class="section-header">{$_('dashboard.summaryResults.header')}</h2>
    <div class="result-item">
        <div class="result-label">
            {$_('dashboard.summaryResults.positionSizeLabel')}
            <button id="lock-position-size-btn" class="copy-btn ml-2" title="{$_('dashboard.summaryResults.lockPositionSizeTitle')}" aria-label="{$_('dashboard.summaryResults.lockPositionSizeAriaLabel')}" on:click={() => dispatch('toggleLock')}>
                {#if isPositionSizeLocked}
                    {@html icons.lockClosed}
                {:else}
                    {@html icons.lockOpen}
                {/if}
            </button>
            <button id="copy-btn" class="copy-btn" aria-label="{$_('dashboard.summaryResults.copyPositionSizeAriaLabel')}" on:click={handleCopy}>
                {@html icons.copy}
            </button>
            {#if showCopyFeedback}<span id="copy-feedback" class="copy-feedback visible">{$_('dashboard.summaryResults.copiedFeedback')}</span>{/if}
        </div>
        <span id="positionSize" class="result-value text-lg text-green-400">{positionSize}</span>
    </div>
    <div class="result-item"><div class="result-label">{$_('dashboard.summaryResults.maxNetLossLabel')}<div class="tooltip"><div class="tooltip-icon">?</div><span class="tooltiptext">{$_('dashboard.summaryResults.maxNetLossTooltip')}</span></div></div><span id="netLoss" class="result-value text-red-400">{netLoss}</span></div>
    <div class="result-item"><div class="result-label">{$_('dashboard.summaryResults.requiredMarginLabel')}<div class="tooltip"><div class="tooltip-icon">?</div><span class="tooltiptext">{$_('dashboard.summaryResults.requiredMarginTooltip')}</span></div></div><span id="requiredMargin" class="result-value">{requiredMargin}</span></div>
    <div class="result-item">
        <span class="result-label">{$_('dashboard.summaryResults.estimatedLiquidationPriceLabel')}<div class="tooltip"><div class="tooltip-icon">?</div><span class="tooltiptext">{$_('dashboard.summaryResults.estimatedLiquidationPriceTooltip')}</span></div></span>
        <span id="liquidationPrice" class="result-value text-warning-color">{liquidationPrice}</span>
    </div>
    <div class="result-item"><span class="result-label">{$_('dashboard.summaryResults.breakEvenPriceLabel')}<div class="tooltip"><div class="tooltip-icon">?</div><span class="tooltiptext">{$_('dashboard.summaryResults.breakEvenPriceTooltip')}</span></div></span><span id="breakEvenPrice" class="result-value text-sky-400">{breakEvenPrice}</span></div>
</div>
