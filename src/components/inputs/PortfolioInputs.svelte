<script lang="ts">
    import { numberInput } from '../../utils/inputUtils'; // Import the action
    import { _ } from '../../locales/i18n';

    export let accountSize: string;
    export let riskPercentage: string;
</script>

<div>
    <h2 class="section-header !mt-6">{$_('dashboard.portfolioInputs.header')}</h2>
    <div class="grid grid-cols-2 gap-4">
        <div>
            <label for="account-size" class="input-label">{$_('dashboard.portfolioInputs.accountSizeLabel')}</label>
            <input id="account-size" type="text" inputmode="decimal" use:numberInput={{}} bind:value={accountSize} class="input-field w-full px-4 py-2 rounded-md" placeholder="{$_('dashboard.portfolioInputs.accountSizePlaceholder')}">
        </div>
        <div>
            <label for="risk-percentage" class="input-label">{$_('dashboard.portfolioInputs.riskPerTradeLabel')}</label>
            <input id="risk-percentage" type="text" inputmode="decimal" use:numberInput={{ noDecimals: true, isPercentage: true, maxValue: 100, minValue: 0 }} bind:value={riskPercentage} class="input-field w-full px-4 py-2 rounded-md" placeholder="{$_('dashboard.portfolioInputs.riskPerTradePlaceholder')}">
        </div>
    </div>
</div>