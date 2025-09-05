<script lang="ts">
    import { CONSTANTS, icons } from '../../lib/constants';
    import { debounce } from '../../utils/utils';
    import { createEventDispatcher } from 'svelte';
    import { numberInput } from '../../utils/inputUtils'; // Import the action
    import { _ } from '../../locales/i18n';
    import { trackCustomEvent } from '../../services/trackingService';
    import { onboardingService } from '../../services/onboardingService';

    const dispatch = createEventDispatcher();

    export let symbol: string;
    export let entryPrice: string;
    export let useAtrSl: boolean;
    export let atrValue: string;
    export let atrMultiplier: string;
    export let stopLossPrice: string;


    export let atrFormulaDisplay: string;
    export let showAtrFormulaDisplay: boolean;
    export let isPriceFetching: boolean;
    export let symbolSuggestions: string[];
    export let showSymbolSuggestions: boolean;

    function toggleAtrSl() {
        trackCustomEvent('ATR', 'Toggle', useAtrSl ? 'On' : 'Off');
        dispatch('toggleAtrInputs', useAtrSl);
    }

    function handleFetchPriceClick() {
        trackCustomEvent('Price', 'Fetch', symbol);
        dispatch('fetchPrice');
    }

    import { app } from '../../services/app';

    const handleSymbolInput = debounce(() => {
        app.updateSymbolSuggestions(symbol);
    }, 200);

    function selectSuggestion(s: string) {
        trackCustomEvent('Symbol', 'SelectSuggestion', s);
        dispatch('selectSymbolSuggestion', s);
    }

    function handleKeyDownSuggestion(event: KeyboardEvent, s: string) {
        if (event.key === 'Enter') {
            selectSuggestion(s);
        }
    }

    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest('.symbol-input-container')) {
            app.updateSymbolSuggestions(''); // Clear suggestions
        }
    }
</script>

<svelte:window on:click={handleClickOutside} />

<div>
    <h2 class="section-header">{$_('dashboard.tradeSetupInputs.header')}</h2>
    <div class="relative mb-4 symbol-input-container">
        <input
            id="symbol-input"
            type="text"
            bind:value={symbol}
            on:input={() => { handleSymbolInput(); onboardingService.trackFirstInput(); }}
            class="input-field w-full px-4 py-2 rounded-md pr-10"
            placeholder="{$_('dashboard.tradeSetupInputs.symbolPlaceholder')}"
            autocomplete="off"
        >
        <button
            type="button"
            class="price-fetch-btn absolute top-1/2 right-2 -translate-y-1/2 {isPriceFetching ? 'animate-spin' : ''}"
            title="{$_('dashboard.tradeSetupInputs.fetchPriceTitle')}"
            aria-label="{$_('dashboard.tradeSetupInputs.fetchPriceAriaLabel')}"
            on:click={handleFetchPriceClick}
        >
            {@html icons.fetch}
        </button>
        {#if showSymbolSuggestions}
            <div class="absolute top-full left-0 w-full rounded-md shadow-lg mt-1 overflow-hidden border border-[var(--border-color)] z-20 bg-[var(--bg-secondary)]">
                {#each symbolSuggestions as s}
                    <div
                        class="suggestion-item p-2 cursor-pointer hover:bg-[var(--accent-color)] hover:text-white"
                        on:click={() => selectSuggestion(s)}
                        on:keydown={(e) => handleKeyDownSuggestion(e, s)}
                        role="button"
                        tabindex="0"
                    >
                        {s}
                    </div>
                {/each}
            </div>
        {/if}
    </div>
    <input id="entry-price-input" type="text" inputmode="decimal" use:numberInput={{ maxDecimalPlaces: 4 }} bind:value={entryPrice} class="input-field w-full px-4 py-2 rounded-md mb-4" placeholder="{$_('dashboard.tradeSetupInputs.entryPricePlaceholder')}" on:input={onboardingService.trackFirstInput}>

    <div class="p-2 rounded-lg mb-4" style="background-color: var(--bg-tertiary);">
        <div class="flex justify-end mb-2">
            <label class="flex items-center cursor-pointer">
                <span class="mr-2 text-sm">{$_('dashboard.tradeSetupInputs.atrStopLossLabel')}</span>
                <input id="use-atr-sl-checkbox" type="checkbox" bind:checked={useAtrSl} on:change={toggleAtrSl} class="sr-only peer" role="switch" aria-checked={useAtrSl}>
                <div class="atr-toggle-track relative w-11 h-6 peer-focus:outline-none rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:border after:rounded-full after:h-5 after:w-5"></div>
            </label>
        </div>
        {#if !useAtrSl}
            <div>
                <input id="stop-loss-price-input" type="text" inputmode="decimal" use:numberInput={{ maxDecimalPlaces: 4 }} bind:value={stopLossPrice} class="input-field w-full px-4 py-2 rounded-md" placeholder="{$_('dashboard.tradeSetupInputs.manualStopLossPlaceholder')}">
            </div>
        {:else}
            <div class="grid grid-cols-2 gap-2">
                <input id="atr-value-input" type="text" inputmode="decimal" use:numberInput={{ maxDecimalPlaces: 4 }} bind:value={atrValue} class="input-field w-full px-4 py-2 rounded-md" placeholder="{$_('dashboard.tradeSetupInputs.atrValuePlaceholder')}">
                <input id="atr-multiplier-input" type="text" inputmode="decimal" use:numberInput={{ maxDecimalPlaces: 4 }} bind:value={atrMultiplier} class="input-field w-full px-4 py-2 rounded-md" placeholder="{$_('dashboard.tradeSetupInputs.multiplierPlaceholder')}">
            </div>
            {#if showAtrFormulaDisplay}
                <div class="text-center text-xs text-sky-300 mt-2">{atrFormulaDisplay}</div>
            {/if}
        {/if}
    </div>
</div>