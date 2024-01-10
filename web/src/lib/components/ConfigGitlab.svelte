<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import TextInput from "./TextInput.svelte";
  import type { ProviderConfig } from "$lib/streams/providers";
  import type { GitlabProviderAuth } from "$lib/models/gitlab/GitlabProvider";

  const dispatch = createEventDispatcher();

  const auth: GitlabProviderAuth = {
    domain: "",
    privateToken: "",
  };
  $: {
    const config: ProviderConfig = {
      type: "gitlab",
      auth: { ...auth },
    };
    dispatch("config", config);
  }
</script>

<TextInput
  id="Gitlab-domain"
  label="Domain"
  bind:value={auth.domain}
  placeholder="gitlab.com"
/>
<TextInput
  id="gitlab-private-token"
  type="textarea"
  label="Private Token"
  bind:value={auth.privateToken}
  placeholder="abcdefghijklmnopqrst"
>
  Create a
  <a
    href="https://{auth.domain}/profile/personal_access_tokens"
    target="_blank"
    rel="noreferrer"
  >
    personal access token
  </a>
  with the
  <strong>api</strong>
  scope.
</TextInput>
