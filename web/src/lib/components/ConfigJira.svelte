<script lang="ts">
  import { browser } from "$app/environment";
  import Button from "../../components/Button/Button.svelte";
  import { jiraLoginUrl } from "../../platforms/jira-api";
</script>

<div class="centered">
  {#if browser}
    <Button href={jiraLoginUrl()}>Authorize&hellip;</Button>
  {/if}
</div>

<style>
  .centered {
    display: flex;
    grid-column: 2/3;
    justify-content: flex-end;
  }
</style>
