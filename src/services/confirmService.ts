import { writable } from 'svelte/store';

interface ConfirmState {
    isOpen: boolean;
    title: string;
    message: string;
    resolve: ((value: boolean) => void) | null;
}

const createConfirmStore = () => {
    const { subscribe, set } = writable<ConfirmState>({
        isOpen: false,
        title: '',
        message: '',
        resolve: null,
    });

    return {
        subscribe,
        show: (title: string, message: string): Promise<boolean> => {
            return new Promise((resolve) => {
                set({
                    isOpen: true,
                    title,
                    message,
                    resolve,
                });
            });
        },
        _handleConfirm: (value: boolean) => {
            set((state) => {
                if (state.resolve) {
                    state.resolve(value);
                }
                return { ...state, isOpen: false, resolve: null };
            });
        },
    };
};

export const confirmService = createConfirmStore();
