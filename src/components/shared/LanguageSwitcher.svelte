<script lang="ts">
	import { page } from '$app/stores';
	import { _ } from '../../locales/i18n';

	$: locale = $page.data.lang || 'en';
</script>

<div class="flex items-center justify-center gap-2">
	<a
		href="?lang=de"
		class="w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-200"
		class:border-2={locale === 'de'}
		class:border-[var(--accent-color)]={locale === 'de'}
		class:border-transparent={locale !== 'de'}
		class:opacity-50={locale !== 'de'}
		class:hover:opacity-100={locale !== 'de'}
		title={$_('languages.german')}
	>
		🇩🇪
	</a>
	<a
		href="?lang=en"
		class="w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-200"
		class:border-2={locale === 'en'}
		class:border-[var(--accent-color)]={locale === 'en'}
		class:border-transparent={locale !== 'en'}
		class:opacity-50={locale !== 'en'}
		class:hover:opacity-100={locale !== 'en'}
		title={$_('languages.english')}
	>
		🇬🇧
	</a>
</div>

<style>
	a {
		border-style: solid;
	}
</style>