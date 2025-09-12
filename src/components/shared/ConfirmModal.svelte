<script lang="ts">
    import Modal from './Modal.svelte';
    import { confirmService } from '../../services/confirmService';
    import { _ } from '../../locales/i18n';

    let state: { isOpen: boolean; title: string; message: string; } = {
        isOpen: false,
        title: '',
        message: '',
    };

    confirmService.subscribe(($state) => {
        state = $state;
    });

    function handleConfirm(value: boolean) {
        confirmService._handleConfirm(value);
    }
</script>

<Modal bind:isOpen={state.isOpen} title={state.title}>
    <p>{state.message}</p>
    <svelte:fragment slot="footer">
        <button
            class="font-bold py-2 px-4 rounded-lg bg-[var(--btn-danger-bg)] hover:bg-[var(--btn-danger-hover-bg)] text-[var(--btn-danger-text)]"
            on:click={() => handleConfirm(true)}
        >
            {$_('dashboard.customModal.yesButton')}
        </button>
        <button
            class="font-bold py-2 px-4 rounded-lg bg-[var(--btn-default-bg)] hover:bg-[var(--btn-default-hover-bg)] text-[var(--btn-default-text)]"
            on:click={() => handleConfirm(false)}
        >
            {$_('dashboard.customModal.noButton')}
        </button>
    </svelte:fragment>
</Modal>
