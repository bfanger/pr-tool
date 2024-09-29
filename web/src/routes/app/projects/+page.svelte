<script lang="ts">
  import BackButton from "$lib/components/BackButton.svelte";
  import projects$, { progress$ } from "$lib/streams/projects";

  $: projects = $projects$;
  $: percentage = $progress$ * 100;
</script>

<div>Progress: {percentage}%</div>
<br />
{#each projects as { project }}
  <div class="project">{project.name}</div>
{/each}

<BackButton />
<slot />

<style>
  .project {
    padding: 0.4rem 1rem;
  }
</style>
