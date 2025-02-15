<script lang="ts">
  import { z } from "zod";
  import storage from "../../services/storage.svelte";

  const item1 = storage("test", z.number().catch(0));
  const item2 = storage("test", z.number().catch(0));
</script>

{item1.value} <button onclick={() => item1.value++}>+1</button>
{item2.value} <button onclick={() => item2.value++}>+1</button>
