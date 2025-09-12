<script lang="ts">
    /**
     * @component GeneralInputs
     *
     * This component provides the UI for setting general trade parameters,
     * including the trade type (Long/Short), leverage, and fees.
     *
     * It is tightly coupled with the `tradeStore`, directly updating the store
     * when the user changes an input value.
     *
     * @props {string} tradeType - The current trade type ('long' or 'short').
     * @props {Decimal | null} leverage - The current leverage value.
     * @props {Decimal | null} fees - The current trading fees percentage.
     */
    import { CONSTANTS } from '../../lib/constants';
    import { updateTradeStore } from '../../stores/tradeStore';
    import { numberInput } from '../../utils/inputUtils';
    import { _ } from '../../locales/i18n';
    import { trackClick } from '../../lib/actions';
    import { Decimal } from 'decimal.js';

    export let tradeType: string;
    export let leverage: Decimal | null;
    export let fees: Decimal | null;

    function setTradeType(type: string) {
        updateTradeStore(s => ({ ...s, tradeType: type }));
    }

    const format = (val: Decimal | null) => (val === null || val === undefined) ? '' : String(val);

    function handleLeverageInput(e: Event) {
        const target = e.target as HTMLInputElement;
        const value = target.value;
        updateTradeStore(s => ({ ...s, leverage: value === '' ? null : new Decimal(value) }));
    }

    function handleFeesInput(e: Event) {
        const target = e.target as HTMLInputElement;
        const value = target.value;
        updateTradeStore(s => ({ ...s, fees: value === '' ? null : new Decimal(value) }));
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
                use:trackClick={{ category: 'GeneralInputs', action: 'SetTradeType', name: 'Long' }}
            >{$_('dashboard.generalInputs.longButton')}</button>
            <button
                class="short w-1/2"
                class:active={tradeType === CONSTANTS.TRADE_TYPE_SHORT}
                role="radio"
                aria-checked={tradeType === CONSTANTS.TRADE_TYPE_SHORT}
                on:click={() => setTradeType(CONSTANTS.TRADE_TYPE_SHORT)}
                use:trackClick={{ category: 'GeneralInputs', action: 'SetTradeType', name: 'Short' }}
            >{$_('dashboard.generalInputs.shortButton')}</button>
        </div>
        <div class="grid grid-cols-2 gap-4">
            <input
                id="leverage-input"
                type="text"
                use:numberInput={{ noDecimals: true, maxValue: 125, minValue: 1 }}
                value={format(leverage)}
                on:input={handleLeverageInput}
                class="input-field w-full h-full px-4 py-2 rounded-md"
                placeholder="{$_('dashboard.generalInputs.leveragePlaceholder')}"
            >
            <input
                id="fees-input"
                type="text"
                use:numberInput={{ maxDecimalPlaces: 4 }}
                value={format(fees)}
                on:input={handleFeesInput}
                class="input-field w-full px-4 py-2 rounded-md"
                placeholder="{$_('dashboard.generalInputs.feesPlaceholder')}"
            >
        </div>
    </div>
</div>