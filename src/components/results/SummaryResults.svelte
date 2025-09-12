<script lang="ts">
    /**
     * @component SummaryResults
     *
     * This component displays the main calculated results of a trade setup,
     * such as Position Size, Max Net Loss, and Required Margin.
     * It also provides actions like copying the position size and toggling its lock state.
     *
     * @props {boolean} isPositionSizeLocked - Indicates if the position size is currently locked.
     * @props {boolean} showCopyFeedback - Controls the visibility of the "Copied!" feedback message.
     * @props {string} positionSize - The calculated position size.
     * @props {string} netLoss - The potential net loss if the stop-loss is hit.
     * @props {string} requiredMargin - The margin required to open the position.
     * @props {string} entryFee - The estimated fee for entering the trade.
     * @props {string} estimatedLiquidationPrice - The estimated price at which the position would be liquidated.
     * @props {string} breakEvenPrice - The price at which the trade breaks even, including fees.
     *
     * @event copy - Dispatched when the user clicks the copy button.
     * @event toggleLock - Dispatched when the user clicks the lock icon for the position size.
     */
    import { createEventDispatcher } from 'svelte';
    import { icons } from '../../lib/constants';
    import Tooltip from '../shared/Tooltip.svelte';
    import { _ } from '../../locales/i18n';
    import { trackCustomEvent } from '../../services/trackingService';

    const dispatch = createEventDispatcher();

    export let isPositionSizeLocked: boolean;
    export let showCopyFeedback: boolean;
    export let positionSize: string | null;
    export let netLoss: string | null;
    export let requiredMargin: string | null;
    export let entryFee: string | null;
    export let estimatedLiquidationPrice: string | null;
    export let breakEvenPrice: string | null;

    function handleCopy() {
        trackCustomEvent('Result', 'Copy', 'PositionSize');
        if (positionSize) {
            navigator.clipboard.writeText(positionSize);
            dispatch('copy');
        }
    }

    function handleToggleLock() {
        trackCustomEvent('Result', 'ToggleLock', !isPositionSizeLocked ? 'On' : 'Off');
        dispatch('toggleLock');
    }
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
            <button id="copy-btn" class="copy-btn" aria-label="{$_('dashboard.summaryResults.copyPositionSizeAriaLabel')}" on:click={handleCopy}>
                {@html icons.copy}
            </button>
            {#if showCopyFeedback}<span id="copy-feedback" class="copy-feedback visible">{$_('dashboard.summaryResults.copiedFeedback')}</span>{/if}
        </div>
        <span id="positionSize" class="result-value text-lg" style:color="var(--success-color)">{positionSize ?? '-'}</span>
    </div>
    <div class="result-item"><div class="result-label">{$_('dashboard.summaryResults.maxNetLossLabel')}<Tooltip text={$_('dashboard.summaryResults.maxNetLossTooltip')} /></div><span id="netLoss" class="result-value" style:color="var(--danger-color)">{netLoss ?? '-'}</span></div>
    <div class="result-item"><div class="result-label">{$_('dashboard.summaryResults.requiredMarginLabel')}<Tooltip text={$_('dashboard.summaryResults.requiredMarginTooltip')} /></div><span id="requiredMargin" class="result-value">{requiredMargin ?? '-'}</span></div>
    <div class="result-item"><div class="result-label">{$_('dashboard.summaryResults.entryFeeLabel')}</div><span id="entryFee" class="result-value">{entryFee ?? '-'}</span></div>
    <div class="result-item">
        <span class="result-label">{$_('dashboard.summaryResults.estimatedLiquidationPriceLabel')}<Tooltip text={$_('dashboard.summaryResults.estimatedLiquidationPriceTooltip')} /></span>
        <span id="liquidationPrice" class="result-value">{estimatedLiquidationPrice ?? '-'}</span>
    </div>
    <div class="result-item"><span class="result-label">{$_('dashboard.summaryResults.breakEvenPriceLabel')}<Tooltip text={$_('dashboard.summaryResults.breakEvenPriceTooltip')} /></span><span id="breakEvenPrice" class="result-value" style:color="var(--warning-color)">{breakEvenPrice ?? '-'}</span></div>
</div>
