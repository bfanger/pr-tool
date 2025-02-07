<script lang="ts">
  import Todo from "../../components/Task/Task.svelte";
  import gitlab from "../../platforms/gitlab.svelte";
  import { configsSchema } from "../../platforms/types";
  import storage from "../../services/storage.svelte";
  import Refresh from "./Refresh.svelte";

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

  let tasksWithAttentionRequired = $derived(
    platforms.map((platform) => platform.tasksWithAttentionRequired).flat(1),
  );

  let activeTasks = $derived(
    platforms.map((platform) => platform.activeTasks).flat(1),
  );
</script>

{#if platforms.length === 0}
  <div>No platforms configured</div>
{/if}
{#key platforms}
  <Refresh {platforms} />

  {#each platforms as platform}
    {#if platform.progress === "init"}
      <div>Loading...</div>
    {:else}
      {#if platform.progress === "error"}
        <div>
          Failed <button onclick={() => platform.refresh()}>Retry</button>
        </div>
      {/if}
      <div>
        Platform: {platform.progress} / {platform.stats.attentionRequired}
      </div>
    {/if}
  {/each}

  <h1>Relevant ({count})</h1>
  <div>
    {#each tasksWithAttentionRequired as task (task.id)}
      <Todo {task} />
    {/each}
  </div>
  <h2>Active</h2>
  <div>
    {#each activeTasks as task (task.id)}
      <Todo {task} />
    {/each}
  </div>
{/key}
