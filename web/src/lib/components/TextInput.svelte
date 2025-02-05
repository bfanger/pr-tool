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
  {#if type === "textarea"}<textarea {id} {placeholder} bind:value
    ></textarea>{/if}
  {#if $$slots.default}
    <div class="tip">
      <slot />
    </div>
  {/if}
</div>

<style>
  label {
    min-width: 16rem;

    font-size: 1.3rem;
    line-height: 2.1rem;
    text-align: right;
    white-space: nowrap;
  }

  input,
  textarea {
    box-sizing: border-box;
    width: 100%;
    padding: 0.2rem 0.3rem;
    border: var(--hairline) solid var(--border);

    font: 1.4rem/1.8rem var(--font);
    color: var(--text);

    background: var(--inset);

    &:focus {
      outline: none;
      box-shadow: 0 0 1px 3px var(--focus-ring);
    }
  }

  .tip {
    margin-top: 0.4rem;
    font-size: 1.2rem;
  }
</style>
