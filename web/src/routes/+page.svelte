<script lang="ts">
  import Button from "$lib/components/Button.svelte";

  if (
    typeof navigator !== "undefined" &&
    navigator.userAgent.match(/ Electron\//)
  ) {
    window.location.href = "/app";
  }
</script>

<!-- <Spinner /> -->
<div class="centered">
  <div>
    <Button
      href="https://smarttvteststorage.blob.core.windows.net/mauna3d/pr-notifications/PR%20notifications-darwin-x64.zip"
    >
      Download for macOS
    </Button>

    <Button
      href="https://smarttvteststorage.blob.core.windows.net/mauna3d/pr-notifications/PR%20notifications-win32-x64.zip"
    >
      Download for Windows
    </Button>
  </div>
  <br /><br />
  <Button href="/app">Continue with web</Button>
</div>
<slot />

<style>
  .centered {
    padding-top: 4rem;
    text-align: center;
  }
</style>
