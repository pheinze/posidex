<script lang="ts">
	import { locale, setLocale, _ } from '../../locales/i18n';

	async function switchLanguage(lang: 'de' | 'en') {
		// Update client-side locale immediately for responsiveness
		setLocale(lang);

		// Call the server endpoint to set the cookie
		await fetch('/api/lang', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ lang })
		});

		// Reload the page to get the new server-rendered content
		window.location.reload();
	}
</script>

<div class="flex items-center justify-center gap-2">
	<button
		class="w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-200"
		class:border-2={$locale === 'de'}
		class:border-[var(--accent-color)]={$locale === 'de'}
		class:border-transparent={$locale !== 'de'}
		class:opacity-50={$locale !== 'de'}
		class:hover:opacity-100={$locale !== 'de'}
		on:click={() => switchLanguage('de')}
		title={$_('languages.german')}
	>
		🇩🇪
	</button>
	<button
		class="w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-200"
		class:border-2={$locale === 'en'}
		class:border-[var(--accent-color)]={$locale === 'en'}
		class:border-transparent={$locale !== 'en'}
		class:opacity-50={$locale !== 'en'}
		class:hover:opacity-100={$locale !== 'en'}
		on:click={() => switchLanguage('en')}
		title={$_('languages.english')}
	>
		🇬🇧
	</button>
</div>

<style>
    button {
        border-style: solid;
    }
</style>