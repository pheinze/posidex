<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { candlestickPatterns, type CandlestickPattern } from '../../lib/data/candlesticks';

    export let selectedPatternId: string | null = null;

    const dispatch = createEventDispatcher<{ select: string }>();

    const categorizedPatterns: Record<string, CandlestickPattern[]> = {};
    candlestickPatterns.forEach(pattern => {
        if (!categorizedPatterns[pattern.type]) {
            categorizedPatterns[pattern.type] = [];
        }
        categorizedPatterns[pattern.type].push(pattern);
    });

    const categoryOrder = [
        'Bullish Reversal', 'Bullish Continuation', 'Bullish Strength/Continuation',
        'Bearish Reversal', 'Bearish Continuation', 'Bearish Strength/Continuation',
        'Indecision', 'Reversal Signals by Wicks', 'Other'
    ];

    function selectPattern(id: string) {
        dispatch('select', id);
    }
</script>

<aside class="sidebar">
    <h2 class="sidebar-title">Select Pattern:</h2>
    <div class="pattern-list-container custom-scrollbar">
        {#each categoryOrder as categoryName}
            {@const patternsInCategory = categorizedPatterns[categoryName]}
            {#if patternsInCategory && patternsInCategory.length > 0}
                <h3 class="pattern-category-header">{categoryName}</h3>
                {#each patternsInCategory as pattern}
                    <button
                        class="pattern-select-button"
                        class:active={selectedPatternId === pattern.id}
                        on:click={() => selectPattern(pattern.id)}
                    >
                        <span>{pattern.name}</span>
                    </button>
                {/each}
            {/if}
        {/each}
    </div>
</aside>

<style>
	.sidebar {
		background-color: var(--bg-secondary);
        border-radius: 0.5rem;
        padding: 1rem;
	}
    .sidebar-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: var(--accent-color);
        border-bottom: 1px solid var(--color-border-subtle);
        padding-bottom: 0.5rem;
    }
    .pattern-list-container {
        max-height: 60vh;
        overflow-y: auto;
        padding-right: 0.5rem;
    }
    .pattern-list-container > *:not(:last-child) {
        margin-bottom: 0.25rem;
    }
    .pattern-category-header {
        font-size: 0.9375rem;
        font-weight: 600;
        margin-top: 0.75rem;
        margin-bottom: 0.25rem;
        color: var(--accent-color);
        opacity: 0.9;
        padding-left: 0.25rem;
        padding-top: 0.25rem;
    }
    .pattern-select-button {
        width: 100%;
        text-align: left;
        padding: 0.625rem;
        border-radius: 0.375rem;
        background-color: var(--bg-tertiary);
        color: var(--text-secondary);
        font-size: 0.875rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: background-color 0.3s ease, color 0.3s ease;
        border: none;
        cursor: pointer;
    }
    .pattern-select-button:hover {
        background-color: var(--btn-default-hover-bg);
    }
    .pattern-select-button.active {
        background-color: var(--accent-color);
        color: var(--btn-accent-text);
        font-weight: 600;
    }
    .pattern-select-button:focus {
        outline: none;
        box-shadow: 0 0 0 2px var(--accent-color);
    }
    .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: var(--bg-primary);
        border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: var(--text-secondary);
        border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: var(--border-color);
    }
</style>
