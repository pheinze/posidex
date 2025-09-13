<script lang="ts">
    import { page } from '$app/stores';
    import { _ } from '../../locales/i18n';
    import CachyIcon from '../shared/CachyIcon.svelte';

    const navLinks = [
        { href: '/', label: 'app.title' },
        { href: '/journal', label: 'journal.title' },
        { href: '/candlesticks', label: 'Candlesticks' },
        { href: '/patterns', label: 'Chart Patterns' },
    ];
</script>

<header class="main-header">
    <div class="logo">
        <a href="/">
            <CachyIcon class="h-8 w-8" />
            <span class="logo-text">Cachy</span>
        </a>
    </div>
    <nav>
        <ul>
            {#each navLinks as link}
                <li>
                    <a
                        href={link.href}
                        class:active={$page.url.pathname === link.href}
                    >
                        {link.label.includes('.') ? $_(link.label) : link.label}
                    </a>
                </li>
            {/each}
        </ul>
    </nav>
</header>

<style>
    .main-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        background-color: var(--bg-secondary);
        border-bottom: 1px solid var(--border-color);
    }
    .logo a {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        text-decoration: none;
        color: var(--text-primary);
    }
    .logo-text {
        font-weight: 700;
        font-size: 1.25rem;
    }
    nav ul {
        display: flex;
        gap: 1.5rem;
        list-style: none;
        margin: 0;
        padding: 0;
    }
    nav a {
        text-decoration: none;
        color: var(--text-secondary);
        font-weight: 500;
        transition: color 0.2s;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid transparent;
    }
    nav a:hover {
        color: var(--text-primary);
    }
    nav a.active {
        color: var(--accent-color);
        border-bottom-color: var(--accent-color);
    }
</style>
