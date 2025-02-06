<script lang="ts">
  let { children } = $props();
</script>

<div class="layout">
  {@render children()}
</div>

<style>
  .layout {
    box-sizing: border-box;
    min-height: 100%;

    font-family: var(--font);
    font-size: 1.4rem;
    letter-spacing: 0.1px;
  }
</style>
