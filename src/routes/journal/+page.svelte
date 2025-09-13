<script lang="ts">
    import JournalContent from '../../components/shared/JournalContent.svelte';
    import { _ } from '../../locales/i18n';
</script>

<div class="p-4 sm:p-8 max-w-7xl mx-auto">
    <header class="mb-6 flex justify-between items-center">
        <h1 class="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">{$_('journal.title')}</h1>
        <a href="/" class="text-sm bg-[var(--btn-accent-bg)] hover:bg-[var(--btn-accent-hover-bg)] text-[var(--btn-accent-text)] font-bold py-2 px-4 rounded-lg no-underline">
            &larr; {$_('app.title')}
        </a>
    </header>
    <main>
        <JournalContent />
    </main>
</div>
