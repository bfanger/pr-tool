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
  let aborts: ((reason: string) => void)[] = [];

  function refreshAll(reason: string) {
    aborts = [];
    promise = Promise.allSettled(
      platforms.map((platform) => {
        aborts.push(platform.abort);
        return platform.refresh(reason);
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
    refreshAll("Refresh, network change detected");
  }

  onMount(() => {
    refreshAll("RefreshTrigger is mounted");
    const abortController = new AbortController();
    poll(() => refreshAll("Polling..."), {
      gap: 3600,
      signal: abortController.signal,
    });
    window.navigator.connection?.addEventListener(
      "change",
      handleNetworkChange,
    );
    return () => {
      const reason = "RefreshTrigger was destroyed";
      abortController.abort(new DOMException(reason, "AbortError"));
      window.navigator.connection?.removeEventListener(
        "change",
        handleNetworkChange,
      );
      for (const abort of aborts) {
        abort(reason);
      }
    };
  });

  function handleVisibilityChange() {
    if (!document.hidden) {
      refreshAll("Refreshing, window was opened");
    }
  }

  function handleFocus() {
    for (const platform of platforms) {
      if (platform.progress === "error" || platform.progress === "idle") {
        platform.refresh("Retry, window regained focus");
      }
    }
  }
</script>

<svelte:document onvisibilitychange={handleVisibilityChange} />
<svelte:window onfocus={handleFocus} />

<Button onclick={() => refreshAll("Manual refresh")}>Refresh</Button>
{#await promise}
  Refreshing...
{/await}

{#each platforms as platform}
  {#if platform.progress === "error"}
    <div class="error-row">
      {#if platform.icon}
        <img class="icon" src={platform.icon} alt="" />
      {/if}
      <span>Failed</span>
      <Button onclick={() => platform.refresh("Manual Retry")}>Retry</Button>
    </div>
  {/if}
{/each}

<style>
  .error-row {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-block: 4px;
  }

  .icon {
    width: 1.6rem;
  }
</style>
