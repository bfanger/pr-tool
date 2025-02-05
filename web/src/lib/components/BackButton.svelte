<script lang="ts">
  import Button from "./Button.svelte";
</script>

<div class="back-button">
  <Button small href="/app">Back</Button>
</div>

<style>
  .back-button {
    position: absolute;
    top: 0.5rem;
    right: 1rem;
  }
</style>
