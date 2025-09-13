<script lang="ts">
    import { uiStore } from '../../stores/uiStore';
    import { _ } from '../../locales/i18n';
    import ModalFrame from './ModalFrame.svelte';
    import JournalContent from './JournalContent.svelte';
</script>

<ModalFrame
    isOpen={$uiStore.showJournalModal}
    title={$_('journal.title')}
    on:close={() => uiStore.toggleJournalModal(false)}
    extraClasses="modal-size-journal"
>
    <JournalContent />
</ModalFrame>
