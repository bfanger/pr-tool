<script lang="ts">
  import Spinner from "../../components/Spinner/Spinner.svelte";
  import TaskRows from "../../components/TaskRows/TaskRows.svelte";
  import { getContext } from "svelte";
  import type { Platform, Task } from "../../platforms/types";
  import Button from "../../components/Button/Button.svelte";
  import ArchiveButton from "./ArchiveButton.svelte";
  import archived from "../../platforms/archived";

  const ctx = getContext<{ platforms: Platform[] }>("platforms");
  let platforms = $derived(ctx.platforms);
  let wantToArchive = $state<string>();

  let allTasks = $derived(
    platforms
      .flatMap((platform) => platform.tasks)
      .filter((task) => archived.isActive(task))
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
    Object.groupBy(allTasks, (task) => task.getGroup().id ?? ""),
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
    {#each Object.entries(groups) as [, tasks]}
      {#if tasks?.length}
        {@const group = tasks![0]!.getGroup()}

        <div>
          <h2 class="group">
            {#if group.icon}
              <img class="icon" src={group.icon} alt="" />
            {:else}
              <div class="icon"></div>
            {/if}
            <span class="title">{group.title || "Untitled"}</span>
            <span class="date">{formatTime(tasks[0])}</span>
            <ArchiveButton
              onclick={() => {
                wantToArchive = group.id;
              }}
            />
          </h2>
          {#if wantToArchive === group.id}
            <div class="archive-confirm">
              <Button
                onclick={() => archived.archive(group, tasks[0]!.timestamp)}
              >
                Archive
              </Button>
              <Button
                onclick={() => {
                  wantToArchive = undefined;
                }}>Cancel</Button
              >
            </div>
          {:else}
            <TaskRows {tasks} />
          {/if}
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

  .group {
    display: flex;
    align-items: flex-end;

    margin-top: 0;
    margin-bottom: 1rem;

    font:
      600 1.4rem "SF Pro Display",
      var(--font);
  }

  .icon {
    width: 1.6rem;
    margin-right: 0.6rem;
    margin-left: 0.2rem;
  }

  .title {
    overflow: hidden;
    flex: 1;
    text-overflow: ellipsis;
  }

  .date {
    font:
      500 1.2rem "SF Pro Display",
      var(--font);
    color: light-dark(#747474, #9f9f9f);
  }

  .archive-confirm {
    display: flex;
    gap: 1rem;
    justify-content: end;

    padding: 1rem;
    border: var(--hairline) solid light-dark(#dadada, #4b4b4b);
    border-radius: 0.6rem;

    background: light-dark(#e7e7e7, #2b2a2a);
  }
</style>
