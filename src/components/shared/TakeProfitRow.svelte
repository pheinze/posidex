<script lang="ts">
    import { icons } from '../../lib/constants';
    import { createEventDispatcher, onMount } from 'svelte';
    import { numberInput } from '../../utils/inputUtils';
    import { _ } from '../../locales/i18n';

    const dispatch = createEventDispatcher();

    export let index: number;
    export let price: string;
    export let percent: string;
    export let isLocked: boolean;
    export let tpDetail: any | undefined = undefined;

    let previousPercent: string;
    let percentInput: HTMLInputElement;

    onMount(() => {
        previousPercent = percent;
    });

    $: if (percent !== previousPercent && percentInput) {
        if (document.activeElement !== percentInput) {
            percentInput.classList.add('highlight');
            setTimeout(() => {
                percentInput.classList.remove('highlight');
            }, 500);
        }
        previousPercent = percent;
    }

    function toggleLock() {
        dispatch('lockToggle', { index, isLocked: !isLocked });
    }

    function removeRow() {
        dispatch('remove', index);
    }

    function handleInput() {
        previousPercent = percent;
        dispatch('input', { index, price, percent, isLocked });
    }
</script>

<style>
    .highlight {
        animation: flash 0.5s ease-out;
    }

    @keyframes flash {
        0% { background-color: var(--accent-color); opacity: 0.7; }
        100% { background-color: var(--input-bg); opacity: 1; }
    }
</style>

<div class="tp-row flex items-center gap-2 p-2 rounded-lg" style="background-color: var(--bg-tertiary);">
    <div class="flex-grow">
        <div class="flex flex-wrap justify-between items-center mb-1">
            <label class="tp-label text-xs text-[var(--text-secondary)]" for="tp-price-{index}">TP {index + 1}</label>
            {#if tpDetail}
                <div class="text-xs text-[var(--text-secondary)] text-right flex-shrink-0">
                    <span class="mr-2">{$_('dashboard.takeProfitRow.winLabel')} <span class="text-[var(--success-color)]">+${tpDetail.netProfit.toFixed(2)}</span></span>
                    <span>{$_('dashboard.takeProfitRow.rrLabel')} <span class="{tpDetail.riskRewardRatio.gte(2) ? 'text-[var(--success-color)]' : tpDetail.riskRewardRatio.gte(1.5) ? 'text-[var(--warning-color)]' : 'text-[var(--danger-color)]'}">{tpDetail.riskRewardRatio.toFixed(2)}</span></span>
                </div>
            {/if}
        </div>
        <div class="grid grid-cols-2 gap-2">
            <input type="text" inputmode="decimal" use:numberInput={{ maxDecimalPlaces: 4 }} bind:value={price} on:input={handleInput} class="tp-price input-field w-full px-4 py-2 rounded-md" placeholder="{$_('dashboard.takeProfitRow.pricePlaceholder')}" id="tp-price-{index}">
            <input
                type="text"
                inputmode="decimal"
                use:numberInput={{ noDecimals: true, isPercentage: true, minValue: 0, maxValue: 100 }}
                bind:value={percent}
                bind:this={percentInput}
                on:input={handleInput}
                class="tp-percent input-field w-full px-4 py-2 rounded-md"
                class:locked-input={isLocked}
                disabled={isLocked}
                placeholder="%"
                id="tp-percent-{index}"
            >
        </div>
    </div>
    <button class="lock-tp-btn btn-lock-icon p-1 self-center" title="{$_('dashboard.takeProfitRow.lockButtonTitle')}" tabindex="-1" on:click={toggleLock}>
        {#if isLocked}
            {@html icons.lockClosed}
        {:else}
            {@html icons.lockOpen}
        {/if}
    </button>
    <button class="remove-tp-btn text-[var(--danger-color)] hover:opacity-80 p-1 self-center" title="{$_('dashboard.takeProfitRow.removeButtonTitle')}" tabindex="-1" on:click={removeRow}>
        {@html icons.remove}
    </button>
</div>