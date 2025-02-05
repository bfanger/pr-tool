<script lang="ts">
  import { BehaviorSubject } from "rxjs";
  import { debounceTime, map, startWith, switchMap, tap } from "rxjs/operators";
  import type { ProviderConfig } from "$lib/streams/providers";
  import configs from "$lib/store/configs";
  import { providerFromConfig } from "$lib/streams/providers";
  import azurePng from "../../assets/img/azure-devops.png";
  import bitbucketPng from "../../assets/img/bitbucket.png";
  import githubSvg from "../../assets/img/github.svg";
  import gitlabPng from "../../assets/img/gitlab.png";
  import Button from "./Button.svelte";
  import ConfigAzureDevops from "./ConfigAzureDevops.svelte";
  import ConfigBitbucket from "./ConfigBitbucket.svelte";
  import ConfigGithub from "./ConfigGithub.svelte";
  import ConfigGitlab from "./ConfigGitlab.svelte";

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

  $: activeProvider = providers.find(
    (p) => p.type === type,
  ) as (typeof providers)[number];

  const config$ = new BehaviorSubject<ProviderConfig | undefined>(undefined);

  const valid$ = config$.pipe(
    debounceTime(500),
    tap(() => {
      loading = true;
    }),
    switchMap((config) => providerFromConfig(config!).valid()),
    startWith(false),
    map((err) => {
      if (typeof err === "boolean") {
        return { error: null, disabled: !err };
      }
      return { error: err, disabled: true };
    }),
    tap(() => {
      loading = false;
    }),
  );

  $: status = $valid$;
  function submit() {
    if (status.disabled) {
      return;
    }
    configs.add($config$!);
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
      this={activeProvider.Component}
      on:config={({ detail }) => config$.next(detail)}
    />
  </div>
  {#if activeProvider.type !== "github"}
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

<style>
  .title {
    margin-top: 0;
    font-size: 1.7rem;
    font-weight: bold;
  }

  .icon {
    width: 1.6rem;
    height: 1.6rem;
    margin-right: 0.4rem;
    margin-left: 0.2rem;
  }

  .form {
    max-width: 750px;
    padding: 1.2rem;
  }

  .fields {
    display: grid;
    grid-gap: 1rem;
    grid-template-columns: 1fr 100fr;
  }

  .providers {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .radio-label {
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    margin-right: 0.8rem;
  }

  .label {
    min-width: 16rem;

    font-size: 1.3rem;
    line-height: 2.1rem;
    text-align: right;
    white-space: nowrap;
  }

  .buttons {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
  }

  .error {
    font-weight: bold;
    color: red;
  }

  .valid {
    font-weight: bold;
    color: green;
  }
</style>
