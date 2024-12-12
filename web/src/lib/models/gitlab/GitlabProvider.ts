import type { Observable } from "rxjs";
import { combineLatest, interval, NEVER, of } from "rxjs";
import { catchError, map, share, switchMap } from "rxjs/operators";
import type { Project } from "../Project";
import type { Provider } from "../Provider";
import type { PullRequest, PullRequestStatus } from "../PullRequest";
import GitlabApi from "../../services/gitlabApi";
import gitlabApi from "../../services/gitlabApi";
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
  #sharedAccount: Observable<GitlabProfile>;
  pullRequestsFor(projectId: number): Observable<PullRequest[]> {
    if (!this.#sharedAccount) {
      this.#sharedAccount = this.account().pipe(share());
    }
    // @todo optimize, gitlab doesn't require a projectId (like azure) to retrieve pull requests.
    // This would allow for less api requests.
    return combineLatest([
      this.#sharedAccount,
      GitlabApi.paged(
        "https://[domain]/api/v4/projects/[projectId]/merge_requests",
        {
          params: {
            domain: this.auth.domain,
            state: "opened",
            projectId,
          },
          token: this.auth.privateToken,
        },
      ),
    ]).pipe(
      switchMap(([me, prs]) =>
        // GET /projects/:id/merge_requests/:merge_request_iid/approvals
        // https://gitlab.tisgroup.nl/api/v4/projects/381/merge_requests/5/approvals
        combineLatest(
          prs.map((pr) => {
            const pullRequest: PullRequest = {
              id: pr.id,
              title: pr.title,
              fase: "READY",
              url: pr.web_url,
              creator: userToProfile(pr.author),
              reviewers: (pr.reviewers.length > 0
                ? pr.reviewers
                : pr.assignees
              ).map((assignee) => ({
                profile: userToProfile(assignee),
                status: "",
                icon: "",
                required: false, // @todo Lookup policy
              })),
            };
            if (
              pr.author.id === me.id ||
              pr.reviewers.some((reviewer) => reviewer.id === me.id)
            ) {
              return gitlabApi
                .get(
                  "https://[domain]/api/v4/projects/[projectId]/merge_requests/[iid]/approvals",
                  {
                    params: {
                      domain: this.auth.domain,
                      projectId,
                      iid: pr.iid,
                    },
                    token: this.auth.privateToken,
                  },
                )
                .pipe(
                  map((approvals) => {
                    for (const reviewer of pullRequest.reviewers) {
                      const approved = approvals.approved_by.find(
                        (approval) => approval.user.id === reviewer.profile.id,
                      );
                      reviewer.status = approved ? "Approved" : reviewer.status;
                      reviewer.icon = approved ? "APPROVED" : reviewer.icon;
                    }
                    return pullRequest;
                  }),
                );
            }
            return of(pullRequest);
          }),
        ),
      ),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  pollFor(projectId: string | number) {
    // @todo Advanced polling:
    // Use gitlab feed to detect changes
    return interval(timeBetween(5 * MIN, 15 * MIN)).pipe(map(() => null));
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
