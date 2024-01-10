<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import TextInput from "./TextInput.svelte";
  import type { ProviderConfig } from "$lib/streams/providers";
  import type { BitbucketProviderAuth } from "$lib/models/bitbucket/BitbucketProvider";

  const dispatch = createEventDispatcher();
  const proxyAvailable = !!window.rpc;
  const auth: BitbucketProviderAuth = {
    domain: "",
    personalAccessToken: "",
    proxy: proxyAvailable,
  };
  $: {
    const config: ProviderConfig = {
      type: "bitbucket",
      auth: { ...auth },
    };
    dispatch("config", config);
  }
</script>

<TextInput
  id="bitbucket-domain"
  label="Domain"
  bind:value={auth.domain}
  placeholder="bitbucket.com"
>
  {#if proxyAvailable}
    <label class="label"
      ><input type="checkbox" bind:checked={auth.proxy} />
      Disable CORS</label
    >
  {:else}Setup the bitbucket server to allow CORS requests{/if}
</TextInput>

<TextInput
  id="bitbucket-private-token"
  type="textarea"
  label="Personal Access Token"
  bind:value={auth.personalAccessToken}
  placeholder="abcdefghijklmnopqrst"
>
  <div>
    Create a
    <a
      href={auth.domain
        ? `https://${auth.domain}/plugins/servlet/access-tokens/manage`
        : "https://confluence.atlassian.com/bitbucketserver/personal-access-tokens-939515499.html"}
      target="_blank"
      rel="noreferrer"
    >
      personal access token
    </a>
  </div>
</TextInput>

<style>
  .label {
    font-size: 1.3rem;
    line-height: 1.2;
    user-select: none;
  }
</style>
