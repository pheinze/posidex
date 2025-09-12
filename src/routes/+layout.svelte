<script lang="ts">
	import favicon from '../assets/favicon.svg';
	import { tradeStore, type initialTradeState } from '../stores/tradeStore';
	import { uiStore } from '../stores/uiStore';
	import { onMount } from 'svelte';
	import superjson from '$lib/superjson';
	import Modal from '../components/shared/Modal.svelte';

	let { children, data } = $props();

	import '../app.css';

	import { CONSTANTS } from '../lib/constants';

	onMount(() => {
		const deserializedState = superjson.deserialize<typeof initialTradeState>(data.serializedInitialTradeState);
		tradeStore.set(deserializedState);

		// The server provides a theme from the cookie.
		// On the client, we prioritize localStorage as it might be more up-to-date
		// if the cookie failed to set for any reason.
		const storedTheme = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_THEME_KEY);
		const themeToSet = storedTheme || data.theme; // Use localStorage theme, fallback to cookie theme
		uiStore.setTheme(themeToSet);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="px-4">
	{@render children?.()}
</div>

<Modal />
