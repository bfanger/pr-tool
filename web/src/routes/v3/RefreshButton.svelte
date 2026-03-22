<script lang="ts">
  import Button from "../../components/Button/Button.svelte";
  import { getPlatformsContext } from "../../services/platformContext-fns";

  const platforms = getPlatformsContext();
</script>

<Button onclick={() => platforms.refreshAll("Manual refresh")}>Refresh</Button>
{#await platforms.promise}
  Refreshing...
{/await}

{#each platforms.current as platform}
  {#if platform.progress === "error"}
    <div class="error-row">
      {#if platform.icon}
        <img class="icon" src={platform.icon} alt="" />
      {/if}
      <span>Failed</span>
      <Button onclick={() => platform.refresh("Manual Retry")}>Retry</Button>
    </div>
  {/if}
{/each}

<style>
  .error-row {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-block: 4px;
  }

  .icon {
    width: 1.6rem;
  }
</style>
