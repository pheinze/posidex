<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { chartPatterns, type ChartPattern } from '../../lib/data/patterns';

    export let selectedPatternId: string | null = null;

    const dispatch = createEventDispatcher<{ select: string }>();

    const categorizedPatterns: Record<string, ChartPattern[]> = {};
    chartPatterns.forEach(pattern => {
        if (!categorizedPatterns[pattern.category]) {
            categorizedPatterns[pattern.category] = [];
        }
        categorizedPatterns[pattern.category].push(pattern);
    });

    const categoryOrder = [
        "Umkehrmuster",
        "Fortsetzungsmuster",
        "Bilaterale Muster",
        "Gap-Typen"
    ];

    function selectPattern(id: string) {
        dispatch('select', id);
    }
</script>

<div class="pattern-select-container">
    <h2 class="pattern-select-title">Chartmuster wählen:</h2>
    {#each categoryOrder as category}
        {@const patterns = categorizedPatterns[category]}
        {#if patterns}
            <h3 class="category-title">{category}</h3>
            {#each patterns as pattern}
                <button
                    class="pattern-button"
                    class:active={selectedPatternId === pattern.id}
                    on:click={() => selectPattern(pattern.id)}
                >
                    {pattern.name}
                </button>
            {/each}
        {/if}
    {/each}
</div>

<style>
    .pattern-select-container {
        background-color: var(--bg-secondary);
        padding: 1rem;
        border-radius: 0.5rem;
        overflow-y: auto;
        max-height: calc(100vh - 10rem);
    }

    .pattern-select-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 0.75rem;
        color: var(--text-primary);
    }
    .category-title {
        margin-top: 1rem;
        margin-bottom: 0.5rem;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-secondary);
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 0.25rem;
    }
    .category-title:first-of-type {
        margin-top: 0;
    }
    .pattern-button {
        width: 100%;
        text-align: left;
        padding: 0.75rem;
        background-color: var(--bg-tertiary);
        border-radius: 0.375rem;
        color: var(--text-secondary);
        margin-bottom: 0.25rem;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    .pattern-button:hover {
        background-color: var(--btn-default-hover-bg);
    }
    .pattern-button.active {
        background-color: var(--accent-color);
        color: var(--btn-accent-text);
        font-weight: 600;
    }
</style>
