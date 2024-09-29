/**
 * All projects of all providers
 */

import { BehaviorSubject } from "rxjs";
import { map, shareReplay } from "rxjs/operators";
import dripFlat from "../services/dripFlat";
import providers$ from "./providers";

export const progress$ = new BehaviorSubject(0);

export default providers$.pipe(
  dripFlat(
    (provider) =>
      provider
        .projects()
        .pipe(
          map((projects) => projects.map((project) => ({ project, provider }))),
        ),
    progress$,
  ),
  shareReplay(1),
);
