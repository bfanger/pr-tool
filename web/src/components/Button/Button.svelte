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
    color: light-dark(#2d2d2d, #eaeaea);
    text-decoration: none;

    background: light-dark(#fff, #5f5f5f);
    outline: none;
    box-shadow:
      0 0.1rem 0.2rem light-dark(rgb(136 136 136 / 45%), rgb(50 50 50/ 45%)),
      0 0 0.1rem light-dark(rgb(136 136 136 / 54%), rgb(50 50 50/ 54%)),
      inset 0 0.5px 0 light-dark(rgb(255 255 255 / 25%), rgb(210 210 210/ 25%));

    &:active {
      background: light-dark(#f3f3f3, #777677);
    }

    &:disabled {
      color: light-dark(#b7b7b7, #737373);
      background: light-dark(#f0f0f0, #454445);
      box-shadow:
        0 0.1rem 0.2rem light-dark(rgb(196 196 196 / 45%), rgb(50 50 50/ 45%)),
        0 0 0.1rem light-dark(rgb(196 196 196 / 54%), rgb(50 50 50/ 54%)),
        inset 0 0.05rem 0
          light-dark(rgb(255 255 255 / 25%), rgb(142 142 142/ 25%));
    }
  }
</style>
