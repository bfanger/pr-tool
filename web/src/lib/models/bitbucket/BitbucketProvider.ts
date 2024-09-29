import type { Observable } from "rxjs";
import { interval, of } from "rxjs";
import { catchError, map, shareReplay, switchMap } from "rxjs/operators";
import type { PullRequestsResponse } from "../../services/bitbucket-api-types/pull-requests-response";
import type { Profile } from "../Profile";
import type { Project } from "../Project";
import type { Provider } from "../Provider";
import type { PullRequest, PullRequestStatus, Reviewer } from "../PullRequest";
import bitbucketApi, { USERNAME } from "../../services/bitbucketApi";
import timeBetween, { MIN, SEC } from "../../services/timeBetween";

export type BitbucketProviderAuth = {
  domain: string;
  personalAccessToken: string;
  proxy: boolean;
};
export interface BitbucketProfile extends Profile {
  email: string;
}

export default class BitbucketProvider implements Provider {
  name: string;

  auth: BitbucketProviderAuth;

  constructor(auth: BitbucketProviderAuth) {
    this.name = `Bitbucket: ${auth.domain}`;
    this.auth = auth;
  }

  valid(): Observable<boolean | Error> {
    const { domain, proxy, personalAccessToken: token } = this.auth;
    if (!domain || !token) {
      return of(false);
    }
    return bitbucketApi
      .get("https://[domain]/rest/api/1.0/projects", {
        token,
        proxy,
        params: { domain },
      })
      .pipe(
        map(() => true),
        catchError((err) => {
          console.warn(err);
          return of(new Error("Authentication failed"));
        }),
      );
  }

  account(): Observable<BitbucketProfile> {
    return bitbucketApi
      .get("https://[domain]/rest/api/1.0/projects", {
        token: this.auth.personalAccessToken,
        proxy: this.auth.proxy,
        params: { domain: this.auth.domain },
      })
      .pipe(switchMap((response) => this.profile((response as any)[USERNAME])));
  }

  profile(username: string): Observable<BitbucketProfile> {
    return bitbucketApi
      .get("https://[domain]/rest/api/1.0/users/[username]", {
        token: this.auth.personalAccessToken,
        proxy: this.auth.proxy,
        params: { domain: this.auth.domain, username },
      })
      .pipe(
        map((response) => {
          const profile: BitbucketProfile = {
            id: response.slug,
            name: response.displayName,
            email: response.emailAddress,
          };
          return profile;
        }),
      );
  }

  avatar(profile: BitbucketProfile, size: string): Observable<string> {
    const px = size === "large" ? 88 : 52;
    // const src = gravatar({
    //     email: profile.email || 'bfanger@notfound.com',
    //     size: px,
    // })
    // const fallback = encodeURIComponent(
    //     `https://${this.auth.domain}/users/${profile.id}/avatar.png?s=${px}`,
    // )
    // return from([`${src}&d=${fallback}`])
    return of(
      `https://${this.auth.domain}/users/${profile.id}/avatar.png?s=${px}`,
    );
  }

  projects(): Observable<Project[]> {
    // @todo pagination
    return bitbucketApi
      .get("https://[domain]/rest/api/1.0/projects", {
        token: this.auth.personalAccessToken,
        proxy: this.auth.proxy,
        params: { domain: this.auth.domain },
      })
      .pipe(
        map((response) => {
          const projects: Project[] = response.values.map((project) => ({
            id: project.key,
            name: project.name,
          }));
          return projects;
        }),
      );
  }

  cached: Observable<PullRequestsResponse["values"]> | undefined = undefined;

  cacheTimer: any;

  pullRequestsFor(projectId: string | number): Observable<PullRequest[]> {
    if (!this.cached) {
      // @todo pagination
      this.cached = bitbucketApi
        .get("https://[domain]/rest/api/1.0/dashboard/pull-requests", {
          token: this.auth.personalAccessToken,
          proxy: this.auth.proxy,
          params: { domain: this.auth.domain, state: "OPEN" },
        })
        .pipe(
          map((response) => response.values),
          shareReplay(1),
        );
      clearTimeout(this.cacheTimer);
      this.cacheTimer = setTimeout(() => {
        this.cached = undefined;
      }, 30 * SEC);
    }
    return this.cached.pipe(
      map((data) => {
        const prs: PullRequest[] = data
          .filter((pr) => pr.fromRef.repository.project.key === projectId)
          .map((pr) => ({
            creator: {
              id: pr.author.user.slug,
              name: pr.author.user.displayName,
              email: pr.author.user.emailAddress,
            },
            id: pr.id,
            title: pr.title,
            fase: "READY",
            url: pr.links.self[0].href,
            reviewers: pr.reviewers.map((author) => {
              const reviewer: Reviewer = {
                icon: author.approved ? "APPROVED" : "",
                profile: {
                  id: author.user.slug,
                  name: author.user.displayName,
                  email: author.user.emailAddress,
                } as BitbucketProfile,
                status: author.approved ? "Approved" : "",
                required: false,
              };
              return reviewer;
            }),
          }));
        return prs;
      }),
      catchError((err) => {
        this.cached = undefined;
        throw err;
      }),
    );
  }

  pollFor(): Observable<null> {
    // @todo Advanced polling
    return interval(timeBetween(1 * MIN, 10 * MIN)).pipe(map(() => null));
  }

  pullRequestStatus(pullRequest: PullRequest, me: Profile): PullRequestStatus {
    const created = pullRequest.creator.id === me.id;
    const assigned = created
      ? undefined
      : pullRequest.reviewers.find((reviewer) => reviewer.profile.id === me.id);
    const active = created || !!assigned;
    let relevant = false;
    if (assigned && assigned.icon !== "APPROVED") {
      relevant = true;
    }
    const approved = pullRequest.reviewers.filter(
      (review) => review.icon === "APPROVED",
    );
    if (
      created &&
      (approved.length >= 2 || approved.length === pullRequest.reviewers.length)
    ) {
      relevant = true;
    }

    // @todo Test for new comments
    return { relevant, active, created, assigned: !!assigned };
  }
}
