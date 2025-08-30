<script lang="ts">
    import { locale, setLocale } from '$lib/i18n';

    function handleLanguageChange(event: Event) {
        const newLocale = (event.target as HTMLSelectElement).value;
        setLocale(newLocale);
    }
</script>

<select class="input-field px-3 py-2 rounded-md text-sm" on:change={handleLanguageChange} bind:value={$locale}>
    <option value="en">English</option>
    <option value="de">Deutsch</option>
</select>

<style>
    /* Add any specific styling for the language switcher here if needed */
</style>