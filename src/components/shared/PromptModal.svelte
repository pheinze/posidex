<script lang="ts">
    import Modal from './Modal.svelte';
    import { promptService } from '../../services/promptService';
    import { _ } from '../../locales/i18n';

    let state: { isOpen: boolean; title: string; message: string; defaultValue: string; } = {
        isOpen: false,
        title: '',
        message: '',
        defaultValue: '',
    };

    let inputValue = '';

    promptService.subscribe(($state) => {
        state = $state;
        if ($state.isOpen) {
            inputValue = $state.defaultValue;
        }
    });

    function handleConfirm() {
        promptService._handleConfirm(inputValue);
    }

    function handleCancel() {
        promptService._handleConfirm(false);
    }
</script>

<Modal bind:isOpen={state.isOpen} title={state.title} on:close={handleCancel}>
    <p>{state.message}</p>
    <input
        type="text"
        class="input-field w-full px-3 py-2 rounded-md mt-4"
        placeholder={$_('dashboard.customModal.promptPlaceholder')}
        bind:value={inputValue}
        on:keydown={(e) => { if (e.key === 'Enter') handleConfirm() }}
    />
    <svelte:fragment slot="footer">
        <button
            class="btn-modal-ok font-bold py-2 px-4 rounded-lg"
            on:click={handleConfirm}
        >
            {$_('dashboard.customModal.okButton')}
        </button>
    </svelte:fragment>
</Modal>
