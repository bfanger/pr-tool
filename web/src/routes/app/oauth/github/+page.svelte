<script lang="ts">
  import { firstValueFrom } from "rxjs";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import Spinner from "$lib/components/Spinner.svelte";
  import Warning from "$lib/components/Warning.svelte";
  import githubApi from "$lib/services/githubApi.js";
  import configs from "$lib/store/configs";

  export let data;

  onMount(async () => {
    if (data.accessToken) {
      const me = await firstValueFrom(
        githubApi.get("user", { accessToken: data.accessToken }),
      );
      configs.add({
        type: "github",
        auth: { login: me.login, accessToken: data.accessToken },
      });
      goto("/app");
    }
  });
</script>

{#if data.accessToken}
  <Spinner />
{:else}
  <Warning message={data.error!} />
{/if}
