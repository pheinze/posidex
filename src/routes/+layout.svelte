<script lang="ts">
	import favicon from '../assets/favicon.svg';
	import { tradeStore, updateTradeStore } from '../stores/tradeStore';
	import { uiStore } from '../stores/uiStore';
	import { onMount } from 'svelte';

	let { children, data } = $props();

	import '../app.css';

	onMount(() => {
		tradeStore.set(data.initialAppState);
		uiStore.setTheme(data.theme);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="px-4">
	{@render children?.()}
</div>
