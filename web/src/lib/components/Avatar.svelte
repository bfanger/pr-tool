<script lang="ts">
  import { of, ReplaySubject } from "rxjs";
  import { startWith, switchMap } from "rxjs/operators";
  import type { Profile } from "$lib/models/Profile";
  import type { Provider } from "$lib/models/Provider";
  import placeholder from "../../assets/img/avatar-placeholder.svg";

  export let profile: Profile;
  export let provider: Provider;
  export let size = "medium";
  export let loaded = false;
  type Config = {
    provider: Provider;
    profile: Profile;
    size: string;
  };
  const config$ = new ReplaySubject<Config>(1);
  $: config$.next({ provider, profile, size });

  const src$ = config$.pipe(
    switchMap((config) => {
      if (!config.provider || !config.profile) {
        return of(placeholder);
      }
      return config.provider
        .avatar(config.profile, config.size)
        .pipe(startWith(placeholder));
    }),
  );
</script>

<img
  src={$src$}
  on:load={() => {
    loaded = true;
  }}
  alt={profile.name}
  class:medium={size === "medium"}
  class:large={size === "large"}
/>

<style>
  img {
    display: inline-block;
    overflow: hidden;
    border-radius: 50%;
  }
  .large {
    width: 40px;
    height: 40px;
  }
  .medium {
    width: 2.4rem;
    height: 2.4rem;
  }
</style>
