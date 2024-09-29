import type { Observable } from "rxjs";
import { interval, NEVER, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import type { Project } from "../Project";
import type { Provider } from "../Provider";
import type { PullRequest, PullRequestStatus } from "../PullRequest";
import GitlabApi from "../../services/gitlabApi";
import timeBetween, { MIN } from "../../services/timeBetween";
import { type GitlabProfile, userToProfile } from "./GitlabProfile";

export type GitlabProviderAuth = {
  domain: string;
  privateToken: string;
};
export default class GitlabProvider implements Provider {
  name: string;

  auth: GitlabProviderAuth;

  constructor(auth: GitlabProviderAuth) {
    this.name = `Gitlab: ${auth.domain}`;
    this.auth = auth;
  }

  account(): Observable<GitlabProfile> {
    return GitlabApi.get("https://[domain]/api/v4/user", {
      params: { domain: this.auth.domain },
      token: this.auth.privateToken,
    }).pipe(
      map((user) => ({
        id: user.id,
        name: user.name,
        avatar: user.avatar_url,
      })),
    );
  }

  avatar(profile: GitlabProfile) {
    if (profile.avatar) {
      return of(profile.avatar);
    }
    return NEVER;
  }

  projects(): Observable<Project[]> {
    return GitlabApi.paged("https://[domain]/api/v4/projects", {
      params: { domain: this.auth.domain },
      token: this.auth.privateToken,
    }).pipe(
      map((projects) =>
        projects
          .filter((project) => project.merge_requests_enabled)
          .map<Project>((project) => ({
            id: project.id,
            name: project.name,
          })),
      ),
    );
  }

  pullRequestsFor(projectId: number): Observable<PullRequest[]> {
    // @todo optimize, gitlab doesn't require a projectId (like azure) to retrieve pull requests.
    // This would allow for less api requests.
    return GitlabApi.paged(
      "https://[domain]/api/v4/projects/[projectId]/merge_requests",
      {
        params: {
          domain: this.auth.domain,
          state: "opened",
          projectId,
        },
        token: this.auth.privateToken,
      },
    ).pipe(
      map((prs) =>
        prs.map(
          (pr) =>
            ({
              id: pr.id,
              title: pr.title,
              fase: "READY",
              url: pr.web_url,
              creator: userToProfile(pr.author),
              reviewers: pr.assignees.map((assignee) => ({
                profile: userToProfile(assignee),
                status: "",
                icon: "",
              })),
            }) as PullRequest,
        ),
      ),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  pollFor(projectId: string | number) {
    // @todo Advanced polling:
    // Use gitlab feed to detect changes
    return interval(timeBetween(1 * MIN, 10 * MIN)).pipe(map(() => null));
  }

  valid(): Observable<Error | boolean> {
    const token = this.auth.privateToken;
    if (!token) {
      return of(false);
    }
    return this.account().pipe(
      map(() => true),
      catchError(() => of(new Error("Invalid credentials, missing scope api"))),
    );
  }

  pullRequestStatus(
    pullRequest: PullRequest,
    me: GitlabProfile,
  ): PullRequestStatus {
    const created = pullRequest.creator.id === me.id;
    const assigned = !!pullRequest.reviewers.find(
      (reviewer) => reviewer.profile.id === me.id,
    );
    const active = created || assigned;

    return { relevant: assigned, active, created, assigned };
  }
}
