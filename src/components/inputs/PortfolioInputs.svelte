<script lang="ts">
    /**
     * @component PortfolioInputs
     *
     * This component provides the UI for portfolio-related inputs, including
     * account size, risk percentage, and the calculated/overridden risk amount.
     * It also handles the logic for locking the risk amount.
     *
     * @props {Decimal | null} accountSize - The total size of the trading account.
     * @props {Decimal | null} riskPercentage - The percentage of the account to risk per trade.
     * @props {Decimal | null} riskAmount - The calculated or user-locked risk amount in currency.
     * @props {boolean} isRiskAmountLocked - Whether the risk amount is locked by the user.
     * @props {boolean} isPositionSizeLocked - Whether the position size is locked (disables risk inputs).
     *
     * @event toggleRiskAmountLock - Dispatched when the user clicks the lock icon next to the risk amount field.
     */
    import { numberInput } from '../../utils/inputUtils';
    import { _ } from '../../locales/i18n';
    import { onboardingService } from '../../services/onboardingService';
    import { createEventDispatcher } from 'svelte';
    import { icons } from '../../lib/constants';
    import { updateTradeStore } from '../../stores/tradeStore';
    import { Decimal } from 'decimal.js';

    export let accountSize: Decimal | null;
    export let riskPercentage: Decimal | null;
    export let riskAmount: Decimal | null;
    export let isRiskAmountLocked: boolean;
    export let isPositionSizeLocked: boolean;

    const dispatch = createEventDispatcher();

    function handleLockClick() {
        dispatch('toggleRiskAmountLock');
    }

    const format = (val: Decimal | null) => (val === null || val === undefined) ? '' : String(val);

    function handleAccountSizeInput(e: Event) {
        const target = e.target as HTMLInputElement;
        const value = target.value;

        if (value.trim() === '') {
            updateTradeStore(s => ({ ...s, accountSize: null }));
            return;
        }

        try {
            const decimalValue = new Decimal(value);
            updateTradeStore(s => ({ ...s, accountSize: decimalValue }));
        } catch (error) {
            // Invalid intermediate state (e.g., '-'). Do nothing.
        }
    }

    function handleRiskPercentageInput(e: Event) {
        const target = e.target as HTMLInputElement;
        const value = target.value;

        if (value.trim() === '') {
            updateTradeStore(s => ({ ...s, riskPercentage: null }));
            return;
        }

        try {
            const decimalValue = new Decimal(value);
            updateTradeStore(s => ({ ...s, riskPercentage: decimalValue }));
        } catch (error) {
            // Invalid intermediate state (e.g., '-'). Do nothing.
        }
    }

    function handleRiskAmountInput(e: Event) {
        const target = e.target as HTMLInputElement;
        const value = target.value;

        if (value.trim() === '') {
            updateTradeStore(s => ({ ...s, riskAmount: null }));
            return;
        }

        try {
            const decimalValue = new Decimal(value);
            updateTradeStore(s => ({ ...s, riskAmount: decimalValue }));
        } catch (error) {
            // Invalid intermediate state (e.g., '-'). Do nothing.
        }
    }
</script>

<div>
    <h2 class="section-header !mt-6">{$_('dashboard.portfolioInputs.header')}</h2>
    <div class="grid grid-cols-3 gap-4">
        <div>
            <label for="account-size" class="input-label text-xs">{$_('dashboard.portfolioInputs.accountSizeLabel')}</label>
            <input
                id="account-size"
                type="text"
                use:numberInput={{ maxDecimalPlaces: 4 }}
                value={format(accountSize)}
                on:input={(e) => { handleAccountSizeInput(e); onboardingService.trackFirstInput(e); }}
                class="input-field w-full px-4 py-2 rounded-md"
                placeholder="{$_('dashboard.portfolioInputs.accountSizePlaceholder')}"
            >
        </div>
        <div>
            <label for="risk-percentage" class="input-label text-xs">{$_('dashboard.portfolioInputs.riskPerTradeLabel')}</label>
            <input
                id="risk-percentage"
                type="text"
                use:numberInput={{ noDecimals: true, isPercentage: true, maxValue: 100, minValue: 0 }}
                value={format(riskPercentage)}
                on:input={(e) => { handleRiskPercentageInput(e); onboardingService.trackFirstInput(e); }}
                class="input-field w-full px-4 py-2 rounded-md"
                placeholder="{$_('dashboard.portfolioInputs.riskPerTradePlaceholder')}"
                disabled={isRiskAmountLocked || isPositionSizeLocked}
            >
        </div>
        <div>
            <label for="risk-amount" class="input-label text-xs">{$_('dashboard.portfolioInputs.riskAmountLabel')}</label>
            <div class="relative">
                <input id="risk-amount" type="text" use:numberInput={{ maxDecimalPlaces: 2 }} value={format(riskAmount)} on:input={handleRiskAmountInput} class="input-field w-full px-4 py-2 rounded-md pr-10" placeholder="e.g. 100" disabled={isPositionSizeLocked}>
                <button class="absolute top-1/2 right-2 -translate-y-1/2 btn-lock-icon" on:click={handleLockClick} title="{$_('dashboard.portfolioInputs.toggleRiskAmountLockTitle')}" disabled={isPositionSizeLocked}>
                    {@html isRiskAmountLocked ? icons.lockClosed : icons.lockOpen}
                </button>
            </div>
        </div>
    </div>
</div>