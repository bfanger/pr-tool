<script lang="ts">
  import Spinner from "../../components/Spinner/Spinner.svelte";
  import TaskRows from "../../components/TaskRows/TaskRows.svelte";
  import { getContext } from "svelte";
  import type { Platform } from "../../platforms/types";

  const ctx = getContext<{ platforms: Platform[] }>("platforms");
  let platforms = $derived(ctx.platforms);

  let allTasks = $derived(platforms.flatMap((platform) => platform.tasks));
  let groups = $derived(
    Object.groupBy(allTasks, (task) => task.getGroup() ?? ""),
  );
</script>

{#if allTasks.length === 0}
  {#if platforms.some((platform) => platform.progress === "updating" || platform.progress === "refreshing")}
    <Spinner />
  {:else if platforms.some((platform) => platform.progress === "error")}
    <div>Failed to load items</div>
  {:else}
    <div>No items</div>
  {/if}
{:else}
  <div class="groups">
    {#each Object.entries(groups) as [group, tasks]}
      {#if tasks?.length}
        <div>
          <h2 class="title">{group || "Untitled"}</h2>
          <TaskRows {tasks} />
        </div>
      {/if}
    {/each}
  </div>
{/if}

<style>
  .groups {
    display: flex;
    flex-direction: column;
    gap: 2.9rem;
  }

  .title {
    margin-top: 0;
    margin-bottom: 1rem;
    font:
      600 1.4rem "SF Pro Display",
      var(--font);
  }
</style>
