import { createContext } from "svelte";
import type { Platform } from "../platforms/types";

const [getPlatformsContext, setPlatformsContext] = createContext<{
  current: Platform[];
  promise: Promise<void>;
  refreshAll: (reason: string) => Promise<void>;
}>();
export { getPlatformsContext, setPlatformsContext };
