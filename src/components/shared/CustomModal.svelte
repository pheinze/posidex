<script lang="ts">
    import { modalManager, type ModalState } from '../../services/modalManager';
    import { fade } from 'svelte/transition';
    import { _ } from '../../locales/i18n';

        let modalState: ModalState = { title: '', message: '', type: 'alert', defaultValue: '', isOpen: false, resolve: null };

    modalManager.subscribe(state => {
        modalState = state;
    });

    function handleConfirm(result: any) {
        modalManager._handleModalConfirm(result);
    }

    function handleInput(event: Event) {
        modalState.defaultValue = (event.target as HTMLInputElement).value;
    }
</script>

{#if modalState.isOpen}
    <div class="modal-overlay" class:visible={modalState.isOpen} transition:fade|local={{ duration: 150 }}>
        <div class="modal-content">
            <h3 class="text-xl font-bold mb-4">{modalState.title}</h3>
            <div class="mb-4 max-h-[70vh] overflow-y-auto pr-2">{@html modalState.message}</div>
            {#if modalState.type === 'prompt'}
                <input type="text" class="input-field w-full px-3 py-2 rounded-md mb-4" placeholder="{$_('dashboard.customModal.promptPlaceholder')}" bind:value={modalState.defaultValue} on:input={handleInput}>
            {/if}
            <div class="flex justify-end gap-4">
                {#if modalState.type === 'confirm'}
                    <button class="font-bold py-2 px-4 rounded-lg bg-[var(--btn-danger-bg)] hover:bg-[var(--btn-danger-hover-bg)] text-[var(--btn-danger-text)]" on:click={() => handleConfirm(true)}>{$_('dashboard.customModal.yesButton')}</button>
                    <button class="font-bold py-2 px-4 rounded-lg bg-[var(--btn-default-bg)] hover:bg-[var(--btn-default-hover-bg)] text-[var(--btn-default-text)]" on:click={() => handleConfirm(false)}>{$_('dashboard.customModal.noButton')}</button>
                {:else}
                    <button class="btn-modal-ok font-bold py-2 px-4 rounded-lg" on:click={() => handleConfirm(modalState.type === 'prompt' ? modalState.defaultValue : true)}>{$_('dashboard.customModal.okButton')}</button>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 50;
        visibility: hidden;
        opacity: 0;
        transition: visibility 0s, opacity 0.3s linear;
    }
    .modal-overlay.visible {
        visibility: visible;
        opacity: 1;
    }
    .modal-content {
        background-color: var(--bg-secondary);
        padding: 2rem;
        border-radius: 1rem;
        max-width: 90vw;
        max-height: 90vh;
        overflow-y: auto;
    }
</style>