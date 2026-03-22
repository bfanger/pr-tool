<script lang="ts">
  const { children } = $props();
</script>

<header class="header">
  {@render children()}
</header>

<style>
  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    padding: 0.8rem;
    border-bottom: 1px solid light-dark(#c9c9c9, #000);

    background: light-dark(#dfdedf, #4c4b4b);
  }
</style>
