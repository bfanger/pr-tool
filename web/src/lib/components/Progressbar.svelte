<script lang="ts">
  export let percentage: number;
</script>

<div class="bar">
  <div
    class="progress"
    style="transform: scaleX({Math.max(1, percentage) / 100})"
  ></div>
</div>

<style>
  .bar {
    margin-left: auto;
    margin-right: auto;
    width: 20rem;
    max-width: 60%;
    border-radius: 1rem;
    overflow: hidden;
    background: var(--progressbar-bar);
    height: 0.6rem;
  }
  .progress {
    height: 100%;
    width: 100%;
    will-change: transform;
    transform-origin: left center;
    background-color: var(--progressbar-progress);
  }
</style>
