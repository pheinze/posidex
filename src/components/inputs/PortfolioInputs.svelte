<script lang="ts">
    import { numberInput } from '../../utils/inputUtils'; // Import the action
    import { _ } from '../../locales/i18n';

    export let accountSize: string;
    export let riskPercentage: string;
</script>

<div>
    <h2 class="section-header !mt-6">{$_('dashboard.portfolioInputs.header')}</h2>
    <div class="grid grid-cols-2 gap-4">
        <input type="text" inputmode="decimal" use:numberInput={{ decimalPlaces: 4 }} bind:value={accountSize} class="input-field w-full px-4 py-2 rounded-md" placeholder="{$_('dashboard.portfolioInputs.accountSizePlaceholder')}">
        <input type="text" inputmode="decimal" use:numberInput={{ decimalPlaces: 2, isPercentage: true }} bind:value={riskPercentage} class="input-field w-full px-4 py-2 rounded-md" placeholder="{$_('dashboard.portfolioInputs.riskPerTradePlaceholder')}">
    </div>
</div>