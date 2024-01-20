<script lang="ts">
  import {
    map,
    distinctUntilChanged,
    retry,
    tap,
    switchMap,
    startWith,
    delay,
  } from "rxjs/operators";
  import {
    interval,
    timer,
    merge,
    combineLatest,
    Subject,
    fromEvent,
  } from "rxjs";
  import rpc from "$lib/services/rpc";
  import { MIN, HOUR } from "$lib/services/timeBetween";
  import { progress$ as accountsProgress$ } from "$lib/streams/accounts";
  import {
    pullRequestsWithStatus$,
    progress$ as pullRequestsProgress$,
  } from "$lib/streams/pullRequests";
  import documentVisible$ from "$lib/streams/documentVisible";

  let title = "Loading...";

  const icon$ = new Subject<string>();
  const count$ = interval(6 * HOUR).pipe(
    startWith(null),
    switchMap(() =>
      combineLatest([
        pullRequestsWithStatus$,
        accountsProgress$,
        pullRequestsProgress$,
      ]),
    ),
    map(([prs, accountsProgress, pullRequestsProgress]) => ({
      count: prs.filter((pr) => pr.status.relevant).length,
      progress: accountsProgress * pullRequestsProgress,
    })),
    tap({
      next({ progress }) {
        if (progress < 1) {
          icon$.next("busy");
          title = `Loading... (${Math.round(progress * 100)}%)`;
        } else {
          icon$.next("default");
          title = "";
        }
      },
      error(err) {
        console.warn(err);
        title = "Oops! something went wrong";
        icon$.next("error");
        rpc.send("title", "");
      },
    }),
    map((entry) => entry.count),
    distinctUntilChanged(),
    retry({
      delay: () =>
        merge(
          timer(15 * MIN),
          fromEvent(window, "online"),
          documentVisible$,
        ).pipe(delay(1000)),
    }),
  );

  count$.subscribe((count) => {
    title = `${count} PRs`;
    if (count === 0) {
      title = "";
    } else if (count === 1) {
      title = `${count} PR`;
    }
    rpc.send("title", title);
  });
  icon$.pipe(distinctUntilChanged()).subscribe((icon) => {
    rpc.send("icon", icon);
  });
</script>

<svelte:head><title>{title || "-"}</title></svelte:head>
