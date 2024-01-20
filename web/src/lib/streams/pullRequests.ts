/* eslint-disable filenames/match-exported */
/**
 * All projects of all providers
 */

import { combineLatest, BehaviorSubject } from "rxjs";
import { map, switchMap, startWith, shareReplay } from "rxjs/operators";
import dripFlat from "../services/dripFlat";
import type { PullRequest, PullRequestStatus } from "../models/PullRequest";
import type { Project } from "../models/Project";
import type { Provider } from "../models/Provider";
import projects$ from "./projects";
import accounts$ from "./accounts";

type Result = {
  pullRequest: PullRequest;
  project: Project;
  provider: Provider;
};
export const progress$ = new BehaviorSubject(0);
const pullRequests$ = projects$.pipe(
  dripFlat(
    ({ project, provider }) =>
      provider.pollFor(project.id).pipe(
        startWith(null),
        switchMap(() =>
          provider.pullRequestsFor(project.id).pipe(
            map((prs: any) =>
              prs.map((pr) => ({
                pullRequest: pr,
                project,
                provider,
              })),
            ),
          ),
        ),
      ),
    progress$,
  ),
  shareReplay(1),
);
export default pullRequests$;
export type ResultWithStatus = Result & {
  status: PullRequestStatus;
};
export const pullRequestsWithStatus$ = combineLatest([
  accounts$,
  pullRequests$,
]).pipe(
  map(([accounts, pullRequests]) => {
    const accountByProvider = new Map();
    accounts.forEach(({ account, provider }) => {
      accountByProvider.set(provider, account);
    });
    const withStatus: ResultWithStatus[] = [];
    pullRequests.forEach((pr) => {
      const account = accountByProvider.get(pr.provider);
      if (account) {
        withStatus.push({
          ...pr,
          status: pr.provider.pullRequestStatus(pr.pullRequest, account),
        });
      }
    });
    return withStatus;
  }),
  shareReplay(1),
);

type Grouped = {
  project: Project;
  provider: Provider;
  pullRequests: PullRequest[];
};
export function groupByProject(prs: Result[]): Grouped[] {
  const grouped: Record<string, Grouped> = {};
  for (const { project, provider, pullRequest } of prs) {
    const group = grouped[project.id] || {
      project,
      provider,
      pullRequests: [],
    };
    group.pullRequests.push(pullRequest);
    grouped[project.id] = group;
  }
  return Object.values(grouped);
}
