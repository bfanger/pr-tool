import type { Observable} from "rxjs";
import { interval,never, of } from "rxjs";
import { catchError, map, shareReplay,switchMap } from "rxjs/operators";
import type { PullRequest as ApiPullRequest } from "../../services/azure-api-types/pull-requests-response";
import type { Project } from "../Project";
import type { Provider } from "../Provider";
import type { PullRequest, PullRequestStatus } from "../PullRequest";
import type { AzureDevopsProfile } from "./AzureDevopsProfile";
import azure from "../../services/azure";
import getAvatar from "../../services/getAvatar";
import timeBetween, { MIN } from "../../services/timeBetween";
import { fromCreatedBy,fromReviewer } from "./AzureDevopsProfile";

const statusMap: Record<number, string> = {
  10: "Approved",
  5: "Approved with suggestions",
  0: "",
  "-5": "Waiting for author",
  "-10": "Rejected",
};
function transformPullRequest(pr: ApiPullRequest): PullRequest {
  const match = pr.repository.url.match(
    /^(https:\/\/dev\.azure\.com\/[^/]+\/)/,
  );
  const encodedProject = encodeURIComponent(pr.repository.project.name);
  const encodedRepo = encodeURIComponent(pr.repository.name);
  return {
    id: pr.codeReviewId,
    title: pr.title,
    fase: pr.isDraft ? "DRAFT" : "READY",
    url: match
      ? `${match[1]}${encodedProject}/_git/${encodedRepo}/pullrequest/${pr.pullRequestId}`
      : "",
    creator: fromCreatedBy(pr.createdBy),
    reviewers: pr.reviewers
      .filter((reviewer) => {
        if (reviewer.vote !== 0) {
          return true; // already reviewed
        }
        if (reviewer.hasDeclined) {
          return false;
        }
        if (reviewer.id === pr.createdBy.id) {
          return false; // Hide creator (probably auto assiged reviewer)
        }
        return true;
      })
      .map((reviewer) => ({
        profile: fromReviewer(reviewer),
        status: statusMap[reviewer.vote],
        icon: reviewer.vote > 0 ? "APPROVED" : "",
        required: !!reviewer.isRequired,
      })),
  };
}
export type AzureDevopsProviderAuth = {
  organization: string;
  personalAccessToken: string;
};

export default class AzureDevopsProvider implements Provider {
  name: string;

  auth: AzureDevopsProviderAuth;

  private account$?: Observable<AzureDevopsProfile>;

  private users$?: Observable<Record<string, AzureDevopsProfile>>;

  constructor(auth: AzureDevopsProviderAuth) {
    this.name = `Azure Devops: ${auth.organization}`;
    this.auth = auth;
  }

  account() {
    if (!this.account$) {
      this.account$ = azure
        .profile(this.auth.organization, this.auth.personalAccessToken)
        .pipe(
          map((profile) => ({
            id: profile.emailAddress.toLowerCase(),
            name: profile.displayName,
          })),
          shareReplay(1),
        );
      this.account$.subscribe(null, () => {
        this.account$ = undefined;
      });
    }
    return this.account$;
  }

  valid() {
    const token = this.auth.personalAccessToken;
    if (!token) {
      return of(false);
    }
    return this.account().pipe(
      map(() => true),
      catchError(() =>
        of(new Error("Invalid credentials, missing scope Graph.Read")),
      ),
    );
  }

  avatar(profile: AzureDevopsProfile, size: string) {
    if (profile.descriptor) {
      return getAvatar(
        this.auth.organization,
        this.auth.personalAccessToken,
        profile.descriptor,
        size,
      );
    }
    return this.users().pipe(
      switchMap((users) => {
        const user = users[profile.id];
        if (!user || !user.descriptor) {
          return never();
        }
        return getAvatar(
          this.auth.organization,
          this.auth.personalAccessToken,
          user.descriptor,
          size,
        );
      }),
    );
  }

  projects(): Observable<Project[]> {
    return azure
      .projects(this.auth.organization, this.auth.personalAccessToken)
      .pipe(
        map((projects) =>
          projects.map((project) => ({
            id: project.id,
            name: project.name,
            provider: this,
          })),
        ),
      );
  }

  pullRequestsFor(projectId: string | number) {
    return azure
      .pullRequests(
        `${projectId}`,
        this.auth.organization,
        this.auth.personalAccessToken,
      )
      .pipe(map((prs) => prs.map(transformPullRequest)));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  pollFor(projectId: string | number) {
    // @todo Advanced polling:
    // slow polling when: no commits for 1 week
    // fast polling when: project is starred
    // fastest polling when: project has "active" prs
    return interval(timeBetween(1 * MIN, 10 * MIN)).pipe(map(() => null));
  }

  users() {
    if (!this.users$) {
      this.users$ = azure
        .users(this.auth.organization, this.auth.personalAccessToken)
        .pipe(
          map((response) => {
            const users: Record<string, AzureDevopsProfile> = {};
            response.value.forEach((user) => {
              users[user.principalName] = {
                id: user.principalName,
                name: user.displayName,
                descriptor: user.descriptor,
              };
            });
            return users;
          }),
        );
    }
    return this.users$;
  }

  pullRequestStatus(
    pullRequest: PullRequest,
    me: AzureDevopsProfile,
  ): PullRequestStatus {
    const created = pullRequest.creator.id === me.id;
    const assigned = created
      ? undefined
      : pullRequest.reviewers.find((reviewer) => reviewer.profile.id === me.id);
    const active = created || !!assigned;
    let relevant = false;
    const approved = pullRequest.reviewers.filter(
      (review) => review.icon === "APPROVED",
    );
    if (assigned && assigned.icon !== "APPROVED") {
      relevant = assigned.required || approved.length < 2;
    }
    if (
      created &&
      (approved.length >= 2 || approved.length === pullRequest.reviewers.length)
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
