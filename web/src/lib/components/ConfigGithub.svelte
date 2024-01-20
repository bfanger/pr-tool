<script lang="ts">
  import Spinner from "./Spinner.svelte";
  import Button from "$lib/components/Button.svelte";
  import {
    PUBLIC_GITHUB_CLIENT_ID,
    PUBLIC_GITHUB_REDIRECT_URI,
  } from "$env/static/public";

  let authorizing = false;

  function authorize() {
    authorizing = true;
    const state = (Math.random() * 100000).toString(16);
    sessionStorage.setItem("github-oauth-state", state);
    const url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.set("client_id", PUBLIC_GITHUB_CLIENT_ID);
    url.searchParams.set("redirect_uri", PUBLIC_GITHUB_REDIRECT_URI);
    url.searchParams.set("scope", "read:user,repo");
    url.searchParams.set("state", state);
    window.location.href = url.toString();
  }
</script>

<div class="centered">
  <Button on:click={authorize} disabled={authorizing}>Authorize</Button>
  {#if authorizing}<Spinner />{/if}
</div>

<style>
  .centered {
    display: flex;
    justify-content: flex-end;
    grid-column: 2/3;
  }
</style>
