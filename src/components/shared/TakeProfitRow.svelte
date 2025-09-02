<script lang="ts">
    import { icons } from '../../lib/constants';
    import { createEventDispatcher } from 'svelte';
    import { numberInput } from '../../utils/inputUtils'; // Import the action
    import { _ } from '../../locales/i18n';

    const dispatch = createEventDispatcher();

    export let index: number;
    export let price: string;
    export let percent: string;
    export let isLocked: boolean;
    export let tpDetail: any | undefined = undefined;

    function toggleLock() {
        dispatch('lockToggle', { index, isLocked: !isLocked });
    }

    function removeRow() {
        dispatch('remove', index);
    }

    function handleInput() {
        dispatch('input', { index, price, percent, isLocked });
    }
</script>

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
            <div class="input-container">
                <input type="text" inputmode="decimal" use:numberInput={{ decimalPlaces: 4 }} bind:value={price} on:input={handleInput} class="tp-price input-field w-full px-4 py-2 rounded-md pr-10" placeholder="{$_('dashboard.takeProfitRow.pricePlaceholder')}" id="tp-price-{index}">
                <div class="stepper-buttons">
                    <button tabindex="-1" on:click={() => {
                        const input = document.getElementById(`tp-price-${index}`);
                        input?.focus();
                        input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
                    }}>▲</button>
                    <button tabindex="-1" on:click={() => {
                        const input = document.getElementById(`tp-price-${index}`);
                        input?.focus();
                        input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
                    }}>▼</button>
                </div>
            </div>
            <div class="input-container">
                <input
                    type="text"
                    inputmode="decimal"
                    use:numberInput={{ decimalPlaces: 2, isPercentage: true }}
                    bind:value={percent}
                    on:input={handleInput}
                    class="tp-percent input-field w-full px-4 py-2 rounded-md pr-10"
                    class:locked-input={isLocked}
                    disabled={isLocked}
                    placeholder="%"
                    id="tp-percent-{index}"
                >
                {#if !isLocked}
                    <div class="stepper-buttons">
                        <button tabindex="-1" on:click={() => {
                            const input = document.getElementById(`tp-percent-${index}`);
                            input?.focus();
                            input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
                        }}>▲</button>
                        <button tabindex="-1" on:click={() => {
                            const input = document.getElementById(`tp-percent-${index}`);
                            input?.focus();
                            input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
                        }}>▼</button>
                    </div>
                {/if}
            </div>
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