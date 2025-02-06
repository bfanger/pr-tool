<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    href: string;
    title: string;
    avatar?: Snippet;
  };
  let { href, title, avatar }: Props = $props();
</script>

<a class="todo" {href} target="_blank" rel="noreferrer">
  <div class="title-row">
    <span class="avatar">
      {@render avatar?.()}
      <!-- title={creator.name} -->
      <!-- <Avatar profile={creator} size="large" {provider} /> -->
    </span>
    {title}
  </div>
  <div class="collaborators">
    <!-- {#each collaborators as collaborator (collaborator.profile.id)}
      <span class="collaborator">
        <collaborator {collaborator} {provider} />
      </span>
    {/each} -->
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

  /* .collaborator {
    margin-top: 0.5rem;
    margin-left: 1.2rem;
  } */
</style>
