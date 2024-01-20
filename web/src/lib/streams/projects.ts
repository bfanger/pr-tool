/**
 * All projects of all providers
 */

import { shareReplay, map } from "rxjs/operators";
import { BehaviorSubject } from "rxjs";
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
