import { writable } from 'svelte/store';

interface PromptState {
    isOpen: boolean;
    title: string;
    message: string;
    defaultValue: string;
    resolve: ((value: string | false) => void) | null;
}

const createPromptStore = () => {
    const { subscribe, set } = writable<PromptState>({
        isOpen: false,
        title: '',
        message: '',
        defaultValue: '',
        resolve: null,
    });

    return {
        subscribe,
        show: (title: string, message: string, defaultValue = ''): Promise<string | false> => {
            return new Promise((resolve) => {
                set({
                    isOpen: true,
                    title,
                    message,
                    defaultValue,
                    resolve,
                });
            });
        },
        _handleConfirm: (value: string | false) => {
            set((state) => {
                if (state.resolve) {
                    state.resolve(value);
                }
                return { ...state, isOpen: false, resolve: null, defaultValue: '' };
            });
        },
    };
};

export const promptService = createPromptStore();
