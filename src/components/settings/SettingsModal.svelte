<script lang="ts">
  import ModalFrame from '../shared/ModalFrame.svelte';
  import { _ } from 'svelte-i18n';
  import { uiStore } from '../../stores/uiStore';
  import { themes, themeIcons } from '../../lib/constants';

  function handleClose() {
    uiStore.toggleSettingsModal(false);
  }
</script>

<ModalFrame
  isOpen={$uiStore.showSettingsModal}
  title={$_('settings.title')}
  on:close={handleClose}
  extraClasses="modal-size-sm"
>
  <div class="space-y-6">
    <!-- Theme Selector -->
    <div>
      <label for="theme-select" class="block text-sm font-medium text-text-primary mb-2">{$_('settings.theme')}</label>
      <div class="flex items-center gap-2">
        <span class="text-xl">{@html themeIcons[$uiStore.currentTheme as keyof typeof themeIcons]}</span>
        <select
          id="theme-select"
          class="input-field w-full"
          bind:value={$uiStore.currentTheme}
          on:change={(e) => uiStore.setTheme(e.currentTarget.value)}
        >
          {#each themes as theme}
            <option value={theme}>{theme.charAt(0).toUpperCase() + theme.slice(1).replace('-', ' ')}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>
</ModalFrame>
