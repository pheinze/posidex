<script lang="ts">
    /**
     * @component TakeProfitRow
     *
     * This component represents a single row for a Take-Profit (TP) target.
     * It includes inputs for the target price and the percentage of the position
     * to sell at that price. It also displays calculated details for the target,
     * such as the net profit and risk/reward ratio.
     *
     * @props {number} index - The index of this TP row.
     * @props {Decimal | null} price - The price of the TP target.
     * @props {Decimal | null} percent - The percentage of the position to sell.
     * @props {boolean} isLocked - Whether the percentage input is locked from auto-adjustment.
     * @props {IndividualTpResult | undefined} [tpDetail=undefined] - The calculated details for this TP target.
     *
     * @event remove - Dispatched when the user clicks the remove button. The event detail is the `index` of the row to be removed.
     */
    import { icons } from '../../lib/constants';
    import { createEventDispatcher } from 'svelte';
    import { numberInput } from '../../utils/inputUtils';
    import { _ } from '../../locales/i18n';
    import { trackClick } from '../../lib/actions';
    import { updateTradeStore, tradeStore } from '../../stores/tradeStore';
    import { app } from '../../services/app';
    import { get } from 'svelte/store';
    import type { IndividualTpResult } from '../../stores/types';
    import { Decimal } from 'decimal.js';

    const dispatch = createEventDispatcher();

    export let index: number;
    export let price: Decimal | null;
    export let percent: Decimal | null;
    export let isLocked: boolean;
    export let tpDetail: IndividualTpResult | undefined = undefined;

    function toggleLock() {
        const newLockState = !isLocked;
        const currentTargets = get(tradeStore).targets;
        if (currentTargets[index]) {
            currentTargets[index].isLocked = newLockState;
            updateTradeStore(s => ({ ...s, targets: currentTargets }));
            app.adjustTpPercentages(index);
        }
    }

    function removeRow() {
        dispatch('remove', index);
    }

    const format = (val: Decimal | null) => (val === null || val === undefined) ? '' : String(val);

    function handlePriceInput(e: Event) {
        const target = e.target as HTMLInputElement;
        const value = target.value;
        const currentTargets = [...get(tradeStore).targets];

        if (!currentTargets[index]) return;

        if (value.trim() === '') {
            currentTargets[index].price = null;
            updateTradeStore(s => ({ ...s, targets: currentTargets }));
            return;
        }

        try {
            currentTargets[index].price = new Decimal(value);
            updateTradeStore(s => ({ ...s, targets: currentTargets }));
        } catch (error) {
            // Invalid intermediate state, do nothing
        }
    }

    function handlePercentInput(e: Event) {
        const target = e.target as HTMLInputElement;
        const value = target.value;
        const currentTargets = [...get(tradeStore).targets];

        if (!currentTargets[index]) return;

        if (value.trim() === '') {
            currentTargets[index].percent = null;
            updateTradeStore(s => ({ ...s, targets: currentTargets }));
            app.adjustTpPercentages(index);
            return;
        }

        try {
            currentTargets[index].percent = new Decimal(value);
            updateTradeStore(s => ({ ...s, targets: currentTargets }));
            app.adjustTpPercentages(index);
        } catch (error) {
            // Invalid intermediate state, do nothing
        }
    }
</script>

<style>
    /* Highlighting removed as it was causing svelte-check warnings */
</style>

<div class="tp-row flex items-center gap-2 p-2 rounded-lg" style="background-color: var(--bg-tertiary);">
    <div class="flex-grow">
        <div class="flex justify-between items-center mb-1">
            <label class="tp-label text-xs text-[var(--text-secondary)]" for="tp-price-{index}">TP {index + 1}</label>
            {#if tpDetail}
                <div class="text-xs text-[var(--text-secondary)] text-right">
                    <span class="mr-2">{$_('dashboard.takeProfitRow.winLabel')} <span class="text-[var(--success-color)]">+${tpDetail.netProfit.toFixed(2)}</span></span>
                    <span>{$_('dashboard.takeProfitRow.rrLabel')} <span class="{tpDetail.riskRewardRatio.gte(2) ? 'text-[var(--success-color)]' : tpDetail.riskRewardRatio.gte(1.5) ? 'text-[var(--warning-color)]' : 'text-[var(--danger-color)]'}">{tpDetail.riskRewardRatio.toFixed(2)}</span></span>
                </div>
            {/if}
        </div>
        <div class="grid grid-cols-2 gap-2">
            <input
                type="text"
                use:numberInput={{ maxDecimalPlaces: 4 }}
                value={format(price)}
                on:input={handlePriceInput}
                class="tp-price input-field w-full px-4 py-2 rounded-md"
                placeholder="{$_('dashboard.takeProfitRow.pricePlaceholder')}"
                id="tp-price-{index}"
            >
            <input
                type="text"
                use:numberInput={{ noDecimals: true, isPercentage: true, minValue: 0, maxValue: 100 }}
                value={format(percent)}
                on:input={handlePercentInput}
                class="tp-percent input-field w-full px-4 py-2 rounded-md"
                class:locked-input={isLocked}
                disabled={isLocked}
                placeholder="%"
                id="tp-percent-{index}"
            >
        </div>
    </div>
    <button class="lock-tp-btn btn-lock-icon p-1 self-center" title="{$_('dashboard.takeProfitRow.lockButtonTitle')}" tabindex="-1" on:click={toggleLock} use:trackClick={{ category: 'TakeProfitRow', action: 'Click', name: 'ToggleLock' }}>
        {#if isLocked}
            {@html icons.lockClosed}
        {:else}
            {@html icons.lockOpen}
        {/if}
    </button>
    <button class="remove-tp-btn text-[var(--danger-color)] hover:opacity-80 p-1 self-center" title="{$_('dashboard.takeProfitRow.removeButtonTitle')}" tabindex="-1" on:click={removeRow} use:trackClick={{ category: 'TakeProfitRow', action: 'Click', name: 'RemoveRow' }}>
        {@html icons.remove}
    </button>
</div>