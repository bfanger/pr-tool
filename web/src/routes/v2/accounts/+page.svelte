<script lang="ts">
  import AddConfig from "$lib/components/AddConfig.svelte";
  import Avatar from "$lib/components/Avatar.svelte";
  import BackButton from "$lib/components/BackButton.svelte";
  import Button from "$lib/components/Button.svelte";
  import configs from "$lib/store/configs";
  import accounts$, { progress$ } from "$lib/streams/accounts";

  $: accounts = $accounts$;
  $: percentage = $progress$ * 100;
</script>

<div>Progress: {percentage}%</div>
<br />
{#each accounts as { provider, account, config }}
  <div class="account">
    <span>{provider.name}</span>
    <Avatar profile={account} {provider} />
    <span>{account.name}</span>
    <span class="button">
      <Button on:click={() => configs.remove(config)}>Remove</Button>
    </span>
  </div>
{/each}
<hr />
<AddConfig />
<BackButton />
<slot />

<style>
  .account {
    display: flex;
    margin-bottom: 1.6rem;
  }

  .button {
    margin-left: auto;
  }
</style>
