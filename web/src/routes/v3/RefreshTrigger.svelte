<script lang="ts">
  import { onMount } from "svelte";
  import type { Platform } from "../../platforms/types";
  import Button from "../../components/Button/Button.svelte";

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
    window.navigator.connection?.addEventListener(
      "change",
      handleNetworkChange,
    );
    return () => {
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
</script>

<svelte:document onvisibilitychange={handleVisibilityChange} />

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
