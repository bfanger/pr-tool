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
    overflow: hidden;

    width: 20rem;
    max-width: 60%;
    height: 0.6rem;
    margin-right: auto;
    margin-left: auto;
    border-radius: 1rem;

    background: var(--progressbar-bar);
  }

  .progress {
    will-change: transform;

    transform-origin: left center;

    width: 100%;
    height: 100%;

    background-color: var(--progressbar-progress);
  }
</style>
