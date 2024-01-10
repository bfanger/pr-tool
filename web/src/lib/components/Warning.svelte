<script lang="ts">
  export let message: string;
</script>

<section class="warning">
  <h2>Oops! an error occurred.</h2>
  <p>{message}</p>
</section>

<style>
  .warning {
    text-align: center;
    background: var(--error-background);
    color: var(--error-text);
    border-radius: 1rem;
    margin: 1rem;
    padding-top: 1px;
    padding-bottom: 1rem;
  }
</style>
