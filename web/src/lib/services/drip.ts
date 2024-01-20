import { combineLatest, Observable, of } from "rxjs";
import type { Observer } from "rxjs";
import { switchMap, startWith, map } from "rxjs/operators";

type Empty = unknown;
const emptyRef: Empty = {};
/**
 * Takes an Observable which emits arrays, convert each item of the array into an observable with the transform function.
 * emits values as they come in.
 *
 * @param progress An optional progress observer:
 *   1 = all observables emitted al least once
 *   0 = no values emitted yet
 *   0.5 = 50% of the observables emitted a value
 */
export default function drip<I, O>(
  transform: (i: I) => Observable<O>,
  progress?: Observer<number>,
) {
  return (input: Observable<I[]>) =>
    input.pipe(
      switchMap((items) => {
        if (items.length === 0) {
          if (progress) {
            progress.next(1);
          }
          return of([]);
        }
        return combineLatest(
          items.map((item) => transform(item).pipe(startWith(emptyRef))),
        ).pipe(
          map((combined) => {
            const output = combined.filter((p) => p !== emptyRef);
            if (progress) {
              if (output.length === items.length) {
                progress.next(1);
              } else {
                progress.next(output.length / items.length);
              }
            }
            return output as O[];
          }),
        );
      }),
    );
}
