<script lang="ts">
    /**
     * @component TakeProfitTargets
     *
     * This component manages and displays a list of Take-Profit (TP) targets.
     * It dynamically renders a `TakeProfitRow` for each target.
     *
     * @props {Array<{ price: Decimal | null; percent: Decimal | null; isLocked: boolean }>} targets - The array of TP target objects.
     * @props {IndividualTpResult[]} [calculatedTpDetails=[]] - The array of calculated details for each TP, used to display results in the rows.
     *
     * @event remove - Forwards the 'remove' event from a `TakeProfitRow`, providing the index of the row to be removed.
     */
    import { icons } from '../../lib/constants';
    import TakeProfitRow from '../shared/TakeProfitRow.svelte';
    import Tooltip from '../shared/Tooltip.svelte';
    import { createEventDispatcher } from 'svelte';
    import { app } from '../../services/app';
    import { _ } from '../../locales/i18n';
    import type { IndividualTpResult } from '../../stores/types';
    import { Decimal } from 'decimal.js';

    const dispatch = createEventDispatcher();

    export let targets: Array<{ id: number; price: Decimal | null; percent: Decimal | null; isLocked: boolean }>;
    export let calculatedTpDetails: IndividualTpResult[] = [];

    // Create a reactive map for efficient lookups. This avoids O(n^2) complexity in the template.
    $: calculatedTpDetailsMap = new Map(calculatedTpDetails.map(detail => [detail.index, detail]));

    function addTakeProfitRow() {
        app.addTakeProfitRow();
    }

    function handleRemove(event: CustomEvent<number>) {
        const index = event.detail;
        // Dispatch the index to be removed. The parent component will handle the logic.
        dispatch('remove', index);
    }
</script>

<section class="mt-4 md:col-span-2">
    <h2 class="section-header">
        <span>{$_('dashboard.takeProfitTargets.header')}</span>
        <div class="flex items-center gap-2">
            <Tooltip text={$_('dashboard.takeProfitTargets.tooltip')} />
            <button id="add-tp-btn" class="btn-icon-accent" title="{$_('dashboard.takeProfitTargets.addTargetTitle')}" tabindex="-1" on:click={addTakeProfitRow}>
                {@html icons.add}
            </button>
        </div>
    </h2>
    <div id="take-profit-list" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {#each targets as target, i (target.id)}
            {@const tpDetail = calculatedTpDetailsMap.get(i)}
            <TakeProfitRow
                index={i}
                price={target.price}
                percent={target.percent}
                isLocked={target.isLocked}
                tpDetail={tpDetail}
                on:remove={handleRemove}
            />
        {/each}
    </div>
</section>
