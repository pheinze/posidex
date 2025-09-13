<script lang="ts">
    import { modalManager, type ModalState } from '../../services/modalManager';
    import { _ } from '../../locales/i18n';
    import { trackClick } from '../../lib/actions';

        let modalState: ModalState = { title: '', message: '', type: 'alert', defaultValue: '', isOpen: false, resolve: null };

    modalManager.subscribe(state => {
        modalState = state;
    });

    function handleConfirm(result: boolean | string) {
        modalManager._handleModalConfirm(result);
    }

    function handleInput(event: Event) {
        modalState.defaultValue = (event.target as HTMLInputElement).value;
    }
</script>

{#if modalState.isOpen}
    <div
        class="modal-overlay"
        class:visible={modalState.isOpen}
        on:click={(e) => { if (e.target === e.currentTarget) handleConfirm(false) }}
        on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { if (e.target === e.currentTarget) handleConfirm(false) } }}
        role="button"
        tabindex="0"
    >
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">{modalState.title}</h3>
                <button
                    class="modal-close-btn"
                    aria-label="{$_('app.closeChangelogAriaLabel')}"
                    on:click={() => handleConfirm(false)}
                    use:trackClick={{ category: 'CustomModal', action: 'Click', name: 'CloseViaX' }}
                >&times;</button>
            </div>

            <div class="prose dark:prose-invert mb-4 max-h-[60vh] overflow-y-auto pr-2 w-full max-w-none">{@html modalState.message}</div>

            {#if modalState.type === 'prompt'}
                <input type="text" class="input-field w-full px-3 py-2 rounded-md mb-4" placeholder="{$_('dashboard.customModal.promptPlaceholder')}" bind:value={modalState.defaultValue} on:input={handleInput}>
            {/if}

            <div class="flex justify-end gap-4 mt-6">
                {#if modalState.type === 'confirm'}
                    <button class="font-bold py-2 px-4 rounded-lg bg-[var(--btn-danger-bg)] hover:bg-[var(--btn-danger-hover-bg)] text-[var(--btn-danger-text)]" on:click={() => handleConfirm(true)} use:trackClick={{ category: 'CustomModal', action: 'Click', name: 'ConfirmYes' }}>{$_('dashboard.customModal.yesButton')}</button>
                    <button class="font-bold py-2 px-4 rounded-lg bg-[var(--btn-default-bg)] hover:bg-[var(--btn-default-hover-bg)] text-[var(--btn-default-text)]" on:click={() => handleConfirm(false)} use:trackClick={{ category: 'CustomModal', action: 'Click', name: 'ConfirmNo' }}>{$_('dashboard.customModal.noButton')}</button>
                {:else}
                    <button class="btn-modal-ok font-bold py-2 px-4 rounded-lg" on:click={() => handleConfirm(modalState.type === 'prompt' ? modalState.defaultValue || '' : true)} use:trackClick={{ category: 'CustomModal', action: 'Click', name: 'ConfirmOK' }}>{$_('dashboard.customModal.okButton')}</button>
                {/if}
            </div>
        </div>
    </div>
{/if}