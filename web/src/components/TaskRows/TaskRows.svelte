<script lang="ts">
  import TaskRow from "./TaskRow.svelte";
  import type { Task } from "../../platforms/types";

  type Props = {
    tasks: Task[];
  };
  let { tasks }: Props = $props();
</script>

{#if tasks.length > 0}
  <section class="task-rows">
    {#each tasks as task (task.id)}
      <TaskRow {task} />
    {/each}
  </section>
{/if}

<style>
  .task-rows {
    margin-top: var(--margin-top);
    margin-bottom: var(--margin-bottom);
  }
</style>
