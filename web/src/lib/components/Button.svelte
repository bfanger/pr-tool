<script lang="ts">
  export let href: string | undefined = undefined;
  export let small = false;
  export let disabled = false;
</script>

{#if href && !disabled}
  <a class="button" class:small {href} on:click><slot /></a>
{:else}
  <button class="button" class:small {disabled} on:click><slot /></button>
{/if}

<style>
  .button {
    font: 1.3rem var(--font);
    background: var(--button-background);
    color: var(--button-text);
    border-radius: 0.4rem;
    padding: 0.2rem 1rem;
    min-width: 9rem;

    border: var(--hairline) solid var(--border);
    position: relative;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;

    &:hover {
      color: var(--text);
    }
    &:active {
      outline: none;
    }
    &:disabled {
      border-color: transparent;
      color: var(--button-disabled-text);
      background: var(--button-disabled-background);
    }
  }
  .small {
    font-size: 1rem;
    min-width: 0;
  }
</style>
