<script lang="ts">
  import BackButton from "$lib/components/BackButton.svelte";
  import Button from "../../../components/Button/Button.svelte";
  import Settings from "../../../components/Settings/Settings.svelte";
</script>

<div class="upgrade">
  <Button href="/v3/">Switch to version 3</Button>
</div>
<Settings />
<BackButton />

<style>
  .upgrade {
    padding: 0.8rem;
  }
</style>
