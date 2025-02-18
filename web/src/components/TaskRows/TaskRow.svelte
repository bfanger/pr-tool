<script lang="ts">
  import type { Task } from "../../platforms/types";
  import Avatar from "../Avatar/Avatar.svelte";
  import ChevronRight from "./ChevronRight.svelte";
  import TaskCollaborator from "./TaskCollaborator.svelte";

  type Props = {
    task: Task;
  };
  let { task }: Props = $props();
  let { url, title, author } = $derived(task);
  let collaborators = $derived(task.getCollaborators());
</script>

<a class="todo" href={url} target="_blank" rel="noreferrer">
  <div class="indicator-spacer">
    {#if task.attentionNeeded}
      <i class="indicator"></i>
    {/if}
  </div>
  <div class="title-and-collaborators">
    <div class="title">
      {title}
    </div>
    {#if collaborators.length > 0}
      <div class="collaborators">
        {#each collaborators as collaborator}
          <TaskCollaborator {collaborator} />
        {/each}
      </div>
    {/if}
  </div>
  <div class="avatar">
    <Avatar
      src={author?.getAvatar("large")}
      title={author?.name}
      size="medium"
    />
  </div>
  <div class="chevron">
    <ChevronRight />
  </div>
</a>

<style>
  .todo {
    --border: light-dark(#dadada, #4b4b4b);

    display: flex;
    align-items: center;

    padding: 0.8rem;
    border-right: var(--hairline) solid var(--border);
    border-bottom: var(--hairline) solid var(--border);
    border-left: var(--hairline) solid var(--border);

    color: var(--text);
    text-decoration: none;

    background: light-dark(#e7e7e7, #2b2a2a);

    &:active {
      background: light-dark(#e0e0e0, #373635);
    }
  }

  .todo:first-child {
    border-top: var(--hairline) solid var(--border);
    border-top-left-radius: 0.6rem;
    border-top-right-radius: 0.6rem;
  }

  .todo:last-child {
    border-bottom-right-radius: 0.6rem;
    border-bottom-left-radius: 0.6rem;
  }

  .title-and-collaborators {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.8rem;
  }

  .indicator-spacer {
    position: relative;
    align-self: stretch;
    width: 1.6rem;
  }

  .indicator {
    position: absolute;
    top: 0.3rem;
    left: 0;

    display: inline-block;

    width: 0.8rem;
    height: 0.8rem;
    border-radius: 50%;

    background: light-dark(#3378f6, #3a82f7);
  }

  .title {
    font-size: 1.4rem;
  }

  .collaborators {
    display: flex;
    flex-wrap: wrap;
    gap: 1.2rem;
  }

  .avatar {
    flex-shrink: 0;
    align-self: center;
    margin-right: 1rem;
  }

  .chevron {
    align-self: center;
    padding-right: 0.4rem;
    padding-left: 0.8rem;
  }
</style>
