import { defer, fromEvent, NEVER } from "rxjs";
import { filter } from "rxjs/operators";

const documentVisible$ = defer(() => {
  if (typeof document === "undefined") {
    return NEVER;
  }
  return fromEvent(document, "visibilitychange").pipe(
    filter(() => document.visibilityState === "visible")
  );
});
export default documentVisible$;
