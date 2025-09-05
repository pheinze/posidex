<script lang="ts">
    import { numberInput } from '../../utils/inputUtils';
    import { _ } from '../../locales/i18n';
    import { onboardingService } from '../../services/onboardingService';
    import { createEventDispatcher } from 'svelte';
    import { icons } from '../../lib/constants';

    export let accountSize: string;
    export let riskPercentage: string;
    export let riskAmount: string;
    export let isRiskAmountLocked: boolean;
    export let isPositionSizeLocked: boolean;

    const dispatch = createEventDispatcher();

    function handleLockClick() {
        dispatch('toggleRiskAmountLock');
    }
</script>

<div>
    <h2 class="section-header !mt-6">{$_('dashboard.portfolioInputs.header')}</h2>
    <div class="grid grid-cols-3 gap-4">
        <div>
            <label for="account-size" class="input-label">{$_('dashboard.portfolioInputs.accountSizeLabel')}</label>
            <input id="account-size" type="text" inputmode="decimal" use:numberInput={{ maxDecimalPlaces: 4 }} bind:value={accountSize} class="input-field w-full px-4 py-2 rounded-md" placeholder="{$_('dashboard.portfolioInputs.accountSizePlaceholder')}" on:input={onboardingService.trackFirstInput}>
        </div>
        <div>
            <label for="risk-percentage" class="input-label">{$_('dashboard.portfolioInputs.riskPerTradeLabel')}</label>
            <input id="risk-percentage" type="text" inputmode="decimal" use:numberInput={{ noDecimals: true, isPercentage: true, maxValue: 100, minValue: 0 }} bind:value={riskPercentage} class="input-field w-full px-4 py-2 rounded-md" placeholder="{$_('dashboard.portfolioInputs.riskPerTradePlaceholder')}" on:input={onboardingService.trackFirstInput} disabled={isRiskAmountLocked || isPositionSizeLocked}>
        </div>
        <div>
            <label for="risk-amount" class="input-label">Risk Amount</label>
            <div class="relative">
                <input id="risk-amount" type="text" inputmode="decimal" use:numberInput={{ maxDecimalPlaces: 2 }} bind:value={riskAmount} class="input-field w-full px-4 py-2 rounded-md pr-10" placeholder="e.g. 100" disabled={isPositionSizeLocked}>
                <button class="absolute top-1/2 right-2 -translate-y-1/2 btn-lock-icon" on:click={handleLockClick} title="Lock/Unlock Risk Amount" disabled={isPositionSizeLocked}>
                    {@html isRiskAmountLocked ? icons.lockClosed : icons.lockOpen}
                </button>
            </div>
        </div>
    </div>
</div>