<script lang="ts">
  import Avatar from "../..//components/Avatar.svelte";
  import Todo from "../../components/Todo.svelte";
  import gitlab from "../../platforms/gitlab.svelte";
  import { configsSchema } from "../../platforms/types";
  import storage from "../../services/storage.svelte";
  import Refresh from "./Refresh.svelte";

  const storedConfigs = storage("configs", configsSchema);
  let platforms = $derived(
    storedConfigs.value.map((config) => {
      if (config?.type === "gitlab") {
        return gitlab(config);
      }
      throw new Error(`Unsupported platform: ${config?.type}`);
    }),
  );
</script>

{#key platforms}
  <Refresh {platforms} />
{/key}

{#each platforms as platform}
  {@const { status, items } = platform.getActiveTodos()}

  <div>Platform status: {platform.status}</div>
  <div>Active Todos status: {status}</div>
  <div>Active: {platform.stats.active}</div>
  <div>
    {#each items as item}
      {@const { author } = item.getAuthor()}
      <Todo href={item.url} title={item.title}>
        {#snippet avatar()}
          {#if author}
            {@const { url } = author.getAvatar("large")}
            {#if url}
              <Avatar src={url} title={author.name} size="large" />
            {/if}
          {/if}
        {/snippet}
      </Todo>
    {/each}
  </div>
{/each}
