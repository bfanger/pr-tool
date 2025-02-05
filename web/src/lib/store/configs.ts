import { Observable } from "rxjs";
import { writable } from "svelte/store";
import type { ProviderConfig } from "$lib/streams/providers";
import storage from "$lib/services/storage";

const { subscribe, update } = writable<ProviderConfig[]>(
  storage.get("configs", []),
);
export default {
  subscribe,

  add(config: ProviderConfig) {
    update((state) => {
      const configs = [...state, config];
      storage.set("configs", configs);
      return configs;
    });
  },
  remove(config: ProviderConfig) {
    update((state) => {
      // projects.removeFrom(account.organization)
      const configs = state.filter((c) => c !== config);
      storage.set("configs", configs);
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
