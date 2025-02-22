import type { Profile } from "$lib/models/Profile";
import type { Project } from "$lib/models/Project";
import type { Provider } from "$lib/models/Provider";
import type { PullRequest, PullRequestStatus } from "$lib/models/PullRequest";
import { of, type Observable, EMPTY } from "rxjs";
import type { PlatformConfig } from "../../platforms/types";

export class CompatProvider implements Provider {
  name: string;
  auth = {};
  constructor(config: PlatformConfig) {
    this.name = config.type;
    if (config.type === "jira") {
      this.name = `JIRA - ${config.domain}`;
    }
  }
  valid(): Observable<Error | boolean> {
    return of(false);
  }
  account(): Observable<Profile> {
    return of({ id: "0", name: "Anonymous" });
  }
  avatar(): Observable<string> {
    return EMPTY;
  }
  projects(): Observable<Project[]> {
    return of([]);
  }
  pullRequestsFor(): Observable<PullRequest[]> {
    throw new Error("Method not implemented.");
  }
  pollFor(): Observable<null> {
    throw new Error("Method not implemented.");
  }
  pullRequestStatus(): PullRequestStatus {
    throw new Error("Method not implemented.");
  }
}
