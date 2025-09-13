<script lang="ts">
    import PatternSelector from '../../components/candlesticks/PatternSelector.svelte';
    import PatternDisplay from '../../components/candlesticks/PatternDisplay.svelte';
    import { candlestickPatterns, type CandlestickPattern } from '../../lib/data/candlesticks';
    import { onMount } from 'svelte';

    let selectedPatternId = $state<string | null>(null);
    let selectedPattern = $derived<CandlestickPattern | null>(
        selectedPatternId ? candlestickPatterns.find(p => p.id === selectedPatternId) ?? null : null
    );

    onMount(() => {
        // Select the first pattern by default on page load
        if (candlestickPatterns.length > 0) {
            selectedPatternId = candlestickPatterns[0].id;
        }
    });

    function handlePatternSelect(event: CustomEvent<string>) {
        selectedPatternId = event.detail;
    }
</script>

<div class="app-container">
    <header class="app-header">
        <h1 class="app-title">Candlestick Patterns</h1>
        <p class="app-subtitle">Learn and recognize important chart patterns.</p>
    </header>

    <div class="content-wrapper">
        <PatternSelector {selectedPatternId} on:select={handlePatternSelect} />
        <PatternDisplay pattern={selectedPattern} />
    </div>
</div>

<style>
    .app-container {
        width: 100%;
        max-width: 72rem;
        margin-inline: auto;
        padding: 1.5rem;
    }

    .app-header {
        margin-bottom: 1.5rem;
        text-align: center;
    }
    .app-title {
        font-size: 1.875rem;
        line-height: 2.25rem;
        font-weight: 700;
        color: var(--color-accent-green);
    }
    .app-subtitle {
        color: var(--color-text-muted);
        margin-top: 0.5rem;
        font-size: 0.875rem;
        line-height: 1.25rem;
    }

    .content-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    @media (min-width: 1024px) {
        .content-wrapper {
            flex-direction: row;
            gap: 2rem;
        }
    }
</style>
