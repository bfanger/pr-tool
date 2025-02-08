<script lang="ts">
  import Spinner from "../../components/Spinner/Spinner.svelte";
  import Todo from "../../components/Task/Task.svelte";
  import gitlab from "../../platforms/gitlab.svelte";
  import { configsSchema } from "../../platforms/types";
  import storage from "../../services/storage.svelte";
  import RefreshTrigger from "./RefreshTrigger.svelte";

  const storedConfigs = storage("configs", configsSchema);
  let platforms = $derived(
    storedConfigs.value.map((config) => {
      if (config?.type === "gitlab") {
        return gitlab(config);
      }
      throw new Error(`Unsupported platform: ${config?.type}`);
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
  {#key platforms}
    <div class="refresh">
      <RefreshTrigger {platforms} />
    </div>
  {/key}
  {#if platforms.length === 0}
    <div>No platforms configured</div>
  {:else if initializing}
    <Spinner />
  {:else}
    {#if tasksWithAttentionRequired.length > 0}
      <section class="attention-required">
        {#each tasksWithAttentionRequired as task (task.id)}
          <Todo {task} />
        {/each}
      </section>
    {/if}
    {#if activeTasks.length > 0}
      <div></div>
      <section>
        {#each activeTasks as task (task.id)}
          <Todo {task} />
        {/each}
      </section>
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

  .attention-required {
    margin-top: 8px;
    margin-bottom: 32px;
  }
</style>
