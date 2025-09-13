<script lang="ts">
    import type { ChartPattern } from "../../lib/data/patterns";

    export let pattern: ChartPattern | null = null;
</script>

<div class="description-box">
    {#if pattern}
        <div class="pattern-title-wrapper">
            <h3 class="pattern-title">{pattern.name}</h3>
            <!-- Favorite button can be added here later -->
        </div>
        <p>{@html pattern.description}</p>

        <h4>Charakteristika:</h4>
        <ul>
            {#each pattern.characteristics as item}
                <li>{item}</li>
            {/each}
        </ul>

        <h4>Trading-Implikationen:</h4>
        <p>{@html pattern.trading}</p>

        <h4>Detailliertere Informationen:</h4>
        <p>{@html pattern.advancedConsiderations}</p>

        <h4>Performance-Hinweise (Illustrativ):</h4>
        <p>{@html pattern.performanceStats}</p>
        <p class="disclaimer"><strong>Disclaimer:</strong> Diese Hinweise sind rein illustrativ und basieren auf allgemeinen Beobachtungen. Sie stellen keine Anlageberatung dar und garantieren keine zukünftigen Ergebnisse. Die tatsächliche Performance kann stark variieren.</p>
    {:else}
        <h3 class="pattern-title">Wählen Sie ein Muster</h3>
        <p>Die Beschreibung des ausgewählten Chartmusters wird hier angezeigt.</p>
    {/if}
</div>

<style>
    .description-box {
        background-color: var(--bg-secondary);
        border-radius: 0.5rem;
        padding: 1.5rem;
        color: var(--text-primary);
        width: 100%;
        overflow-y: auto;
    }
    .pattern-title-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
    }
    .pattern-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--accent-color);
    }
    .description-box p, .description-box ul {
        margin-bottom: 1rem;
        overflow-wrap: break-word;
        word-break: break-word;
        font-size: 0.875rem;
        line-height: 1.6;
        color: var(--text-secondary);
    }
    .description-box h4 {
        font-weight: 600;
        font-size: 1.125rem;
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
        color: var(--text-primary);
    }
    .description-box ul {
        list-style-type: disc;
        list-style-position: inside;
        padding-left: 0.5rem;
    }
    .description-box ul > *:not(:last-child) {
        margin-bottom: 0.25rem;
    }
    .disclaimer {
        font-size: 0.75rem;
        color: var(--text-secondary);
        margin-top: 1rem;
        border-top: 1px solid var(--border-color);
        padding-top: 1rem;
        opacity: 0.8;
    }
</style>
