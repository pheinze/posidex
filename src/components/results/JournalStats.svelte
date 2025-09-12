<script lang="ts">
    /**
     * @component JournalStats
     *
     * This component displays a grid of key performance indicators (KPIs)
     * derived from the user's trading journal data.
     *
     * It takes the full journal data as a prop and uses the `calculator` service
     * to compute the performance statistics, which are then displayed.
     * It shows a loading state while the calculation is in progress.
     *
     * @props {JournalEntry[]} journalData - An array of all journal entries.
     */
    import { calculator } from '../../lib/calculator';
    import type { JournalEntry } from '../../stores/types';
    import { _ } from '../../locales/i18n';
    import { formatDynamicDecimal } from '../../utils/utils';
    import Tooltip from '../shared/Tooltip.svelte';
    import Decimal from 'decimal.js';
    import { tick } from 'svelte';

    export let journalData: JournalEntry[];

    let stats: ReturnType<typeof calculator.calculatePerformanceStats> | null = null;
    let isLoading = true;

    $: {
        // Use a self-invoking async function inside the reactive block
        // to handle the calculation and loading state.
        (async () => {
            isLoading = true;
            await tick(); // Allow UI to update to show loading state
            stats = calculator.calculatePerformanceStats(journalData);
            isLoading = false;
        })();
    }

    function formatStat(value: Decimal | number | null | undefined, dp: number = 2, prefix: string = '', suffix: string = ''): string {
        if (value === null || value === undefined) return 'N/A';
        const decimalValue = value instanceof Decimal ? value : new Decimal(value);
        if (decimalValue.isFinite()) {
            return `${prefix}${formatDynamicDecimal(decimalValue, dp)}${suffix}`;
        }
        return 'N/A';
    }
</script>

{#if isLoading}
    <div class="text-center text-slate-500 py-4">Loading stats...</div>
{:else if stats}
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
        <div class="stat-item">
            <div class="stat-label">{$_('journal.stats.winrate')}</div>
            <div class="stat-value">{formatStat(stats.winRate, 2, '', '%')}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">{$_('journal.stats.profitFactor')} <Tooltip text={$_('journal.stats.profitFactorTooltip')} /></div>
            <div class="stat-value">{formatStat(stats.profitFactor)}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">{$_('journal.stats.expectancy')} <Tooltip text={$_('journal.stats.expectancyTooltip')} /></div>
            <div class="stat-value" class:positive={stats.expectancy.gt(0)} class:negative={stats.expectancy.lt(0)}>
                {formatStat(stats.expectancy, 2, '$')}
            </div>
        </div>
        <div class="stat-item">
            <div class="stat-label">{$_('journal.stats.avgRMultiple')} <Tooltip text={$_('journal.stats.avgRMultipleTooltip')} /></div>
            <div class="stat-value" class:positive={stats.avgRMultiple.gt(0)} class:negative={stats.avgRMultiple.lt(0)}>
                {formatStat(stats.avgRMultiple, 2, '', 'R')}
            </div>
        </div>
        <div class="stat-item">
            <div class="stat-label">{$_('journal.stats.avgWinLossRatio')} <Tooltip text={$_('journal.stats.avgWinLossRatioTooltip')} /></div>
            <div class="stat-value" class:positive={stats.winLossRatio && stats.winLossRatio.gte(1)} class:negative={stats.winLossRatio && stats.winLossRatio.lt(1)}>
                {formatStat(stats.winLossRatio, 2)}
            </div>
        </div>
        <div class="stat-item">
            <div class="stat-label">{$_('journal.stats.currentStreak')}</div>
            <div class="stat-value">{stats.currentStreakText}</div>
        </div>
    </div>
{:else}
    <div class="text-center text-slate-500 py-4">{$_('journal.noDataForStats')}</div>
{/if}

<style>
    .stat-item {
        @apply bg-[var(--bg-secondary)] p-3 rounded-lg shadow;
    }
    .stat-label {
        @apply text-xs text-[var(--text-secondary)] uppercase font-bold flex items-center justify-center gap-1;
    }
    .stat-value {
        @apply text-lg sm:text-xl font-semibold text-[var(--text-primary)] mt-1;
    }
    .positive {
        @apply text-[var(--success-color)];
    }
    .negative {
        @apply text-[var(--danger-color)];
    }
</style>
