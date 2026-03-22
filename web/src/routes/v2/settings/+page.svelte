<script lang="ts">
  import BackButton from "$lib/components/BackButton.svelte";
  import Button from "../../../components/Button/Button.svelte";
  import Settings from "../../../components/Settings/Settings.svelte";
</script>

<Settings />
<BackButton />
<div class="upgrade">
  <Button href="/v3/">Upgrade to version 3</Button>
</div>

<style>
  .upgrade {
    margin-top: 2rem;
    text-align: center;
  }
</style>
