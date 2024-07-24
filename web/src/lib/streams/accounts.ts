/* eslint-disable filenames/match-exported */
import { BehaviorSubject } from "rxjs";
import { map,shareReplay } from "rxjs/operators";
import drip from "../services/drip";
import { providersWithConfig$ } from "./providers";

export const progress$ = new BehaviorSubject(0);

const accounts$ = providersWithConfig$.pipe(
  drip(
    ({ config, provider }) =>
      provider
        .account()
        .pipe(map((account) => ({ account, provider, config }))),
    progress$,
  ),
  shareReplay(1),
);
export default accounts$;
