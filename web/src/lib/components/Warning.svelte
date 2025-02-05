<script lang="ts">
  export let message: string;
</script>

<section class="warning">
  <h2>Oops! an error occurred.</h2>
  <p>{message}</p>
</section>

<style>
  .warning {
    margin: 1rem;
    padding-top: 1px;
    padding-bottom: 1rem;
    border-radius: 1rem;

    color: var(--error-text);
    text-align: center;

    background: var(--error-background);
  }
</style>
