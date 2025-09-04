<script lang="ts">
	import favicon from '../assets/favicon.svg';
	import { tradeStore, updateTradeStore } from '../stores/tradeStore';
	import { uiStore } from '../stores/uiStore';
	import { onMount } from 'svelte';

	let { children, data } = $props();

	import '../app.css';

	import { CONSTANTS } from '../lib/constants';

	onMount(() => {
		tradeStore.set(data.initialTradeState);

		// The server provides a theme from the cookie.
		// On the client, we prioritize localStorage as it might be more up-to-date
		// if the cookie failed to set for any reason.
		const storedTheme = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_THEME_KEY);
		const themeToSet = storedTheme || data.theme; // Use localStorage theme, fallback to cookie theme
		uiStore.setTheme(themeToSet);
	});
</script>

<svelte:head>
	<title>{data.seo.title}</title>
	<meta name="description" content={data.seo.description} />
	<meta name="keywords" content={data.seo.keywords} />
	<link rel="icon" href={favicon} />
	<link rel="canonical" href="https://www.cachy.app/" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://www.cachy.app/" />
	<meta property="og:title" content={data.seo.title} />
	<meta property="og:description" content={data.seo.description} />
	<!-- <meta property="og:image" content="https://www.cachy.app/og-image.jpg" /> -->

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content="https://www.cachy.app/" />
	<meta property="twitter:title" content={data.seo.title} />
	<meta property="twitter:description" content={data.seo.description} />
	<!-- <meta property="twitter:image" content="https://www.cachy.app/twitter-image.jpg" /> -->
</svelte:head>

<div class="px-4">
	{@render children?.()}
</div>
