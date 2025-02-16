<script lang="ts">
  import Spinner from "../../components/Spinner/Spinner.svelte";
  import TaskRows from "../../components/TaskRows/TaskRows.svelte";
  import { getContext } from "svelte";
  import type { Platform } from "../../platforms/types";

  const ctx = getContext<{ platforms: Platform[] }>("platforms");
  let platforms = $derived(ctx.platforms);

  let initializing = $derived(
    !platforms.find((platform) => platform.progress !== "init"),
  );
  let groups = $derived(
    Object.groupBy(
      platforms.flatMap((platform) => platform.tasks),
      (task) => task.getGroup() ?? "",
    ),
  );
</script>

{#if platforms.length === 0}
  <div>No platforms configured</div>
{:else if initializing}
  <Spinner />
{/if}
<div class="groups">
  {#each Object.entries(groups) as [group, tasks]}
    {#if tasks}
      <div>
        <h2 class="title">{group || "Untitled"}</h2>
        <TaskRows {tasks} />
      </div>
    {/if}
  {/each}
</div>

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
