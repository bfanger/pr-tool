<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    href?: string;
    size?: "medium" | "small";
    disabled?: boolean;
    onclick?: () => void;
    children: Snippet;
  };
  let { href, size = "medium", disabled, onclick, children }: Props = $props();
</script>

{#if href && !disabled}
  <a class="button" data-size={size} {href} {onclick}>{@render children()}</a>
{:else}
  <button class="button" data-size={size} {disabled} {onclick}
    >{@render children()}</button
  >
{/if}

<style>
  .button {
    cursor: pointer;

    position: relative;

    display: inline-block;

    padding: 0.2rem 1rem;
    border: var(--hairline) solid var(--border);
    border-radius: 0.4rem;

    font-family: var(--font);
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

  [data-size="small"] {
    min-width: 0;
    font-size: 1rem;
  }

  [data-size="medium"] {
    min-width: 9rem;
    font-size: 1.3rem;
  }
</style>
