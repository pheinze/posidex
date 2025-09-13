<script lang="ts">
  import { uiStore } from '../../stores/uiStore';
  import Tooltip from '../shared/Tooltip.svelte';
  import { _ } from 'svelte-i18n';
</script>

<Tooltip text={$_('settings.title')}>
  <button
    class="btn-icon-accent"
    on:click={() => uiStore.toggleSettingsModal(true)}
    aria-label={$_('settings.title')}
  >
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      class="w-6 h-6"
    >
      <path d="M10.47 4.32a1.684 1.684 0 0 1 3.06 0l.218.473a1.684 1.684 0 0 0 2.112.875l.49-.18c1.348-.498 2.66.814 2.162 2.163l-.18.489a1.684 1.684 0 0 0 .875 2.112l.473.218c1.306.602 1.306 2.458 0 3.06l-.473.218a1.684 1.684 0 0 0-.875 2.112l.18.49c.498 1.348-.814 2.66-2.163 2.162l-.489-.18a1.684 1.684 0 0 0-2.112.875l-.218-.473c-.602 1.306-2.458 1.306-3.06 0l-.218-.473a1.684 1.684 0 0 0-2.112-.875l-.49.18c-1.348.498-2.66-.814-2.162-2.163l.18-.489a1.684 1.684 0 0 0-.875-2.112l-.473-.218c-1.306-.602-1.306-2.458 0-3.06l.473-.218a1.684 1.684 0 0 0 .875-2.112l-.18-.49C3.15 5.134 4.462 3.822 5.81 4.32l.489.18a1.684 1.684 0 0 0 2.112-.875l.218-.473z"/>
      <path d="M12 15a3 3 0 1 0 0-6a3 3 0 0 0 0 6z"/>
    </svg>
  </button>
</Tooltip>
