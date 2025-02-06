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
</script>

{#key platforms}
  <Refresh {platforms} />
{/key}

{#each platforms as platform}
  <div>Platform status: {platform.progress}</div>
  <div>attentionRequired: {platform.stats.attentionRequired}</div>
  <div>
    {#each platform.tasksWithAttentionRequired as task (task.id)}
      <Todo {task} />
    {/each}
    <h2>Active</h2>
    {#each platform.activeTasks as task (task.id)}
      <Todo {task} />
    {/each}
  </div>
{/each}
