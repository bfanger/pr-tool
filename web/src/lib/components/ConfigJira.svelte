<script lang="ts">
  import Button from "../../components/Button/Button.svelte";
  import Spinner from "../../components/Spinner/Spinner.svelte";
  import { jiraLogin } from "../../platforms/jira.svelte";

  const authorizing = $state(false);
</script>

<div class="centered">
  <Button disabled={authorizing} onclick={() => void jiraLogin()}>
    Authorize&hellip;
  </Button>
  {#if authorizing}
    <Spinner />
  {/if}
</div>

<style>
  .centered {
    display: flex;
    grid-column: 2/3;
    justify-content: flex-end;
  }
</style>
