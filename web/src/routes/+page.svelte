<script lang="ts">
  import Button from "../components/Button/Button.svelte";

  if (
    typeof navigator !== "undefined" &&
    navigator.userAgent.match(/ Electron\//)
  ) {
    window.location.href = "/app";
  }
</script>

<div class="centered">
  <Button href="/app">Continue with web</Button>

  <a class="link" href="https://github.com/bfanger/pr-tool/releases">
    Download the desktop app&hellip;
  </a>
</div>
<slot />

<style>
  .centered {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;

    padding-top: 4rem;
  }

  .link {
    font:
      500 1.4rem "SF Pro Display",
      var(--font);
    color: #2b67d4;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
</style>
