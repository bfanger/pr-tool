<script lang="ts">
  import Avatar from "./Avatar.svelte";
  import Reviewer from "./Reviewer.svelte";
  import type { PullRequest } from "$lib/models/PullRequest";
  import type { Provider } from "$lib/models/Provider";

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

<style lang="scss">
  @import "../../styling/helpers.scss";
  .pull-request {
    display: block;
    color: var(--text);
    text-decoration: none;
    background: var(--inset);
    padding: 0.8rem 1.2rem;
    @include hairline(var(--border), -bottom);
    @include hairline(var(--border), -left);
    @include hairline(var(--border), -right);
  }
  .pull-request:first-child {
    @include hairline(var(--border), -top);
    border-top-left-radius: 0.6rem;
    border-top-right-radius: 0.6rem;
  }
  .pull-request:last-child {
    border-bottom-left-radius: 0.6rem;
    border-bottom-right-radius: 0.6rem;
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
    align-content: flex-start;
    justify-content: flex-end;
  }
  .reviewer {
    margin-left: 1.2rem;
    margin-top: 0.5rem;
  }
</style>
