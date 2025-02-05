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
    cursor: pointer;

    position: relative;

    display: inline-block;

    min-width: 9rem;
    padding: 0.2rem 1rem;
    border: var(--hairline) solid var(--border);
    border-radius: 0.4rem;

    font: 1.3rem var(--font);
    color: var(--button-text);
    text-decoration: none;

    background: var(--button-background);

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
    min-width: 0;
    font-size: 1rem;
  }
</style>
