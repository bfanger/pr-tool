<script lang="ts">
  import rpc from "$lib/services/rpc";
  import type { Platform } from "../../platforms/types";

  type Props = {
    platforms: Platform[];
  };
  let { platforms }: Props = $props();

  let title = $derived.by(() => {
    let count = 0;
    for (const platform of platforms) {
      for (const task of platform.tasks) {
        if (task.attentionNeeded) {
          count++;
        }
      }
    }
    return count === 0 ? "" : `${count} PRs`;
  });

  let icon: "default" | "busy" | "error" = $derived.by(() => {
    for (const platform of platforms) {
      if (platform.progress === "error") {
        return "error";
      }
      if (platform.progress === "init") {
        return "busy";
      }
    }
    return "default";
  });

  $effect(() => {
    rpc.send("title", title);
  });
  $effect(() => {
    rpc.send("icon", icon);
  });
</script>

<svelte:head>
  <title>[{icon}] {title}</title>
</svelte:head>
