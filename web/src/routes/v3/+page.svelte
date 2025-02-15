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
{#each Object.entries(groups) as [group, tasks]}
  <h2 class="group">{group || "Untitled"}</h2>
  {#if tasks}
    <TaskRows {tasks} />
  {/if}
{/each}

<style>
  .group {
    margin-top: 2.9rem;
    margin-bottom: 1rem;
    font-size: 1.4rem;
    font-weight: 600;
  }
</style>
