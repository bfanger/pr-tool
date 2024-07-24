<script lang="ts">
  import { map } from "rxjs/operators";
  import { page } from "$app/stores";
  import AddConfig from "$lib/components/AddConfig.svelte";
  import Spinner from "$lib/components/Spinner.svelte";
  import Trayicon from "$lib/components/Trayicon.svelte";
  import accounts$, { progress$ } from "$lib/streams/accounts";

  const isServer = typeof window === "undefined";

  const accountCount$ = accounts$.pipe(map((accounts) => accounts.length));
  $: oauth = $page.route.id.startsWith("/app/oauth/");
  $: noAccounts = $progress$ === 1 && $accountCount$ === 0;
</script>

<div class="layout">
  {#if noAccounts && !oauth}
    {#if isServer}
      <Spinner />
    {:else}
      <AddConfig />
    {/if}
  {:else}
    <slot />
  {/if}
  {#if typeof window !== "undefined"}
    <Trayicon />
  {/if}
</div>

<style>
  .layout {
    min-height: 100%;
    box-sizing: border-box;
    font-family: var(--font);
    font-size: 1.4rem;
    letter-spacing: 0.1px;
    display: flex;
    flex-direction: column;
  }
</style>
