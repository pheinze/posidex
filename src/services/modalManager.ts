import { get } from 'svelte/store';
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * Defines the state structure for a modal dialog.
 */
export interface ModalState {
    /** The title displayed at the top of the modal. */
    title: string;
    /** The main message or question displayed in the modal body. */
    message: string;
    /** The type of modal, which determines its buttons and behavior. */
    type: 'alert' | 'confirm' | 'prompt';
    /** The default value for the input field in a 'prompt' modal. */
    defaultValue?: string;
    /** Whether the modal is currently visible. */
    isOpen: boolean;
    /** The resolve function of the Promise returned by `show()`, used to return the result. */
    resolve: ((value: boolean | string) => void) | null;
}

/**
 * A private Svelte store that holds the state of the currently active modal.
 * Not exported directly; managed by the `modalManager`.
 */
const modalState = writable<ModalState>({
    title: '',
    message: '',
    type: 'alert',
    defaultValue: '',
    isOpen: false,
    resolve: null,
});

/**
 * A service to programmatically control and interact with a global modal component.
 */
export const modalManager = {
    /**
     * Displays a modal and returns a Promise that resolves with the user's interaction.
     * @param title The title for the modal.
     * @param message The message to display.
     * @param type The type of modal ('alert', 'confirm', 'prompt').
     * @param defaultValue Optional default value for prompt inputs.
     * @returns A Promise that resolves to `true` (for confirm), a `string` (for prompt), or `false` (for cancel/close).
     */
    show(title: string, message: string, type: 'alert' | 'confirm' | 'prompt', defaultValue: string = ''): Promise<boolean | string> {
        return new Promise((resolve) => {
            if (!browser) { // Only show modal in browser environment
                console.warn("Modal cannot be shown in SSR environment.");
                resolve(false); // Or handle as appropriate for your app
                return;
            }

            modalState.set({
                title,
                message,
                type,
                defaultValue,
                isOpen: true,
                resolve,
            });
        });
    },

    /**
     * Internal handler called by the modal component when the user makes a choice.
     * It resolves the promise and resets the modal state.
     * @param result The value from the user's interaction (boolean for confirm, string for prompt).
     * @private
     */
    _handleModalConfirm(result: boolean | string) {
        const currentModalState = get(modalState);
        if (currentModalState.resolve) {
            currentModalState.resolve(result);
        }
        modalState.set({ ...currentModalState, isOpen: false, resolve: null });
    },

    /**
     * Exposes the `subscribe` method of the internal store.
     * This allows Svelte components to reactively bind to the modal's state.
     */
    subscribe: modalState.subscribe,
};