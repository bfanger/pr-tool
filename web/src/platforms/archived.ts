import { z } from "zod";
import storage from "../services/storage.svelte";
import type { Group, Task } from "./types";

const store = storage("archived", z.record(z.string(), z.number()).catch({}));

const archived = {
  archive: (group: Group, timestamp: number) => {
    store.value = { ...store.value, [group.id]: timestamp };
  },
  isActive: (task: Task) => {
    const maxTimestamp = store.value[task.getGroup().id];
    if (maxTimestamp && task.timestamp <= maxTimestamp) {
      return false;
    }
    return true;
  },
  get hasItems() {
    return Object.keys(store.value).length > 0;
  },
  reset: () => {
    store.value = {};
  },
};
export default archived;
