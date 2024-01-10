import { NEVER, Observable, interval, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import type { Project } from "../Project";
import type { Provider } from "../Provider";
import type { PullRequest, PullRequestStatus } from "../PullRequest";
import type { GithubProfile } from "./GithubProfile";
import githubApi from "$lib/services/github-api";
import drip from "$lib/services/drip";
import timeBetween, { MIN } from "$lib/services/time-between";

export type GithubProviderAuth = {
  login: string;
  accessToken: string;
};
const statuses = {
  APPROVED: "Approved",
  CHANGES_REQUESTED: "Changes requested",
  COMMENTED: "Commented",
  PENDING: "Pending",
};

export default class GithubProvider implements Provider {
  name: string;

  auth: GithubProviderAuth;

  constructor(auth: GithubProviderAuth) {
    this.name = `GitHub: ${auth.login}`;
    this.auth = auth;
  }

  valid(): Observable<boolean | Error> {
    return this.account().pipe(
      map(() => true),
      catchError((err) => of(err))
    );
  }

  account(): Observable<GithubProfile> {
    return githubApi.get("user", { accessToken: this.auth.accessToken }).pipe(
      map((user) => ({
        id: user.login,
        name: user.name,
        avatar: user.avatar_url,
      }))
    );
  }

  avatar(profile: GithubProfile, size: string): Observable<string> {
    if (!profile.avatar) {
      return NEVER;
    }
    const url = new URL(profile.avatar);
    if (size === "large") {
      url.searchParams.set("s", "80");
    }
    return of(url.toString());
  }

  projects(): Observable<Project[]> {
    return githubApi
      .get("user/repos", {
        params: { sort: "updated", direction: "desc", per_page: 100 },
        accessToken: this.auth.accessToken,
      })
      .pipe(
        map((repos) =>
          repos
            .filter(
              (repo) => repo.open_issues > 0 && !repo.archived && !repo.fork
            )
            .map((repo) => ({
              id: repo.full_name,
              name: repo.name,
            }))
        )
      );
  }

  pullRequestsFor(projectId: string): Observable<PullRequest[]> {
    const { owner, repo } = splitProjectId(projectId);
    return githubApi
      .get("repos/[owner]/[repo]/pulls", {
        params: { owner, repo },
        accessToken: this.auth.accessToken,
      })
      .pipe(
        drip((pr) => {
          const data: PullRequest = {
            id: pr.id,
            title: pr.title,
            fase: "READY",
            url: pr.html_url,
            creator: {
              id: pr.user.login,
              name: pr.user.name,
              avatar: pr.user.avatar_url,
            } as GithubProfile,
            reviewers:
              pr.requested_reviewers?.map((reviewer) => ({
                profile: {
                  id: reviewer.login,
                  name: reviewer.login,
                  avatar: reviewer.avatar_url,
                },
                status: "",
                icon: "",
                required: false,
              })) ?? [],
          };
          if (pr.user.login === this.auth.login) {
            return githubApi
              .get("repos/[owner]/[repo]/pulls/[number]/reviews", {
                params: { owner, repo, number: pr.number },
                accessToken: this.auth.accessToken,
              })
              .pipe(
                map((reviews) => {
                  for (const review of reviews) {
                    data.reviewers = data.reviewers.filter(
                      (r) => r.profile.id !== review.user.login
                    );
                    data.reviewers.push({
                      profile: {
                        id: review.user.login,
                        name: review.user.login,
                        avatar: review.user.avatar_url,
                      } as GithubProfile,
                      status: statuses[review.state] ?? review.state,
                      icon: review.state === "APPROVED" ? "APPROVED" : "",
                      required: false,
                    });
                  }
                  return data;
                })
              );
          }
          return of(data);
        })
      );
  }

  pollFor(): Observable<null> {
    // @todo Advanced polling: https://docs.github.com/en/rest/rate-limit
    return interval(timeBetween(10 * MIN, 30 * MIN)).pipe(map(() => null));
  }

  pullRequestStatus(
    pullRequest: PullRequest,
    me: GithubProfile
  ): PullRequestStatus {
    const created = pullRequest.creator.id === me.id;
    const owner = new URL(pullRequest.url).pathname.split("/")[1] === me.id;
    const assigned = created
      ? undefined
      : pullRequest.reviewers.find((reviewer) => reviewer.profile.id === me.id);

    const active = created || owner || !!assigned;
    let relevant = owner;
    const approved = pullRequest.reviewers.filter(
      (review) => review.icon === "APPROVED"
    );
    if (assigned && assigned.icon !== "APPROVED") {
      relevant = assigned.required || approved.length < 2;
    }
    if (
      created &&
      (approved.length >= 1 || approved.length === pullRequest.reviewers.length)
    ) {
      relevant = true;
    }
    if (!created && pullRequest.fase === "DRAFT") {
      relevant = false;
    }
    // @todo Test for new comments
    return { relevant, active, created, assigned: !!assigned };
  }
}

function splitProjectId(projectId: string): { owner: string; repo: string } {
  const [owner, repo] = projectId.split("/");
  return { owner, repo };
}
