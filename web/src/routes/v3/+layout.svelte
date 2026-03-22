<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import { configsSchema } from "../../platforms/types";
  import storage from "../../services/storage.svelte";
  import gitlab from "../../platforms/gitlab.svelte";
  import legacy from "../../platforms/legacy.svelte";
  import github from "../../platforms/github.svelte";
  import jira from "../../platforms/jira.svelte";
  import TrayIcon from "./TrayIcon.svelte";
  import { setPlatformsContext } from "../../services/platformContext-fns";
  import poll from "../../services/poll";
  type Props = {
    children: Snippet;
  };
  let { children }: Props = $props();

  let promise = $state(new Promise<void>(() => undefined));
  let aborts: ((reason: string) => void)[] = [];

  const storedConfigs = storage("configs", configsSchema);
  let platforms = $derived(
    storedConfigs.value.map((config) => {
      if (config?.type === "gitlab") {
        return gitlab(config);
      } else if (config?.type === "github") {
        return github(config);
      } else if (config?.type === "jira") {
        return jira(config);
      } else if (config) {
        return legacy(config);
      }
      throw new Error(`Unsupported platform: ${(config as any)?.type}`);
    }),
  );

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

  setPlatformsContext({
    get current() {
      return platforms;
    },
    get promise() {
      return promise;
    },
    refreshAll,
  });

  function handleNetworkChange() {
    refreshAll("Refresh, network change detected");
  }

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
</script>

<svelte:document onvisibilitychange={handleVisibilityChange} />
<svelte:window onfocus={handleFocus} />

<div class="page-layout">
  {#if platforms.length > 0}
    <TrayIcon />
  {/if}

  {@render children()}
</div>

<style>
  .page-layout {
    box-sizing: border-box;
    max-width: 100rem;
    min-height: 100%;
    margin-right: auto;
    margin-left: auto;

    font-family: var(--font);
    font-size: 1.4rem;
    color: light-dark(#242424, #e9e9e9);
    letter-spacing: 0.1px;

    background: light-dark(#ebebeb, #282727);
  }
</style>
