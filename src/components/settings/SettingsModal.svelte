<script lang="ts">
  import ModalFrame from '../shared/ModalFrame.svelte';
  import { modalManager } from '../../services/modalManager';
  import { _ } from 'svelte-i18n';

  let isOpen = false;
  modalManager.subscribe(state => {
    isOpen = state.currentModal === 'settings' && state.isOpen;
  });

  function handleClose() {
    modalManager.close();
  }
</script>

<ModalFrame
  isOpen={isOpen}
  title={$_('settings.title')}
  on:close={handleClose}
  extraClasses="modal-size-sm"
>
  <div class="space-y-4">
    <!-- Settings sections will go here -->
  </div>
</ModalFrame>
