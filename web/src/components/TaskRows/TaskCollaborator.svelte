<script lang="ts">
  import completedSvg from "./completed.svg?no-inline";
  import type { Collaborator } from "../../platforms/types";
  import Avatar from "../Avatar/Avatar.svelte";

  type Props = {
    collaborator: Collaborator;
  };
  let { collaborator }: Props = $props();

  type Status = NonNullable<Collaborator["icon"]>;
  const icons: Record<Status, string> = {
    completed: completedSvg,
  };
  let avatar = $derived(collaborator.getAvatar("medium"));
  let icon = $derived(icons[collaborator.icon as Status]);
</script>

<div class="collaborator">
  <div class="avatar-and-icon">
    <div class="avatar" class:has-icon={icon}>
      <Avatar src={avatar} size="medium" />
    </div>
    {#if icon}
      <div class="icon" style="background-image:url('{icon}')"></div>
    {/if}
  </div>
  <div>
    <div class="name">{collaborator.name}</div>
    <div class="status">{collaborator.status}</div>
  </div>
</div>

<style>
  .collaborator {
    display: flex;
    align-items: center;

    margin-top: 0.5rem;
    margin-left: 1.2rem;

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
    margin-top: -4px;
    font-size: 1.2rem;
  }

  .status {
    font-size: 1rem;
    color: var(--muted);
    letter-spacing: 0;
  }
</style>
