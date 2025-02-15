<script lang="ts">
  import { merge, Subject } from "rxjs";
  import { retry, tap } from "rxjs/operators";
  import type { ResultWithStatus } from "$lib/streams/pullRequests";
  import Button from "$lib/components/Button.svelte";
  import Progressbar from "$lib/components/Progressbar.svelte";
  import PullRequest from "$lib/components/PullRequest.svelte";
  import TabbedPanel from "$lib/components/TabbedPanel.svelte";
  import Warning from "$lib/components/Warning.svelte";
  import { progress$ as accountsProgress$ } from "$lib/streams/accounts";
  import documentVisible$ from "$lib/streams/documentVisible";
  import {
    groupByProject,
    progress$ as prProgress$,
    pullRequestsWithStatus$,
  } from "$lib/streams/pullRequests";

  const filterOptions = [
    { key: "relevant", label: "Relevant" },
    { key: "active", label: "Active" },
    { key: "all", label: "All" },
  ];
  let activeFilter = "relevant";
  let error: Error | null = null;

  const retry$ = new Subject<void>();

  const pullRequests$ = pullRequestsWithStatus$.pipe(
    tap({
      next() {
        error = null;
      },
      error(err) {
        error = err;
      },
    }),
    retry({ delay: () => merge(retry$, documentVisible$) }),
  );

  function filter(prs: ResultWithStatus[], type: string) {
    if (type === "relevant") {
      return prs.filter((item) => item.status.relevant);
    }
    if (type === "active") {
      return prs.filter((item) => item.status.active);
    }
    return prs;
  }
  $: filtered = filter($pullRequests$, activeFilter);
  $: projects = groupByProject(filtered);
  $: percentage = Math.round($accountsProgress$ * $prProgress$ * 100);
</script>

<TabbedPanel bind:active={activeFilter} tabs={filterOptions}>
  {#if error}
    <Warning message={error.message} />
    <div class="retry">
      <button on:click={() => retry$.next()}> Try again </button>
    </div>
  {:else if percentage !== 100}
    <div class="message">
      <Progressbar {percentage} />
    </div>
  {:else if projects.length === 0}
    <div class="message">No pull requests</div>
  {/if}

  {#each projects as { project, provider, pullRequests } (project.id)}
    <div class="pull-requests">
      <h2 class="title">{project.name}</h2>
      <div>
        {#each pullRequests as pullRequest (pullRequest.id)}
          <PullRequest {pullRequest} {provider} />
        {/each}
      </div>
    </div>
  {/each}
</TabbedPanel>
<div class="settings">
  <Button href="/v2/settings" small>Settings</Button>
</div>
<slot />

<style>
  .pull-requests {
    max-width: 100rem;
    margin-right: auto;
    margin-left: auto;
  }

  .title {
    margin-top: 2.2rem;
    margin-bottom: 1rem;

    font-size: 1.4rem;
    font-weight: normal;
    text-transform: uppercase;
    letter-spacing: 0.2px;
  }

  .message {
    padding: 2rem;
    font-size: 1.6rem;
    text-align: center;
  }

  .settings {
    position: absolute;
    top: 0.5rem;
    right: 1rem;
  }

  .retry {
    text-align: center;
  }
</style>
