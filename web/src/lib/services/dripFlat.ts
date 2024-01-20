import type { Observable, Observer } from "rxjs";
import { map } from "rxjs/operators";
import drip from "./drip";

/**
 * Similar to drip, but the transform creates a observable that emits an array, these resulting arrays are flattend into a single array
 */
export default function dripFlat<T, R>(
  transform: (i: T) => Observable<R[]>,
  progress?: Observer<number>,
) {
  return (input: Observable<T[]>) =>
    drip(transform, progress)(input).pipe(map((output) => output.flat(1)));
}
