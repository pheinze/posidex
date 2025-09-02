<script lang="ts">
    import { numberInput } from '../../utils/inputUtils'; // Import the action
    import { _ } from '../../locales/i18n';

    export let accountSize: string;
    export let riskPercentage: string;
</script>

<div>
    <h2 class="section-header !mt-6">{$_('dashboard.portfolioInputs.header')}</h2>
    <div class="grid grid-cols-2 gap-4">
        <div class="input-container">
            <label for="account-size" class="input-label">{$_('dashboard.portfolioInputs.accountSizeLabel')}</label>
            <input id="account-size" type="text" inputmode="decimal" use:numberInput={{ decimalPlaces: 4 }} bind:value={accountSize} class="input-field w-full px-4 py-2 rounded-md pr-10" placeholder="{$_('dashboard.portfolioInputs.accountSizePlaceholder')}">
            <div class="stepper-buttons">
                <button tabindex="-1" on:click={() => {
                    const input = document.getElementById('account-size');
                    input?.focus();
                    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
                }}>▲</button>
                <button tabindex="-1" on:click={() => {
                    const input = document.getElementById('account-size');
                    input?.focus();
                    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
                }}>▼</button>
            </div>
        </div>
        <div class="input-container">
            <label for="risk-percentage" class="input-label">{$_('dashboard.portfolioInputs.riskPerTradeLabel')}</label>
            <input id="risk-percentage" type="text" inputmode="decimal" use:numberInput={{ decimalPlaces: 2, isPercentage: true, maxValue: 100 }} bind:value={riskPercentage} class="input-field w-full px-4 py-2 rounded-md pr-10" placeholder="{$_('dashboard.portfolioInputs.riskPerTradePlaceholder')}">
            <div class="stepper-buttons">
                <button tabindex="-1" on:click={() => {
                    const input = document.getElementById('risk-percentage');
                    input?.focus();
                    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
                }}>▲</button>
                <button tabindex="-1" on:click={() => {
                    const input = document.getElementById('risk-percentage');
                    input?.focus();
                    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
                }}>▼</button>
            </div>
        </div>
    </div>
</div>