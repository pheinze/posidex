<script lang="ts">
    import { icons } from '../../lib/constants';
    import TakeProfitRow from '../shared/TakeProfitRow.svelte';
    import { createEventDispatcher } from 'svelte';
    import { app } from '../../services/app';
    import { _ } from '../../locales/i18n';

    const dispatch = createEventDispatcher();

    export let targets: Array<{ price: string; percent: string; isLocked: boolean }>;
    export let calculatedTpDetails: any[] = [];

    function addTakeProfitRow() {
        app.addTakeProfitRow();
    }

    function handleRemove(event: CustomEvent<number>) {
        const index = event.detail;
        // Dispatch the index to be removed. The parent component will handle the logic.
        dispatch('remove', index);
    }

    function handleInput(event: CustomEvent<{ index: number; price: string; percent: string; isLocked: boolean }>) {
        const { index, price, percent, isLocked } = event.detail;
        targets[index] = { price, percent, isLocked };
        app.adjustTpPercentages(index); // Re-adjust percentages after input
        dispatch('change', targets);
    }

    function handleLockToggle(event: CustomEvent<{ index: number; isLocked: boolean }>) {
        const { index, isLocked } = event.detail;
        targets[index].isLocked = isLocked;
        app.adjustTpPercentages(index); // Re-adjust percentages after lock/unlock
        dispatch('change', targets);
    }

    // Initial adjustment when component mounts or targets prop changes
    // This is now handled by the reactive statement in +page.svelte and app.calculateAndDisplay
</script>

<section class="mt-4 md:col-span-2">
    <h2 class="section-header">
        <span>{$_('dashboard.takeProfitTargets.header')}</span>
        <div class="flex items-center gap-2">
            <div class="tooltip"><div class="tooltip-icon">?</div><span class="tooltiptext">{$_('dashboard.takeProfitTargets.tooltip')}</span></div>
            <button id="add-tp-btn" class="btn-icon-accent" title="{$_('dashboard.takeProfitTargets.addTargetTitle')}" tabindex="-1" on:click={addTakeProfitRow}>
                {@html icons.add}
            </button>
        </div>
    </h2>
    <div id="take-profit-list" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {#each targets as target, i (i)}
            {@const tpDetail = calculatedTpDetails.find(d => d.index === i)}
            <TakeProfitRow
                index={i}
                bind:price={target.price}
                bind:percent={target.percent}
                bind:isLocked={target.isLocked}
                tpDetail={tpDetail}
                on:remove={handleRemove}
                on:input={handleInput}
                on:lockToggle={handleLockToggle}
            />
        {/each}
    </div>
</section>
