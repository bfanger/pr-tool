<script lang="ts">
  import RefreshTrigger from "../RefreshButton.svelte";
  import Onboarding from "../../../components/Onboarding/Onboarding.svelte";
  import Button from "../../../components/Button/Button.svelte";
  import { getPlatformsContext } from "../../../services/platformContext-fns";
  import Header from "../../../components/Header/Header.svelte";

  let { children } = $props();
  const platforms = getPlatformsContext();
</script>

{#if platforms.current.length === 0}
  <Onboarding />
{:else}
  <Header>
    <div>
      <RefreshTrigger />
    </div>
    <div>
      <Button href="/v3/settings">Settings</Button>
    </div>
  </Header>
  <main class="content">
    {@render children()}
  </main>
{/if}

<style>
  .content {
    padding: 0.8rem;
  }
</style>
