<script lang="ts">
  import Spinner from "../../components/Spinner/Spinner.svelte";
  import TaskRows from "../../components/TaskRows/TaskRows.svelte";
  import { getContext } from "svelte";
  import type { Platform, Task } from "../../platforms/types";

  const ctx = getContext<{ platforms: Platform[] }>("platforms");
  let platforms = $derived(ctx.platforms);

  let allTasks = $derived(
    platforms
      .flatMap((platform) => platform.tasks)
      .toSorted((a, b) => {
        if (a.attentionNeeded && !b.attentionNeeded) {
          return -1;
        }
        if (!a.attentionNeeded && b.attentionNeeded) {
          return 1;
        }
        return b.timestamp - a.timestamp;
      }),
  );
  let groups = $derived(
    Object.groupBy(allTasks, (task) => task.getGroup() ?? ""),
  );
  const dateFormatter = new Intl.DateTimeFormat("en-GB", { dateStyle: "long" });
  function formatTime(task: Task | undefined) {
    if (!task) {
      return "";
    }
    return dateFormatter.format(task.timestamp);
  }
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
          <h2 class="title">
            <span>{group || "Untitled"}</span>
            <span class="date">{formatTime(tasks[0])}</span>
          </h2>
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
    padding-top: 1.2rem;
  }

  .title {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;

    margin-top: 0;
    margin-bottom: 1rem;

    font:
      600 1.4rem "SF Pro Display",
      var(--font);
  }

  .date {
    font:
      500 1.2rem "SF Pro Display",
      var(--font);
    color: light-dark(#747474, #9f9f9f);
  }
</style>
