<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { AzureDevopsProviderAuth } from "$lib/models/azure-devops/AzureDevopsProvider";
  import type { ProviderConfig } from "$lib/streams/providers";
  import TextInput from "./TextInput.svelte";

  const dispatch = createEventDispatcher();

  export let auth: AzureDevopsProviderAuth = {
    organization: "",
    personalAccessToken: "",
  };
  $: {
    const config: ProviderConfig = {
      type: "azure-devops",
      auth: { ...auth },
    };
    dispatch("config", config);
  }
</script>

<TextInput
  id="azure-organisation"
  label="Organization"
  bind:value={auth.organization}
  placeholder="tenant"
/>
<TextInput
  id="azure-personal-access-token"
  type="textarea"
  label="Personal Access Token"
  bind:value={auth.personalAccessToken}
  placeholder="abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnop"
>
  Create a
  <a
    href="https://dev.azure.com/{auth.organization}/_usersSettings/tokens"
    target="_blank"
    rel="noreferrer"
  >
    personal access token
  </a>
  , see the
  <a
    href="https://docs.microsoft.com/nl-nl/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&viewFallbackFrom=vsts&tabs=preview-page#create-personal-access-tokens-to-authenticate-access"
    target="_blank"
    rel="noreferrer"
  >
    guide
  </a>
  and enable the
  <strong>Code.Read</strong>
  and
  <strong>Graph.Read</strong>
  scopes.
</TextInput>
