<script lang="ts">
  import Spinner from "../../components/Spinner/Spinner.svelte";
  import gitlab from "../../platforms/gitlab.svelte";
  import { configsSchema } from "../../platforms/types";
  import storage from "../../services/storage.svelte";
  import RefreshTrigger from "./RefreshTrigger.svelte";
  import TaskRows from "../../components/TaskRows/TaskRows.svelte";
  import legacy from "../../platforms/legacy.svelte";

  const storedConfigs = storage("configs", configsSchema);
  let platforms = $derived(
    storedConfigs.value.map((config) => {
      if (config?.type === "gitlab") {
        return gitlab(config);
      } else if (config) {
        return legacy(config);
      }
      throw new Error(`Unsupported platform: ${(config as any)?.type}`);
    }),
  );
  let count = $derived(
    platforms
      .map((platform) => platform.stats.attentionRequired)
      .reduce((a, b) => a + b, 0),
  );
  $effect(() => {
    console.info("attentionRequired", count);
  });

  let initializing = $derived(
    !platforms.find((platform) => platform.progress !== "init"),
  );

  let tasksWithAttentionRequired = $derived(
    platforms.map((platform) => platform.tasksWithAttentionRequired).flat(1),
  );

  let activeTasks = $derived(
    platforms.map((platform) => platform.activeTasks).flat(1),
  );
</script>

<div class="content">
  {#if platforms.length === 0}
    <div>No platforms configured</div>
  {:else}
    {#key platforms}
      <div class="refresh">
        <RefreshTrigger {platforms} />
      </div>
    {/key}
    {#if initializing}
      <Spinner />
    {:else}
      <TaskRows
        tasks={tasksWithAttentionRequired}
        --margin-top="8px"
        --margin-bottom="32px"
      />

      {#if activeTasks.length > 0}
        <TaskRows tasks={activeTasks} />
      {/if}

      <style>
        .attention-required {
          margin-top: 8px;
          margin-bottom: 32px;
        }
      </style>
    {/if}
  {/if}
</div>

<style>
  .content {
    padding: 8px;
  }

  .refresh {
    margin-bottom: 8px;
  }
</style>
