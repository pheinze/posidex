<script lang="ts">
    import PatternSelector from '../../components/patterns/PatternSelector.svelte';
    import PatternDisplay from '../../components/patterns/PatternDisplay.svelte';
    import PatternCanvas from '../../components/patterns/PatternCanvas.svelte';
    import IndicatorControls from '../../components/patterns/IndicatorControls.svelte';
    import { chartPatterns, type ChartPattern } from '../../lib/data/patterns';
    import { onMount } from 'svelte';

    let selectedPatternId = $state<string | null>(null);
    let showMA = $state(false);
    let showRSI = $state(false);

    let selectedPattern = $derived<ChartPattern | null>(
        selectedPatternId ? chartPatterns.find(p => p.id === selectedPatternId) ?? null : null
    );

    onMount(() => {
        if (chartPatterns.length > 0) {
            selectedPatternId = chartPatterns[0].id;
        }
    });

    function handlePatternSelect(event: CustomEvent<string>) {
        selectedPatternId = event.detail;
    }
</script>

<div class="main-container">
    <header class="header">
        <h1 class="header-title">Interaktiver Chartmuster Visualisierer</h1>
        <p class="header-subtitle">Wählen Sie ein Muster und optionale Indikatoren aus.</p>
    </header>

    <div class="content-grid">
        <div class="pattern-select-container">
            <PatternSelector {selectedPatternId} on:select={handlePatternSelect} />
            <IndicatorControls bind:showMA bind:showRSI />
        </div>

        <div class="chart-description-area">
            <PatternCanvas pattern={selectedPattern} {showMA} {showRSI} />
            <PatternDisplay pattern={selectedPattern} />
        </div>
    </div>
</div>

<style>
    .main-container {
        width: 100%;
        max-width: 1280px;
        margin-left: auto;
        margin-right: auto;
        padding: 1rem;
    }
    .header {
        margin-bottom: 1.5rem;
        text-align: center;
    }
    .header-title {
        font-size: 1.875rem;
        font-weight: 700;
        color: var(--accent-color);
    }
    .header-subtitle {
        color: var(--text-secondary);
        margin-top: 0.5rem;
        font-size: 0.875rem;
    }
    .content-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
    .pattern-select-container {
        background-color: var(--bg-tertiary);
        padding: 1rem;
        border-radius: 0.5rem;
    }
    .chart-description-area {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        min-width: 0;
    }
    @media (min-width: 1024px) {
        .content-grid {
            grid-template-columns: 1fr 2fr;
        }
    }
</style>
