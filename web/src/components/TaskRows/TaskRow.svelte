<script lang="ts">
  import type { Task } from "../../platforms/types";
  import Avatar from "../Avatar/Avatar.svelte";
  import TaskCollaborator from "./TaskCollaborator.svelte";

  type Props = {
    task: Task;
  };
  let { task }: Props = $props();
  let { url, title, author } = $derived(task);
</script>

<a
  class="todo"
  href={url}
  class:muted={!task.attentionNeeded}
  target="_blank"
  rel="noreferrer"
>
  <div class="title-row">
    <span class="avatar">
      <Avatar
        src={author?.getAvatar("large")}
        title={author?.name}
        size="large"
      />
    </span>
    {title}
  </div>
  <div class="collaborators">
    {#each task.getCollaborators() as collaborator}
      <TaskCollaborator {collaborator} />
    {/each}
  </div>
</a>

<style>
  .todo {
    display: block;

    padding: 0.8rem 1.2rem;
    border-right: var(--hairline) solid var(--border);
    border-bottom: var(--hairline) solid var(--border);
    border-left: var(--hairline) solid var(--border);

    color: var(--text);
    text-decoration: none;

    background: var(--inset);

    &.muted {
      background: var(--inset-muted);
      transition: background 0.3s;

      &:hover {
        background: var(--inset);
        transition-duration: 0.05s;
      }
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

  .title-row {
    display: flex;
    align-items: flex-start;
    font-size: 1.4rem;
    letter-spacing: 0.1px;
  }

  .avatar {
    flex-shrink: 0;
    margin-right: 1rem;
  }

  .collaborators {
    display: flex;
    flex-wrap: wrap;
    place-content: flex-start flex-end;
  }
</style>
