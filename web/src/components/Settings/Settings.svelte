<script lang="ts">
  import { lastValueFrom } from "rxjs";
  import AddConfig from "$lib/components/AddConfig.svelte";
  import Button from "$lib/components/Button.svelte";
  import configs from "$lib/store/configs";
  import { providersWithConfig$ } from "$lib/streams/providers";
  import archived from "../../platforms/archived";

  let adding = $state(-1);
</script>

{#if $providersWithConfig$.length === 0}
  <AddConfig />
{:else}
  {#if archived.hasItems}
    <div class="unarchive-button">
      <Button on:click={archived.reset}>Unarchive tasks (reset)</Button>
    </div>
  {/if}
  <div class="accounts-header">
    <h2>Accounts</h2>
    {#if adding !== $providersWithConfig$.length}
      <Button
        on:click={() => {
          adding = $providersWithConfig$.length;
        }}
      >
        Add new account
      </Button>
    {/if}
  </div>

  <div class="platforms">
    {#each $providersWithConfig$ as { config, provider }}
      <div class="config">
        <span>{provider.name}</span>
        {#await lastValueFrom(provider.valid())}
          <span>Validating...</span>
        {:then valid}
          {#if valid === true}
            <span style="color: light-dark(green, lightgreen)">Valid</span>
          {:else}<span style="color: orange">{valid}</span>{/if}
        {:catch err}
          <span style="color: red">Exception:{err.message}</span>
        {/await}

        <Button on:click={() => configs.remove(config)}>Remove</Button>
      </div>
    {/each}
  </div>
  {#if adding === $providersWithConfig$.length}
    <AddConfig />
  {/if}
{/if}

<style>
  .unarchive-button {
    padding: 1rem;
  }

  .accounts-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;

    h2 {
      margin: 0;
      font-size: 1.7rem;
      font-weight: bold;
    }
  }

  .platforms {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding-inline: 1rem;
  }

  .config {
    display: grid;
    grid-template-columns: 2fr 1fr min-content;
  }
</style>
