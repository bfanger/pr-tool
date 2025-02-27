<script lang="ts">
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import Button from "../../../../components/Button/Button.svelte";
  import Warning from "$lib/components/Warning.svelte";
  import { z } from "zod";
  import { configsSchema, type JiraConfig } from "../../../../platforms/types";
  import storage from "../../../../services/storage.svelte";
  import { goto } from "$app/navigation";
  import { jiraLogin } from "../../../../platforms/jira.svelte";

  const storedConfigs = storage("configs", configsSchema);

  let { data } = $props();

  onMount(async () => {
    if (data.accessToken && data.refreshToken) {
      const response = await fetch(
        "https://api.atlassian.com/oauth/token/accessible-resources",
        { headers: { Authorization: `Bearer ${data.accessToken}` } },
      );
      const resources = z
        .array(
          z.object({
            id: z.string(),
            url: z.string(),
            scopes: z.array(z.string()),
          }),
        )
        .parse(await response.json());

      localStorage.setItem("app_jira_accessToken", data.accessToken);
      localStorage.setItem("app_jira_refreshToken", data.refreshToken);

      for (const resource of resources) {
        const exists = storedConfigs.value.some(
          (config) => config?.type === "jira" && config.cloudid === resource.id,
        );
        if (!exists) {
          const config: JiraConfig = {
            type: "jira",
            cloudid: resource.id,
            domain: resource.url,
          };
          storedConfigs.value.push(config);
        }
      }
      storedConfigs.value = storedConfigs.value;
      await goto("/app");
    }
  });
</script>

{#if data.error}
  <Warning message={data.error} />
  {#if browser}
    <div class="button">
      <Button onclick={() => void jiraLogin()}>Try again&hellip;</Button>
    </div>
  {/if}
{/if}

<style>
  .button {
    margin-top: 1rem;
    text-align: center;
  }
</style>
