<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { appStore, updateStore } from '$lib/stores'; // Import appStore and updateStore
	import { onMount } from 'svelte'; // Import onMount

	let { children, data } = $props(); // Destructure data prop

	import '../app.css'; // Importiere die globale CSS-Datei

	// The theme class is now applied server-side by src/hooks.server.ts
	// No need for client-side manipulation here.

	onMount(() => {
        appStore.set(data.initialAppState); // Set initial state from server
		// Update the appStore's currentTheme with the server-rendered theme
		// This ensures the client-side store (and thus the theme switcher icon)
		// reflects the correct theme on initial load.
		updateStore(s => ({ ...s, currentTheme: data.theme }));
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
