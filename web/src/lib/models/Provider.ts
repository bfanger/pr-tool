import type { Observable } from "rxjs";
import type { Profile } from "./Profile";
import type { Project } from "./Project";
import type { PullRequest, PullRequestStatus } from "./PullRequest";

export type PullRequestWithProject = {
  pullRequest: PullRequest;
  project: Project;
};
export interface Provider {
  name: string;
  auth: Record<string, unknown>;
  valid(): Observable<Error | boolean>;
  account(): Observable<Profile>;
  avatar(profile: Profile, size: string): Observable<string>;
  projects(): Observable<Project[]>;
  pullRequestsFor(projectId: string | number): Observable<PullRequest[]>;
  pollFor(projectId: string | number): Observable<null>;
  pullRequestStatus(pullRequest: PullRequest, me: Profile): PullRequestStatus;
}
