<script lang="ts">
  import type { Provider } from "$lib/models/Provider";
  import type { Reviewer } from "$lib/models/PullRequest";
  import approvedSvg from "../../assets/img/approved.svg?no-inline";
  import Avatar from "./Avatar.svelte";

  export let reviewer: Reviewer;
  export let provider: Provider;

  const icons = {
    "": false,
    APPROVED: approvedSvg,
  };
  $: profile = reviewer.profile;
  $: icon = icons[reviewer.icon];
</script>

<div class="reviewer">
  <div class="avatar-and-icon">
    <div class="avatar" class:has-icon={reviewer.icon}>
      <Avatar {profile} size="medium" {provider} />
    </div>
    {#if icon}
      <div class="icon" style="background-image:url('{icon}')"></div>
    {/if}
  </div>
  <div>
    <div class="name">{profile.name}</div>
    <div class="status">{reviewer.status}</div>
  </div>
</div>

<style>
  .reviewer {
    display: flex;
    white-space: nowrap;
  }

  .avatar-and-icon {
    position: relative;
    flex-shrink: 0;
    padding-right: 0.4rem;
  }

  .avatar.has-icon {
    opacity: 0.7;
  }

  .icon {
    position: absolute;
    right: 0.2rem;
    bottom: 0.2rem;

    width: 1.6rem;
    height: 1.6rem;
    border-radius: 50%;

    background: #808080;
    box-shadow: 1px 1px 3px rgb(0 0 0 / 40%);
  }

  .name {
    font-size: 1.2rem;
  }

  .status {
    font-size: 1rem;
    color: var(--muted);
    letter-spacing: 0;
  }
</style>
