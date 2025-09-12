<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	export let isOpen = false;
	export let title = '';

	let modalElement: HTMLElement;
	let previouslyFocusedElement: HTMLElement;

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
		}

		if (event.key === 'Tab') {
			// Focus trapping
			const focusableElements = modalElement.querySelectorAll<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			const firstElement = focusableElements[0];
			const lastElement = focusableElements[focusableElements.length - 1];

			if (event.shiftKey) {
				// Shift + Tab
				if (document.activeElement === firstElement) {
					lastElement.focus();
					event.preventDefault();
				}
			} else {
				// Tab
				if (document.activeElement === lastElement) {
					firstElement.focus();
					event.preventDefault();
				}
			}
		}
	}

	function close() {
		isOpen = false;
	}

	onMount(() => {
		const handleOpen = () => {
			if (isOpen) {
				previouslyFocusedElement = document.activeElement as HTMLElement;
				setTimeout(() => {
					modalElement.focus();
				}, 100);
			}
		};

		const handleClose = () => {
			if (!isOpen && previouslyFocusedElement) {
				previouslyFocusedElement.focus();
			}
		};

		// Reactive handling of isOpen changes
		$: if (isOpen) {
			handleOpen();
		} else {
			handleClose();
		}
	});
</script>

{#if isOpen}
	<svelte:window on:keydown={handleKeydown} />

	<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
	<div
		class="modal-overlay"
		on:click={close}
		transition:fade={{ duration: 150 }}
	>
		<div
			bind:this={modalElement}
			class="modal-content"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
			on:click={(e) => e.stopPropagation()}
			tabindex="-1"
		>
			<header class="flex justify-between items-center mb-4">
				<h2 id="modal-title" class="text-2xl font-bold">{title}</h2>
				<button
					class="text-3xl"
					aria-label="Close modal"
					on:click={close}
				>&times;</button>
			</header>
			<main>
				<slot />
			</main>
			<footer class="mt-6 flex justify-end gap-4">
				<slot name="footer" />
			</footer>
		</div>
	</div>
{/if}
