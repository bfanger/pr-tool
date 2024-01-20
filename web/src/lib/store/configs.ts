import { writable } from "svelte/store";
import { Observable } from "rxjs";
import storage from "$lib/services/storage";
import type { ProviderConfig } from "$lib/streams/providers";

const { subscribe, update } = writable<ProviderConfig[]>(
  storage.get("configs", []),
);
export default {
  subscribe,

  async add(config: ProviderConfig) {
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
