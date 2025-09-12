<script lang="ts">
    import { themes, themeIcons, icons } from '../../lib/constants';
    import { app } from '../../services/app';
    import { resetAllInputs } from '../../stores/tradeStore';
    import { presetStore } from '../../stores/presetStore';
    import { uiStore } from '../../stores/uiStore';
    import { _ } from '../../locales/i18n';
    import { trackClick } from '../../lib/actions';
    import CachyIcon from '../shared/CachyIcon.svelte';

    function handleThemeSwitch() {
        const currentIndex = themes.indexOf($uiStore.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        uiStore.setTheme(themes[nextIndex]);
    }

    // Diese reaktive Variable formatiert den Theme-Namen benutzerfreundlich.
    // z.B. 'solarized-light' wird zu 'Solarized Light'
    $: themeTitle = $uiStore.currentTheme
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    function handlePresetLoad(event: Event) {
        const selectedPreset = (event.target as HTMLSelectElement).value;
        app.loadPreset(selectedPreset);
    }
</script>

<header class="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
    <div class="flex justify-between items-center w-full md:w-auto">
        <div class="flex items-center gap-3 text-[var(--text-primary)]">
            <CachyIcon class="h-8 w-8" />
            <h1 class="text-2xl sm:text-3xl font-bold">{$_('app.title')}</h1>
        </div>
        <button id="view-journal-btn-mobile" class="text-sm md:hidden bg-[var(--btn-accent-bg)] hover:bg-[var(--btn-accent-hover-bg)] text-[var(--btn-accent-text)] font-bold py-2 px-4 rounded-lg" title="{$_('app.journalButtonTitle')}" on:click={() => uiStore.toggleJournalModal(true)} use:trackClick={{ category: 'Navigation', action: 'Click', name: 'ViewJournalMobile' }}>{$_('app.journalButton')}</button>
    </div>
    <div class="flex items-center flex-wrap justify-end gap-2 w-full md:w-auto">
        <div class="flex items-center flex-wrap justify-end gap-2 md:order-1">
            <select id="preset-loader" class="input-field px-3 py-2 rounded-md text-sm" on:change={handlePresetLoad} bind:value={$presetStore.selectedPreset}>
                <option value="">{$_('dashboard.presetLoad')}</option>
                {#each $presetStore.availablePresets as presetName}
                    <option value={presetName}>{presetName}</option>
                {/each}
            </select>
            <button id="save-preset-btn" class="text-sm bg-[var(--btn-default-bg)] hover:bg-[var(--btn-default-hover-bg)] text-[var(--btn-default-text)] font-bold py-2.5 px-2.5 rounded-lg" title="{$_('dashboard.savePresetTitle')}" aria-label="{$_('dashboard.savePresetAriaLabel')}" on:click={app.savePreset} use:trackClick={{ category: 'Presets', action: 'Click', name: 'SavePreset' }}>{@html icons.save}</button>
            <button id="delete-preset-btn" class="text-sm bg-[var(--btn-danger-bg)] hover:bg-[var(--btn-danger-hover-bg)] text-[var(--btn-danger-text)] font-bold py-2.5 px-2.5 rounded-lg disabled:cursor-not-allowed" title="{$_('dashboard.deletePresetTitle')}" disabled={!$presetStore.selectedPreset} on:click={app.deletePreset} use:trackClick={{ category: 'Presets', action: 'Click', name: 'DeletePreset' }}>{@html icons.delete}</button>
            <button id="reset-btn" class="text-sm bg-[var(--btn-default-bg)] hover:bg-[var(--btn-default-hover-bg)] text-[var(--btn-default-text)] font-bold py-2.5 px-2.5 rounded-lg flex items-center gap-2" title="{$_('dashboard.resetButtonTitle')}" on:click={resetAllInputs} use:trackClick={{ category: 'Actions', action: 'Click', name: 'ResetAll' }}>{@html icons.broom}</button>
            <button
                id="theme-switcher"
                class="text-sm bg-[var(--btn-default-bg)] hover:bg-[var(--btn-default-hover-bg)] text-[var(--btn-default-text)] font-bold py-2 px-2.5 rounded-lg"
                aria-label="{$_('dashboard.themeSwitcherAriaLabel')}"
                on:click={handleThemeSwitch}
                title={themeTitle}
                use:trackClick={{ category: 'Settings', action: 'Click', name: 'SwitchTheme' }}
            >{@html themeIcons[$uiStore.currentTheme as keyof typeof themeIcons]}</button>
        </div>
        <button id="view-journal-btn-desktop" class="hidden md:inline-block text-sm bg-[var(--btn-accent-bg)] hover:bg-[var(--btn-accent-hover-bg)] text-[var(--btn-accent-text)] font-bold py-2 px-4 rounded-lg md:order-2" title="{$_('app.journalButtonTitle')}" on:click={() => uiStore.toggleJournalModal(true)} use:trackClick={{ category: 'Navigation', action: 'Click', name: 'ViewJournalDesktop' }}>{$_('app.journalButton')}</button>
    </div>
</header>
