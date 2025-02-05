<script lang="ts">
  import type { Provider } from "$lib/models/Provider";
  import type { PullRequest } from "$lib/models/PullRequest";
  import Avatar from "./Avatar.svelte";
  import Reviewer from "./Reviewer.svelte";

  export let provider: Provider;
  export let pullRequest: PullRequest;
</script>

<a class="pull-request" href={pullRequest.url} target="_blank" rel="noreferrer">
  <div class="title-row">
    <span class="avatar" title={pullRequest.creator.name}>
      <Avatar profile={pullRequest.creator} size="large" {provider} />
    </span>
    {pullRequest.title}
  </div>
  <div class="reviewers">
    {#each pullRequest.reviewers as reviewer (reviewer.profile.id)}
      <span class="reviewer">
        <Reviewer {reviewer} {provider} />
      </span>
    {/each}
  </div>
</a>

<style>
  .pull-request {
    display: block;

    padding: 0.8rem 1.2rem;
    border-right: var(--hairline) solid var(--border);
    border-bottom: var(--hairline) solid var(--border);
    border-left: var(--hairline) solid var(--border);

    color: var(--text);
    text-decoration: none;

    background: var(--inset);
  }

  .pull-request:first-child {
    border-top: var(--hairline) solid var(--border);
    border-top-left-radius: 0.6rem;
    border-top-right-radius: 0.6rem;
  }

  .pull-request:last-child {
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

  .reviewers {
    display: flex;
    flex-wrap: wrap;
    place-content: flex-start flex-end;
  }

  .reviewer {
    margin-top: 0.5rem;
    margin-left: 1.2rem;
  }
</style>
