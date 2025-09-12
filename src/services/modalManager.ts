import { get, writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { ComponentType } from 'svelte';

/**
 * Defines the state structure for a modal dialog.
 */
export interface ModalState {
    /** The title displayed at the top of the modal. */
    title: string;
    /** The main message or question displayed in the modal body. */
    message: string;
    /** The type of modal, which determines its buttons and behavior. */
    type: 'alert' | 'confirm' | 'prompt' | 'component';
    /** The default value for the input field in a 'prompt' modal. */
    defaultValue?: string;
    /** Whether the modal is currently visible. */
    isOpen: boolean;
    /** The resolve function of the Promise returned by `show()`, used to return the result. */
    resolve: ((value: any) => void) | null;
    /** The Svelte component to render for 'component' type modals. */
    component?: ComponentType | null;
    /** The props to pass to the rendered Svelte component. */
    props?: Record<string, any>;
    /** The size of the modal window. */
    size?: 'normal' | 'large';
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
    component: null,
    props: {}
});

/**
 * A service to programmatically control and interact with a global modal component.
 */
export const modalManager = {
    /**
     * Displays a modal and returns a Promise that resolves with the user's interaction.
     * @param options The configuration for the modal.
     * @returns A Promise that resolves with the result of the user interaction.
     */
    show(options: Partial<ModalState>): Promise<any> {
        return new Promise((resolve) => {
            if (!browser) {
                resolve(false);
                return;
            }

            const currentState = get(modalState);
            modalState.set({
                ...currentState,
                ...options,
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