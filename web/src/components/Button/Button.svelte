<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    href?: string;
    disabled?: boolean;
    onclick?: () => void;
    children: Snippet;
  };
  let { href, disabled, onclick, children }: Props = $props();
</script>

{#if href && !disabled}
  <a class="button" {href} {onclick}>{@render children()}</a>
{:else}
  <button class="button" {disabled} {onclick}>{@render children()}</button>
{/if}

<style>
  .button {
    padding: 0.2rem 0.6rem;
    border: none;
    border-radius: 0.5rem;

    font:
      500 1.3rem "SF Pro Text",
      var(--font);
    color: var(--text);
    text-decoration: none;

    background: var(--background);
    outline: none;
    box-shadow:
      0 0.1rem 0.2rem rgb(var(--shadow) / 45%),
      0 0 0.1rem rgb(var(--shadow) / 54%),
      inset 0 0.5px 0 rgb(var(--inset-shadow) / 25%);

    &:active {
      background: var(--background-active);
    }

    &:disabled {
      color: var(--text-disabled);
      background: var(--background-disabled);
      box-shadow:
        0 0.1rem 0.2rem rgb(var(--shadow-disabled) / 45%),
        0 0 0.1rem rgb(var(--shadow-disabled) / 54%),
        inset 0 0.05rem 0 rgb(var(--inset-shadow-disabled) / 25%);
    }

    @media (prefers-color-scheme: light) {
      --text: #2d2d2d;
      --text-disabled: #b7b7b7;
      --background: #fff;
      --background-active: #f3f3f3;
      --background-disabled: #f0f0f0;
      --shadow: 136 136 136;
      --shadow-disabled: 196 196 196;
      --inset-shadow: 255 255 255;
      --inset-shadow-disabled: 255 255 255;
    }

    @media (prefers-color-scheme: dark) {
      --text: #eaeaea;
      --text-disabled: #737373;
      --background: #5f5f5f;
      --background-active: #777677;
      --background-disabled: #454445;
      --shadow: 50 50 50;
      --shadow-disabled: 50 50 50;
      --inset-shadow: 210 210 210;
      --inset-shadow-disabled: 142 142 142;
    }
  }
</style>
