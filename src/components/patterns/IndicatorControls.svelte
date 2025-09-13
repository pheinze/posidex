<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let showMA = false;
    export let showRSI = false;

    const dispatch = createEventDispatcher<{
        toggleMA: boolean;
        toggleRSI: boolean;
    }>();

    function handleMAChange(e: Event) {
        const target = e.target as HTMLInputElement;
        dispatch('toggleMA', target.checked);
    }

    function handleRSIChange(e: Event) {
        const target = e.target as HTMLInputElement;
        dispatch('toggleRSI', target.checked);
    }
</script>

<div class="indicator-controls">
    <h3>Illustrative Indikatoren:</h3>
    <div>
        <label>
            <input type="checkbox" bind:checked={showMA} on:change={handleMAChange}>
            Gleitender Durchschnitt (MA)
        </label>
        <label>
            <input type="checkbox" bind:checked={showRSI} on:change={handleRSIChange}>
            Relative Strength Index (RSI)
        </label>
    </div>
</div>

<style>
    .indicator-controls {
        margin-top: 1.5rem;
    }
    .indicator-controls > *:not(:last-child) {
        margin-bottom: 0.5rem;
    }
    .indicator-controls h3 {
        font-size: 1.125rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: var(--text-primary);
    }
    .indicator-controls label {
        display: flex;
        align-items: center;
        padding: 0.5rem;
        background-color: var(--bg-tertiary);
        border-radius: 0.375rem;
        cursor: pointer;
        transition: background-color 0.2s;
        margin-top: 0.5rem;
    }
    .indicator-controls label:hover {
        background-color: var(--btn-default-hover-bg);
    }
    .indicator-controls input[type="checkbox"] {
        margin-right: 0.5rem;
        accent-color: var(--accent-color);
    }
</style>
