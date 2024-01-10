<script lang="ts">
  import Button from "$lib/components/Button.svelte";

  if (
    typeof navigator !== "undefined" &&
    navigator.userAgent.match(/ Electron\//)
  ) {
    window.location.href = "/app";
  }
</script>

<div class="centered">
  <Button href="/app">Continue with web</Button>
</div>
<slot />

<style>
  .centered {
    padding-top: 4rem;
    text-align: center;
  }
</style>
