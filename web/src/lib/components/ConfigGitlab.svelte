<script lang="ts">
  import type { ProviderConfig } from "$lib/streams/providers";
  import { createEventDispatcher } from "svelte";
  import extractDomain from "../../services/extractDomain";
  import TextInput from "./TextInput.svelte";

  const dispatch = createEventDispatcher();

  let domain = $state("");
  let privateToken = $state("");

  let config: ProviderConfig = $derived({
    type: "gitlab",
    auth: { domain: extractDomain(domain) || "gitlab.com", privateToken },
  });

  $effect(() => {
    dispatch("config", config);
  });
</script>

<TextInput
  id="Gitlab-domain"
  label="Domain"
  bind:value={domain}
  placeholder="gitlab.com"
/>
<TextInput
  id="gitlab-private-token"
  type="textarea"
  label="Private Token"
  bind:value={privateToken}
  placeholder="glpat-abcdefghijklmnopqrst"
>
  Create a
  <a
    href="https://{domain || 'gitlab.com'}/profile/personal_access_tokens"
    target="_blank"
    rel="noreferrer"
  >
    personal access token
  </a>
  with the
  <strong>api</strong>
  scope.
</TextInput>
