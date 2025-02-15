import { Observable } from "rxjs";
import { writable } from "svelte/store";
import type { ProviderConfig } from "$lib/streams/providers";
import { z } from "zod";
import storage from "../../services/storage.svelte";

const { subscribe, update } = writable<ProviderConfig[]>(
  storage("configs", z.array(z.any()).catch([])).value,
);
export default {
  subscribe,

  add(config: ProviderConfig) {
    update((state) => {
      const configs = [...state, config];
      // storage.set("configs", configs);
      storage("configs", z.array(z.any()).catch([])).value = configs;
      return configs;
    });
  },
  remove(config: ProviderConfig) {
    update((state) => {
      // projects.removeFrom(account.organization)
      const configs = state.filter((c) => c !== config);
      storage("configs", z.array(z.any()).catch([])).value = configs;
      // storage.set("configs", configs);
      return configs;
    });
  },

  /**
   *  Store as RxJS observable
   */
  rx(): Observable<ProviderConfig[]> {
    return new Observable((observer) =>
      subscribe((configs) => {
        observer.next(configs);
      }),
    );
  },
};
