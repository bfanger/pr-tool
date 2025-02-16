<script lang="ts">
  import { configsSchema } from "../../platforms/types";
  import storage from "../../services/storage.svelte";
  import gitlab from "../../platforms/gitlab.svelte";
  import legacy from "../../platforms/legacy.svelte";
  import { setContext } from "svelte";
  import TrayIcon from "./TrayIcon.svelte";
  import RefreshTrigger from "./RefreshTrigger.svelte";
  import Onboarding from "../../components/Onboarding/Onboarding.svelte";
  import Button from "../../components/Button/Button.svelte";
  import github from "../../platforms/github.svelte";

  let { children } = $props();

  const storedConfigs = storage("configs", configsSchema);
  let platforms = $derived(
    storedConfigs.value.map((config) => {
      if (config?.type === "gitlab") {
        return gitlab(config);
      } else if (config?.type === "github") {
        return github(config);
      } else if (config) {
        return legacy(config);
      }
      throw new Error(`Unsupported platform: ${(config as any)?.type}`);
    }),
  );

  setContext("platforms", {
    get platforms() {
      return platforms;
    },
  });
</script>

{#if platforms.length > 0}
  <TrayIcon {platforms} />
  <div class="layout">
    {#key platforms}
      <header class="header">
        <div>
          <RefreshTrigger {platforms} />
        </div>
        <div>
          <Button href="/v3/settings">Settings</Button>
        </div>
      </header>
    {/key}
    <main class="content">
      {@render children()}
    </main>
  </div>
{:else}
  <div class="layout">
    <Onboarding />
  </div>
{/if}

<style>
  .layout {
    box-sizing: border-box;
    max-width: 100rem;
    min-height: 100%;
    margin-right: auto;
    margin-left: auto;

    font-family: var(--font);
    font-size: 1.4rem;
    color: var(--color);
    letter-spacing: 0.1px;

    background: var(--background);

    @media (prefers-color-scheme: light) {
      --background: #ebebeb;
      --color: #242424;
    }

    @media (prefers-color-scheme: dark) {
      --background: #282727;
      --color: #e9e9e9;
    }
  }

  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 0.8rem;

    @media (prefers-color-scheme: light) {
      border-bottom: 1px solid #c9c9c9;
      background: #dfdedf;
    }

    @media (prefers-color-scheme: dark) {
      border-bottom: 1px solid #000;
      background: #4c4b4b;
    }
  }

  .content {
    padding: 0.8rem;
  }
</style>
