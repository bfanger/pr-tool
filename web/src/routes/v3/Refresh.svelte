<script lang="ts">
  import { onMount } from "svelte";
  import type { Platform } from "../../platforms/types";

  type Props = {
    platforms: Platform[];
  };
  let { platforms }: Props = $props();
  let promise = $state<Promise<void>>();

  function refreshAll() {
    promise = Promise.allSettled(
      platforms.map((platform) => platform.refresh()),
    ).then(() => undefined);
  }

  onMount(() => {
    refreshAll();
  });
</script>

{#await promise}
  Loading...
{:then _}
  Ready
{:catch err}
  {err.message}
{/await}
<button onclick={refreshAll}>Refresh</button>
