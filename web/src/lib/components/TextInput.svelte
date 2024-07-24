<script lang="ts">
  export let type: "text" | "textarea" = "text";
  export let label: string;
  export let id: string;
  export let value: string;
  export let placeholder: string | undefined = undefined;
</script>

<label for={id}>{label}:</label>
<div>
  {#if type === "text"}
    <input {id} type="text" {placeholder} bind:value />
  {/if}
  {#if type === "textarea"}<textarea {id} {placeholder} bind:value />{/if}
  {#if $$slots.default}
    <div class="tip">
      <slot />
    </div>
  {/if}
</div>

<style>
  label {
    white-space: nowrap;
    font-size: 1.3rem;
    line-height: 2.1rem;
    text-align: right;
    min-width: 16rem;
  }
  input,
  textarea {
    width: 100%;
    box-sizing: border-box;
    font: 1.4rem/1.8rem var(--font);
    background: var(--inset);
    color: var(--text);
    padding: 0.2rem 0.3rem;
    border: var(--hairline) solid var(--border);
    &:focus {
      box-shadow: 0 0 1px 3px var(--focus-ring);
      outline: none;
    }
  }
  .tip {
    margin-top: 0.4rem;
    font-size: 1.2rem;
  }
</style>
