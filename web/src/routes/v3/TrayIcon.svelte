<script lang="ts">
  import rpc from "$lib/services/rpc";
  import archived from "../../platforms/archived";
  import type { Platform } from "../../platforms/types";

  type Props = {
    platforms: Platform[];
  };
  let { platforms }: Props = $props();

  let title = $derived.by(() => {
    let count = 0;
    for (const platform of platforms) {
      for (const task of platform.tasks) {
        if (task.attentionNeeded && archived.isActive(task)) {
          count++;
        }
      }
    }
    return count === 0 ? "" : `${count} PRs`;
  });
  type Icon = "default" | "busy" | "error";
  let previous: Icon = "busy";

  let icon: Icon = $derived.by(() => {
    for (const platform of platforms) {
      if (platform.progress === "error") {
        previous = "error";
        return "error";
      }
      if (
        platform.progress === "init" ||
        (platform.progress === "refreshing" && previous !== "default")
      ) {
        return "busy";
      }
    }
    previous = "default";
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
