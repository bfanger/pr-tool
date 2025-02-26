<script lang="ts">
  import { onMount } from "svelte";
  import type { Platform } from "../../platforms/types";
  import Button from "../../components/Button/Button.svelte";
  import poll from "../../services/poll";

  type Props = {
    platforms: Platform[];
  };
  let { platforms }: Props = $props();
  let promise = $state<Promise<any>>();
  let aborts: (() => void)[] = [];

  function refreshAll() {
    aborts = [];
    promise = Promise.allSettled(
      platforms.map((platform) => {
        aborts.push(platform.abort);
        return platform.refresh();
      }),
    ).then((results) => {
      for (const result of results) {
        if (result.status === "rejected") {
          console.warn(result.reason);
        }
      }
      return undefined;
    });
    return promise;
  }

  function handleNetworkChange() {
    console.info("Network change detected");
    refreshAll();
  }

  onMount(() => {
    refreshAll();
    const abortController = new AbortController();
    poll(refreshAll, { gap: 3600, signal: abortController.signal });
    window.navigator.connection?.addEventListener(
      "change",
      handleNetworkChange,
    );
    return () => {
      abortController.abort();
      window.navigator.connection?.removeEventListener(
        "change",
        handleNetworkChange,
      );
      for (const abort of aborts) {
        abort();
      }
    };
  });

  function handleVisibilityChange() {
    if (!document.hidden) {
      refreshAll();
    }
  }

  function handleFocus() {
    for (const platform of platforms) {
      if (platform.progress === "error" || platform.progress === "idle") {
        platform.refresh();
      }
    }
  }
</script>

<svelte:document onvisibilitychange={handleVisibilityChange} />
<svelte:window onfocus={handleFocus} />

<Button onclick={refreshAll}>Refresh</Button>
{#await promise}
  Refreshing...
{/await}

{#each platforms as platform}
  {#if platform.progress === "error"}
    <div>
      Failed <Button onclick={() => platform.refresh()}>Retry</Button>
    </div>
  {/if}
{/each}
