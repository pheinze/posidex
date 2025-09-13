<script lang="ts">
	// Base imports from original layout
	import favicon from '../assets/favicon.svg';
	import { tradeStore } from '../stores/tradeStore';
	import { uiStore } from '../stores/uiStore';
	import { onMount } from 'svelte';
	import '../app.css';
	import { CONSTANTS } from '../lib/constants';

	// Imports for modals (moved from +page.svelte)
	import JournalView from '../components/shared/JournalView.svelte';
	import CustomModal from '../components/shared/CustomModal.svelte';
	import SettingsModal from '../components/settings/SettingsModal.svelte';
	import ModalFrame from '../components/shared/ModalFrame.svelte';
	import { _, locale } from '../locales/i18n';
	import { loadInstruction } from '../services/markdownLoader';

	let { children, data } = $props();

	// Logic for modals (moved from +page.svelte)
	let changelogContent = $state('');
    let guideContent = $state('');

	$effect(() => {
        if ($uiStore.showChangelogModal && changelogContent === '') {
			loadInstruction('changelog').then(content => {
				changelogContent = content.html;
			});
		}
		if ($uiStore.showGuideModal && guideContent === '') {
			loadInstruction('guide').then(content => {
				guideContent = content.html;
			});
		}
    });

	// Reset content when locale changes to force refetch
    $effect(() => {
		void $locale; // Establish dependency on locale store
        guideContent = '';
        changelogContent = '';
    });

	// Original onMount logic from layout
	onMount(() => {
		tradeStore.set(data.initialTradeState);
		const storedTheme = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_THEME_KEY);
		const themeToSet = storedTheme || data.theme;
		uiStore.setTheme(themeToSet);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="px-4">
	{@render children?.()}
</div>

<!-- Global Modals -->
<JournalView />
<CustomModal />
<SettingsModal />

<ModalFrame
    isOpen={$uiStore.showChangelogModal}
    title={$_('app.changelogTitle')}
    on:close={() => uiStore.toggleChangelogModal(false)}
    extraClasses="modal-size-instructions"
>
    <div id="changelog-content" class="prose dark:prose-invert">
        {@html changelogContent}
    </div>
</ModalFrame>

<ModalFrame
    isOpen={$uiStore.showGuideModal}
    title={$_('app.guideTitle')}
    on:close={() => uiStore.toggleGuideModal(false)}
    extraClasses="modal-size-instructions"
>
    <div id="guide-content" class="prose dark:prose-invert">
        {@html guideContent}
    </div>
</ModalFrame>
