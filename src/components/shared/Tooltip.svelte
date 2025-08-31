<script lang="ts">
  export let text = '';
  let visible = false;
  let tooltipEl: HTMLElement;
  let triggerEl: HTMLElement;

  function show() {
    visible = true;
  }

  function hide() {
    visible = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      visible = !visible;
    }
  }
</script>

<div class="tooltip-container">
  <button
    bind:this={triggerEl}
    on:mouseenter={show}
    on:mouseleave={hide}
    type="button"
    class="tooltip-trigger"
    aria-describedby="tooltip-text"
    on:focus={show}
    on:blur={hide}
    on:keydown={handleKeydown}
  >
    ?
  </button>
  {#if visible}
    <div
      bind:this={tooltipEl}
      id="tooltip-text"
      role="tooltip"
      class="tooltip-content"
    >
      {text}
    </div>
  {/if}
</div>

<style>
  .tooltip-container {
    position: relative;
    display: inline-block;
  }
  .tooltip-trigger {
    background: var(--border-color);
    color: var(--text-primary);
    border-radius: 99px;
    width: 1rem;
    height: 1rem;
    font-size: 0.7rem;
    line-height: 1rem;
    text-align: center;
    border: none;
    cursor: pointer;
    padding: 0;
  }
  .tooltip-content {
    width: 220px;
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
    text-align: center;
    border-radius: 0.5rem;
    padding: 0.5rem 0.75rem;
    position: absolute;
    z-index: 10;
    bottom: 140%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.8rem;
    font-weight: 500;
    box-shadow: var(--shadow-tooltip);
    border: 2px solid var(--border-color);
    pointer-events: none;
    text-transform: none;
  }
  .tooltip-content::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: var(--bg-tertiary) transparent transparent transparent;
  }
</style>
