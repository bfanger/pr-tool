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
</script>

<a class="todo" href={url} target="_blank" rel="noreferrer">
  <span class="indicator-spacer">
    {#if task.attentionNeeded}
      <span class="indicator"></span>
    {/if}
  </span>
  <div class="title-and-collaborators">
    <div class="title">
      {title}
    </div>
    <div class="collaborators">
      {#each task.getCollaborators() as collaborator}
        <TaskCollaborator {collaborator} />
      {/each}
    </div>
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
    display: flex;

    padding: 0.8rem;
    border-right: var(--hairline) solid var(--border);
    border-bottom: var(--hairline) solid var(--border);
    border-left: var(--hairline) solid var(--border);

    color: var(--text);
    text-decoration: none;

    background: var(--background);

    &:active {
      background: var(--background-pressed);
    }

    @media (prefers-color-scheme: light) {
      --background: #e7e7e7;
      --background-pressed: #e0e0e0;
      --border: #dadada;
      --indicator: #4086f7;
    }

    @media (prefers-color-scheme: dark) {
      --background: #2b2a2a;
      --border: #4b4b4b;
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

    background: var(--indicator);
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
