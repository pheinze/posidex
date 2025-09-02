<script lang="ts">
    import { CONSTANTS } from '../../lib/constants';
    import { updateTradeStore } from '../../stores/tradeStore';
    import { numberInput } from '../../utils/inputUtils'; // Import the action
    import { _ } from '../../locales/i18n';

    export let tradeType: string;
    export let leverage: string;
    export let fees: string;

    function setTradeType(type: string) {
        updateTradeStore(s => ({ ...s, tradeType: type }));
    }
</script>

<div>
    <h2 class="section-header" id="trade-type-label">{$_('dashboard.generalInputs.header')}</h2>
    <div class="grid grid-cols-1 gap-4 mb-4">
        <div class="trade-type-switch p-1 rounded-lg flex" role="radiogroup" aria-labelledby="trade-type-label">
            <button
                class="long w-1/2"
                class:active={tradeType === CONSTANTS.TRADE_TYPE_LONG}
                role="radio"
                aria-checked={tradeType === CONSTANTS.TRADE_TYPE_LONG}
                on:click={() => setTradeType(CONSTANTS.TRADE_TYPE_LONG)}
            >{$_('dashboard.generalInputs.longButton')}</button>
            <button
                class="short w-1/2"
                class:active={tradeType === CONSTANTS.TRADE_TYPE_SHORT}
                role="radio"
                aria-checked={tradeType === CONSTANTS.TRADE_TYPE_SHORT}
                on:click={() => setTradeType(CONSTANTS.TRADE_TYPE_SHORT)}
            >{$_('dashboard.generalInputs.shortButton')}</button>
        </div>
        <div class="grid grid-cols-2 gap-4">
            <input type="text" inputmode="decimal" use:numberInput={{ noDecimals: true, maxValue: 125, minValue: 1 }} bind:value={leverage} class="input-field w-full h-full px-4 py-2 rounded-md" placeholder="{$_('dashboard.generalInputs.leveragePlaceholder')}">
            <input type="text" inputmode="decimal" use:numberInput={{ maxDecimalPlaces: 4 }} bind:value={fees} class="input-field w-full px-4 py-2 rounded-md" placeholder="{$_('dashboard.generalInputs.feesPlaceholder')}">
        </div>
    </div>
</div>