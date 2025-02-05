<script lang="ts">
  import { lastValueFrom } from "rxjs";
  import AddConfig from "$lib/components/AddConfig.svelte";
  import BackButton from "$lib/components/BackButton.svelte";
  import Button from "$lib/components/Button.svelte";
  import rpc from "$lib/services/rpc";
  import configs from "$lib/store/configs";
  import { providersWithConfig$ } from "$lib/streams/providers";
</script>

<br />
<br />
{#each $providersWithConfig$ as { config, provider }}
  <div class="config">
    <span>{provider.name}</span>
    {#await lastValueFrom(provider.valid())}
      <span>Validating...</span>
    {:then valid}
      {#if valid === true}
        <span style="color: green">Valid</span>
      {:else}<span style="color: orange">{valid}</span>{/if}
    {:catch err}
      <span style="color: red">Exception:{err.message}</span>
    {/await}

    <Button on:click={() => configs.remove(config)}>Remove</Button>
  </div>
{/each}
<div class="buttons">
  <Button
    on:click={() => {
      window.location.hash = "";
      window.location.reload();
    }}
  >
    Restart
  </Button>
  {#if rpc}
    <Button on:click={() => rpc.send("quit")}>Quit</Button>
  {/if}
</div>
<AddConfig />
<BackButton />
<slot />

<style>
  .config {
    display: grid;
    grid-template-columns: 2fr 1fr min-content;
    margin-right: 1rem;
    margin-left: 1rem;
  }

  .buttons {
    display: flex;
    justify-content: center;

    width: 100%;
    margin-top: 2rem;
    margin-bottom: 2rem;
  }

  .buttons > :global(* + *) {
    margin-left: 1rem;
  }
</style>
