<script lang="ts">
  import configs from "$lib/store/configs";
  import { providerFromConfig } from "$lib/streams/providers";
  import { Subject } from "rxjs";
  import { switchMap, debounceTime, map, tap, startWith } from "rxjs/operators";
  import ConfigAzureDevops from "./ConfigAzureDevops.svelte";
  import azurePng from "../../assets/img/azure-devops.png";
  import ConfigGitlab from "./ConfigGitlab.svelte";
  import Button from "./Button.svelte";
  import gitlabPng from "../../assets/img/gitlab.png";
  import ConfigBitbucket from "./ConfigBitbucket.svelte";
  import bitbucketPng from "../../assets/img/bitbucket.png";
  import ConfigGithub from "./ConfigGithub.svelte";
  import githubSvg from "../../assets/img/github.svg";
  import type { ProviderConfig } from "$lib/streams/providers";

  let type: ProviderConfig["type"] = "azure-devops";
  let loading = false;

  const providers = [
    {
      type: "azure-devops",
      icon: azurePng,
      label: "Azure DevOps",
      Component: ConfigAzureDevops,
    },
    {
      type: "gitlab",
      icon: gitlabPng,
      label: "GitLab",
      Component: ConfigGitlab,
    },
    {
      type: "github",
      icon: githubSvg,
      label: "GitHub",
      Component: ConfigGithub,
    },
    {
      type: "bitbucket",
      icon: bitbucketPng,
      label: "Bitbucket",
      Component: ConfigBitbucket,
    },
  ];

  $: provider = providers.find(
    (p) => p.type === type
  ) as (typeof providers)[number];

  const config$ = new Subject<ProviderConfig>();

  const valid$ = config$.pipe(
    debounceTime(500),
    tap(() => {
      loading = true;
    }),
    switchMap((config) => providerFromConfig(config).valid()),
    startWith(false),
    map((err) => {
      if (typeof err === "boolean") {
        return { error: null, disabled: !err };
      }
      return { error: err, disabled: true };
    }),
    tap(() => {
      loading = false;
    })
  );

  $: status = $valid$;
  function submit() {
    if (status.disabled) {
      return;
    }
    configs.add($config$);
  }
</script>

<form class="form" on:submit|preventDefault={submit}>
  <h1 class="title">Add an account</h1>

  <div class="fields">
    <label class="label" for="add-config-provider">Provider:</label>
    <div class="providers">
      {#each providers as provider}
        <label class="radio-label">
          <input
            id="add-config-provider"
            name="type"
            type="radio"
            bind:group={type}
            value={provider.type}
          />
          <img class="icon" src={provider.icon} alt="" />
          {provider.label}
        </label>
      {/each}
    </div>
    <svelte:component
      this={provider.Component}
      on:config={({ detail }) => config$.next(detail)}
    />
  </div>
  {#if provider.type !== "github"}
    <div class="buttons">
      <Button disabled={status.disabled}>Add account</Button>
    </div>
  {/if}

  {#if loading}
    <div>Loading...</div>
  {:else if status.disabled === false}
    <div class="valid">Valid</div>
  {:else if status.error}
    <div class="error">{status.error.message}</div>
  {/if}
</form>

<style lang="scss">
  .title {
    font-size: 1.7rem;
    font-weight: bold;
    margin-top: 0;
  }
  .icon {
    width: 1.6rem;
    height: 1.6rem;
    margin-left: 0.2rem;
    margin-right: 0.4rem;
  }
  .form {
    padding: 1.2rem;
    max-width: 750px;
  }
  .fields {
    display: grid;
    grid-template-columns: 1fr 100fr;
    grid-gap: 1rem;
  }
  .providers {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .radio-label {
    display: inline-flex;
    align-items: center;
    margin-right: 0.8rem;
    cursor: pointer;
  }
  .label {
    white-space: nowrap;
    font-size: 1.3rem;
    line-height: 2.1rem;
    text-align: right;
    min-width: 16rem;
  }
  .buttons {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
  }
  .error {
    color: red;
    font-weight: bold;
  }
  .valid {
    color: green;
    font-weight: bold;
  }
</style>
