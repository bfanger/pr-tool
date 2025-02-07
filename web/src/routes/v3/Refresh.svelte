<script lang="ts">
  import { onMount } from "svelte";
  import type { Platform } from "../../platforms/types";
  import Spinner from "../../components/Spinner/Spinner.svelte";

  type Props = {
    platforms: Platform[];
  };
  let { platforms }: Props = $props();
  let promise = $state<Promise<void>>();

  let initializing = $derived(
    !!platforms.find((platform) => platform.progress === "init"),
  );
  let failed = $derived(
    !!platforms.find((platform) => platform.progress === "error"),
  );

  function refreshAll() {
    promise = Promise.allSettled(
      platforms.map((platform) => platform.refresh()),
    ).then(() => undefined);
  }

  onMount(() => {
    refreshAll();
  });
</script>

<button onclick={refreshAll}>Refresh</button>

{#if initializing}
  <Spinner />
{/if}

{#await promise}
  Refreshing...
{:then _}
  {#if failed}
    Oops
  {:else}
    Ready
  {/if}
{:catch err}
  allSettled failed? Error: {err.message}
{/await}
